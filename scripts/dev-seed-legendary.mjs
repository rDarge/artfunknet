import { MongoClient } from "mongodb";
import { calculateItemValues } from "../src/server/gameplay.ts";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB ?? "artfunkel";
const playerEmail = process.env.PLAYER_EMAIL?.trim().toLowerCase();

if (!uri || !playerEmail) {
  throw new Error("MONGODB_URI and PLAYER_EMAIL must be configured in .env.local.");
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db(databaseName);

const metadata = await db.collection("metadata").findOne({ _id: "loot-data" });
if (!metadata) {
  throw new Error("Metadata has not been seeded. Did you run npm run db:seed?");
}

// 1. Fix any existing items missing attributes, tags, or values.sell
await db.collection("items").updateMany(
  { attributes: { $exists: false } },
  { $set: { attributes: { locked: [], unlocked: [], special: [] } } }
);
await db.collection("items").updateMany(
  { tags: { $exists: false } },
  { $set: { tags: [] } }
);

// XP_FOR_AUCTIONS unique_attribute _id in database is 'ChzMmNXmSZkzuCs33' (FgRMQA6s24wmTRyrx:T8v35e75v4Hh2JpxQ)
const XP_FOR_AUCTIONS_ID = "ChzMmNXmSZkzuCs33";

// Update any previously seeded items with wrong ID to the correct XP_FOR_AUCTIONS ID
await db.collection("items").updateMany(
  { active_unique_attribute: "29niKXTysWwTTahKM" },
  { $set: { active_unique_attribute: XP_FOR_AUCTIONS_ID } }
);

// Repair values for items missing 'sell' property
const itemsMissingSell = await db.collection("items").find({ "values.sell": { $exists: false } }).toArray();
for (const item of itemsMissingSell) {
  const artwork = await db.collection("artworks").findOne({ _id: item.artwork_id }) ?? {
    _id: "demo-artwork-1",
    artist: "Vincent van Gogh",
    title: "The Starry Night",
    rarity: "legendary",
    value_scale: 0.8,
    active: true,
  };
  const computedValues = calculateItemValues(item, artwork, metadata.loot_data);
  await db.collection("items").updateOne(
    { _id: item._id },
    { $set: { values: computedValues } }
  );
}

const player = await db.collection("players").findOne({ email: playerEmail });
if (!player) {
  throw new Error(`Player ${playerEmail} not found. Did you run npm run db:seed?`);
}

// 2. Find or create an artwork
let artwork = await db.collection("artworks").findOne({ rarity: "legendary", active: true });
if (!artwork) {
  artwork = await db.collection("artworks").findOne({ active: true });
}
if (!artwork) {
  artwork = {
    _id: "demo-artwork-1",
    artist_id: "artist-van-gogh",
    artist: "Vincent van Gogh",
    title: "The Starry Night",
    date: 1889,
    genre: "Post-Impressionism",
    medium: "Oil on canvas",
    rarity: "legendary",
    value_scale: 0.8,
    height: 73,
    width: 92,
    active: true,
    special_attributes: ["FgRMQA6s24wmTRyrx", "T8v35e75v4Hh2JpxQ"],
    unique_attributes: [XP_FOR_AUCTIONS_ID],
    created_at: new Date(),
    source: "dev-seed",
  };
  await db.collection("artworks").insertOne(artwork);
}

const attributes = await db.collection("attributes").find({ active: true }).toArray();

// 3. Construct a fully-valid GameItem
const newItemBase = {
  _id: "dev-legendary-item-" + Date.now(),
  artwork_id: artwork._id,
  condition: 1.0,
  mint: false,
  mint_value_multiplier: 1,
  attributes: {
    locked: [],
    unlocked: [],
    special: attributes.slice(0, 2).map((a) => ({ ...a, value: 0.8 })),
  },
  active_unique_attribute: XP_FOR_AUCTIONS_ID,
  tags: [],
  owner: player._id,
  transaction_history: [
    {
      type: "generation",
      from_owner: null,
      to_owner: player._id,
      occurred_at: new Date().toISOString(),
      source: "dev-seed",
    },
  ],
  status: "displayed",
  source: "dev-seed",
  date_created: new Date().toISOString(),
  date_received: new Date().toISOString(),
  level: 1,
  roll_count: 0,
  reroll_spent: 0,
  foil: false,
  unlocked: true,
  seasonal: false,
  lottery: 0,
  original: false,
  patreon: false,
  vintage: false,
  authenticity: {
    forgery: false,
    forgery_quality: 0,
    liable: player._id,
    liability_pending: false,
    identified: true,
    fee: 0,
    original_owner: player._id,
  },
};

const computedValues = calculateItemValues(newItemBase, artwork, metadata.loot_data);
const newItem = {
  ...newItemBase,
  values: computedValues,
};

await db.collection("items").insertOne(newItem);

// 4. Activate Market Expert status for 60 minutes
const marketExpertExp = new Date(Date.now() + 60 * 60 * 1000).toISOString();
await db.collection("players").updateOne(
  { _id: player._id },
  { $set: { "profile.market_expert.expiration": marketExpertExp } }
);

console.log("---------------------------------------------------------");
console.log("Success!");
console.log("- Cleaned up items missing attributes, tags, or sell values.");
console.log(`- Updated active_unique_attribute to XP_FOR_AUCTIONS (${XP_FOR_AUCTIONS_ID}).`);
console.log(`- Inserted valid displayed legendary item ID: ${newItem._id}`);
console.log(`- Artwork: ${artwork.title} by ${artwork.artist}`);
console.log(`- Market Expert status active until: ${marketExpertExp}`);
console.log("---------------------------------------------------------");

await client.close();
