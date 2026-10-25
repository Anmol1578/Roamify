# 16 · Profile Screen Redesign

Status: done

## Goal

Redesign the profile screen (`src/app/(app)/profile.tsx`) to match the provided modern Roamify design mockup: brand wordmark with settings icon, user avatar with location and "Roamify Explorer" badge, 3-metric stats card (Trips, Saved, Rating), grouped Account and Preferences list items, a lavender "Free cancellation" policy banner, and Clerk sign out.

## Decisions

- **Header:** Uses lowercase `roamify` wordmark with `PlusJakartaSans_800ExtraBold` matching the app name and home screen, with a rounded settings button (`Settings` icon) on the top right.
- **User Header:** Displays user avatar (from Clerk or high-res fallback), full name (from Clerk or "Joanna Smith"), location ("San Francisco, CA" or metadata), and a pill badge with gold star and "Roamify Explorer" text on lavender background.
- **Stats Card:** A white elevated card with 3 columns divided by vertical borders: "12 Trips", "8 Saved", and "★ 4.9 Rating".
- **Account Group:** A rounded section with items: "Personal info" (`User` icon), "Payment methods" (`CreditCard` icon), and "Trips" (`Luggage` icon), each with rounded icon container, label, and right chevron.
- **Preferences Group:** A rounded section with items: "Notifications" (`Bell` icon) and "Help & support" (`HelpCircle` icon).
- **Policy Banner:** Soft lavender banner card with `FileText` icon, "Free cancellation" title, "Full refund up to 7 days before check-in." subtitle, and right chevron.
- **Sign Out:** Preserved as a clean, styled action button at the bottom of the screen to satisfy Clerk auth requirements ("Sign out lives in Profile").
- **Motion & Interactions:** All items use `PressableScale` for micro-animations and haptic feedback.
- **Safe Area & Tabs:** Scroll padding accounts for top safe area insets and bottom `GlassTabBar` floating overlay (`paddingBottom: insets.bottom + 110`).

## Out of scope

- Backing payment processors or custom notification preference sub-screens (placeholder feedback on press).
- Custom avatar upload pipeline (uses existing Clerk image or fallback).

## Steps

### 1. Implement redesigned ProfileScreen in `src/app/(app)/profile.tsx`

Build the screen layout, styled components, and Clerk integration:
- Brand header row (`roamify` + settings icon button).
- User profile hero (avatar, name, location with map pin, "Roamify Explorer" badge).
- Stats summary card (3 columns: Trips, Saved, Rating).
- Grouped "Account" menu section with rounded icons and chevrons.
- Grouped "Preferences" menu section.
- Soft lavender "Free cancellation" callout card.
- Red-tinted Clerk sign-out action button.
- Clean integration with Clerk `useUser` and `useClerk` hooks.

### 2. Lint and Typecheck

Run `npx tsc --noEmit` and `npx expo lint` to ensure zero compilation or styling errors.

## Verification

1. Typecheck: `npx tsc --noEmit` passes with 0 errors.
2. Lint: `npx expo lint` passes with 0 errors.
3. Visual comparison against reference image:
   - Header with brand wordmark and settings button.
   - User hero with avatar, name, location pin, and explorer badge.
   - 3-column stats card with vertical dividers.
   - Account and Preferences cards with correct icons.
   - Free cancellation banner.
   - Smooth press interactions and functional sign out.

## AGENTS.md updates

None

## Result

Redesigned `src/app/(app)/profile.tsx` matching the user reference image:
- Top brand header with `roamify` bold wordmark and settings button.
- Profile hero with avatar, name (Clerk user or fallback), location, and "Roamify Explorer" star badge.
- Elevated 3-column stats card with "12 Trips", "8 Saved", and "4.9 ★ Rating" with vertical dividers.
- Grouped "Account" card with "Personal info", "Payment methods", and "Trips".
- Grouped "Preferences" card with "Notifications" and "Help & support".
- Soft lavender "Free cancellation" policy banner with purple accent icon.
- Clerk-integrated red sign-out action button with haptic feedback.
- Both `npx tsc --noEmit` and `npx expo lint` pass with 0 errors.
