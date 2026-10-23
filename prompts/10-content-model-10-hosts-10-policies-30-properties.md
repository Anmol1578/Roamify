# 10 · Content model with 10 Hosts, 10 Policies, and 30 Properties

Status: done

## Goal

Design, deploy, and seed Roamify's production content model in Sanity Studio to match the provided studio design: 10 shared hosts, 10 shared policies, and 30 realistic stays with high-quality free Unsplash photos. Field groups in the Studio match the reference screenshot tabs (`Basics`, `Location`, `Rooms & price`, `Amenities`, `Description`, `Photos`, `Rules`). Documents are seeded idempotently with deterministic keys so the seed can safely be rerun anytime without creating duplicates.

## Decisions

- **Studio Design Alignment (Screenshots 2026-10-21 221619, 221635, 221645)**:
  - Studio title is "Roam" with custom desk structure:
    - **Stays** (`property` type, `HomeIcon` from `@sanity/icons`)
    - **Hosts** (`host` type, `UserIcon` from `@sanity/icons`)
    - **Policies** (`policy` type, `DocumentTextIcon` from `@sanity/icons`)
  - Property document groups:
    - `basics` ("Basics")
    - `location` ("Location")
    - `roomsAndPrice` ("Rooms & price")
    - `amenities` ("Amenities")
    - `description` ("Description")
    - `photos` ("Photos")
    - `rules` ("Rules")
  - `basics` fields match Screenshot 3:
    - `title`: string, required
    - `slug`: slug from title, required
    - `type`: string list radio (`cabin`, `beach`, `city`, `villa`), horizontal radio layout
    - `featured`: boolean switch with title "Featured" and description "Shown in the Home feed"
    - `host`: reference to `host`, required
    - `rating`: number (1.0 - 5.0)
    - `reviewCount`: number (integer >= 0)

- **Search Results Screen Requirements**:
  - Filterable typed fields: `type`, `pricePerNight`, `maxGuests`, `bedrooms`, `beds`, `baths`, `petsAllowed`, `amenities[]`, `location.city`, `location.region`, `location.country`.
  - Soft intent & ranking text directly on property document (embeddings only inspect property document): `description`, `spaceOverview`, `neighborhood`, `vibes[]`.
  - Search card display needs: Cover photo (`mainImage`), title, place (`city, region`), rating & review count, price per night, and 2 "why it matched" badges derived from typed amenities and house rules (`petsAllowed`).

- **Stay Details Screen Requirements**:
  - Photo gallery: `mainImage` + `gallery` array with high-resolution Unsplash URLs, captions, and alt descriptions.
  - Specs & Layout: `maxGuests`, `bedrooms`, `beds`, `baths`.
  - Costing breakdown: `pricePerNight`, `cleaningFee`, `serviceFeePercent`.
  - Host card: shared `host` document with `name`, `slug`, `avatar` (image/url), `isSuperhost`, `bio`, `joinedDate`, `responseRate`, `responseTime`, `languages`.
  - Policy cards & sheets:
    - Referenced `cancellationPolicy` (`policy`)
    - Referenced `houseRulesPolicy` (`policy`)
    - `additionalPolicies` (array of references to `policy`)
    - Structured house rules: `checkInTime`, `checkOutTime`, `quietHoursFrom`, `quietHoursTo`, `petsAllowed`, `maxPets`, `petFee`, `smokingAllowed`, `partiesAllowed`, `additionalRules`.

- **Shared Documents**:
  - **10 Hosts**: Shared across properties, including Marcus Reed (from screenshot), Sarah Jenkins, Marcus Thorne, Elena Rostova, David Kim, Maya Lin, Carlos Mendez, Chloe Bennett, Liam O'Connor, and Amara Okafor.
  - **10 Policies**: Shared across properties covering all core rental concerns:
    1. Flexible Cancellation
    2. Moderate Cancellation
    3. Strict Cancellation
    4. House Rules & Quiet Hours
    5. Pet Friendly Policy & Etiquette
    6. Self Check-in & Keyless Entry
    7. Damage & Security Deposit
    8. Payment & Booking Terms
    9. Guest Refund & Rebooking Guarantee
    10. Commercial Filming & Event Policy

- **30 Properties**:
  - Exactly matching screenshot stays where shown:
    - Modern Villa in the Hollywood Hills (Los Angeles, CA · $575)
    - Hillside Villa with Ocean Views (Montecito, CA · $650)
    - Desert Villa with Infinity Pool (Scottsdale, AZ · $525)
    - Desert Modern Villa (Palm Springs, CA · $379)
    - Spanish Hacienda with Pool (Santa Barbara, CA · $498)
    - Designer Home in Wine Country (Healdsburg, CA · $365)
    - Oceanview Villa with Private Pool (Malibu, CA · $412)
    - Sunny Apartment near Roosevelt Arts (Phoenix, AZ · $129)
    - Industrial Loft Downtown (Salt Lake City, UT · $149)
    - Modern Townhouse in RiNo (Denver, CO · $205)
    - Modern Townhouse in the Pearl (Portland, OR · $158)
    - Light-Filled Condo with City Views (Seattle, WA · $176)
    - ...plus 18 more realistic cabins, beach houses, city lofts, and villas across North America.
  - Realistic Unsplash photos with alt text, valid coordinates, typed amenities, and rich vibe descriptions.

- **Idempotency & Rerun Safety**:
  - Stable IDs: `host-<slug>`, `policy-<slug>`, `property-<slug>`.
  - Uses `client.createOrReplace` so running multiple times cleanly updates content without duplicate documents or broken references.
  - Seeding script runs via `studio/scripts/seed.ts` authenticated via Sanity user CLI login.
  - Studio schema deployed with Studio CLI (`npx sanity schema deploy`).

- **Frontend Compatibility**:
  - Keep `src/data/properties.ts` and `src/app/(app)/home.tsx` in sync with the schema fields (`type`, `pricePerNight`, `rating`, `reviewCount`, `featured`, `host`, `cancellationPolicy`, `houseRules`).

## Out of scope

- AI Context knowledge endpoint migration (handled in subsequent AI Q&A task).
- Checkout payment processing.
- Real-time Sanity Live listeners on mobile (queries use static/cached GROQ fetches).

## Steps

### 1. Update Studio Schema Types (`studio/schemaTypes/`)
- In `studio/schemaTypes/property.ts`:
  - Add Studio groups: `basics`, `location`, `roomsAndPrice`, `amenities`, `description`, `photos`, `rules`.
  - Update `type` field (Cabin, Beach, City, Villa radio), `featured` boolean switch, `rating`, `reviewCount`, `host` in `basics`.
  - Assign all fields to their matching group tabs.
  - Update preview to show `${city}, ${region} · $${pricePerNight}`.
- In `studio/schemaTypes/host.ts`:
  - Add `languages` array, ensure `avatar` supports both image asset and URL, add `UserIcon`.
- In `studio/schemaTypes/policy.ts`:
  - Add categories for the 10 policy types, add `DocumentTextIcon`.
- In `studio/sanity.config.ts`:
  - Set Studio title to "Roam" and configure desk structure with Stays, Hosts, and Policies list items with their icons.

### 2. Deploy Schema to Sanity
- Run `npx sanity schema deploy` from `studio/` directory to update the schema in Sanity project `ird6lvzh`, dataset `production`.

### 3. Expand Seed Data (`studio/scripts/seed-data.ts`)
- Author 10 realistic host profiles (`SEED_HOSTS`) with avatars, bios, response metrics, and languages.
- Author 10 comprehensive policy documents (`SEED_POLICIES`) with full legal/guest-friendly text.
- Author 30 properties (`SEED_PROPERTIES`) with realistic Unsplash photo URLs, accurate coordinates, full price breakdown, and rich descriptions.

### 4. Execute Seed Script (`studio/scripts/seed.ts`)
- Run `npx sanity exec scripts/seed.ts --with-user-token` to seed the 10 hosts, 10 policies, and 30 properties.
- Verify rerun safety by executing a second time and verifying zero duplicate documents.

### 5. Update Local Data & App Compatibility
- Update `src/data/properties.ts` to export all 10 hosts, 10 policies, and 30 properties.
- Verify TypeScript compilation (`npx tsc --noEmit`) and Expo linting (`npx expo lint`).

## Verification

1. GROQ Document Counts:
   - `count(*[_type == "host"]) == 10`
   - `count(*[_type == "policy"]) == 10`
   - `count(*[_type == "property"]) == 30`
2. Idempotency Check:
   - Running the seed script twice results in exact same document counts and zero duplicate IDs.
3. Schema & Studio Alignment:
   - Verify all 7 tabs exist in Studio (`Basics`, `Location`, `Rooms & price`, `Amenities`, `Description`, `Photos`, `Rules`).
   - Verify `Basics` shows title, slug, Type radio, Featured switch, Host reference, Rating, Review Count as in Screenshot 3.
   - Verify desk structure lists Stays, Hosts, and Policies as in Screenshot 1.
4. App Validation:
   - Run `npx tsc --noEmit` in root: 0 errors.
   - Run `npx expo lint`: 0 errors.

## Result

Deployed Sanity content schema to dataset `production` with 7 Studio groups (`Basics`, `Location`, `Rooms & price`, `Amenities`, `Description`, `Photos`, `Rules`) and desk structure featuring Stays (`HomeIcon`), Hosts (`UserIcon`), and Policies (`DocumentTextIcon`). Seeded 10 shared hosts (including Marcus Reed), 10 shared policies, and 30 properties with free Unsplash photos. Verified idempotency with rerun and verified exact document counts (10 hosts, 10 policies, 30 properties). All TypeScript and lint checks pass cleanly.

## AGENTS.md updates

- Content section: Document the 10 hosts, 10 policies, and 30 properties schema in Sanity dataset `production`.
- Note the Studio groups convention (`basics`, `location`, `roomsAndPrice`, `amenities`, `description`, `photos`, `rules`).
