# 08 · Search screen redesign with costing and hover motion

Status: done

## Goal

Redesign the Search screen (`src/app/(app)/search.tsx`) to match the user's screenshots (`225532`, `225729`, and `230018`):
1. A top navigation bar with circular back button and search bar with filter sliders.
2. Horizontal scrollable filter chips (active lilac fill / inactive outline).
3. Stays counter and sort selector ("Sort by Best match ⌵").
4. Compact side-by-side property listing cards with square photos, favorite heart button, location pin, star rating with review counts, amenity pill badges, prominent bold pricing ("$289 / night"), and smooth press/hover motion.
5. Exact property data structure from screenshot 230018 with `photo()` helper, `regionName`, kebab-case amenities (`hot-tub`, `fireplace`, `wifi`, etc.), slug IDs, and matching listings.

## Decisions

- **Source**: Three screenshots:
  - `Screenshot 2026-10-20 225532.png`: search results with 2 stays, active lilac chips ("Cabins", "Under $300", "Pet Friendly"), side-by-side cards with "$289 / night" and "$198 / night".
  - `Screenshot 2026-10-20 225729.png`: search screen with 18 stays, inactive outline chips, side-by-side cards with "$289 / night", "$345 / night", "$236 / night".
  - `Screenshot 2026-10-20 230018.png`: exact property code structure (`export const PROPERTIES: Property[] = ...`, slug `id`, `regionName: "California"`, `pricePerNight: 289`, `amenities: ["hot-tub", "fireplace", "wifi", ...]`, `image: photo("1568605114967-8130f3a36994")`).
- **Data & Schema (`src/data/properties.ts`)**:
  - Export `photo(id)` helper: `const photo = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;`
  - Update `Property` interface:
    - `id: string` (slug format: `"modern-cabin-lake-arrowhead"`)
    - `title: string`
    - `type: PropertyType`
    - `city: string`
    - `region: string`
    - `regionName: string`
    - `pricePerNight: number`
    - `rating: number`
    - `reviewCount: number`
    - `maxGuests: number`
    - `bedrooms?: number`
    - `petsAllowed: boolean`
    - `amenities: string[]` (supports both kebab-case like `"hot-tub"` and readable)
    - `vibes: string[]`
    - `description: string`
    - `imageUrl: string`
    - `image: string` (alias pointing to `imageUrl`)
  - Export both `PROPERTIES` and `properties = PROPERTIES` for full backwards compatibility.
  - Include the exact stays from the screenshots:
    - "Modern Cabin with Hot Tub" ($289, Lake Arrowhead, CA, 4.9, 342 reviews, photo "1568605114967-8130f3a36994")
    - "Log Cabin by Big Bear Lake" ($198, Big Bear Lake, CA, 4.8, 274 reviews, photo "1449158743715-0a90ebb6d2d8")
    - "Beachfront Bungalow" ($345, Laguna Beach, CA, 4.9, 211 reviews, photo "1499793983690-e29da59ef1c2")
    - "A-Frame in the Redwoods" ($236, Monte Rio, CA, 4.9, 96 reviews, photo "1518780664697-55e3ad937233")
    - Plus remaining stays across price points ($95 to $850) and locations.
- **Header Navigation**:
  - Left: Circular back button (size 44×44 pt, `rounded-full bg-surface-muted`, `ChevronLeft` 20 pt ink). Tapping calls `router.back()` or falls back to `/home`.
  - Center/Right: Search input pill (`h-12` / 48 pt, `rounded-full bg-lavender-light` `#F3EFFE`, `flex-1`, `flex-row items-center px-4 gap-2.5`).
    - Magnifying glass icon `Search` 18 pt ink on left.
    - `TextInput` (`flex-1`, `PlusJakartaSans_500Medium`, placeholder `"Describe your stay"` in ink/muted).
    - Filter sliders button `SlidersHorizontal` 18 pt ink on right.
- **Filter Chips Row**:
  - Horizontal `ScrollView` (`showsHorizontalScrollIndicator={false}`, `px-5 gap-2 mt-3`).
  - Chips: "Cabins", "Under $300", "Pet Friendly", "Beach", "Villas", "City", "Hot Tub", "Pool".
  - Active state: filled soft lilac pill (`bg-[#D4C4FC]`, text `#0B0B1A`, font 600 semi-bold).
  - Inactive state: white/light gray outline pill (`bg-surfaceWhite border border-borderGray`, text `#374151`).
  - Tapping toggles filter, triggers `Haptics.selectionAsync()`, and dynamically updates results.
- **Sub-header Row**:
  - Left: Results count (e.g., "2 stays", "18 stays", `PlusJakartaSans_700Bold text-base text-textPrimary`).
  - Right: Sort dropdown selector ("Sort by Best match ⌵"), opens an interactive sort sheet (Best match, Price: low to high, Price: high to low, Highest rated).
- **Search Listing Card (`src/components/stays/search-listing-card.tsx`)**:
  - Side-by-side row layout:
    - Left: Square photo (~130×130 pt, `rounded-2xl`, `overflow-hidden`, `contentFit="cover"`).
    - Right: Flex-1 content column (`pl-3.5 justify-between`):
      - Top row: Title (bold 16 pt, 2 lines max, flex-1) + Heart favorite toggle button (circular 36×36 pt, outline `Heart` icon 18 pt, toggling to filled red `#EF4444` with haptics).
      - Location row: `MapPin` 13 pt + Location text (e.g. "Lake Arrowhead, CA", 13 pt textSecondary).
      - Rating row: Star icon 14 pt filled `#F59E0B` + rating `4.9` + `(342)` review count in muted text.
      - Amenity badges: horizontal flex-row wrap with small rounded pill badges (`px-2 py-1 rounded-md bg-[#F4F5F7]`), e.g.:
        - `Hot Tub` (bath/hot tub icon)
        - `Pet Friendly` (paw/dog icon)
        - `Ocean View` (waves icon)
        - `Wifi` (wifi icon)
        - `Fireplace` (flame icon)
      - Pricing: `**$289** / night` (price in 18 pt extra-bold ink, `/ night` in 13 pt muted text).
  - Hover / press motion:
    - `PressableScale` primitive on every card with scale 0.98, 120 ms transition.
    - Card entrance staggered animations (`FadeInDown.duration(200).delay(index * 40)`).

## Out of scope

- Booking reservation checkout flow.
- Remote Sanity studio sync (data remains local).

## Steps

### 1. Data and Property alignment (`src/data/properties.ts`)
Update `src/data/properties.ts` with `photo(id)` helper, `regionName`, slug IDs, kebab-case amenities, `PROPERTIES` and `properties` exports, and exact stays from the screenshots.

### 2. SearchListingCard component (`src/components/stays/search-listing-card.tsx`)
Create `src/components/stays/search-listing-card.tsx` with side-by-side layout, square image, favorite heart button, location, rating with review count, amenity badges, bold price, and `PressableScale` motion.

### 3. Redesign Search screen (`src/app/(app)/search.tsx`)
Update `src/app/(app)/search.tsx` to match screenshots `225532` and `225729` with circular back button, integrated search bar with filter sliders, horizontal scrollable filter chips (active lilac / inactive outline), stay count, sort dropdown, and `SearchListingCard` list.

### 4. Search parser & ranker compatibility (`src/lib/search/`)
Ensure `parseQuery` and `searchProperties` handle both kebab-case amenities (`hot-tub`) and space-separated amenities (`hot tub`), and handle sorting (best match, price low/high, rating).

### 5. Verification and closeout
Run `npx tsc --noEmit` and `npx expo lint`. Test queries, back navigation, chips toggle, sort dropdown, and heart favoriting.

## Verification

- `npx tsc --noEmit` passes with 0 errors.
- `npx expo lint` passes with 0 errors and warnings.
- Search screen matches the screenshots:
  - Top navigation bar has circular back button and lilac input bar with search and filter slider icons.
  - Filter chips toggle between active lilac and inactive outline states with haptic feedback.
  - Cards show side-by-side square photos, title, favorite heart button, location, star rating with review count, amenity tags, and `$XXX / night` pricing.
  - Pressing cards triggers scale animation.
  - Tapping heart button toggles state with haptic feedback.
  - Sorting options ("Best match", "Price: low to high", "Price: high to low", "Highest rated") re-order the results dynamically.

## AGENTS.md updates

- Search Screen: uses `SearchListingCard` side-by-side compact layout with square photo, amenity pills, and bold price display.

## Result

- Redesigned Search screen to match screenshots (`225532`, `225729`, `230018`).
- Updated `src/data/properties.ts` with exact property schema (`export const PROPERTIES: Property[] = ...`), `photo()` helper, `regionName: "California"`, slug IDs, kebab-case amenities, and matching listings ("Modern Cabin with Hot Tub" at $289, "Log Cabin by Big Bear Lake" at $198, "Beachfront Bungalow" at $345, "A-Frame in the Redwoods" at $236).
- Built `SearchListingCard` (`src/components/stays/search-listing-card.tsx`) featuring side-by-side layout with square photo, title, interactive heart favorite toggle, location pin, star rating with review count, amenity badges (Hot Tub, Pet Friendly, Ocean View, Wifi, Fireplace), and prominent costing (`$XXX / night`) with `PressableScale` hover/press motion.
- Rebuilt `SearchScreen` (`src/app/(app)/search.tsx`) with circular back button, integrated lilac search input with filter sliders icon, horizontal scrollable filter chips (active lilac fill / inactive outline), dynamic stays counter, and interactive sort dropdown ("Sort by Best match ⌵").
- Verified with `npx tsc --noEmit` (0 errors) and `npx expo lint` (0 errors).
