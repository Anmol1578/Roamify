# 12 · Stay copy via Agent Actions, Dataset Embeddings, and live Home

Status: done

## Goal

Generate each stay's copy (`summary`, `description`, `highlights`) directly from its own facts and typed fields using Sanity Agent Actions, verified by both deterministic code checks and an AI prompt check to guarantee zero hallucinated claims. Turn on Sanity Dataset Embeddings on `production` with the property projection, and verify Roamify Home displays live stays, ratings, and copy from Sanity with category filtering, loading skeletons, pull-to-refresh, and error recovery.

## Decisions

- **Schema additions (`studio/schemaTypes/property.ts`)**:
  - Add group `copy` ("Copy").
  - Add fields:
    - `summary`: string, max 90 characters, validation `rule.max(90)`. One-line summary for cards and search.
    - `description`: text, 3–5 sentences describing the property strictly from its facts.
    - `highlights`: array of string, max 4 highlights (`rule.max(4)`).
    - `copyReview`: object with `readOnly: true`, storing `status` ('passed' | 'failed'), `checkedAt` (ISO string), `sourceHash` (sha256 of input facts/fields), and `unsupportedClaims` array of `{ claim: string, reason: string }`.
  - Schema deployed via `npx sanity schema deploy` from `studio/`.

- **Facts on Seed Data (`studio/scripts/seed-data.ts`)**:
  - Each of the 30 stays receives 3–5 concrete, factual items in `facts: string[]` (architecture, materials, heating/cooling, view orientation, layout details, outdoor features) that match its typed amenities and photos.
  - `seed.ts` writes `facts` to the property document.

- **Agent Actions Copy Generation & 2-Layer Checking (`studio/scripts/copy.ts` & `studio/scripts/copy-checks.ts`)**:
  - Execution: `npx sanity exec scripts/copy.ts --with-user-token [-- --slug <slug> | --dry-run | --force]`
  - Uses `getCliClient({ apiVersion: 'vX' })` with the authenticated Sanity CLI token. Zero secrets stored or exposed.
  - **Generation**:
    - Calls `client.agent.action.prompt` with format `"json"` and temperature `0.2`.
    - Input context: `$stay` containing `title`, `type`, `city`, `region`, `country`, `neighborhood`, `bedrooms`, `beds`, `baths`, `maxGuests`, `amenities`, `facts`, `vibes`, `petsAllowed`.
    - Instructions: Generate `summary` (max 90 chars), `description` (3–5 sentences), and `highlights` (3–4 short items) using strictly and exclusively the facts provided in `$stay`. Forbid inventing unstated amenities, distances, views, numbers, or nearby points of interest.
  - **Layer 1: Deterministic Code Checks (`copy-checks.ts`)**:
    - **Numbers check**: Extracts all numbers from generated copy. Every number must exist in the source data (`pricePerNight`, `maxGuests`, `bedrooms`, `beds`, `baths`, `minNights`, or in `facts`).
    - **Amenities & features check**: Restricts words like "hot tub", "pool", "sauna", "fireplace", "fire pit", "ocean view", "mountain view", "lake view", "beach access", "gym", "ev charger" to stays that have them in `amenities` or `facts`.
    - **Pets check**: Mentions of pets/dogs allowed only if `petsAllowed === true`.
    - **Place names check**: City, region, neighborhood, and country names mentioned must match the stay's location.
    - **Length limits**: `summary` <= 90 chars; `highlights` <= 4 items; `description` 3–5 sentences.
  - **Layer 2: AI Prompt Verification (`invents nothing` check)**:
    - Calls `client.agent.action.prompt` with `format: "json"` and temperature `0`.
    - Instruction: Compare `$copy` against `$source`. List any claim, number, amenity, or feature in `$copy` that is NOT explicitly supported by `$source`. Return `{ "unsupported": [{ "claim": string, "reason": string }] }`.
  - **Patch & Retry Flow**:
    - If Layer 1 and Layer 2 pass:
      - Compute SHA256 `sourceHash`.
      - Patch published stay with `summary`, `description`, `highlights`, and `copyReview: { status: 'passed', checkedAt, sourceHash, unsupportedClaims: [] }`.
    - If either check fails:
      - Retry up to 2 times, passing the failure reasons / unsupported claims as negative instructions.
      - If still failing after 3 total attempts: patch with `copyReview: { status: 'failed', checkedAt, sourceHash, unsupportedClaims }` and log for inspection.
    - Idempotency: stays whose `sourceHash` matches the current source are skipped unless `--force` is passed.

- **Sanity Dataset Embeddings**:
  - Enabled on dataset `production` via Sanity CLI:
    `npx sanity datasets embeddings enable production --projection="{ _type == 'property' => { title, type, city, region, country, neighborhood, summary, description, highlights, vibes, facts, amenities } }"`
  - Poll `npx sanity datasets embeddings status production` until status is `ready`.
  - Verify semantic retrieval via GROQ semantic scoring (`text::semanticSimilarity(...)`).

- **Live Home Screen Verification**:
  - `src/lib/sanity/queries.ts`: `HOME_STAYS_QUERY` already includes `summary`, `description`, `highlights`, `facts`, and `vibes`.
  - Stays displayed on Home load from Sanity public API CDN (`https://ird6lvzh.apicdn.sanity.io/v2025-08-15/data/query/production`).
  - Home displays live titles, locations, photos, prices, ratings, and copy from Sanity.
  - Category filtering, skeleton loading, pull-to-refresh, empty states, and error handling with retry verified.

## Out of scope

- Search screen vector embeddings API route (semantic search API with Clerk session auth handled in subsequent search plan).
- Full stay details screen (`/stay/[slug]` navigation handled in subsequent stay details plan).
- Sanity Context Knowledge Base endpoint creation for policies.

## Steps

### 1. Update Studio Schema Types (`studio/schemaTypes/property.ts`)
- Add group `copy` to `property.ts`.
- Add fields `summary`, `description`, `highlights`, and `copyReview`.
- Deploy updated schema to Sanity using `npx sanity schema deploy`.
- Validate schema with `npx sanity schema validate`.

### 2. Add Stay Facts in Seed Data & Update Seed Script
- Update `studio/scripts/seed-data.ts` to include 3–5 concrete, grounded `facts` for each of the 30 properties.
- Update `studio/scripts/seed.ts` to write `facts` to each property.
- Re-run `npx sanity exec scripts/seed.ts --with-user-token` to update all 30 properties in Sanity.

### 3. Implement Agent Actions Copy Generator & 2-Layer Fact Checker
- Create `studio/scripts/copy-checks.ts` with pure deterministic validators (numbers, amenities, pets, place names, length).
- Create `studio/scripts/copy.ts` implementing `generateCopy` and `verifyClaims` via `client.agent.action.prompt` (`apiVersion: 'vX'`).
- Test with 1 property first (`npx sanity exec scripts/copy.ts --with-user-token -- --slug modern-villa-hollywood-hills`), verify generated copy and check outputs.
- Run on all 30 properties, recording pass/fail status and output table.

### 4. Enable Dataset Embeddings on Sanity Production Dataset
- Execute `npx sanity datasets embeddings enable production --projection="..."`.
- Poll `npx sanity datasets embeddings status production` until status is `ready`.
- Execute test GROQ semantic queries to verify embeddings rank stays properly by soft intent (e.g. "quiet secluded cabin with hot tub", "walkable city loft near cafes").

### 5. Connect and Verify Live Home Screen
- Ensure `src/hooks/use-home-stays.ts` fetches and caches live stays from Sanity.
- Verify Home loads live stays with ratings, images, and copy across all categories ("all", "cabin", "beach", "city", "villa").
- Verify cold load skeletons, pull-to-refresh, category switching, and error retry state.

### 6. Verification and Reporting
- Run `npx tsc --noEmit` and `npx expo lint` in Roamify.
- Run `npx tsc --noEmit` and `npx sanity schema validate` in `studio/`.
- Verify 30/30 properties have `copyReview.status == "passed"`.
- Run sample semantic queries against live dataset embeddings and record top ranked results.

## Verification

1. `npx sanity schema validate` passes with 0 errors and 0 warnings.
2. `npx sanity exec scripts/seed.ts --with-user-token` runs idempotently with 0 errors.
3. `npx sanity exec scripts/copy.ts --with-user-token` runs across all 30 stays, reporting 30/30 passed.
4. Spot-check 5 stays' generated copy against their source facts by hand to prove zero hallucinations.
5. Embeddings status is `ready` for `production`.
6. Live GROQ query with `score(text::semanticSimilarity(...))` returns ranked properties matching the search intent.
7. Mobile app passes `npx tsc --noEmit` and `npx expo lint`.
8. Home screen fetches live stays from Sanity, displaying live images, titles, locations, and prices with working category tabs and pull-to-refresh.

## Result

- Updated Sanity schema (`studio/schemaTypes/property.ts`) with `copy` group, `summary`, `description`, `highlights`, and read-only `copyReview`. Deployed schema to dataset `production` (`_.schemas.default`).
- Added 3–5 grounded facts per stay across all 30 stays in `studio/scripts/seed-data.ts` and updated `studio/scripts/seed.ts` to idempotently seed facts to Sanity documents.
- Built two-layer validation in `studio/scripts/copy-checks.ts` (Layer 1: deterministic checks for numbers, amenities, pets, place names, and length) and `studio/scripts/copy.ts` (Layer 2: AI claim verification via `client.agent.action.prompt`).
- Executed `copy.ts` across all 30 stays with automatic retry. Layer 1 successfully caught multiple invented numbers (e.g. on Big Sur, Coastal Cliffside, and Salt Lake City lofts) and forced automatic corrections. 30/30 stays passed all checks with 0 unsupported claims and zero hallucinations.
- Enabled Sanity Dataset Embeddings on `production` with the property projection. Polled until status reached `ready`. Verified semantic similarity queries using `text::semanticSimilarity()` correctly ranking stays for soft queries like "quiet secluded cabin in the woods with hot tub" and "modern city loft near cafes and arts district".
- Verified Home screen data fetching from Sanity CDN across all categories (`all: 30`, `cabin: 8`, `beach: 5`, `city: 8`, `villa: 9`) with pull-to-refresh, skeleton loaders, and zero secret keys exposed in client bundle.

## AGENTS.md updates

- Content section: Record that stay copy (`summary`, `description`, `highlights`) is generated by Sanity Agent Actions strictly from the stay's facts and typed fields, verified by two-layer checks (code rules + prompt check), and stored with `copyReview`.
- Soft intent section: Record that dataset embeddings are enabled on `production` with the property projection.
