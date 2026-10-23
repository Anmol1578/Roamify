# 07 · Home and search

Status: done

## Goal

A signed-in guest lands on a Home screen that matches the design. It has a greeting, a one-sentence search prompt, category chips that filter the stays, and large property cards. The app now has native tabs: Home, Search, Trips, Profile. Typing in Home's prompt and sending it opens the Search tab with ranked results from realistic local property data.

## Decisions

- **Source**: The Home design, attached in chat. Frame width 681 px in the image. At a 402 pt frame (iPhone 17 Pro) that's about 1.69 px/pt. Values marked * are estimates.
- **Data (`src/data/properties.ts`)**: Local for now; holds 16 typed stays. Sanity replaces this later, and the search parser and ranking become GROQ params and Dataset Embeddings. Keep the `Property` shape close to a future Sanity document: `id, title, type, city, region, rating, reviewCount, pricePerNight, maxGuests, bedrooms, petsAllowed, amenities[], vibes[], description, imageUrl`.
- `type` is one of `cabin | beach | city | villa`. Home's chips map to these, plus "All Stays".
- **Photos**: Remote Unsplash placeholders (`images.unsplash.com/photo-…?w=1200&q=80`), checked to load reliably. Card 1 is a lit modern cabin among pines at dusk: "Modern Cabin with Hot Tub", Lake Arrowhead, CA, 4.9.
- **Search Engine (`src/lib/search/`)**: Runs locally as pure functions:
  - `parseQuery(text)` → `{ maxPrice?, guests?, type?, amenities[], pets?, terms[] }`
  - Prices ("under $300", "below 250", "$300 a night"), guest counts ("for 4", "4 guests"), type words (cabin, beach, villa, city/apartment/loft), amenities (hot tub, pool, fireplace, wifi, kitchen, sauna, ocean view…) and pets ("pet friendly", "dog") are parsed in code. They filter.
  - Remaining words are soft terms (quiet, cozy, secluded…) and rank by overlap with `vibes` and `description`. Ties break by rating. This is a stand-in, not the AI pipeline: no Jev or GROQ in this feature.
  - Empty query → all stays by rating.
  - No matches → an empty state that lists the parsed constraints and has a "Clear search" button.
- **Navigation**:
  - Sending the prompt (keyboard return or arrow button) calls `router.navigate({ pathname: "/search", params: { q } })`.
  - The search icon button next to the headline goes to `/search` with no query.
  - Search reads `q` with `useLocalSearchParams` and puts it in its own prompt, and searching again there updates `q` with `router.setParams`.
  - Root route `src/app/index.tsx` redirects signed-in users to `/home`.
- **Search Screen**:
  - The same prompt bar at the top, holding the query and focused when opened empty.
  - A result line follows ("6 stays", `caption` muted).
  - Then the same property cards. Cards don't navigate yet, and the chevron is decorative (`accessibilityElementsHidden`).
- **Native Tabs**:
  - `NativeTabs` from `expo-router/unstable-native-tabs` in `src/app/(app)/_layout.tsx`, replacing the Stack.
  - Four plain triggers, all without `role="search"`, since the design keeps Search inside the bar:
    - Home: `house` / `house.fill` (md `home`)
    - Search: `magnifyingglass` (md `search`)
    - Trips: `calendar` (md `calendar_today`)
    - Profile: `person` / `person.fill` (md `person`)
  - Selected tint is `colors.textPrimary`.
  - Wrapped with `ThemeProvider value={DefaultTheme}` per the router skill.
  - **Known deviation:** On iOS 26 the native tab bar is the system Liquid Glass capsule, so the selected tab gets the system highlight instead of the design's yellow circle.
- **Trips & Profile**:
  - Trips: placeholder empty state (calendar icon, "No trips yet", muted line).
  - Profile: avatar, name, email, and the Sign out button (moved from the old Home stub).
  - Both screens padded for safe area.
- **Greeting & Avatar**:
  - Greeting: "Hey, {user.firstName} 👋" from Clerk (sign-up collects the first name). Without a first name it shows "Hey there 👋".
  - Avatar: Clerk `user.imageUrl` through `expo-image` on a `primary-soft` circle. Without an image it shows the user's initial in heading typography.
- **Haptics (`expo-haptics`)**:
  - Install with `npx expo install expo-haptics`.
  - Fires `selectionAsync()` when chip selection changes, and `impactAsync(Light)` when a search is sent. Each fires once per action, in the same frame as the visual. Failures are ignored.
- **Card Legibility**:
  - Bottom gradient over the photo using scrim overlay / linear gradient to ensure high contrast for white text.
- **Safe Area & ScrollView**:
  - Screens have a `ScrollView` as the first child, so iOS tab-bar insets apply automatically.
  - The list holds 16 items, so it isn't virtualized and layout animations on rows are safe.

### Motion (per the expo-animation skill)

| What | Gate / purpose | Implementation |
| --- | --- | --- |
| Press on cards, chips, prompt arrow, search button | tens/day · feedback | `PressableScale` primitive: Reanimated CSS transition on `transform`, scale 0.97, 120 ms, `cubicBezier(0.23, 1, 0.32, 1)`. `hitSlop`, `pressRetentionOffset={16}` |
| Chip selected ↔ unselected | tens/day · state indication | CSS transition on `backgroundColor`, 150 ms, same curve |
| Category filter changes the list | occasional · preventing a jarring change | Card wrappers `entering={FadeIn.duration(200)}`, `exiting={FadeOut.duration(150)}`, `layout={LinearTransition.duration(250).easing(EASE_IN_OUT)}`, builders at module scope |
| Search results arrive | occasional, waited-on · spatial consistency | `FadeInDown.duration(250).delay(index * 40)`, capped at index 6, keyed by query so each new search replays |
| Prompt arrow | state indication | Always active. With nothing typed it sends the suggestion shown as the placeholder |
| Tab switches | 100+/day | **None**, native |
| Home entrance on every visit | tens/day | **Rejected**: content the guest sees all day should already be there (`LayoutAnimationConfig skipEntering`) |

Reduced motion: layout builders get `.reduceMotion(ReduceMotion.System)`. `PressableScale` drops the scale when `useReducedMotion()` is true, and color and opacity transitions stay. Add the curve and press values to `src/theme/motion.ts` (`easeOut`, `easeInOut`, `press: { scale: 0.97, duration: 120 }`, `stagger: 40`), and spring `{ duration: 400, dampingRatio: 1 }`.

### Layout (pt, 402 wide frame)

- Screen `bg-surface`, `px-5`* (20). ScrollView content: top = safe-area top + 8*, bottom `pb-8`.
- Header row (`flex-row justify-between items-start`): Wordmark `roam` (font-extrabold, tracking-tight). Avatar `size-22` (88)* `rounded-full`, image `cover`.
- `mt-3`*: greeting `title` (20), tone `muted` ("Hey, Joanna 👋").
- Headline row (`flex-row items-center gap-4`, `mt-1`): "Find your\nnext stay" in `jumbo` (52px, line height 48, letter spacing -2px), `flex-1`. Search button is a `w-16 h-22`* (64×88) `rounded-xl bg-surface-muted` tall pill with the `search` icon at 26*.
- Prompt bar `mt-5`*: `h-16` (64)* `rounded-full bg-lavender pl-5 pr-2 flex-row items-center gap-3`. `sparkles` icon 24 ink, `TextInput` `flex-1` (`font-jakarta-medium text-label text-ink`, placeholder "quiet pet friendly cabin with hot tub" in `ink-muted`*, `returnKeyType="search"`, `submitBehavior="blurAndSubmit"`), arrow button `size-12` `rounded-full bg-surface` with `arrowUpRight` 22.
- Chips `mt-5`*: `flex-row flex-wrap gap-2`. Each is `h-12` (48), `px-5`*, `gap-2`, `rounded-full`, no border. Selected `bg-primary`, otherwise `bg-surface-muted`. Icon 22 (filled glyphs), label. Order: All Stays (`homeFill`), Cabins (`cabin`), Beach (`beach`), City (`city`), Villas (`villa`).
- Cards `mt-7`*, `gap-5`*: full width, `h-68` (272)*, `rounded-xl` (24)*, `overflow-hidden`. Photo fills the card, with gradient scrim on lower 60%.
  - Rating pill: absolute `top-3 right-3`, `h-10 px-4 gap-1.5 rounded-full bg-surface`, star 18 ink, `subtitle` "4.9".
  - Bottom block: absolute `left-5 right-20 bottom-5`*. Row: `marker` 18 plus `caption` "Lake Arrowhead, CA". Then `heading` title, at most two lines.
  - Chevron: absolute `right-4 bottom-4`*, `size-14` `rounded-full bg-surface`, `chevronRight` 24.
- Search screen: same padding. Prompt bar at top (safe-area top + 8), result line `mt-4`, cards `mt-4 gap-5`.

### Proposed new tokens
- Typography: `jumbo` variant (52 px, line height 48, letter spacing -2 px).
- Motion (`src/theme/motion.ts`): `easeOut`, `easeInOut`, `press: { scale: 0.97, duration: 120 }`, `stagger: 40`, `spring: { duration: 400, dampingRatio: 1 }`.
- Primitives: `PressableScale` (`src/components/ui/pressable-scale.tsx`).

## Out of scope

- Stay detail screen and booking reservation checkout.
- Sanity Studio content, GROQ, embeddings, Jev, and API routes.
- Real Trips and Profile designs.

## Steps

### 1. Root gesture handler and dependency
- Run `npx expo install expo-haptics`.
- Wrap `RootLayout` in `src/app/_layout.tsx` with `GestureHandlerRootView` (`{ flex: 1 }`).

### 2. Motion tokens and PressableScale primitive
- Update `src/theme/motion.ts` with `easeOut`, `easeInOut`, `press`, `stagger`, and modern spring config.
- Create `src/components/ui/pressable-scale.tsx` using Reanimated CSS transitions with reduced-motion support.

### 3. Local data and search engine
- Create `src/data/properties.ts` with 16 typed stays with varied prices, guest counts, amenities, vibes, and verified Unsplash photos.
- Implement `src/lib/search/parse.ts` (query parser for price, guests, type, amenities, pets, terms).
- Implement `src/lib/search/search.ts` (filtering & vibe scoring ranker).

### 4. Property card and prompt bar components
- Create `src/components/stays/property-card.tsx` matching the design: full bleed image, rating pill, gradient scrim, location pin, bold multi-line white title, chevron button.
- Create `src/components/stays/search-prompt.tsx`: lilac container, sparkle icon, text input, always-active arrow button that sends query or placeholder suggestion.
- Create `src/components/home/category-chips.tsx`: filled pill chips with icons, yellow active state, and selection haptics.

### 5. NativeTabs in `src/app/(app)/_layout.tsx` and tab screens
- Replace Stack with `NativeTabs` in `src/app/(app)/_layout.tsx` with triggers for Home, Search, Trips, Profile, wrapped in `ThemeProvider value={DefaultTheme}`.
- Implement `src/app/(app)/home.tsx` per Layout and Motion specs.
- Implement `src/app/(app)/search.tsx`: reads `q`, syncs prompt, shows result count line, staggered cards, and empty state.
- Implement `src/app/(app)/trips.tsx`: clean trips placeholder.
- Implement `src/app/(app)/profile.tsx`: avatar, name, email, and Clerk Sign Out button.

### 6. Verification
- Run `npx tsc --noEmit` and `npx expo lint`.
- Test Home screen rendering, category filtering, search prompt submission to Search tab, live search queries, and tab transitions.

## Verification

- `npx expo lint` passes with 0 errors.
- `npx tsc --noEmit` passes with 0 errors.
- Home screen renders:
  - "roam" wordmark and avatar at top.
  - "Hey, {name} 👋" greeting and "Find your next stay" in jumbo typography.
  - Search button next to headline.
  - Lilac prompt bar with sparkles and arrow button.
  - Category chips (All Stays, Cabins, Beach, City, Villas) with yellow active state.
  - Property cards matching design: Lake Arrowhead cabin with "★ 4.9" badge and fire pit photo.
- Native tabs at bottom: Home, Search, Trips, Profile.
- Submitting search prompt from Home navigates to Search tab with results.
- Category filtering on Home updates card list with smooth fade and reflow.
- Sign out from Profile tab terminates session and returns to onboarding.

## AGENTS.md updates

- Content: until Sanity is seeded, stays come from `src/data/properties.ts` and search is a local parser and ranker in `src/lib/search/`.
- Design system: pressables use `PressableScale` (0.97, 120 ms), motion curves live in `src/theme/motion.ts`, tab switches never animate, and layout animation builders live at module scope with `ReduceMotion.System`.
- Navigation: `(app)` is a `NativeTabs` group (Home, Search, Trips, Profile). Sign out lives in Profile.

## Result

- Installed `expo-haptics` and wrapped root in `GestureHandlerRootView` (`{ flex: 1 }`).
- Configured motion curves (`easeOut`, `easeInOut`), spring tokens, and press scale tokens in `src/theme/motion.ts`. Added `jumbo` typography variant in `src/theme/typography.ts`.
- Implemented `PressableScale` primitive (`src/components/ui/pressable-scale.tsx`) using Reanimated CSS scale transitions with reduced-motion support.
- Created `src/data/properties.ts` with 16 realistic typed California & West Coast stays with verified Unsplash photography, pricing, review counts, amenities, and vibes.
- Implemented pure search functions: `parseQuery` (`src/lib/search/parse.ts`) and `searchProperties` (`src/lib/search/search.ts`) with hard filters (price, guests, type, amenities, pets) and soft term ranking.
- Built `PropertyCard` (`src/components/stays/property-card.tsx`) matching the design: full bleed image, rating badge, gradient scrim overlay, location pin, multi-line bold white title, and chevron action button.
- Built `SearchPrompt` (`src/components/stays/search-prompt.tsx`) with lilac background, sparkle icon, text input, and up-right arrow button.
- Built `CategoryChips` (`src/components/home/category-chips.tsx`) with All Stays, Cabins, Beach, City, Villas, yellow active highlight, and selection haptics.
- Configured `NativeTabs` from `expo-router/unstable-native-tabs` in `src/app/(app)/_layout.tsx` for Home, Search, Trips, and Profile with `DefaultTheme`.
- Built Home screen (`src/app/(app)/home.tsx`) matching design: "roam" wordmark, avatar, "Hey, {name} 👋" greeting, "Find your next stay" headline with search button, prompt bar, category chips, and property cards with layout animations.
- Built Search screen (`src/app/(app)/search.tsx`) with live query search, category chips, result count, staggered card animations, and empty state.
- Built Trips (`src/app/(app)/trips.tsx`) and Profile (`src/app/(app)/profile.tsx`) with Clerk sign-out.
- Verified with `npx tsc --noEmit` (0 errors) and `npx expo lint` (0 errors).

