# 05 · Onboarding Design Update (Images & Bold Typography)

Status: done

## Goal

Update the onboarding screen to match the user's design reference: load the high-res Positano terrace sunset wallpaper for slide 1 and two matching luxury stay wallpapers for slides 2 and 3 from local assets, style the headline text with bold, punchy Plus Jakarta Sans 800 weight, and refine indicator bars and button aesthetics to match the screenshot.

## Decisions

- **Slide 1 image**: Use `assets/images/onboarding/slide-1-positano.jpg` (clean 9:16 high-resolution photorealistic rendering of the exact Positano villa terrace with loungers overlooking the Mediterranean sunset).
- **Slide 2 image**: Use `assets/images/onboarding/slide-2-banff.jpg` (luxury modern A-frame mountain chalet in Banff with glowing interior and steaming outdoor cedar hot tub).
- **Slide 3 image**: Use `assets/images/onboarding/slide-3-santorini.jpg` (private Aegean caldera cliffside villa in Santorini with turquoise infinity pool at dusk).
- **Local vs Remote**: Local bundled assets via `require("@/../assets/images/onboarding/...")` replace remote Unsplash URLs for zero load lag, instant launch, and offline support.
- **Bold Typography**:
  - Headline: Set `fontSize: 36`, `lineHeight: 42`, `fontFamily: "PlusJakartaSans_800ExtraBold"`, `fontWeight: "800"`, `letterSpacing: -1.2`, color `#0B0B1A`. Ensure both `fontFamily` and `fontWeight` are explicitly provided to avoid platform rendering bugs where custom fonts lose their 800 weight on native/web.
  - Subtitle: `fontSize: 16`, `lineHeight: 23`, `fontFamily: "PlusJakartaSans_400Regular"`, `color: "#6B7280"`.
- **Page Indicators**:
  - Update `PageDots` to match screenshot: active indicator is a rounded pill (`w-10 h-1.5 rounded-full`) in vibrant purple `#8A7CFE`, inactive indicators are `w-9 h-1.5` in light gray `#E5E7EB`.
- **Wordmark & Buttons**:
  - Ensure Wordmark `roamify` has `fontWeight: "800"` and letter spacing `-1.2`.
  - Primary button: "Start exploring" with right arrow icon (`→`) and amber fill (`#FFAE00` / `#FFC629`).
  - Secondary button: "Continue with Google" with Google icon and subtle border.

## Out of scope

- Production Clerk OAuth backend wiring.
- Changing onboarding routing logic.

## Steps

### 1. Update slides data with local assets
Update `src/components/onboarding/slides.ts` to import or require the 3 local images from `assets/images/onboarding/` and keep accurate locations: "Positano, Italy", "Banff, Canada", and "Santorini, Greece".

### 2. Update typography and page dots styling
Update `src/components/onboarding/page-dots.tsx` with vibrant purple active indicator `#8A7CFE` and proper dimensions. Update `src/app/onboarding.tsx` to apply explicit `fontWeight: "800"` on the headline along with `PlusJakartaSans_800ExtraBold`, `fontSize: 36`, `lineHeight: 42`, and refined margins.

### 3. Verify screen rendering and flow
Run `npx expo lint` and `npx tsc --noEmit`. Verify slide swiping, text cross-fading, button interactions, and visual alignment with the design screenshot.

## Verification

- `npx expo lint` passes with 0 errors.
- `npx tsc --noEmit` passes with 0 errors.
- Onboarding screen renders slide 1 with the Positano sunset villa terrace image.
- Swiping reveals slide 2 (Banff A-frame cabin) and slide 3 (Santorini infinity pool villa).
- Headline is rendered with thick, bold 800-weight typography matching the screenshot.
- Active page dot renders vibrant purple pill.
- "Start exploring", "Continue with Google", and "Skip" buttons work smoothly.

## AGENTS.md updates

- None (all patterns adhere to existing design system tokens and navigation rules).

## Result

- Slide 1 background image updated to high-resolution Positano cliffside villa terrace matching the design reference screenshot.
- Slide 2 and 3 images updated with matching luxury stay photography: Banff mountain A-frame cabin with hot tub, and Santorini whitewashed caldera cliffside villa with infinity pool.
- Local assets bundled in `assets/images/onboarding/` for instant offline loading with zero flicker.
- Headline styled with crisp, high-impact `PlusJakartaSans_800ExtraBold`, explicit `fontWeight: "800"`, `fontSize: 36`, and `lineHeight: 42`.
- Indicator dots updated with vibrant `#8A7CFE` purple active pill matching the design.
- `npx eslint src/` and `npx tsc --noEmit` pass with zero errors and zero warnings.
