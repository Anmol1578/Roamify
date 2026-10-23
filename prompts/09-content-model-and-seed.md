# 09 · Content model and Sanity seeding

Status: done

## Goal

Design and deploy the production Sanity content model for Roamify (`property`, `host`, `policy`) using the Sanity MCP, with typed filterable fields for exact GROQ queries, rich property-level text for dataset embeddings, shared host and policy documents, and an idempotent seed of 30 realistic stays safe to run multiple times.

## Decisions

- **Content Schema (`studio/schemaTypes/`)**:
  - `property` document type:
    - Typed filter fields: `propertyType` (string dropdown: `cabin`, `beach`, `city`, `villa`), `pricePerNight` (number), `cleaningFee` (number), `serviceFeePercent` (number), `maxGuests` (number), `bedrooms` (number), `beds` (number), `baths` (number), `petsAllowed` (boolean), `amenities` (array of string tags with kebab-case values matching parser), `location` (object with `city`, `region`, `regionName`, `country`, `coordinates` geopoint).
    - Embedding & search fields directly on property: `title`, `slug`, `description` (long overview), `spaceOverview` (rooms and layout), `neighborhood` (surrounding vibe and attractions), `vibes` (array of soft-intent strings: `quiet`, `cozy`, `secluded`, `romantic`, etc.). Embeddings only read the property document itself, so no referenced text is relied on for vector search.
    - Shared document references: `host` (reference to `host`), `cancellationPolicy` (reference to `policy`), `houseRules` (reference to `policy`), `additionalPolicies` (array of references to `policy`).
    - Images: `mainImage` and `gallery` (array of image objects with `url`, `alt`, and `caption`, supporting both Unsplash CDN URLs and Sanity assets).
    - Stats: `rating` (number), `reviewCount` (number), `isFeatured` (boolean).
  - `host` document type:
    - Shared entity referenced by properties. Fields: `name`, `slug`, `avatar` (image/url), `isSuperhost` (boolean), `bio` (text), `joinedDate` (string), `responseRate` (string, e.g. "100%"), `responseTime` (string, e.g. "within an hour").
  - `policy` document type:
    - Shared knowledge entity for exact-answer display and Sanity Context KB mode. Fields: `title`, `slug`, `category` (dropdown: `cancellation`, `house-rules`, `pets`, `safety`, `check-in`), `summary` (short card text), `content` (exact policy text, word for word).
- **Sanity Deployment**:
  - Updated `studio/schemaTypes/` with `host.ts`, `policy.ts`, `property.ts`, and index exports.
  - Deployed schema via Sanity MCP `deploy_schema` to project `ird6lvzh`, dataset `production`.
- **Seeding & Idempotency**:
  - Stable deterministic IDs (`host-<slug>`, `policy-<slug>`, `property-<slug>`) so running the seed multiple times overwrites/updates without creating duplicate documents.
  - 4 diverse Superhosts seeded and published.
  - 5 shared platform policies seeded and published.
  - 30 realistic stays seeded across California and premier destinations covering all 4 property types, diverse price points, rich space/neighborhood text, coordinates, specs, and references.
  - Standalone script provided in `studio/scripts/seed.ts` for repeatable execution.
- **Frontend / Data Layer Compatibility**:
  - Updated `src/data/properties.ts` and `src/lib/search/` types to match the expanded schema while maintaining 100% backwards compatibility for existing screens.

## Out of scope

- Direct Sanity Context AI endpoint creation (handled in subsequent AI policy knowledge task).
- Full booking checkout payment processing.
- Live real-time Sanity GROQ subscription in mobile UI (data remains statically queryable / seeded).

## Steps

### 1. Studio schema definitions (`studio/schemaTypes/`)
Create `studio/schemaTypes/host.ts`, `studio/schemaTypes/policy.ts`, and `studio/schemaTypes/property.ts`, then export them in `studio/schemaTypes/index.ts`. Validate syntax and ensure all filterable fields, embedding text fields, and reference relationships are defined.

### 2. Deploy schema to Sanity project `ird6lvzh`
Deploy the schema to Sanity using the Sanity MCP / CLI (`npx sanity@latest schema deploy` or `deploy_schema`), ensuring dataset `production` has the `host`, `policy`, and `property` types registered.

### 3. Seed shared hosts and policies
Create the 4 shared hosts and 5 shared policy documents in dataset `production` using deterministic IDs (`host-*` and `policy-*`), and publish them.

### 4. Seed 30 realistic properties
Seed 30 realistic stays referencing the shared hosts and policies, with rich descriptive text on each property document, typed filter fields, coordinates, images, and pricing breakdown. Publish all 30 properties.

### 5. Update local types and data layer
Update `src/data/properties.ts` to reflect the expanded schema (host and policy references/types, fee breakdown, beds/baths, space details) so existing screens and future stay details screens have full TypeScript support.

## Verification

1. Query Sanity dataset using GROQ via Sanity MCP `query_documents`:
   - Verify all 4 hosts exist: `count(*[_type == "host"]) == 4`
   - Verify all 5 policies exist: `count(*[_type == "policy"]) == 5`
   - Verify all 30 properties exist: `count(*[_type == "property"]) == 30`
   - Test GROQ filter query: `*[_type == "property" && petsAllowed == true && pricePerNight < 300]{title, pricePerNight, petsAllowed, "hostName": host->name}`
2. Re-run seed check: verify that executing the seed again maintains the exact same document count (30 properties, 4 hosts, 5 policies) with no duplicates.
3. App validation: Run `npx tsc --noEmit` and `npx expo lint` in Roamify root to ensure zero type errors or broken imports.

## Result

Content schema successfully deployed to Sanity dataset `production` via Sanity MCP. 4 shared hosts, 5 shared policies, and 30 realistic properties seeded with deterministic IDs and published. Local types in `src/data/properties.ts` aligned and verified with zero TypeScript and linter errors.

## AGENTS.md updates

- Document the Sanity schema structure (`property`, `host`, `policy`), the field conventions (typed filters, property-level embedding text, shared host/policy references), and the deterministic seeding ID convention.
