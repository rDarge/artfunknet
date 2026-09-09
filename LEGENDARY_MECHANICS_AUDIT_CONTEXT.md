# Legendary Mechanics Audit Context & Bootstrap Guide

This document summarizes the context, architecture, key code paths, developer tooling, and lessons learned from the recent fix to the `XP_FOR_AUCTIONS` Legendary attribute. It is designed to bootstrap the upcoming codebase audit of all Legendary artwork special mechanics and unique benefits.

---

## 1. Goal of the Upcoming Audit

Following an earlier gameplay refactor, some Legendary artwork unique benefits may not be triggering correctly across various player actions (e.g., auctions, sales, gallery payouts, NPC interactions, repairs, etc.). 

The goal of the audit is to:
1. Identify all defined Legendary unique attributes (`unique_attributes` collection & `legendary-attributes.ts`).
2. Verify where and how each effect is intended to be evaluated in server endpoints and gameplay modules.
3. Confirm that active displayed Legendary works properly grant their respective bonuses.
4. Implement missing triggers or fix disconnected logic, backed by unit tests and developer seeding scripts.

---

## 2. Architecture & Data Schema

### Legendary Attributes & Effects
- **`unique_attributes` Collection**: Stores definitions of legendary effects.
  - Key fields: `_id` (e.g., `"ChzMmNXmSZkzuCs33"`), `code` (e.g., `"XP_FOR_AUCTIONS"`, `"MONEY_FOR_XP"`), `name`, `active`, `parameters` (e.g., `{ "xp_chunk_percentage": 0.5 }`), `linked_attributes`.
- **`artworks` Collection**:
  - `special_attributes`: Array of attribute ID pairs.
  - `unique_attributes`: Array of unique attribute IDs linked to the artwork.
- **`items` Collection**:
  - `active_unique_attribute`: References `unique_attributes._id`.
  - `status`: Must be `"displayed"` for gallery-based Legendary effects to be active.
  - `tags`: Array of string tags (e.g. `["for sale"]`).
  - `values`: Object containing monetary values, including `sell` (`values.sell`).

### Core Evaluation Module (`src/server/legendary-attributes.ts`)
- **`getDisplayedLegendaryEffect(database, playerId, effectCode)`**:
  - Queries `unique_attributes` by `code` to get `_id`.
  - Queries `items` where `owner === playerId`, `status === "displayed"`, and `active_unique_attribute === effect._id`.
  - Returns the matching attribute effect object (or `null` if not active/displayed).
- **`getLegendaryNumberParameter(effect, paramName, defaultValue)`**:
  - Safely extracts numeric parameters from the effect's `parameters` object.

---

## 3. Key Code Paths & Core Files

| File / Component | Purpose / Functionality |
| :--- | :--- |
| `src/server/legendary-attributes.ts` | Central utility for checking displayed legendary effects and parameter lookup. |
| `src/server/auction-gameplay.ts` | Includes `grantAuctionXpReward()`, evaluating `XP_FOR_AUCTIONS` & `MONEY_FOR_XP`. |
| `src/app/api/play/items/[id]/auction/route.ts` | POST endpoint triggering auction creation and invoking `grantAuctionXpReward`. |
| `src/server/standard-npc-rewards.ts` | Contains NPC reward logic checking displayed legendary effects. |
| `src/server/collection-gameplay.ts` | Contains leveling, XP calculation (`getXpChunk`, `applyXp`), profile caps (`getCapsForLevel`), and gallery rates. |
| `src/app/play/game-dashboard.tsx` | Dashboard UI displaying inventory, gallery, item property badges, and action buttons. |
| `src/components/item-cards/shared.tsx` | Item card rendering logic; relies on item `tags` array and `values.sell`. |

---

## 4. Developer Helper Scripts (`scripts/`)

The following helper scripts are available in the project to facilitate testing player states and seeding items:

- **`scripts/dev-seed-legendary.mjs`**:
  - Seeds a fully-formed Legendary item into the test player's inventory (`status: "displayed"`, complete `tags`, `values.sell`, and `active_unique_attribute` set to `XP_FOR_AUCTIONS` `ChzMmNXmSZkzuCs33`).
  - Also activates `market_expert` status on the player's profile.
- **`scripts/grant-market-expert.mjs`**:
  - Activates `profile.market_expert.expiration` for a target player.
  - Usage: `node --env-file=.env.local scripts/grant-market-expert.mjs <hours>`
- **`scripts/set-player-level.mjs`**:
  - Sets a player's level and recalculates profile caps (`inventory_cap`, `display_cap`, `auction_cap`, etc.).
  - Usage: `node --env-file=.env.local scripts/set-player-level.mjs <level>` (e.g. `30`).
- **`scripts/seed-sample-artworks.mjs`**:
  - Seeds sample artworks into the local development database.

---

## 5. Testing & Verification Strategies

### Automated Unit Tests
- **Runner**: Node.js built-in test runner (`npm test` / `node --test`).
- **Test Files**: `src/server/*.test.ts` (e.g., `auction-gameplay.test.ts`, `legendary-attributes.test.ts`).
- **Pattern**: Mock the MongoDB `Db` interface for `items`, `unique_attributes`, and `players` collections to test effect resolution edge cases (inactive effect, item not displayed, missing player, leveling up, etc.).

### Manual QA & Verification Flow
1. **Bootstrap local DB**:
   ```bash
   npm run db:up
   npm run db:seed
   ```
2. **Seed state using dev scripts**:
   ```bash
   node --env-file=.env.local scripts/dev-seed-legendary.mjs
   node --env-file=.env.local scripts/grant-market-expert.mjs 24
   node --env-file=.env.local scripts/set-player-level.mjs 30
   ```
3. **Run dev server**:
   ```bash
   npm run dev
   ```
4. **Inspect in UI**: Log into `http://localhost:3000/play` and perform the target action to verify UI state, notifications, and profile balance/XP updates.

---

## 6. Important Lessons Learned & Gotchas

1. **Item Schema Integrity**:
   - Items in MongoDB must strictly adhere to the expected item schema. Missing fields like `tags` or `values.sell` cause client-side React rendering crashes (e.g., `item.tags.includes` or `item.values.sell.toLocaleString`).
2. **Item Status (`"displayed"`)**:
   - `getDisplayedLegendaryEffect()` requires `item.status === "displayed"`. If an item is in inventory or up for auction (`status === "inventory"` or `"auction"`), the effect will return `null`.
3. **Unique Attribute ID Matching**:
   - Legendary items match effects by the database document `_id` of the `unique_attributes` entry, NOT directly by the string `code`. Always resolve `code -> _id` first via `unique_attributes` collection.
4. **Scope Control**:
   - Do NOT alter production application code (`src/`) to force test conditions. Use developer `.mjs` scripts or unit test mocks for testing scenarios.
