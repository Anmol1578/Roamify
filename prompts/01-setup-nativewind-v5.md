# 01 · Setup NativeWind V5

Status: done

## Goal

Configure NativeWind v5 (RC0) with Tailwind CSS v4 in the Expo React Native app so components can be styled using Tailwind utility classes (`className`) across native and web platforms.

## Decisions

- Target exact versions specified in the NativeWind v5 documentation: `nativewind@5.0.0-rc.0` and `react-native-css@3.1.0-rc.0`.
- Target exact dev dependencies: `tailwindcss@4.1.12`, `@tailwindcss/postcss@4.1.12`, `postcss`, and `lightningcss@1.30.1`.
- Add package override for `"lightningcss": "1.30.1"` in `package.json` to prevent deserialization errors during builds.
- Configure `postcss.config.mjs` exporting `@tailwindcss/postcss` plugin (Expo discovers `.mjs` or `.js`, not `.cjs`).
- Configure root `global.css` with unlayered utilities as required by NativeWind v5 / React Native Web:
  - `@import "tailwindcss/theme.css" layer(theme);`
  - `@import "tailwindcss/preflight.css" layer(base);`
  - `@import "tailwindcss/utilities.css";`
  - `@import "nativewind/theme";`
- Configure `metro.config.js` wrapping `getDefaultConfig(__dirname)` with `withNativewind(config)` from `nativewind/metro`.
- Import `../../global.css` once at the top of the root layout `src/app/_layout.tsx`.
- Create `nativewind-env.d.ts` with `/// <reference types="react-native-css/types" />` and `declare module "*.css";` for TypeScript declaration merging.
- Verify `app.json` contains `"userInterfaceStyle": "automatic"` (already confirmed).
- Verify setup by rendering styled components in `src/app/index.tsx` utilizing Tailwind classes.

## Out of scope

- Migrating legacy v4 syntax or deprecated v4 helpers (`cssInterop`, `remapProps`).
- Building the custom design system tokens and theme palette (handled in subsequent design plans).

## Steps

### 1. Install NativeWind v5 and Tailwind CSS v4 dependencies
Add `"overrides": { "lightningcss": "1.30.1" }` to `package.json`.
Install runtime dependencies: `nativewind@5.0.0-rc.0` and `react-native-css@3.1.0-rc.0`.
Install dev dependencies: `tailwindcss@4.1.12`, `@tailwindcss/postcss@4.1.12`, `postcss`, `lightningcss@1.30.1`.

### 2. Configure PostCSS and Tailwind root stylesheet
Create `postcss.config.mjs` specifying `@tailwindcss/postcss`.
Create `global.css` at project root with the required split `@import` directives.

### 3. Configure Metro bundler
Create `metro.config.js` using `getDefaultConfig` from `expo/metro-config` and `withNativewind` from `nativewind/metro`.

### 4. Configure root layout and TypeScript declarations
Create `nativewind-env.d.ts` with `react-native-css/types` reference and `*.css` module declaration.
Import `../../global.css` in `src/app/_layout.tsx`.

### 5. Verify styling with test component
Update `src/app/index.tsx` to use `className` styles (e.g. flex layout, typography, colors, dark mode support).
Run type check and build/export verification.

## Verification

- `npx tsc --noEmit` passes with 0 errors.
- `npx expo lint` passes with 0 errors.
- `npx expo export --platform web --clear` completes successfully without CSS or Metro bundling errors.
- Verify component rendered with Tailwind utility classes in browser or simulator.

## Result

NativeWind v5 RC0 (`5.0.0-rc.0` and `react-native-css@3.1.0-rc.0`) with Tailwind CSS v4 (`tailwindcss@4.1.12`, `@tailwindcss/postcss@4.1.12`, `lightningcss@1.30.1`) is fully installed and configured. Metro and PostCSS compile the root `global.css` stylesheet without errors, TypeScript type declarations are active, and `src/app/index.tsx` verifies that `className` styling works as expected.

## AGENTS.md updates

- Document styling stack: NativeWind v5 RC0 with Tailwind CSS v4.
- Document component styling rule: NativeWind handles `className` on standard React Native components; third-party components use `styled()` from `nativewind` instead of deprecated `cssInterop`/`remapProps`.
