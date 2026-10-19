# 02 · Design System Implementation

Status: done

## Goal

Implement the complete Roam design system derived from the reference design sheet, including fonts (Plus Jakarta Sans Geometric Sans), colors (Primary Yellow, Lavender, Text, Surfaces, Glass), spacing, radii, shadows, and shared components across the app.

## Decisions

- **Color Tokens**:
  - `primary`: `#FFC629` (Primary Yellow: buttons, active tab glow, active toggles)
  - `lavender`: `#C9B4FF` (Secondary actions, filter highlights, focus rings, policy icons)
  - `textPrimary`: `#0B0B1A` (Headings, primary labels)
  - `textSecondary`: `#6B7280` (Body copy, metadata, secondary labels)
  - `surfaceWhite`: `#FFFFFF` (Cards, sheets, elevated surfaces)
  - `surfaceGray`: `#F4F5F7` (App background, input fields, inactive chips)
  - `borderGray`: `#E5E7EB` (Dividers, card outlines, subtle borders)
  - `glassBlur`: `rgba(255, 255, 255, 0.7)` (Tab bar, floating glass chrome)
  - `statusSuccess`: `#EAF7EE` bg, `#15803D` text/icon
  - `statusError`: `#FEECEE` bg, `#B91C1C` text/icon
  - Badges: `guestFavorite` (`#FEF7E6`), `new` (`#E8FAF3`), `discount` (`#FDF2F4`), `superhost` (`#EEF2FF` with `#C7D2FE` border)
- **Typography Tokens**:
  - Font: Plus Jakarta Sans via `@expo-google-fonts/plus-jakarta-sans` (`400Regular`, `500Medium`, `600SemiBold`, `700Bold`, `800ExtraBold`).
  - Ramp:
    - `display`: 56-64px, bold, line-height 1.0
    - `heading`: 28-32px, bold, line-height 1.2
    - `title`: 20-22px, semibold, line-height 1.25
    - `body`: 16px, regular, line-height 1.5
    - `subhead`: 15px, medium, line-height 1.4
    - `caption`: 14px, medium, line-height 1.4
    - `button`: 17-18px, medium
- **Spacing Scale (4-point grid)**:
  - `xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 20`, `2xl: 24`, `3xl: 32`, `4xl: 48`
- **Radius Scale**:
  - `sm: 8`, `md: 12`, `lg: 16`, `xl: 20`, `2xl: 24`, `3xl: 32`, `full: 9999` with `borderCurve: "continuous"`
- **Iconography**:
  - `lucide-react-native` for 100% vector SVG icons matching the exact outline styling in the reference sheet.
- **Storage & Consumption**:
  - Dual access: Tailwind CSS v4 `@theme` in `global.css` for utility classes (`bg-primary`, `text-textPrimary`, etc.) and TypeScript token definitions in `src/theme/` (`colors.ts`, `spacing.ts`, `typography.ts`, `radius.ts`, `shadows.ts`, `motion.ts`, `index.ts`).
- **Shared Components (`src/components/`)**:
  - `ThemedText`: Typographic hierarchy with Plus Jakarta Sans and token colors.
  - `Button`: Primary (Yellow capsule with text + arrow), Secondary (White outline capsule), Icon button (circular/capsule with pressed state).
  - `Input`: Search field (with search & filter icons), Form field (default & lavender focus ring), Password field (with eye visibility toggle).
  - `FilterChip`: Rounded-full pill, active (lavender/yellow) & inactive (`#F4F5F7`), with optional icon.
  - `Badge`: Status tags ("Guest favorite", "New", "20% off", "Superhost").
  - `ListingCard`: Full card with image, floating heart favorite button, title, location, star rating, amenity chips, price per night.
  - `PolicyCard`: Lavender icon badge, title, description, and chevron.
  - `ProfileRow`: Icon, label, and chevron row.
  - `SegmentedControl`: List vs Map pill toggle.
  - `Toggle`: Switch with primary yellow track.
  - `Stepper`: Minus / count / Plus counter capsule.
  - `AlertBanner`: Success and Error alert pills.
  - `GlassTabBar`: Floating liquid glass bottom navigation bar with glowing active tab.
  - `BrandWordmark`: Roamify brand logo supporting both image asset and typography variants.
- **Showcase Screen**:
  - Interactive design system catalog in `src/app/index.tsx` presenting all 15 reference sections.

## Out of scope

- Production routing and deep navigation (search flow, stay details, booking, checkout) — deferred to their respective feature plans.
- Clerk authentication and Sanity CMS API queries.

## Steps

### 1. Install dependencies
Run `npx expo install @expo-google-fonts/plus-jakarta-sans lucide-react-native`.

### 2. Configure Tailwind CSS v4 @theme in global.css
Add custom theme colors, fonts, radii, and shadows in `global.css` using Tailwind v4 syntax.

### 3. Create TypeScript theme tokens in src/theme/
Create `src/theme/colors.ts`, `src/theme/spacing.ts`, `src/theme/typography.ts`, `src/theme/radius.ts`, `src/theme/shadows.ts`, `src/theme/motion.ts`, and `src/theme/index.ts`.

### 4. Configure font loading in root layout
Update `src/app/_layout.tsx` to load Plus Jakarta Sans weights using `useFonts` and prevent splash screen until fonts are loaded.

### 5. Build reusable design system components in src/components/
Build:
- `ThemedText`
- `Button`
- `Input`
- `FilterChip`
- `Badge`
- `ListingCard`
- `PolicyCard`
- `ProfileRow`
- `SegmentedControl`
- `Toggle`
- `Stepper`
- `AlertBanner`
- `GlassTabBar`

### 6. Build design system showcase in src/app/index.tsx
Create an interactive screen rendering all 15 reference sections with live interactive states (chips selection, toggle switches, stepper increment/decrement, segmented control, search filter, tab selection).

### 7. Run verification
Verify TypeScript check, lint check, web export bundling, and visual appearance.

## Verification

- `npx tsc --noEmit` passes with 0 errors.
- `npx expo lint` passes with 0 errors.
- `npx expo export --platform web --clear` succeeds without bundling errors.
- Visual inspection of the 15 design system sections in browser.

## Result

Implemented the complete Roam design system across tokens (`global.css` and `src/theme/`), font loading (Plus Jakarta Sans in `src/app/_layout.tsx`), and all 13 reusable UI primitives (`ThemedText`, `Button`, `IconButton`, `Input`, `SearchInput`, `FilterChip`, `Badge`, `ListingCard`, `PolicyCard`, `ProfileRow`, `SegmentedControl`, `Toggle`, `Stepper`, `AlertBanner`, `GlassTabBar`) matching the reference design. An interactive showcase is live on `src/app/index.tsx`.

## AGENTS.md updates

- Added Roam design system tokens, Plus Jakarta Sans typography, and shared components rules.
