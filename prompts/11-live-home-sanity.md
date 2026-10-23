# 11 · Live Home with Sanity

Status: done

## Goal

Connect the Roamify Home screen to live stays from Sanity's public API CDN. Category chips filter stays via GROQ queries. Results are cached in memory per category, and the screen supports initial skeleton loading, pull-to-refresh, empty category states, and error recovery with a "Try again" action.

## Decisions

- **Public API CDN Access**:
  - Home fetches directly from Sanity's public CDN endpoint: `https://<projectId>.apicdn.sanity.io/v2025-08-15/data/query/<dataset>`.
  - Public dataset `production` has read access with no API token required; zero secrets reach the client bundle.
  - Project ID (`ird6lvzh`) and dataset (`production`) configured via `EXPO_PUBLIC_SANITY_PROJECT_ID` and `EXPO_PUBLIC_SANITY_DATASET`.
- **Query & Data Structure**:
  - `HOME_STAYS_QUERY` in `src/lib/sanity/queries.ts`:
    `*[_type == "property" && defined(slug.current) && ($type == "all" || type == $type)] | order(rating desc, reviewCount desc)[0...30]{ "id": _id, "slug": slug.current, title, type, "city": location.city, "region": location.region, "country": location.country, rating, reviewCount, pricePerNight, "imageUrl": coalesce(mainImage.url, mainImage.asset->url) }`
  - Image fallback: `coalesce(mainImage.url, mainImage.asset->url)` ensures both Unsplash external URLs and Sanity image assets resolve cleanly.
  - Location fallback: `${city}, ${region}` if region exists, else `${city}, ${country}`.
- **Hook & Caching (`src/hooks/use-home-stays.ts`)**:
  - In-memory `Map<string, Property[]>` cache keyed by category.
  - When switching categories, stale data is kept visible until new data resolves, transitioning smoothly via Reanimated layout transitions.
  - Supports `AbortController` cancellation for rapid chip taps to avoid race conditions.
  - Exposes `stays`, `isLoading`, `isError`, `error`, `refetch`, and `isRefreshing`.
- **Screen States in `src/app/(app)/home.tsx`**:
  - **Loading (initial cold start)**: 3 card skeleton placeholders matching the 272 pt card layout.
  - **Error state**: Friendly error notice with a secondary "Try again" button that triggers `refetch()`.
  - **Empty state**: Clean notice when a category has 0 stays.
  - **Pull-to-refresh**: Standard `RefreshControl` invalidates the active category cache and refetches live.

## Out of scope

- Search screen GROQ migration (handled in subsequent plan 12).
- Stay details screen navigation (`/stay/[slug]`, handled in plan 13).
- Real-time Sanity Live listeners / webhooks.

## Steps

### 1. Sanity client config and query helper
- Add `EXPO_PUBLIC_SANITY_PROJECT_ID` and `EXPO_PUBLIC_SANITY_DATASET` to `.env`, `.env.local`, and `.env.example`.
- Create `src/lib/sanity/config.ts` exporting `projectId`, `dataset`, and `apiVersion`.
- Create `src/lib/sanity/fetch.ts` implementing `sanityQuery<T>(query, params, signal)` which serializes GROQ params as `$<key>=JSON.stringify(val)` and validates HTTP responses.
- Create `src/lib/sanity/queries.ts` exporting `HOME_STAYS_QUERY`.

### 2. Home stays hook (`src/hooks/use-home-stays.ts`)
- Implement `useHomeStays(category: CategoryFilter)` with module-level in-memory cache, abort handling, loading, error, and refresh controls.

### 3. Connect Home Screen (`src/app/(app)/home.tsx`)
- Replace the static `properties` import with `useHomeStays(selectedCategory)`.
- Implement card skeleton loading placeholders for initial load.
- Implement error state with retry button.
- Implement pull-to-refresh with `RefreshControl`.
- Preserve Reanimated enter/exit/layout animations.

### 4. Verification
- Verify live stays load directly from Sanity on cold start.
- Test category switching ("All Stays", "Cabins", "Beachfront", "City Lofts", "Villas").
- Verify pull-to-refresh re-fetches from CDN.
- Run `npx tsc --noEmit` and `npx expo lint`.

## Verification

1. App builds and compiles with zero TypeScript errors (`npx tsc --noEmit`) and zero lint errors (`npx expo lint`).
2. Home renders 30 live stays from Sanity dataset `production`.
3. Category filters ("Cabins", "Beachfront", "City Lofts", "Villas") filter correctly using GROQ queries against live data.
4. Pull-to-refresh functions and updates feed.
5. Simulated network error (e.g. invalid dataset) properly renders error state with working retry.

## Result

Connected Home to live Sanity content via public API CDN fetch with zero secret tokens in the mobile app bundle. Implemented `useHomeStays` hook with category caching, abort handling, 3-card skeleton loading, error recovery with "Try again" button, empty state, and pull-to-refresh with `RefreshControl`. Tested across all categories ("all", "cabin", "beach", "city", "villa") against live Sanity dataset `production` with 100% clean TypeScript and ESLint passes.

## AGENTS.md updates

- Content section: Record that Home screen reads live stays directly from the Sanity public API CDN via `src/lib/sanity/`.
