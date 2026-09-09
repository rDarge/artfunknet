import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB ?? "artfunkel";

if (!uri) {
  throw new Error("MONGODB_URI is not configured in .env.local.");
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db(databaseName);

const sampleArtworks = [
  {
    _id: "dev-art-common-1",
    artist: "Development Artist",
    title: "Abstract Geometric Composition",
    date: 2024,
    genre: "Abstract",
    medium: "Digital on Canvas",
    rarity: "common",
    value_scale: 0.4,
    height: 50,
    width: 50,
    active: true,
    created_at: new Date(),
    source: "sample-catalog-seed",
  },
  {
    _id: "dev-art-common-2",
    artist: "Development Artist",
    title: "Urban Landscape at Dusk",
    date: 2024,
    genre: "Realism",
    medium: "Oil on Panel",
    rarity: "common",
    value_scale: 0.5,
    height: 60,
    width: 40,
    active: true,
    created_at: new Date(),
    source: "sample-catalog-seed",
  },
  {
    _id: "dev-art-uncommon-1",
    artist: "Development Artist",
    title: "Symphony of Warm Tones",
    date: 2024,
    genre: "Impressionism",
    medium: "Acrylic on Linen",
    rarity: "uncommon",
    value_scale: 0.6,
    height: 70,
    width: 50,
    active: true,
    created_at: new Date(),
    source: "sample-catalog-seed",
  },
  {
    _id: "dev-art-rare-1",
    artist: "Development Artist",
    title: "Study of Shadow and Light",
    date: 2024,
    genre: "Baroque Revival",
    medium: "Oil on Canvas",
    rarity: "rare",
    value_scale: 0.75,
    height: 80,
    width: 60,
    active: true,
    created_at: new Date(),
    source: "sample-catalog-seed",
  },
  {
    _id: "dev-art-masterpiece-1",
    artist: "Development Master",
    title: "Opus Magnum",
    date: 2024,
    genre: "Masterpiece",
    medium: "Mixed Media",
    rarity: "masterpiece",
    value_scale: 0.95,
    height: 100,
    width: 80,
    active: true,
    created_at: new Date(),
    source: "sample-catalog-seed",
  },
];

let inserted = 0;
for (const artwork of sampleArtworks) {
  const result = await db
    .collection("artworks")
    .updateOne({ _id: artwork._id }, { $setOnInsert: artwork }, { upsert: true });
  if (result.upsertedCount > 0) inserted += 1;
}

console.log("---------------------------------------------------------");
console.log("Success!");
console.log(`- Seeded ${inserted} sample artworks (Common, Uncommon, Rare, Masterpiece).`);
console.log("- Crates and daily drops can now be tested at any player level!");
console.log("---------------------------------------------------------");

await client.close();
