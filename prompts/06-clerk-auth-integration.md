# 06 · Clerk Authentication Integration

Status: done

## Goal

Replace mock authentication with real Clerk authentication using `@clerk/expo` and the Roamify Clerk instance (`pk_test_ZW5hYmxpbmctcGlwZWZpc2gtODA4OC5jbGVyay5hY2NvdW50cy5kZXYk`). A guest can sign up with name, email and password, then confirm the email with a 6-digit code. They can sign in with email and password, entering a code when Clerk asks to verify a new device. They can continue with Google or Apple via browser SSO (`useSSO`). The session survives app restarts via `expo-secure-store` `tokenCache`, `/home` is protected in `(app)/`, and Sign out returns to onboarding. The existing custom screens and design stay the same.

## Decisions

- **Dependencies**:
  - Install `expo-secure-store` and `expo-auth-session` via `npx expo install expo-secure-store expo-auth-session`.
  - Add `"expo-secure-store"` and `"@clerk/expo"` plugins to `app.json`.
- **Environment & Keys**:
  - `.env` created with `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZW5hYmxpbmctcGlwZWZpc2gtODA4OC5jbGVyay5hY2NvdW50cy5kZXYk`.
  - `.env.example` created with `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=` and `CLERK_SECRET_KEY=`.
  - Ensure `.env` is in `.gitignore`.
- **Clerk SDK Version & Hooks**:
  - `@clerk/expo` 4.13.0 installed.
  - Use current method-based API (`useSignIn()`, `useSignUp()` returning `{ signIn, errors, fetchStatus }` / `{ signUp, errors, fetchStatus }`).
- **Error Mapping (`src/lib/auth/errors.ts`)**:
  - Map Clerk error codes (`form_identifier_exists`, `form_identifier_not_found`, `form_password_incorrect`, `form_code_incorrect`, `verification_expired`, `form_password_pwned`, `form_password_length_too_short`, `too_many_requests`).
- **Sign Up (`src/app/(auth)/sign-up.tsx`)**:
  - Split "Full name" into `firstName` and `lastName`.
  - `signUp.password({ emailAddress, password, firstName, lastName })`.
  - `signUp.verifications.sendEmailCode()`.
  - Push `/verify` with `params: { email, flow: "sign-up" }`.
  - Mount `<View nativeID="clerk-captcha" />` for bot protection.
  - Google & Apple buttons trigger `useSSO()`.
- **Sign In (`src/app/(auth)/sign-in.tsx`)**:
  - `signIn.password({ emailAddress, password })`.
  - Branch on `signIn.status`:
    - `complete` → `signIn.finalize()`.
    - `needs_client_trust` with `email_code` → `signIn.mfa.sendEmailCode()`, push `/verify` with `flow: "sign-in"`.
  - Mount `<View nativeID="clerk-captcha" />`.
  - Google & Apple buttons trigger `useSSO()`.
- **Verify (`src/app/(auth)/verify.tsx`)**:
  - Serves both `flow === "sign-up"` and `flow === "sign-in"`:
    - `sign-up`: verify with `signUp.verifications.verifyEmailCode({ code })`, resend with `signUp.verifications.sendEmailCode()`.
    - `sign-in`: verify with `signIn.mfa.verifyEmailCode({ code })`, resend with `signIn.mfa.sendEmailCode()`.
  - If attempt invalid (e.g. reload without state), `<Redirect>` to `/sign-up` or `/sign-in`.
  - On `complete`, call `finalize()`.
- **Social SSO (`useSSO`)**:
  - Use `startSSOFlow({ strategy: "oauth_google" | "oauth_apple" })` from `useSSO()`.
  - On `createdSessionId`, call `setActive({ session: createdSessionId })`.
  - Ignore user cancellations cleanly.
- **Routing & Protection**:
  - Use `useAuth()` in `src/app/_layout.tsx` child `RootNavigator`.
  - Hide splash screen only when fonts are ready AND `isLoaded` is true to prevent any screen flash.
  - Guard screens using `Stack.Protected`:
    - `guard={!isSignedIn}`: `onboarding` and `(auth)`.
    - `guard={isSignedIn}`: `(app)`.
    - Unguarded: `index` and `design-system`.
  - Move `home.tsx` to `src/app/(app)/home.tsx` with `(app)/_layout.tsx`.
  - `index.tsx`: `<Redirect href={isSignedIn ? "/home" : "/onboarding"} />`.
- **Home & Sign Out (`src/app/(app)/home.tsx`)**:
  - Displays user info from `useUser()` (`user.fullName` / `user.firstName`, `user.primaryEmailAddress.emailAddress`).
  - "Sign out" calls `signOut()` from `useClerk()`.
- **Cleanup**:
  - Remove `src/context/mock-auth.tsx`.

## Out of scope

- Native Apple/Google buttons requiring development build (using browser SSO via `useSSO` compatible with Expo Go and Dev builds).
- Password reset email flow.

## Steps

### 1. Configure environment and install dependencies
Add `.env` to `.gitignore`. Create `.env.example` and `.env` with publishable key. Run `npx expo install expo-secure-store expo-auth-session`. Add plugins in `app.json`.

### 2. Create Auth Errors Helper (`src/lib/auth/errors.ts`)
Implement `authErrorMessage(error: unknown): string` mapping Clerk error codes to user-friendly messages.

### 3. Root layout, protected routing, and home screen migration
Update `src/app/_layout.tsx` with `ClerkProvider` and `tokenCache`. Split into `RootNavigator` with `useAuth()` gating on `isLoaded` before hiding splash. Set up `Stack.Protected` or layout guards. Move `src/app/home.tsx` to `src/app/(app)/home.tsx` and create `src/app/(app)/_layout.tsx`. Update `src/app/index.tsx`.

### 4. Wire Sign Up (`src/app/(auth)/sign-up.tsx`)
Implement `useSignUp()` and `useSSO()`. Split full name, call `signUp.password()`, send email code, add `clerk-captcha`, and handle social auth.

### 5. Wire Sign In (`src/app/(auth)/sign-in.tsx`)
Implement `useSignIn()` and `useSSO()`. Handle password sign-in, `needs_client_trust` routing to verify, add `clerk-captcha`, and handle social auth.

### 6. Wire Verify (`src/app/(auth)/verify.tsx`)
Support both `sign-up` and `sign-in` verification with 6-digit OTP code, resend countdown, and `finalize()`.

### 7. Clean up mock auth and verify
Remove `src/context/mock-auth.tsx`. Run `npx tsc --noEmit` and `npx expo lint`. Test sign-up, sign-in, session persistence, and sign-out.

## Verification

- `npx expo lint` passes with 0 errors.
- `npx tsc --noEmit` passes with 0 errors.
- Sign up with test email (`you+clerk_test@example.com` and code `424242`) creates account and lands on `/home`.
- Restart/reload retains active session.
- Sign out terminates session and returns to `/onboarding`.
- Deep linking to `/home` while signed out redirects to `/onboarding` or `/sign-in`.

## Result

- Installed `expo-secure-store` and `expo-auth-session`, added plugins to `app.json`.
- Configured `.env` with publishable key and committed `.env.example` template while ignoring `.env`.
- Created `src/lib/auth/errors.ts` for user-friendly Clerk error messages.
- Wired `ClerkProvider` in `_layout.tsx` with `tokenCache` from `@clerk/expo/token-cache` and gated splash hide on `fontsReady` and `isLoaded`.
- Moved `home.tsx` to protected route group `src/app/(app)/home.tsx` with `(app)/_layout.tsx` authentication guard.
- Updated `src/app/index.tsx` and `src/app/(auth)/_layout.tsx` with Clerk authentication checks.
- Implemented real Clerk sign-up (`useSignUp()`), sign-in (`useSignIn()`), email verification (`verify.tsx`), browser SSO (`useSSO()`), bot protection (`clerk-captcha`), and interactive sign-out (`useClerk().signOut()`).
- Retired and removed `src/context/mock-auth.tsx`.
- Both `npx tsc --noEmit` and `npx eslint src/` pass with zero errors and zero warnings.
