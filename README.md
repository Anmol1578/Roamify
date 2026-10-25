# Roamify 🏡✨

> **Intelligent stay discovery app built with Expo, React Native, Sanity Content Lake, Clerk, and Google Gemini AI.**

Roamify lets travelers discover stays by simply describing what they want in plain sentences (*"quiet pet-friendly cabin with a hot tub under $300 a night"*). It ranks verified stays matching both hard constraints and soft vibes, and provides instant, zero-hallucination answers to house rule and policy questions directly from Sanity's Knowledge Base.

---

## ✨ Features

- **🔍 Natural Language Search**  
  Describe what you want in your own words. The search pipeline parses pricing constraints, guest capacity, destination, and amenity preferences, ranking results via semantic intent and exact GROQ filtering.
- **💬 Zero-Hallucination Policy Q&A**  
  Ask any question about house rules, cancellation terms, pets, or quiet hours. Answers quote verified property policies and house rules verbatim with source attribution—no invented text.
- **🏡 Curated Listings & Galleries**  
  Explore 30 hand-crafted stays across global destinations, featuring multi-photo carousels, verified host profiles ("Meet your host"), full fee breakdowns, and favorite toggling.
- **🔐 Secure Authentication**  
  Complete authentication powered by **Clerk** supporting Email OTP and Google/Apple SSO, with route protection and session management.
- **🎨 State-of-the-Art Native UI**  
  Crafted with **NativeWind v5 (Tailwind CSS v4)**, **Plus Jakarta Sans** typography, continuous corner radii, custom glass tab bar navigation, staggered reanimated transitions, and tactile haptic feedback.
- **📈 Privacy-Preserving Analytics**  
  User journey telemetry via **PostHog** with session reset on sign-out and strict exclusion of sensitive personal details.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Expo](https://expo.dev) (SDK 58) with [React Native](https://reactnative.dev) 0.88 & Expo Router |
| **Styling & Theme** | [NativeWind v5](https://www.nativewind.dev/) (Tailwind CSS v4), `react-native-css`, Plus Jakarta Sans |
| **Authentication** | [Clerk](https://clerk.com/) (`@clerk/expo`) with secure token caching |
| **CMS & Knowledge Base** | [Sanity Studio v6](https://www.sanity.io/) Content Lake & Knowledge Base Mode |
| **AI & Search Engine** | [Google Gemini 2.5 Flash](https://ai.google.dev/) via Vercel AI SDK (`generateObject` with Zod validation) |
| **Animation & Gestures** | React Native Reanimated 4, Gesture Handler, Expo Haptics |
| **Analytics** | [PostHog](https://posthog.com/) (`posthog-react-native`) |

---

## 📁 Repository Structure

```
Roamify/
├── assets/                  # App icons, splash screens, and onboarding imagery
├── src/
│   ├── app/                 # Expo Router file-based screens & API routes
│   │   ├── (app)/           # Authenticated tab routes: Home, Search, Trips, Profile
│   │   ├── (auth)/          # Authentication flows: Sign-in, Sign-up, Email OTP
│   │   ├── api/             # Server API routes (/api/search, /api/ask)
│   │   ├── stay/[slug]/     # Stay details, Policy Q&A sheet, and Booking summary
│   │   ├── design-system.tsx# Interactive design system & component catalog
│   │   └── onboarding.tsx   # Visual onboarding carousel
│   ├── components/          # Reusable UI primitives, cards, inputs, and modals
│   ├── hooks/               # Custom hooks for stays, search queries, and policy Q&A
│   ├── lib/                 # Sanity client, Clerk auth helpers, search parsing & PostHog
│   └── theme/               # Colors, typography, spacing, radius, shadows, and motion curves
└── studio/                  # Sanity Studio schemas, migration scripts, and seed data
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18 or newer)
- **npm** or **bun**
- **Expo Go** app on your physical device or an iOS/Android simulator

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Anmol1578/Roamify.git
cd Roamify
npm install
```

### 3. Environment Setup
Copy the environment template and fill in your keys:
```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key (Frontend) |
| `CLERK_SECRET_KEY` | Clerk Secret Key (Server API verification) |
| `EXPO_PUBLIC_SANITY_PROJECT_ID` | Sanity Project ID |
| `EXPO_PUBLIC_SANITY_DATASET` | Sanity Dataset (e.g. `production`) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini API Key for search intent & Q&A |
| `SANITY_ORGANIZATION_TOKEN` | Sanity Organization Token for Knowledge Base access |
| `EXPO_PUBLIC_POSTHOG_KEY` | PostHog API Key (Optional) |
| `EXPO_PUBLIC_POSTHOG_HOST` | PostHog Ingestion Host (Optional) |

### 4. Running the App
Start the Expo development server:
```bash
npm run start
```

Press:
- `i` to open in the **iOS Simulator**
- `a` to open in the **Android Emulator**
- Scan the QR code with the **Expo Go** app on iOS/Android

---

## 🧪 Quality & Validation

Run static analysis and type checks:
```bash
# Type check all TypeScript files
npm run typecheck

# Lint check codebase
npm run lint
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
