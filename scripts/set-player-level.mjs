import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB ?? "artfunkel";
const playerEmail = process.env.PLAYER_EMAIL?.trim().toLowerCase();

if (!uri || !playerEmail) {
  throw new Error("MONGODB_URI and PLAYER_EMAIL must be configured in .env.local.");
}

const levelArg = process.argv[2];
const targetLevel = levelArg !== undefined ? Number(levelArg) : 30;

if (isNaN(targetLevel) || targetLevel < 0 || targetLevel > 50 || !Number.isInteger(targetLevel)) {
  console.error("Error: Player level must be an integer between 0 and 50.");
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db(databaseName);

const MAX_PLAYER_LEVEL = 50;
const cap = (start, end) =>
  Math.floor(start + (end - start) * (targetLevel / MAX_PLAYER_LEVEL));

const caps = {
  inventory_cap: cap(15, 64),
  display_cap: cap(5, 10),
  auction_cap: cap(8, 16),
  ticket_cap: cap(3, 10),
  pc_cap: 12,
  visitor_cap: cap(20, 200),
  repairing_cap: cap(4, 12),
};

const result = await db.collection("players").updateOne(
  { email: playerEmail },
  {
    $set: {
      "profile.level": targetLevel,
      "profile.xp": 0,
      ...Object.fromEntries(
        Object.entries(caps).map(([key, value]) => [`profile.${key}`, value]),
      ),
      "profile.last_activity": new Date().toISOString(),
      updated_at: new Date(),
    },
  },
);

if (result.matchedCount === 0) {
  console.error(`Player account with email '${playerEmail}' was not found.`);
} else {
  console.log("---------------------------------------------------------");
  console.log("Success!");
  console.log(`- Updated player level for: ${playerEmail}`);
  console.log(`- New Level: ${targetLevel}`);
  console.log(`- Current XP: 0`);
  console.log("- Updated Caps:", caps);
  console.log("---------------------------------------------------------");
}

await client.close();
