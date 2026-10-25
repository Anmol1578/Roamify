# 17 · Polish, states and booking placeholder

Status: done

## Goal
Make several small fixes and add loading behavior across Home, Search and stay details:
- Home search bar: a clearer icon, and a shorter, dimmer placeholder.
- The Home greeting no longer shows a broken emoji.
- Search result cards get room between their content and their bottom edge.
- The host appears right on the stay screen, not in a sheet.
- "Book this stay" opens a placeholder trip-summary screen.
- Empty and error states explain what happened and offer a next step.
- Loading placeholders pulse.
- Home, Search and stay details can be pulled to refresh.

## Decisions
- **No design attached.** Everything uses existing tokens and patterns: Good to know rows, `PolicyCard`, `PriceBar`, the Ask header and the Trips empty state. No new color, type, radius or shadow tokens.
- **Home search icon:** the `SearchPrompt`'s leading `sparkles` becomes the plain `search` glyph (`magnifyingglass` / `search`), size 24, tone `ink`. The send button (`arrowUpRight`) is unchanged.
- **Placeholder:** `PROMPT_SUGGESTION` becomes `"cabin with a hot tub"`. Sending with nothing typed still searches it. The placeholder color changes from `placeholder:text-ink` to `placeholder:text-ink/50`, the ink token at 50%, about 3:1 contrast on lavender.
- **Greeting:** "Hey, Sujata 👋" shows a "?" box because Plus Jakarta Sans has no emoji glyph and iOS doesn't fall back. The emoji is replaced with a new `wave` icon (`hand.wave.fill` / `waving_hand`), size 22, tone `primary`, placed after the text in a `flex-row items-center gap-1.5`. It is hidden from VoiceOver, which reads "Hey, Sujata".
- **Result card spacing:** the card's shadow edge runs right under "$289 / night" because the image (152 pt) and the details column are the same height. The details column gets `pb-3`. The image changes from `h-38` to `min-h-40 self-stretch` (160 pt, grows with large text), so the card is 160 pt and the price sits 12 pt above the edge. `ResultCardSkeleton` follows (`h-40`).
- **Host on screen:** the Host form sheet is removed. A "Meet your host" section replaces the host row at the bottom of the details body, with a divider above it:
  - It follows the Good to know pattern: a `title` heading, then a row with the `md` avatar (with `border-2 border-surface shadow-raised`), the `subtitle` name and the Superhost line.
  - Then the full `bio` (`body`), then fact rows. Each fact row is icon 20 + text, `gap-3`, `gap-2.5` between rows: `calendar` "Hosting since May 2019", `clock` "Responds within an hour", and a new `globe` icon (`globe` / `language`) "Speaks English and Spanish".
  - `hostFacts` returns `{ key: "since" | "response" | "languages", text }[]`, so each fact gets its icon. Missing fields are left out, as now.
  - `HostRow` is replaced by `HostSection` (`src/components/stay/host-section.tsx`). `SuperhostLine` stays. The `stay_host_opened` event goes away.
- **Book screen:**
  - Route: `src/app/stay/[slug]/book.tsx`, pushed over the tabs like `ask`, registered in the root Stack inside the signed-in guard. "Book this stay" pushes it with no Alert and no haptic (the push is the feedback). `stay_book_tapped { slug }` stays.
  - Header: the same as Ask's, a `chevronLeft` back button + `title` "Confirm your stay".
  - Body, a ScrollView with `px-5 pt-5`:
    1. **Stay row:** the first photo (`w-28 h-24 rounded-md`), then `cardTitle` title (2 lines), `caption` subtle place with `marker`, and a `star` + `label` rating "4.9 (214)".
    2. Divider (`h-px bg-border`, `my-5`).
    3. **Your trip** (`title`): a Dates row ("Dates", subtle "Add dates") and a Guests row ("Guests", subtle "Up to {maxGuests} guests", or "Add guests" if unknown). Each row has a trailing `Badge label="Coming soon"`.
    4. Divider.
    5. **Price details** (`title`): "$289 × 2 nights" … "$578"; "Cleaning fee" … "$95" (only if set); a divider; then "Total" … "$673" in `subtitle`. Values come from `stayTotal` plus a new `priceLines(stay)` in `src/lib/stay-details.ts`, with the same thousands formatting as `PriceBar`.
    6. Divider.
    7. **Cancellation** (`title`): the existing `PolicyCard` with the policy's title and summary word for word. It opens the Policies sheet at `section=cancellation`. It's hidden if the stay has no cancellation policy.
  - Pinned bottom bar, like `PriceBar` (`border-t`, safe-area padding): a disabled `Button size="lg"` "Confirm and pay", with a `caption` muted line under it: "Booking opens soon in Roam."
  - States: the stay is normally already cached. Loading shows a pulsing skeleton. Not found and error use the shared states below.
  - Data: `maxGuests` is added to `STAY_QUERY` and `StayDetails` (`number | null`). The field already exists on `property`, so the schema doesn't change.
- **Empty and error states:**
  - **`EmptyState`, a new `src/components/ui/empty-state.tsx`:** props `icon`, `title`, `message`, optional `action { title, onPress }`, optional `secondaryAction`, optional `children` (shown between message and actions), `className`, `style`.
    - Layout: `items-center gap-3 px-6`. An icon tile `size-18 rounded-full bg-surface-muted` holds the icon at 32. Then the `title` heading, the `body` muted message (`text-center`), any children, then the buttons (`Button size="sm"`, the main one `variant="primary"`, the secondary one `variant="secondary"`, in a `flex-row gap-3`, `mt-2`).
    - `accessibilityLiveRegion="polite"`.
    - It fades in (`FadeIn` 200 ms ease-out, `ReduceMotion.Never`, since it's opacity only).
    - It's a ui primitive because Home, Search, stay, Book, Ask, Policies and Trips all use it.
  - **`LoadError`, a new `src/components/load-error.tsx`:** `{ error, subject, onRetry }` picks copy by cause.
    - Can't connect: a `SanityError` with status 0 and "Network error", or a `TypeError` from `fetch`. Icon `wifiOff` (`wifi.slash` / `wifi_off`), title "Can't connect", message "Check your connection and try again."
    - Anything else (a server status, or Jev or Context failing behind `/api/search`): icon `warning` (`exclamationmark.triangle` / `warning`), title "Something went wrong", message "We couldn't load {subject} right now. Try again in a moment."
    - Action: "Try again".
  - **Copy per screen:**
    - Home, empty category: the category's own icon (exported from `category-chips.tsx`), "No stays here yet" / "Try another category, or describe your stay above." It offers "Show all stays" (sets category to `all`) when the category isn't `all`.
    - Home, error: `LoadError subject="stays"`.
    - Search, no results: icon `searchOff` (`text.magnifyingglass` / `search_off`), "No stays match that yet".
      - If the search had hard constraints, it shows "Every stay has to meet these:" and the existing constraint badges as children.
      - Then "Try one of these:" with 3 suggestion `Chip`s that each run a new search: "cabin with a hot tub", "beach house under $400" and "city apartment with a workspace".
      - Action: "Clear search".
    - Search, error: `LoadError subject="stays"`.
    - Stay, not found: icon `pinOff` (`mappin.slash` / `wrong_location`), "This stay isn't available", "It may have been removed by its host.", action "Back".
    - Stay, error: `LoadError subject="this stay"`. The back button stays on top.
    - Ask, Policies and Book use the same not-found and `LoadError` states. Their "Loading…" text becomes a centered spinner (`Spinner`).
    - Trips switches to `EmptyState` (calendar, "No trips yet", "Stays you book will show up here.", action "Explore stays" → `/home`).
  - **`Can't refresh`:** when content is already on screen and a pull to refresh fails, the content stays. A dismissible `Alert tone="danger"` reads "Couldn't refresh. Showing what you had." at the top of the list.
- **Loaders:**
  - **`Skeleton`, a new `src/components/ui/skeleton.tsx`:** an `Animated.View` with `bg-surface-muted` plus layout classes. Its opacity pulses 1 → 0.5, alternating forever, using a Reanimated CSS animation (`css.keyframes`, `animationDuration: motion.pulse` (900), `animationDirection: "alternate"`, `animationIterationCount: "infinite"`, and `motion.cssEaseInOut`). With Reduce Motion it's static.
  - Home's placeholder cards, `ResultCardSkeleton`, `StaySkeleton` and the Book skeleton all use it.
  - **Search:** while the first results for a request load, the count row reads "Finding stays…" above the skeletons. When a chip or sort change is waiting, the results stay on screen and the count row reads "Updating…" until the new results land.
- **Pull to refresh:** `RefreshControl` (native) on Home, Search and stay details.
  - Each hook gets `refresh(): Promise<void>`, `refreshing`, `refreshError` and `clearRefreshError`.
- **PostHog:** `stays_refreshed { screen: "home" | "search" | "stay" }`, and `search_suggestion_tapped { index }`. `stay_host_opened` is removed.

## Result
Built as planned.
- Created `Skeleton`, `EmptyState`, `LoadError`, `Spinner`, and icon registry with `wave`, `globe`, `wifiOff`, `warning`, `searchOff`, `pinOff`, `search`, `calendar`, `clock`.
- Search prompt updated to magnifier icon, dimmed placeholder, and default suggestion "cabin with a hot tub".
- Home greeting emoji replaced with accessible `wave` icon.
- Search result cards spacing updated with `pb-3` and `min-h-40 self-stretch` image.
- Inline "Meet your host" `HostSection` added to stay details; host modal removed.
- Placeholder trip summary screen created at `/stay/[slug]/book` and registered in root layout.
- Ask, Trips, Home, Search, and Stay updated to use shared `EmptyState`, `LoadError`, and `RefreshControl`.
- All TypeScript types pass and ESLint passes with 0 errors and 0 warnings.
