import fs from 'fs';
import path from 'path';

const codes = [
  "MONEY_FOR_XP",
  "UNCLAIMED_ITEM_SELL_BONUS",
  "BENEFACTOR_CONDITION_BONUS",
  "REROLL_DISCOUNT",
  "DEALER_DISCOUNT",
  "COLLECTOR_DOES_NOT_COLLECT",
  "QUEST_ITEM_SELL_BONUS",
  "PRIVATE_AUCTION_PRICE_REDUCTION",
  "DONOR_LEVEL_MIN",
  "LEVEL_UP_COST_REDUCTION",
  "XP_FOR_ZERO_COUNTS",
  "DEALER_LEVEL_MIN",
  "ART_COLLECTOR_XP_REWARD",
  "QUEST_XP_BONUS",
  "XP_FOR_AUCTIONS",
  "DONOR_CONDITION_MIN",
  "DONOR_EXPERT_BONUS",
  "BONUS_DEALER_DONOR",
  "COLLECTOR_DONOR_PAIR",
  "DONOR_QUEST_ITEM_CHANCE",
  "DONOR_AUCTIONEER_TRADE",
  "KNOWLEDGE_FOR_REPAIR",
  "DISPLAY_CONDITION_DEALER_BOOST",
  "GOOD_CONDITION_COLLECTOR_BONUS",
  "QUEST_TARGET_CONDITION_INCREASE",
  "AUCTION_WIN_CONDITION_INCREASE",
  "DEALER_PURCHASE_ROLL_COUNT_SET",
  "ART_COLLECTOR_ROLL_COUNT_BONUS",
  "KNOWLEDGE_FOR_QUESTS",
  "KNOWLEDGE_FOR_AUCTION_WINS",
  "COLLECTOR_FOR_SALE_OFFER",
  "DEALER_QUEST_ITEM_CHANCE",
  "AUCTION_COUNT_DEALER_BONUS",
  "COLLECTOR_QUEST_ITEM",
  "ART_COLLECTOR_AUCTION_BONUS",
  "MARKET_EXPERT_QUEST_BONUS"
];

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (dirPath.includes('node_modules') || dirPath.includes('.git') || dirPath.includes('.next')) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

const rootDir = process.cwd();
const allFiles = getAllFiles(rootDir);

const results = {};
codes.forEach(code => {
  results[code] = [];
});

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  codes.forEach(code => {
    if (content.includes(code)) {
      const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
      results[code].push(relPath);
    }
  });
});

console.log(JSON.stringify(results, null, 2));
