# 04 · Auth Screens (Sign Up, Verification, Sign In)

Status: done

## Goal

Guests can create an account, verify their email with a 6-digit OTP code, and sign in using interactive forms matching the Roamify design system and `auth.png` reference. Authentication and credential validation are mocked with fluid state transitions and keyboard handling.

## Decisions

- **Source**: `auth.png` (Sign Up screen). Sign In and Verification screens follow the exact same visual hierarchy, typography, form controls, and layout.
- **Brand name**: Always `roamify` (per user instruction: "and the name is roamify").
- **Header**:
  - Left: 44x44 circular button (`rounded-full border border-borderGray bg-surfaceWhite`) with `ChevronLeft` icon (`size={20}`, `#0B0B1A`).
  - Right: `roamify` wordmark in `PlusJakartaSans_800ExtraBold` (`fontSize: 26`, color `#0B0B1A`, `letterSpacing: -1.2`).
- **Sign Up (`src/app/(auth)/sign-up.tsx`)**:
  - Title: "Create\nyour account" (`PlusJakartaSans_800ExtraBold`, 34pt, leading 40pt, `#0B0B1A`).
  - Subtitle: "Join roamify to save your stays, get personalized recommendations and access them across all your devices." (15pt, `PlusJakartaSans_400Regular`, `#6B7280`).
  - Fields:
    1. Full name: `User` icon (20pt), label "Full name", placeholder "e.g. Adrian Hajdin".
    2. Email address: `Mail` icon (20pt), label "Email address", placeholder "you@example.com", `keyboardType="email-address"`, `autoCapitalize="none"`.
    3. Password: `Lock` icon (20pt), label "Password", placeholder "At least 8 characters", `isPassword={true}` with eye toggle.
  - Primary button: "Create account" with right arrow (`→`), `variant="primary"`, `size="lg"`, `spreadIcons`.
  - Divider: "or" between horizontal hair lines (`#E5E7EB`).
  - Social buttons:
    - "Continue with Google" (`Button variant="secondary"` with `GoogleIcon`).
    - "Continue with Apple" (`Button variant="secondary"` with `AppleIcon`).
  - Footer: "Already have an account? Sign in" (linking to `/sign-in`).
  - On submit: Validates input fields (checks non-empty name, email regex, password length >= 8). On success, navigates to `/verify` with `email` parameter.
- **Verification (`src/app/(auth)/verify.tsx`)**:
  - Title: "Verify your\nemail" (34pt, 800 weight).
  - Subtitle: "We've sent a 6-digit verification code to\n{email}. Enter it below to complete your registration."
  - 6-digit OTP code cells: 6 rounded boxes (`w-12 h-14 rounded-2xl bg-surfaceGray border border-transparent`), focused state (`bg-surfaceWhite border-lavender`), centered bold 22pt digits, numeric keypad, supports auto-advance and backspace.
  - Resend timer: "Didn't receive code? Resend (59s)" with countdown timer and active pressable "Resend code" when expired.
  - Primary button: "Verify & continue" with right arrow (`→`). Disabled until 6 digits entered.
  - On submit: Validates 6 digits, mocks success banner, and navigates to the app (`/design-system` or root).
- **Sign In (`src/app/(auth)/sign-in.tsx`)**:
  - Title: "Welcome\nback" (34pt, 800 weight).
  - Subtitle: "Sign in to roamify to access your saved stays, bookings, and travel preferences."
  - Fields:
    1. Email address: `Mail` icon, label "Email address", placeholder "you@example.com".
    2. Password: `Lock` icon, label "Password", placeholder "Enter your password", `isPassword={true}`.
  - "Forgot password?" right-aligned action link with press handler.
  - Primary button: "Sign in" with right arrow (`→`).
  - Divider: "or".
  - Social buttons: Google & Apple buttons.
  - Footer: "Don't have an account? Sign up" (linking to `/sign-up`).
  - On submit: Validates credentials, simulates 600ms loading state, and redirects to app on success.
- **Mock Auth State**:
  - Simple client state (`src/context/mock-auth.tsx` or hook) storing `user: { name, email, isAuthenticated }` to enable live interactive state without real Clerk credentials.

## Out of scope

- Production Clerk OAuth and server backend tokens (user specified: "keep authenication mocked for now").
- Password reset email delivery backend.
- Biometric authentication (FaceID/TouchID).

## Steps

### 1. Mock Auth State & Helpers
Create `src/context/mock-auth.tsx` with `MockAuthProvider` and `useMockAuth()` hook holding user credentials, mock sign-in, mock sign-up, mock verification, and sign-out methods.

### 2. OTP Code Input Component
Create `src/components/otp-input.tsx` rendering 6 individual digit cells with smooth focus transition, backspace navigation, paste handling, and numeric keyboard.

### 3. Sign Up Screen (`src/app/(auth)/sign-up.tsx`)
Build the Sign Up screen matching `auth.png` with top navigation bar, form fields (Full name, Email address, Password), form validation, loading state, error alert banner, social buttons, and navigation to `/verify` upon submission.

### 4. Verification Screen (`src/app/(auth)/verify.tsx`)
Build the Verification screen matching the visual style with 6-digit OTP code input, dynamic email recipient display, resend timer, verification check, error/success alert banners, and redirect.

### 5. Sign In Screen (`src/app/(auth)/sign-in.tsx`)
Build the Sign In screen with email and password fields, eye visibility toggle, forgot password action, validation, and redirect.

### 6. Wire Navigation & Auth Layout
Update `src/app/(auth)/_layout.tsx` to register `sign-in`, `sign-up`, and `verify` screens with smooth transitions and keyboard-dismissing wrapper.

### 7. Verification & Visual QA
Run type check, linter, test the interactive flow end-to-end (Sign up → Enter info → Verify → Success → Sign in), test validation errors and field focus rings.

## Verification

- `npx expo lint` passes with 0 errors.
- `npx tsc --noEmit` passes with 0 errors.
- Interactive flow:
  1. Open `/sign-up` → verify layout matches `auth.png` (back button, roamify wordmark, inputs with icons & labels, primary button, divider, Google & Apple buttons, footer link).
  2. Test validation on `/sign-up` (empty fields, invalid email format, short password).
  3. Submit valid sign-up → transitions to `/verify` with email displayed.
  4. Test 6-digit OTP input on `/verify` (typing, backspace, auto-advance).
  5. Submit code → displays success alert and completes registration.
  6. Open `/sign-in` → verify layout, enter credentials → submits and logs in.
  7. Cross-links between `/sign-in` and `/sign-up` work seamlessly.

## AGENTS.md updates

- Auth section: Auth screens in `(auth)` include `sign-up`, `sign-in`, and `verify` using Roamify design system components with mocked state until Clerk integration.

## Result

- Built complete Sign Up screen matching `auth.png` with circular back button, `roamify` wordmark, 3 input fields with custom icons and labels, password toggle, "Create account" button with arrow, "or" divider, Google and Apple auth buttons, and navigation to `/verify`.
- Built 6-digit OTP verification screen (`/verify`) with auto-advance, backspace handling, resend timer, and alert banner feedback.
- Built Sign In screen (`/sign-in`) with email/password authentication, forgot password support, and cross-linking to `/sign-up`.
- Created lightweight `MockAuthProvider` context for interactive state across all screens.
- `npx expo lint`, `npx tsc --noEmit`, and `npx expo-doctor` (20/20) pass with zero errors. Static web export compiles cleanly.

