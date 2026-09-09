import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB ?? "artfunkel";
const playerEmail = process.env.PLAYER_EMAIL?.trim().toLowerCase();

if (!uri || !playerEmail) {
  throw new Error("MONGODB_URI and PLAYER_EMAIL must be configured in .env.local.");
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db(databaseName);

const hours = process.argv[2] ? Number(process.argv[2]) : 24;
const expirationDate = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

const result = await db.collection("players").updateOne(
  { email: playerEmail },
  { $set: { "profile.market_expert.expiration": expirationDate } }
);

if (result.matchedCount === 0) {
  console.error(`Player account with email '${playerEmail}' was not found.`);
} else {
  console.log("---------------------------------------------------------");
  console.log("Success!");
  console.log(`- Activated Market Expert status for: ${playerEmail}`);
  console.log(`- Expiration: ${expirationDate} (${hours} hours from now)`);
  console.log("---------------------------------------------------------");
}

await client.close();
