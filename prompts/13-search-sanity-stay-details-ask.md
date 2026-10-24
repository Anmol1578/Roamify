# 13 · Search on Sanity, Stay details, Good to know, and Ask about stay

Status: done

## Goal

Complete the core Roamify discovery and evaluation loops by connecting Search to live Sanity GROQ queries, building the Stay Details screen (`/stay/[slug]`) with full data hydration from Sanity, adding the "Good to know" house rules section, and enabling the word-for-word grounded "Ask about this stay" feature with exact policy and stay facts attribution.

## Decisions

- **Architecture & Source of Truth**:
  - Migrate off local `data/properties.ts` and `search/search.ts` to `src/lib/stays.ts` (shared types: `Property`, `PropertyType`, `Amenity`, `Host`, `Policy`, `Review`, `HouseRules`).
  - Search runs directly on Sanity's public CDN API via GROQ (`src/lib/search/query.ts` & `src/hooks/use-search-stays.ts`).
  - Search query builder maps natural language filters (`type`, `maxPrice`, `pets`, `amenities`, `vibes`, `location`) into GROQ filter clauses and sorts (`rating desc`, `pricePerNight asc`, `pricePerNight desc`).
  - Place parsing in `src/lib/search/parse.ts` recognizes California regions, cities, and common destination terms (e.g., Lake Tahoe, Joshua Tree, Big Bear, Malibu, Napa).
  - Favorites managed in `src/lib/favorites.ts` with shared reactive hook `useFavorites()`.
  - Stay details screen at `src/app/stay/[slug]/index.tsx` fetches single stay via `STAY_QUERY` in `src/lib/sanity/queries.ts` with `useStay(slug)`.
  - Cards on Home and Search navigate to `/stay/[slug]` via `router.push('/stay/${slug}')`.
  - **"Good to know" section (`src/components/stay/good-to-know.tsx`)**:
    - Appears directly above the Ask card, after amenities divider.
    - Shows key house rules in order: check-in, checkout, quiet hours (if set), pets, smoking, parties.
    - Icons: clock (check-in/out), moon (quiet hours), dog/pets, no-smoking, party popper/celebration.
    - "Show all rules" opens the Policies sheet.
  - **"Ask about this stay" (`src/lib/ask.ts` and `src/app/stay/[slug]/ask.tsx`)**:
    - Card reads "Ask about this stay" with subtitle "Cancellation, house rules, pets, check-in and more."
    - Zero invented claims or LLM hallucinations in-app; exact word-for-word matching from property fields, house rules, and cancellation policies, with exact source badge ("House rules", "Cancellation policy", "Amenities", "Highlights").

## Out of scope

- Real-time booking payment processing (Stripe / checkout integration).
- Server-side Jev LLM evaluator endpoint (Plan 12 server search).
- Multi-day calendar date picker availability locking.

## Steps

### 1. Unified Types & Favorites Module (`src/lib/stays.ts`, `src/lib/favorites.ts`)
- Create `src/lib/stays.ts` declaring types: `Property`, `PropertyType`, `Amenity`, `Host`, `Policy`, `Review`, `HouseRules`, and helper formatting functions (`formatPrice`, `formatLocation`).
- Create `src/lib/favorites.ts` providing an in-memory reactive store and `useFavorites()` hook.
- Update `src/hooks/use-home-stays.ts`, `src/components/stays/property-card.tsx`, and `src/components/stays/search-listing-card.tsx` to import types from `src/lib/stays.ts`.
- Safely retire `src/data/properties.ts` and `src/lib/search/search.ts`.

### 2. GROQ Query Builder & Place Parsing (`src/lib/search/query.ts`, `src/lib/search/parse.ts`)
- Extend `src/lib/search/parse.ts` with US/California place recognition (`city`, `region`, `neighborhood`).
- Create `src/lib/search/query.ts` exporting `buildSearchQuery(parsed: ParsedQuery, sort: SortOption)`.
- Support filter combinations: category type, price ceilings, pet friendliness, amenities, and vibe matches.

### 3. Sanity Search Hook & Search Screen Overhaul (`src/hooks/use-search-stays.ts`, `src/app/(app)/search.tsx`)
- Implement `useSearchStays(queryText, activeChips, sortOption)` with debouncing, cache, and `AbortController`.
- Update `src/app/(app)/search.tsx` to use `useSearchStays` live from Sanity CDN.
- Implement native/accessible sort menu with haptic feedback.
- Wire search results cards with `onPress` navigating to `/stay/[slug]`.

### 4. Stay Details Screen & "Good to know" (`src/lib/sanity/queries.ts`, `src/hooks/use-stay.ts`, `src/components/stay/good-to-know.tsx`, `src/app/stay/[slug]/index.tsx`)
- Add `STAY_QUERY` in `src/lib/sanity/queries.ts` fetching complete stay document by `slug.current`.
- Implement `useStay(slug: string)` hook.
- Create `src/components/stay/good-to-know.tsx` showing check-in, checkout, quiet hours, pets, smoking, and parties with icons.
- Build `src/app/stay/[slug]/index.tsx`:
  - Full-width hero gallery with pagination dots and top back / favorite buttons.
  - Property title, rating, review count, location pin, and host summary card.
  - Quick badges: max guests, bedrooms, beds, baths.
  - Space overview, highlights, facts, and full amenities list.
  - "Good to know" house rules section.
  - Policies section: cancellation policy summary and house rules sheet trigger.
  - "Ask about this stay" card.
  - Sticky bottom action bar with price per night, total estimate, "Ask" button, and "Reserve" button.
- Wire `PropertyCard` in `home.tsx` to navigate to `/stay/[slug]`.

### 5. Grounded "Ask About This Stay" (`src/lib/ask.ts`, `src/app/stay/[slug]/ask.tsx`)
- Implement `src/lib/ask.ts` extracting stay facts, house rules, amenities, and cancellation terms, matching guest questions and returning exact quotes with source attribution.
- Build `src/app/stay/[slug]/ask.tsx` (modal / sheet) allowing guests to ask questions with instant grounded answers and suggested quick prompt chips ("Can I bring a pet?", "What is the check-in time?", "Is there wifi?", "What is the refund policy?").

### 6. Verification & Quality Assurance
- Run `npx tsc --noEmit` and `npx expo lint`.
- Verify live search on Sanity CDN with keywords, price filters, and category chips.
- Verify navigating to `/stay/[slug]` displays complete stay data from Sanity.
- Verify "Good to know" and "Ask about this stay" components.

## Verification

1. `npx tsc --noEmit` passes with 0 errors.
2. `npx expo lint` passes.
3. Search tab queries Sanity CDN directly and filters by keyword, chip, and sort order.
4. Tapping any property card on Home or Search transitions smoothly to `/stay/[slug]`.
5. "Good to know" renders key rules with icons.
6. Asking questions on a stay returns exact word-for-word citations from the stay's verified fields.

## AGENTS.md updates

- Content & Search: Search queries Sanity CDN directly via GROQ with client-side parameterization.
- Stay Details: Dynamic route at `/stay/[slug]` hydrates via `STAY_QUERY`.
- Policy & Fact QA: "Ask about this stay" provides exact word-for-word answers from stay data and Sanity policies with zero invented claims.
- Good to know: Details screen renders key house rules directly above the Ask card.

## Result

Built as planned across all three core modules:
1. **Search on Sanity (GROQ Query Builder & Hook)**:
   - `src/lib/stays.ts` defines unified types (`Property`, `PropertyType`, `Amenity`, `Host`, `Policy`, `HouseRules`, `Review`) and formatting helpers.
   - `src/lib/search/query.ts` builds GROQ queries with dynamic filters and sorting options.
   - `src/lib/search/parse.ts` recognizes places and maps natural language constraints.
   - `src/hooks/use-search-stays.ts` fetches live stays from Sanity public CDN with in-memory caching and PostHog metrics.
   - Retired and deleted `src/data/properties.ts` and `src/lib/search/search.ts`.
2. **Stay Details Screen (`/stay/[slug]`)**:
   - `src/lib/sanity/queries.ts` provides `STAY_QUERY`.
   - `src/hooks/use-stay.ts` provides caching and live data hydration for stays.
   - `src/app/stay/[slug]/index.tsx` delivers full hero carousel, quick stats, host card, highlights, space description, amenities grid, policies, and sticky action bar.
   - Cards on Home and Search navigate to `/stay/[slug]`.
3. **Good to know & Grounded Ask about stay**:
   - `src/components/stay/good-to-know.tsx` renders key house rules with dedicated icons and full rules sheet.
   - `src/lib/ask.ts` and `src/app/stay/[slug]/ask.tsx` ground guest answers word-for-word in stay data and Sanity policies with zero hallucinations.
4. Both `npx tsc --noEmit` and `npx expo lint` pass with 0 errors.
