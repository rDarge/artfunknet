# Legendary Mechanics Audit Report

## 1. Overview & Objectives

Following a recent major gameplay refactor in **artfunknet**, an audit is underway to ensure all **36 Legendary Artwork Unique Attributes** grant their special abilities correctly when displayed in a player's gallery.

This audit report cataloging all 36 Legendary effects serves as the primary tracking document for verifying effect logic, identifying disconnected or unhooked mechanics, and guiding subsequent fixes and test coverage.

### Key Audit Highlights
- **Total Legendary Attributes Cataloged**: 36
- **Recently Fixed**: 4 (`XP_FOR_AUCTIONS` restored in commit `2137f86e`, `QUEST_ITEM_SELL_BONUS` restored in branch `feature/quest-item-sell-bonus-parity`, `DONOR_QUEST_ITEM_CHANCE` restored in branch `feat/restore-donor-quest-item-chance`, `DEALER_QUEST_ITEM_CHANCE` restored in branch `feat/restore-dealer-quest-item-chance`)
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
  - Implementation: [`src/server/auction-gameplay.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/auction-gameplay.ts#L206-L282) (`grantAuctionXpReward`)
  - Endpoint: [`src/app/api/play/items/[id]/auction/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/items/%5Bid%5D/auction/route.ts#L145)
  - Unit Tests: [`src/server/auction-gameplay.test.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/auction-gameplay.test.ts#L61-L117)
- **Status**: **VERIFIED / RESTORED**. Recently repaired in commit [`2137f86e`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/items/%5Bid%5D/auction/route.ts). Combines with `MONEY_FOR_XP` if active.

#### 2. `PRIVATE_AUCTION_PRICE_REDUCTION`
- **Description**: Private auction items have a reduced starting price.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L783) (Auctioneer interaction)
  - Legacy Reference: [`server/npc_interactions/auctioneerInteraction.js`](file:///c:/Users/Ryan/workspace/artfunknet/server/npc_interactions/auctioneerInteraction.js)
- **Status**: **Wired**. Requires audit verification during Auctioneer meetings.

#### 3. `AUCTION_WIN_CONDITION_INCREASE`
- **Description**: Auction wins below 50% condition immediately increase to 90% condition.
- **Default Parameters**: `{ condition_threshold: 0.5, condition_target: 0.9 }`
- **Key Code Paths**:
  - Implementation: [`src/server/auction-gameplay.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/auction-gameplay.ts#L541) (`settleExpiredAuctions`)
  - Legacy Reference: [`server/auction_methods.js`](file:///c:/Users/Ryan/workspace/artfunknet/server/auction_methods.js)
- **Status**: **Wired**. Evaluated during auction settlement.

#### 4. `KNOWLEDGE_FOR_AUCTION_WINS`
- **Description**: Winning auctions grants Karma based on the item won.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Implementation: Missing in [`src/server/auction-gameplay.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/auction-gameplay.ts)
  - Legacy Reference: [`server/auction_methods.js`](file:///c:/Users/Ryan/workspace/artfunknet/server/auction_methods.js)
- **Status**: **UNHOOKED / MISSING**. Karma award is not currently evaluated upon winning an auction.

#### 5. `ART_COLLECTOR_AUCTION_BONUS`
- **Description**: Art Collectors offer bonuses based on your currently auctioned items.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L1130) (TODO comment placeholder)
  - Legacy Reference: [`server/npc_interactions/collectorInteraction.js`](file:///c:/Users/Ryan/workspace/artfunknet/server/npc_interactions/collectorInteraction.js)
- **Status**: **INCOMPLETE (TODO AI)**. Pending implementation during NPC interaction porting.

#### 6. `AUCTION_COUNT_DEALER_BONUS`
- **Description**: Art Dealers give bonus items based on your number of active auctions.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L964) (TODO comment placeholder)
  - Legacy Reference: [`server/npc_interactions/artDealerInteraction.js`](file:///c:/Users/Ryan/workspace/artfunknet/server/npc_interactions/artDealerInteraction.js)
- **Status**: **INCOMPLETE (TODO AI)**. Pending implementation during NPC interaction porting.

#### 7. `DONOR_AUCTIONEER_TRADE`
- **Description**: When both are present, Art Donors offer one fewer item and Auctioneers offer four more.
- **Default Parameters**: `{ donor_item_delta: -1, auctioneer_item_delta: 4 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L617) & [`route.ts:L776`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L776)
- **Status**: **Wired**. Modifies item counts when both NPCs appear simultaneously.

---

### Category 2: Sales, Pricing & Economy

#### 8. `MONEY_FOR_XP`
- **Description**: Earn $2 for each experience point you earn.
- **Default Parameters**: `{ money_per_xp: 2 }`
- **Key Code Paths**:
  - Implementation: [`src/server/collection-gameplay.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/collection-gameplay.ts#L327) (`grantXp`)
  - Implementation: [`src/server/auction-gameplay.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/auction-gameplay.ts#L224) (`grantAuctionXpReward`)
  - Service: [`src/server/standard-npc-reward-service.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/standard-npc-reward-service.ts#L153)
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L1320)
- **Status**: **Wired**. Evaluated across multiple XP grant routines.

#### 9. `UNCLAIMED_ITEM_SELL_BONUS`
- **Description**: Gain bonus money for selling unclaimed art.
- **Default Parameters**: `{ sell_multiplier: 1.5 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/items/[id]/sell/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/items/%5Bid%5D/sell/route.ts#L130)
  - Endpoint: [`src/app/api/play/items/sell-all/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/items/sell-all/route.ts#L240)
- **Status**: **Wired**. Applied during single or bulk unclaimed item sales.

#### 10. `QUEST_ITEM_SELL_BONUS`
- **Description**: Selling quest items gives double the selling fee.
- **Default Parameters**: `{ sell_multiplier: 2 }`
- **Key Code Paths**:
  - Implementation: [`src/server/quest-item-sell.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/quest-item-sell.ts) (`evaluateQuestItemSellBonus`)
  - Endpoint (Single Sell): [`src/app/api/play/items/[id]/sell/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/items/%5Bid%5D/sell/route.ts#L139)
  - Endpoint (Bulk Sell): [`src/app/api/play/items/sell-all/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/items/sell-all/route.ts#L243)
  - Unit Tests: [`src/server/quest-item-sell.test.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/quest-item-sell.test.ts)
  - Seed Script: [`scripts/legendary-effects/seed-quest-item-sell-bonus.mjs`](file:///c:/Users/Ryan/workspace/artfunknet/scripts/legendary-effects/seed-quest-item-sell-bonus.mjs)
  - Legacy Reference: [`lib/PlayerItemIF.js`](file:///c:/Users/Ryan/workspace/artfunknet/lib/PlayerItemIF.js), [`lib/client-loot.js`](file:///c:/Users/Ryan/workspace/artfunknet/lib/client-loot.js)
- **Status**: **VERIFIED / RESTORED**. Evaluates active quests, matches artwork IDs, and applies sell multiplier on single and bulk item sales.

#### 11. `REROLL_DISCOUNT`
- **Description**: Reroll costs are reduced by 25%.
- **Default Parameters**: `{ cost_multiplier: 0.75 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/items/[id]/reroll/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/items/%5Bid%5D/reroll/route.ts#L75)
  - UI Component: [`src/app/play/page.tsx`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/play/page.tsx#L376)
- **Status**: **Wired**. Reduces reroll pricing in API and UI.

#### 12. `DEALER_DISCOUNT`
- **Description**: Dealer prices are reduced by 25%.
- **Default Parameters**: `{ cost_multiplier: 0.75 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/items/[id]/purchase/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/items/%5Bid%5D/purchase/route.ts#L44)
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L928)
  - Endpoint: [`src/app/api/play/items/[id]/archive/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/items/%5Bid%5D/archive/route.ts#L157)
- **Status**: **Wired**. Reduces dealer item purchase prices.

---

### Category 3: NPC Interactions & Offer Generation

#### 13. `BENEFACTOR_CONDITION_BONUS`
- **Description**: Benefactors increase their donation multiplier by 5% for each displayed item above 90% condition.
- **Default Parameters**: `{ condition_minimum: 0.9, multiplier_per_item: 0.05 }`
- **Key Code Paths**:
  - Service: [`src/server/standard-npc-reward-service.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/standard-npc-reward-service.ts#L78)
- **Status**: **Wired**. Increases benefactor reward multiplier based on gallery condition.

#### 14. `COLLECTOR_DOES_NOT_COLLECT`
- **Description**: Art Collectors have a 15% chance to offer a reward without taking their desired item.
- **Default Parameters**: `{ keep_chance: 0.15 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L1073)
- **Status**: **Wired**. Evaluated when resolving collector offers.

#### 15. `DONOR_LEVEL_MIN`
- **Description**: Artwork donated to you always starts at level 5.
- **Default Parameters**: `{ level_minimum: 5 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L612)
- **Status**: **Wired**. Forces donor item level baseline.

#### 16. `XP_FOR_ZERO_COUNTS`
- **Description**: Meeting an Art Expert grants 10% of an XP chunk for each displayed painting with a roll count of 0 or less.
- **Default Parameters**: `{ xp_chunk_percentage: 0.1 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L356)
- **Status**: **Wired**. Grants XP on Art Expert interaction.

#### 17. `DEALER_LEVEL_MIN`
- **Description**: Artwork offered by Art Dealers always starts at level 3.
- **Default Parameters**: `{ level_minimum: 3 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L921)
- **Status**: **Wired**. Forces dealer item level baseline.

#### 18. `ART_COLLECTOR_XP_REWARD`
- **Description**: When an Art Enthusiast is present, Art Collectors offer XP instead of money.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L1068)
- **Status**: **Wired**. Converts monetary reward to XP.

#### 19. `DONOR_CONDITION_MIN`
- **Description**: Artwork donated to you always has condition above 80%.
- **Default Parameters**: `{ condition_minimum: 0.8 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L607)
- **Status**: **Wired**. Sets minimum condition for donor items.

#### 20. `DONOR_EXPERT_BONUS`
- **Description**: Art Experts appearing with Art Donors provide double the reroll reduction or Karma reward.
- **Default Parameters**: `{ reward_multiplier: 2 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L351)
- **Status**: **Wired**. Doubles Art Expert rewards when Donor is present.

#### 21. `BONUS_DEALER_DONOR`
- **Description**: Art Dealers and Art Donors both give an additional painting.
- **Default Parameters**: `{ additional_items: 1 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L602) & [`route.ts:L911`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L911)
- **Status**: **Wired**. Grants +1 item in offer sets.

#### 22. `COLLECTOR_DONOR_PAIR`
- **Description**: Platinum Art Donors are always accompanied by Art Collectors, and vice versa.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Implementation: [`src/server/npc-gameplay.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/npc-gameplay.ts#L200) (`rollDailyNpcPresence`)
- **Status**: **Wired**. Forces paired NPC presence in daily rolls.

#### 23. `DONOR_QUEST_ITEM_CHANCE`
- **Description**: Art Donors have an increased chance to offer quest items.
- **Default Parameters**: `{ chance: 0.2 }`
- **Key Code Paths**:
  - Module: [`src/server/npc-quest-item.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/npc-quest-item.ts) (`evaluateDonorQuestItemChance`)
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L660)
  - Unit Tests: [`src/server/npc-quest-item.test.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/npc-quest-item.test.ts)
  - Seed Script: [`scripts/legendary-effects/seed-donor-quest-item-chance.mjs`](file:///c:/Users/Ryan/workspace/artfunknet/scripts/legendary-effects/seed-donor-quest-item-chance.mjs)
  - Legacy Reference: [`server/npc_interactions/donorInteraction.js`](file:///c:/Users/Ryan/workspace/artfunknet/server/npc_interactions/donorInteraction.js)
- **Status**: **VERIFIED / RESTORED**. Evaluates active quests, picks a target artwork ID on 20% roll chance, and replaces 1 standard donor drop with the quest target item.

#### 24. `DISPLAY_CONDITION_DEALER_BOOST`
- **Description**: If every displayed painting has condition above 70%, Art Dealers give an additional item.
- **Default Parameters**: `{ condition_minimum: 0.7, additional_items: 1 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L916)
- **Status**: **Wired**. Evaluates gallery condition threshold for bonus dealer item.

#### 25. `GOOD_CONDITION_COLLECTOR_BONUS`
- **Description**: Art Collectors add 0.2 to their offer multiplier for paintings with condition above 80%.
- **Default Parameters**: `{ condition_minimum: 0.8, multiplier_bonus: 0.2 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L1058)
- **Status**: **Wired**. Increases collector offer multiplier.

#### 26. `DEALER_PURCHASE_ROLL_COUNT_SET`
- **Description**: Items bought from the Art Dealer start with a -20 roll count.
- **Default Parameters**: `{ roll_count: -20 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/items/[id]/purchase/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/items/%5Bid%5D/purchase/route.ts#L49)
- **Status**: **Wired**. Sets initial roll count on purchased items.

#### 27. `ART_COLLECTOR_ROLL_COUNT_BONUS`
- **Description**: Art Collectors add 0.2 to their offer multiplier for items with a roll count of 0 or less.
- **Default Parameters**: `{ roll_count_maximum: 0, multiplier_bonus: 0.2 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L1063)
- **Status**: **Wired**. Increases collector offer multiplier for low roll-count items.

#### 28. `COLLECTOR_FOR_SALE_OFFER`
- **Description**: Art Collectors offer two additional artworks for sale.
- **Default Parameters**: `{ additional_items: 2 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L1078)
- **Status**: **Wired**. Expands collector sale inventory.

#### 29. `DEALER_QUEST_ITEM_CHANCE`
- **Description**: Art Dealers have an increased chance to offer quest items.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Module: [`src/server/npc-quest-item.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/npc-quest-item.ts) (`evaluateDealerQuestItemChance`)
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L1045)
  - Unit Tests: [`src/server/npc-quest-item.test.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/npc-quest-item.test.ts)
  - Seed Script: [`scripts/legendary-effects/seed-dealer-quest-item-chance.mjs`](file:///c:/Users/Ryan/workspace/artfunknet/scripts/legendary-effects/seed-dealer-quest-item-chance.mjs)
  - Legacy Reference: [`server/npc_interactions/artDealerInteraction.js`](file:///c:/Users/Ryan/workspace/artfunknet/server/npc_interactions/artDealerInteraction.js)
- **Status**: **VERIFIED / RESTORED**. Evaluates active quests, picks a target artwork ID on 20% roll chance, and replaces 1 standard dealer drop with the quest target item for sale.

#### 30. `COLLECTOR_QUEST_ITEM`
- **Description**: Art Collectors occasionally give quest items in addition to money.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts#L1130) (TODO comment placeholder)
  - Legacy Reference: [`server/npc_interactions/collectorInteraction.js`](file:///c:/Users/Ryan/workspace/artfunknet/server/npc_interactions/collectorInteraction.js)
- **Status**: **INCOMPLETE (TODO AI)**. Pending implementation during NPC interaction porting.

---

### Category 4: Quests & Art Historian

#### 31. `QUEST_XP_BONUS`
- **Description**: Quests give bonus XP.
- **Default Parameters**: `{ xp_multiplier: 1.5 }`
- **Key Code Paths**:
  - Implementation: [`src/server/art-historian-gameplay.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/art-historian-gameplay.ts#L194) (`claimArtHistorianQuest`)
- **Status**: **Wired**. Multiplies quest reward XP.

#### 32. `QUEST_TARGET_CONDITION_INCREASE`
- **Description**: Turning in quest items immediately increases their condition to 90%.
- **Default Parameters**: `{ condition_target: 0.9 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/quests/[id]/claim/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/quests/%5Bid%5D/claim/route.ts#L152)
- **Status**: **Wired**. Restores item condition on quest completion.

#### 33. `KNOWLEDGE_FOR_QUESTS`
- **Description**: Turning in quest items grants Karma.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Implementation: Missing in [`src/app/api/play/quests/[id]/claim/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/quests/%5Bid%5D/claim/route.ts)
  - Legacy Reference: [`scripts/legendary-attribute-data.mjs`](file:///c:/Users/Ryan/workspace/artfunknet/scripts/legendary-attribute-data.mjs#L83)
- **Status**: **UNHOOKED / MISSING**. Karma award is omitted on quest claim.

#### 34. `MARKET_EXPERT_QUEST_BONUS`
- **Description**: Quests provide bonus money based on active auctions.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Implementation: [`src/server/art-historian-gameplay.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/art-historian-gameplay.ts#L199) (`claimArtHistorianQuest`)
- **Status**: **Wired**. Grants bonus money on quest claim.

---

### Category 5: Gallery Care & Restoration

#### 35. `LEVEL_UP_COST_REDUCTION`
- **Description**: When a Preservationist is present, items above 80% condition require fewer resources to level up.
- **Default Parameters**: `{ condition_minimum: 0.8 }`
- **Key Code Paths**:
  - Endpoint: [`src/app/api/play/items/[id]/level/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/items/%5Bid%5D/level/route.ts#L65)
  - UI Component: [`src/app/play/page.tsx`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/play/page.tsx#L386)
- **Status**: **Wired**. Reduces level-up cost when requirements are satisfied.

#### 36. `KNOWLEDGE_FOR_REPAIR`
- **Description**: Manually repairing an item to 100% grants Karma for that item.
- **Default Parameters**: `{}`
- **Key Code Paths**:
  - Implementation: [`src/server/preservationist-gameplay.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/preservationist-gameplay.ts#L219) (`grantPreservationistRepair`)
- **Status**: **Wired**. Grants Karma when item repair reaches 100%.

---

## 4. Initial Audit Findings & Priority Action Items

Based on code path analysis across modern `src/` files vs legacy implementations, the effects requiring immediate validation or remediation are:

> [!WARNING]
> ### 1. Missing / Unhooked Effects (High Priority)
> The following 2 effects are defined in seed metadata but completely missing implementation in modern `src/` handlers:
> 1. **`KNOWLEDGE_FOR_QUESTS`**: Missing in [`src/app/api/play/quests/[id]/claim/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/quests/%5Bid%5D/claim/route.ts).
> 2. **`KNOWLEDGE_FOR_AUCTION_WINS`**: Missing in [`src/server/auction-gameplay.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/server/auction-gameplay.ts).

> [!NOTE]
> ### 2. Incomplete NPC Interactions (Medium Priority)
> The following 3 effects have `TODO AI:` comment markers in [`src/app/api/play/npcs/[id]/meet/route.ts`](file:///c:/Users/Ryan/workspace/artfunknet/src/app/api/play/npcs/%5Bid%5D/meet/route.ts):
> 1. **`AUCTION_COUNT_DEALER_BONUS`** (Line 964)
> 2. **`ART_COLLECTOR_AUCTION_BONUS`** (Line 1130)
> 3. **`COLLECTOR_QUEST_ITEM`** (Line 1130)

---

## 5. Next Steps & Validation Plan

1. **User Review**: Verify that the cataloged list of 36 Legendary attributes and identified key code paths accurately represent the intended game mechanics.
2. **Automated Test Suite**: Develop targeted unit tests in `src/server/*.test.ts` to test each effect handler with mock MongoDB DB instances.
3. **Manual QA Verification**: Utilize seed scripts (`scripts/dev-seed-legendary.mjs`, etc.) to test live effect execution on local dev environment.
