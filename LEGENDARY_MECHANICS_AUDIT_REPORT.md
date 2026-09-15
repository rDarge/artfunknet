# Legendary Mechanics Audit Report

## 1. Overview & Objectives

Following a recent major gameplay refactor in **artfunknet**, an audit is underway to ensure all **36 Legendary Artwork Unique Attributes** grant their special abilities correctly when displayed in a player's gallery.

This audit report cataloging all 36 Legendary effects serves as the primary tracking document for verifying effect logic, identifying disconnected or unhooked mechanics, and guiding subsequent fixes and test coverage.

### Key Audit Highlights
- **Total Legendary Attributes Cataloged**: 36
- **Recently Fixed**: 5 (`XP_FOR_AUCTIONS` restored in commit [`2137f86e`](src/app/api/play/items/[id]/auction/route.ts) / PR #8, `DONOR_QUEST_ITEM_CHANCE` restored in commit [`ad35dd46`](src/server/npc-quest-item.ts) / PR #12, `QUEST_ITEM_SELL_BONUS` restored in commit [`cd82fac6`](src/server/quest-item-sell.ts) / PR #16, `DEALER_QUEST_ITEM_CHANCE` restored in commit [`61ffc998`](src/server/npc-quest-item.ts) / PR #17, `MARKET_EXPERT_QUEST_BONUS` restored in commit [`9e6684c0`](src/server/art-historian-gameplay.ts) / PR #24)
- **Currently Active & Wired**: 31
- **Identified Gaps / Unhooked Logic**: 5 (including 3 explicit `TODO AI:` placeholders in NPC interactions and 2 omitted handlers in quest claims and auction settlements)

---

## 2. Executive Summary of Effect Categories

The 36 Legendary effects are organized into 5 primary functional domains:

1. **Auction & Market Mechanics** (7 effects)
2. **Sales, Pricing & Economy** (5 effects)
3. **NPC Interactions & Offer Generation** (18 effects)
4. **Quests & Art Historian** (4 effects)
5. **Gallery Care & Restoration** (2 effects)

---

## 3. Comprehensive Legendary Attribute Catalog

### Category 1: Auction & Market Mechanics

#### 1. `XP_FOR_AUCTIONS`
- **Description**: Putting items up for auction grants XP.
- **Default Parameters**: `{ xp_chunk_percentage: 0.5 }`
- **Key Code Paths**:
  - Implementation: [`src/server/auction-gameplay.ts`](src/server/auction-gameplay.ts#L208-L270) (`grantAuctionXpReward`)
  - Endpoint: [`src/app/api/play/items/[id]/auction/route.ts`](src/app/api/play/items/[id]/auction/route.ts#L145)
  - Unit Tests: [`src/server/auction-gameplay.test.ts`](src/server/auction-gameplay.test.ts#L61-L117)
- **Status**: **VERIFIED / RESTORED**. Recently repaired in commit [`2137f86e`](src/app/api/play/items/[id]/auction/route.ts) (PR #8). Combines with `MONEY_FOR_XP` if active.

#### 2. `PRIVATE_AUCTION_PRICE_REDUCTION`
- **Description**: Private auction items have a reduced starting price.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L866) (Auctioneer interaction)
  - Legacy Reference: [`server/npc_interactions/auctioneerInteraction.js`](server/npc_interactions/auctioneerInteraction.js)
- **Status**: **Wired**. Requires audit verification during Auctioneer meetings.

#### 3. `AUCTION_WIN_CONDITION_INCREASE`
- **Description**: Auction wins below 50% condition immediately increase to 90% condition.
- **Default Parameters**: `{ condition_threshold: 0.5, condition_target: 0.9 }`
- **Key Code Paths**:
  - Implementation: [`src/server/auction-gameplay.ts`](src/server/auction-gameplay.ts#L556) (`settleExpiredAuctions`)
  - Legacy Reference: [`server/auction_methods.js`](server/auction_methods.js)
- **Status**: **Wired**. Evaluated during auction settlement.

#### 4. `KNOWLEDGE_FOR_AUCTION_WINS`
- **Description**: Winning auctions grants Karma based on the item won.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Implementation: Missing in [`src/server/auction-gameplay.ts`](src/server/auction-gameplay.ts)
  - Legacy Reference: [`server/auction_methods.js`](server/auction_methods.js)
- **Status**: **UNHOOKED / MISSING**. Karma award is not currently evaluated upon winning an auction.

#### 5. `ART_COLLECTOR_AUCTION_BONUS`
- **Description**: Art Collectors offer bonuses based on your currently auctioned items.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L1261) (TODO comment placeholder)
  - Legacy Reference: [`server/npc_interactions/collectorInteraction.js`](server/npc_interactions/collectorInteraction.js)
- **Status**: **INCOMPLETE (TODO AI)**. Pending implementation during NPC interaction porting.

#### 6. `AUCTION_COUNT_DEALER_BONUS`
- **Description**: Art Dealers give bonus items based on your number of active auctions.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L1053) (TODO comment placeholder)
  - Legacy Reference: [`server/npc_interactions/artDealerInteraction.js`](server/npc_interactions/artDealerInteraction.js)
- **Status**: **INCOMPLETE (TODO AI)**. Pending implementation during NPC interaction porting.

#### 7. `DONOR_AUCTIONEER_TRADE`
- **Description**: When both are present, Art Donors offer one fewer item and Auctioneers offer four more.
- **Default Parameters**: `{ donor_item_delta: -1, auctioneer_item_delta: 4 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L656) & [`route.ts:L859`](src/app/api/play/npcs/[id]/meet/route.ts#L859)
- **Status**: **Wired**. Modifies item counts when both NPCs appear simultaneously.

---

### Category 2: Sales, Pricing & Economy

#### 8. `MONEY_FOR_XP`
- **Description**: Earn $2 for each experience point you earn.
- **Default Parameters**: `{ money_per_xp: 2 }`
- **Key Code Paths**:
  - Implementation: [`src/server/collection-gameplay.ts`](src/server/collection-gameplay.ts#L328) (`grantXp`)
  - Implementation: [`src/server/auction-gameplay.ts`](src/server/auction-gameplay.ts#L225) (`grantAuctionXpReward`)
  - Service: [`src/server/standard-npc-reward-service.ts`](src/server/standard-npc-reward-service.ts#L160)
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L1452)
- **Status**: **Wired**. Evaluated across multiple XP grant routines.

#### 9. `UNCLAIMED_ITEM_SELL_BONUS`
- **Description**: Gain bonus money for selling unclaimed art.
- **Default Parameters**: `{ sell_multiplier: 1.5 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/items/[id]/sell/route.ts`](src/app/api/play/items/[id]/sell/route.ts#L136)
  - Endpoint: [`src/app/api/play/items/sell-all/route.ts`](src/app/api/play/items/sell-all/route.ts#L247)
- **Status**: **Wired**. Applied during single or bulk unclaimed item sales.

#### 10. `QUEST_ITEM_SELL_BONUS`
- **Description**: Selling quest items gives double the selling fee.
- **Default Parameters**: `{ sell_multiplier: 2 }`
- **Key Code Paths**:
  - Implementation: [`src/server/quest-item-sell.ts`](src/server/quest-item-sell.ts) (`evaluateQuestItemSellBonus`)
  - Endpoint (Single Sell): [`src/app/api/play/items/[id]/sell/route.ts`](src/app/api/play/items/[id]/sell/route.ts#L139)
  - Endpoint (Bulk Sell): [`src/app/api/play/items/sell-all/route.ts`](src/app/api/play/items/sell-all/route.ts#L252)
  - Unit Tests: [`src/server/quest-item-sell.test.ts`](src/server/quest-item-sell.test.ts)
  - Seed Script: [`scripts/legendary-effects/seed-quest-item-sell-bonus.mjs`](scripts/legendary-effects/seed-quest-item-sell-bonus.mjs)
  - Legacy Reference: [`lib/PlayerItemIF.js`](lib/PlayerItemIF.js), [`lib/client-loot.js`](lib/client-loot.js)
- **Status**: **VERIFIED / RESTORED**. Evaluates active quests, matches artwork IDs, and applies sell multiplier on single and bulk item sales. Restored in commit [`cd82fac6`](src/server/quest-item-sell.ts) (PR #16).

#### 11. `REROLL_DISCOUNT`
- **Description**: Reroll costs are reduced by 25%.
- **Default Parameters**: `{ cost_multiplier: 0.75 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/items/[id]/reroll/route.ts`](src/app/api/play/items/[id]/reroll/route.ts#L76)
  - UI Component: [`src/app/play/page.tsx`](src/app/play/page.tsx#L376)
- **Status**: **Wired**. Reduces reroll pricing in API and UI.

#### 12. `DEALER_DISCOUNT`
- **Description**: Dealer prices are reduced by 25%.
- **Default Parameters**: `{ cost_multiplier: 0.75 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/items/[id]/purchase/route.ts`](src/app/api/play/items/[id]/purchase/route.ts#L44)
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L1014)
  - Endpoint: [`src/app/api/play/items/[id]/archive/route.ts`](src/app/api/play/items/[id]/archive/route.ts#L157)
- **Status**: **Wired**. Reduces dealer item purchase prices.

---

### Category 3: NPC Interactions & Offer Generation

#### 13. `BENEFACTOR_CONDITION_BONUS`
- **Description**: Benefactors increase their donation multiplier by 5% for each displayed item above 90% condition.
- **Default Parameters**: `{ condition_minimum: 0.9, multiplier_per_item: 0.05 }`
- **Key Code Paths**:
  - Service: [`src/server/standard-npc-reward-service.ts`](src/server/standard-npc-reward-service.ts#L79)
- **Status**: **Wired**. Increases benefactor reward multiplier based on gallery condition.

#### 14. `COLLECTOR_DOES_NOT_COLLECT`
- **Description**: Art Collectors have a 15% chance to offer a reward without taking their desired item.
- **Default Parameters**: `{ keep_chance: 0.15 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L1204)
- **Status**: **Wired**. Evaluated when resolving collector offers.

#### 15. `DONOR_LEVEL_MIN`
- **Description**: Artwork donated to you always starts at level 5.
- **Default Parameters**: `{ level_minimum: 5 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L651)
- **Status**: **Wired**. Forces donor item level baseline.

#### 16. `XP_FOR_ZERO_COUNTS`
- **Description**: Meeting an Art Expert grants 10% of an XP chunk for each displayed painting with a roll count of 0 or less.
- **Default Parameters**: `{ xp_chunk_percentage: 0.1 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L363)
- **Status**: **Wired**. Grants XP on Art Expert interaction.

#### 17. `DEALER_LEVEL_MIN`
- **Description**: Artwork offered by Art Dealers always starts at level 3.
- **Default Parameters**: `{ level_minimum: 3 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L1005)
- **Status**: **Wired**. Forces dealer item level baseline.

#### 18. `ART_COLLECTOR_XP_REWARD`
- **Description**: When an Art Enthusiast is present, Art Collectors offer XP instead of money.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L1199)
- **Status**: **Wired**. Converts monetary reward to XP.

#### 19. `DONOR_CONDITION_MIN`
- **Description**: Artwork donated to you always has condition above 80%.
- **Default Parameters**: `{ condition_minimum: 0.8 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L646)
- **Status**: **Wired**. Sets minimum condition for donor items.

#### 20. `DONOR_EXPERT_BONUS`
- **Description**: Art Experts appearing with Art Donors provide double the reroll reduction or Karma reward.
- **Default Parameters**: `{ reward_multiplier: 2 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L358)
- **Status**: **Wired**. Doubles Art Expert rewards when Donor is present.

#### 21. `BONUS_DEALER_DONOR`
- **Description**: Art Dealers and Art Donors both give an additional painting.
- **Default Parameters**: `{ additional_items: 1 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L641) & [`route.ts:L995`](src/app/api/play/npcs/[id]/meet/route.ts#L995)
- **Status**: **Wired**. Grants +1 item in offer sets.

#### 22. `COLLECTOR_DONOR_PAIR`
- **Description**: Platinum Art Donors are always accompanied by Art Collectors, and vice versa.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Implementation: [`src/server/npc-gameplay.ts`](src/server/npc-gameplay.ts#L200) (`rollDailyNpcPresence`)
- **Status**: **Wired**. Forces paired NPC presence in daily rolls.

#### 23. `DONOR_QUEST_ITEM_CHANCE`
- **Description**: Art Donors have an increased chance to offer quest items.
- **Default Parameters**: `{ chance: 0.2 }`
- **Key Code Paths**:
  - Module: [`src/server/npc-quest-item.ts`](src/server/npc-quest-item.ts) (`evaluateDonorQuestItemChance`)
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L706)
  - Unit Tests: [`src/server/npc-quest-item.test.ts`](src/server/npc-quest-item.test.ts)
  - Seed Script: [`scripts/legendary-effects/seed-donor-quest-item-chance.mjs`](scripts/legendary-effects/seed-donor-quest-item-chance.mjs)
  - Legacy Reference: [`server/npc_interactions/donorInteraction.js`](server/npc_interactions/donorInteraction.js)
- **Status**: **VERIFIED / RESTORED**. Evaluates active quests, picks a target artwork ID on 20% roll chance, and replaces 1 standard donor drop with the quest target item. Restored in commit [`ad35dd46`](src/server/npc-quest-item.ts) (PR #12).

#### 24. `DISPLAY_CONDITION_DEALER_BOOST`
- **Description**: If every displayed painting has condition above 70%, Art Dealers give an additional item.
- **Default Parameters**: `{ condition_minimum: 0.7, additional_items: 1 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L1000)
- **Status**: **Wired**. Evaluates gallery condition threshold for bonus dealer item.

#### 25. `GOOD_CONDITION_COLLECTOR_BONUS`
- **Description**: Art Collectors add 0.2 to their offer multiplier for paintings with condition above 80%.
- **Default Parameters**: `{ condition_minimum: 0.8, multiplier_bonus: 0.2 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L1189)
- **Status**: **Wired**. Increases collector offer multiplier.

#### 26. `DEALER_PURCHASE_ROLL_COUNT_SET`
- **Description**: Items bought from the Art Dealer start with a -20 roll count.
- **Default Parameters**: `{ roll_count: -20 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/items/[id]/purchase/route.ts`](src/app/api/play/items/[id]/purchase/route.ts#L58)
- **Status**: **Wired**. Sets initial roll count on purchased items.

#### 27. `ART_COLLECTOR_ROLL_COUNT_BONUS`
- **Description**: Art Collectors add 0.2 to their offer multiplier for items with a roll count of 0 or less.
- **Default Parameters**: `{ roll_count_maximum: 0, multiplier_bonus: 0.2 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L1194)
- **Status**: **Wired**. Increases collector offer multiplier for low roll-count items.

#### 28. `COLLECTOR_FOR_SALE_OFFER`
- **Description**: Art Collectors offer two additional artworks for sale.
- **Default Parameters**: `{ additional_items: 2 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L1209)
- **Status**: **Wired**. Expands collector sale inventory.

#### 29. `DEALER_QUEST_ITEM_CHANCE`
- **Description**: Art Dealers have an increased chance to offer quest items.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Module: [`src/server/npc-quest-item.ts`](src/server/npc-quest-item.ts) (`evaluateDealerQuestItemChance`)
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L1057)
  - Unit Tests: [`src/server/npc-quest-item.test.ts`](src/server/npc-quest-item.test.ts)
  - Seed Script: [`scripts/legendary-effects/seed-dealer-quest-item-chance.mjs`](scripts/legendary-effects/seed-dealer-quest-item-chance.mjs)
  - Legacy Reference: [`server/npc_interactions/artDealerInteraction.js`](server/npc_interactions/artDealerInteraction.js)
- **Status**: **VERIFIED / RESTORED**. Evaluates active quests, picks a target artwork ID on 20% roll chance, and replaces 1 standard dealer drop with the quest target item for sale. Restored in commit [`61ffc998`](src/server/npc-quest-item.ts) (PR #17).

#### 30. `COLLECTOR_QUEST_ITEM`
- **Description**: Art Collectors occasionally give quest items in addition to money.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts#L1261) (TODO comment placeholder)
  - Legacy Reference: [`server/npc_interactions/collectorInteraction.js`](server/npc_interactions/collectorInteraction.js)
- **Status**: **INCOMPLETE (TODO AI)**. Pending implementation during NPC interaction porting.

---

### Category 4: Quests & Art Historian

#### 31. `QUEST_XP_BONUS`
- **Description**: Quests give bonus XP.
- **Default Parameters**: `{ xp_multiplier: 1.5 }`
- **Key Code Paths**:
  - Implementation: [`src/server/art-historian-gameplay.ts`](src/server/art-historian-gameplay.ts#L194) (`claimArtHistorianQuest`)
- **Status**: **Wired**. Multiplies quest reward XP.

#### 32. `QUEST_TARGET_CONDITION_INCREASE`
- **Description**: Turning in quest items immediately increases their condition to 90%.
- **Default Parameters**: `{ condition_target: 0.9 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/quests/[id]/claim/route.ts`](src/app/api/play/quests/[id]/claim/route.ts#L154)
- **Status**: **Wired**. Restores item condition on quest completion.

#### 33. `KNOWLEDGE_FOR_QUESTS`
- **Description**: Turning in quest items grants Karma.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Implementation: Missing in [`src/app/api/play/quests/[id]/claim/route.ts`](src/app/api/play/quests/[id]/claim/route.ts)
  - Legacy Reference: [`scripts/legendary-attribute-data.mjs`](scripts/legendary-attribute-data.mjs#L83)
- **Status**: **UNHOOKED / MISSING**. Karma award is omitted on quest claim.

#### 34. `MARKET_EXPERT_QUEST_BONUS`
- **Description**: Quests provide bonus money based on active winning auctions.
- **Default Parameters**: `{ multiplier_per_winning_auction: 0.1 }`
- **Key Code Paths**:
  - Implementation: [`src/server/art-historian-gameplay.ts`](src/server/art-historian-gameplay.ts) (`createArtHistorianQuest`, `calculateMarketExpertMoneyMultiplier`)
  - Unit Tests: [`src/server/art-historian-gameplay.test.ts`](src/server/art-historian-gameplay.test.ts)
- **Status**: **VERIFIED / RESTORED**. Evaluates active winning auctions and applies money multiplier during Art Historian quest generation. Restored in commit [`9e6684c0`](src/server/art-historian-gameplay.ts) / [`89009ec8`](src/server/art-historian-gameplay.ts) (PR #24).

---

### Category 5: Gallery Care & Restoration

#### 35. `LEVEL_UP_COST_REDUCTION`
- **Description**: When a Preservationist is present, items above 80% condition require fewer resources to level up.
- **Default Parameters**: `{ condition_minimum: 0.8 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/items/[id]/level/route.ts`](src/app/api/play/items/[id]/level/route.ts#L65)
  - UI Component: [`src/app/play/page.tsx`](src/app/play/page.tsx#L376)
- **Status**: **Wired**. Reduces level-up cost when requirements are satisfied.

#### 36. `KNOWLEDGE_FOR_REPAIR`
- **Description**: Manually repairing an item to 100% grants Karma for that item.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Implementation: [`src/server/preservationist-gameplay.ts`](src/server/preservationist-gameplay.ts#L219) (`grantPreservationistRepair`)
- **Status**: **Wired**. Grants Karma when item repair reaches 100%.

---

## 4. Initial Audit Findings & Priority Action Items

Based on code path analysis across modern `src/` files vs legacy implementations, the effects requiring immediate validation or remediation are:

> [!WARNING]
> ### 1. Missing / Unhooked Effects (High Priority)
> The following 2 effects are defined in seed metadata but completely missing implementation in modern `src/` handlers:
> 1. **`KNOWLEDGE_FOR_QUESTS`**: Missing in [`src/app/api/play/quests/[id]/claim/route.ts`](src/app/api/play/quests/[id]/claim/route.ts).
> 2. **`KNOWLEDGE_FOR_AUCTION_WINS`**: Missing in [`src/server/auction-gameplay.ts`](src/server/auction-gameplay.ts).

> [!NOTE]
> ### 2. Incomplete NPC Interactions (Medium Priority)
> The following 3 effects have `TODO AI:` comment markers in [`src/app/api/play/npcs/[id]/meet/route.ts`](src/app/api/play/npcs/[id]/meet/route.ts):
> 1. **`AUCTION_COUNT_DEALER_BONUS`** (Line 1053)
> 2. **`ART_COLLECTOR_AUCTION_BONUS`** (Line 1261)
> 3. **`COLLECTOR_QUEST_ITEM`** (Line 1261)

---

## 5. Next Steps & Validation Plan

1. **User Review**: Verify that the cataloged list of 36 Legendary attributes and identified key code paths accurately represent the intended game mechanics.
2. **Automated Test Suite**: Develop targeted unit tests in `src/server/*.test.ts` to test each effect handler with mock MongoDB DB instances.
3. **Manual QA Verification**: Utilize seed scripts (`scripts/dev-seed-legendary.mjs`, etc.) to test live effect execution on local dev environment.
