# Roamify · Sanity Studio

Content management studio for Roamify stay listings, hosts, and policies.

## Schemas

- **Property (`property`)**: Rental listings with location coordinates, pricing, bedrooms/baths, amenities, vibes, host references, policy references, and multi-image galleries.
- **Host (`host`)**: Verified stay hosts with avatar, superhost status, response time, response rate, languages, and bio.
- **Policy (`policy`)**: Shared cancellation, house rules, and custom policies structured for the zero-hallucination knowledge base.
- **Review (`review`)**: Stay reviews and guest ratings.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start local studio:
   ```bash
   npm run dev
   ```

3. Deploy studio:
   ```bash
   npm run deploy
   ```

## Seeding & Verification

- Seed 30 properties, 10 hosts, and 10 policies:
  ```bash
  npx tsx scripts/seed.ts
  ```
- Check for duplicate photo URLs across properties:
  ```bash
  npx tsx scripts/check-duplicates.ts
  ```
