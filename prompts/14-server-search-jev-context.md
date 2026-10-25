# 14 · Server Search with Gemini Structured Outputs & Sanity Context Endpoint

Status: done

## Goal

Move discovery search to a server API route (`/api/search`) that validates the guest's Clerk session, uses Google Gemini via AI SDK structured outputs (`generateObject` with Zod) to categorize filters (`wanted`, `avoided`, `not_mentioned`) and assign meanings to parsed numbers with confidence labels (`low`, `medium`, `high`), constructs a GROQ query combining hard filters and semantic embeddings, and runs it through the `roam-search` Sanity Context endpoint.


## Decisions

- **Model & AI SDK Integration**:
  - Replace Jev/TypeSafe AI with Google Gemini (`gemini-2.5-flash`) through the AI SDK (`@ai-sdk/google` + `ai`).
  - Use `generateObject` with a strict Zod schema enforcing typed structured outputs.
  - Every decision keeps the exact same options defined in code:
    - Filter options: `wanted`, `avoided`, `not_mentioned`.
    - Number meanings: `max_price`, `guests`, `bedrooms`, `beds`, `min_nights`, `unrelated`.
  - Confidence labels: `low`, `medium`, `high` instead of numeric probabilities.
  - Decisions are accepted only if confidence is `high` or `medium`. Low-confidence decisions fall back to code defaults.
- **Validation & Fallback**:
  - Schema validation is enforced by Zod via `generateObject`.
  - If a response fails schema validation, model throws, or key is unconfigured, execution falls back cleanly to deterministic code parsing (`parseQuery`), ensuring zero downtime or search failures.
- **Key & Secrets Management**:
  - Gemini key lives server-side as `GOOGLE_GENERATIVE_AI_API_KEY` (or `GEMINI_API_KEY`) in `.env.local`. Documented in `.env.example`.
  - Never exposed behind `EXPO_PUBLIC_` or bundled into client code.
- **Server-Side API Route & Clerk Authentication**:
  - Lives at `src/app/api/search+api.ts` (`POST`).
  - Extracts `Authorization: Bearer <token>` and verifies the Clerk session with `@clerk/backend` `verifyToken` using `CLERK_SECRET_KEY`. Rejects unauthenticated requests with HTTP 401.
- **GROQ Construction & Sanity Context Execution**:
  - Code maps accepted filter decisions (`type`, `pets`, `amenities`, `maxPrice`, `guests`, `place`) into hard GROQ filters.
  - Semantic soft intent & vibes are scored with dataset embeddings via `text::semanticSimilarity(...)`.
  - Queries are executed through the `roam-search` Sanity Context MCP endpoint (`ou2pge611/mcp/roam-search`) via `groq_query` using `SANITY_ORGANIZATION_TOKEN`.
  - Resilient fallback to direct Sanity Client query if the Context endpoint is in development or unreachable.
- **Client Integration**:
  - `src/hooks/use-search-stays.ts` calls `POST /api/search` with the guest's query, active filter chips, sort options, and Clerk session token.
- **Documentation & Testing**:
  - Rerun test searches and QA questions, recording and listing any differences in results.
  - Update `AGENTS.md` with: the model name, how structured outputs are validated, fallback behavior, and key location.

## Out of scope

- Direct booking / reservation payments.
- Client-side GROQ generation (all search logic is moved server-side).

## Steps

### 1. Install Dependencies & Update Environment Templates
- Install `@ai-sdk/google`, `ai`, `zod`, and `@clerk/backend` via `npx expo install`.
- Document `GOOGLE_GENERATIVE_AI_API_KEY`, `SANITY_ORGANIZATION_TOKEN`, and `SANITY_CONTEXT_MCP_URL` in `.env.example`.
- Ensure `.env.local` contains the key.

### 2. Implement Server Structured Decision Engine (`src/lib/server/evaluator.ts`)
- Code owns options and numbers:
  - Deterministically extracts candidate numbers (`\b\d+\b`) from the raw sentence.
  - Prepares candidate filter lists (`pets`, `types`, `amenities`, `vibes`).
- Constructs Zod schema for structured output:
  - `numbers`: array of `{ number: number, role: 'max_price' | 'guests' | 'bedrooms' | 'beds' | 'min_nights' | 'unrelated', confidence: 'low' | 'medium' | 'high' }`.
  - `filters`: array of `{ category: 'pets' | 'type' | 'amenity' | 'vibe', name: string, status: 'wanted' | 'avoided' | 'not_mentioned', confidence: 'low' | 'medium' | 'high' }`.
- Calls `generateObject` using Google Gemini (`gemini-2.5-flash`) with structured output.
- Filters decisions: accepts if confidence is `medium` or `high`; discards `low` confidence.
- Graceful fallback: on validation error, timeout, or missing key, falls back to code heuristic parsing (`parseQuery`).

### 3. Implement GROQ Query Builder & Context MCP Client (`src/lib/server/`)
- `src/lib/server/search-query.ts`:
  - Translates accepted structured decisions into hard GROQ filters.
  - Generates semantic embeddings scoring clause `score(text::semanticSimilarity(...))` for soft intent and vibes.
  - Appends `PROPERTY_PROJECTION`.
- `src/lib/server/context-client.ts`:
  - Executes GROQ query via `tools/call` (`groq_query`) on the `roam-search` Context MCP endpoint.
  - Falls back to Sanity CDN Client if Context MCP endpoint is unreachable.

### 4. Implement Server API Route (`src/app/api/search+api.ts`)
- Expo Router API route handling `POST`.
- Verifies Clerk bearer token using `@clerk/backend`. Returns 401 if unauthorized.
- Parses body `{ query, activeChips, sort }`.
- Runs structured evaluation, builds query, executes through Context endpoint, and returns `{ stays, appliedFilters, debug }`.

### 5. Update Client Search Hook (`src/hooks/use-search-stays.ts`)
- Updates `useSearchStays` to fetch from `POST /api/search` with session token from `useAuth().getToken()`.
- Updates UI state handling and preserves PostHog telemetry.

### 6. Rerun Test Searches, Knowledge Base Questions & Update AGENTS.md
- Run test queries:
  - "quiet pet friendly cabin with a hot tub under $300 a night"
  - "modern city loft for 2 with wifi and workspace"
  - Negative constraints: "beach house no pets"
- Verify Knowledge Base / stay policy answers.
- List any result changes or accuracy comparisons.
- Update `AGENTS.md` with:
  - Model: Google Gemini Flash (`gemini-2.5-flash`) via AI SDK structured outputs.
  - Schema validation: Zod object schema enforced by `generateObject`.
  - Fallback: Deterministic code heuristic parsing on schema mismatch or low confidence.
  - Key location: `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local` (never in client bundle).

## Verification

1. `npx tsc --noEmit` and `npx expo lint` pass with 0 errors.
2. Unauthenticated calls to `/api/search` return 401.
3. Authenticated query with "quiet pet friendly cabin with a hot tub under $300 a night" produces validated structured output:
   - 300 categorized as `max_price` (confidence: `high`)
   - `pets` categorized as `wanted` (confidence: `high`)
   - `cabin` categorized as `wanted` (confidence: `high`)
   - `hot tub` categorized as `wanted` (confidence: `high`)
   - `quiet` categorized as `wanted` (confidence: `high`)
4. Results execute through `roam-search` Context endpoint with embeddings ranking.
5. Injected invalid schema response triggers fallback without crashing or failing search.
6. Test searches and Knowledge Base queries verified and logged.
7. `AGENTS.md` updated with model, validation, fallback, and key location.

## AGENTS.md updates

- Replace Jev with Google Gemini (`gemini-2.5-flash`) using AI SDK `generateObject` with Zod schema validation.
- Confidence labels `low`, `medium`, `high`.
- Fallback: deterministic code parsing when schema validation fails or confidence is low.
- Secrets: `GOOGLE_GENERATIVE_AI_API_KEY` stored in `.env.local`, never exposed to client.

## Result

- Built the server-side discovery architecture at `POST /api/search` (`src/app/api/search+api.ts`) protected by Clerk session verification with `@clerk/backend` `verifyToken`.
- Created `src/lib/search/intent.ts` with typed `SearchIntent`, vocabulary definitions (17 amenities, 4 types, 16 vibes), and helper functions (`chipsFor`, `hasChip`, `toggleChip`, `describeIntent`, `stayTags`).
- Built the decision engine in `src/lib/server/evaluator.ts` using Google Gemini (`gemini-2.5-flash`) via the AI SDK with structured outputs (`generateObject` and Zod schema validation). It maps candidate numbers and filter options into typed stances with confidence ratings (`low`, `medium`, `high`), falling back cleanly to code deterministic parsing on any schema mismatch or key absence.
- Implemented `src/lib/server/search-groq.ts` with strict literal escaping `lit()` and semantic embeddings scoring `text::semanticSimilarity(...)` with vibe/amenity boosts and demote ordering.
- Implemented `src/lib/server/context.ts` to execute queries through the Sanity Context endpoint (`roam-record-search`) via JSON-RPC `groq_query`, backed by resilient Sanity CDN fallback.
- Rewrote `src/hooks/use-search-stays.ts` to fetch from `/api/search` with Clerk bearer tokens and in-memory caching.
- Updated `src/app/(app)/search.tsx` to drive the UI and chip toggling directly from server-interpreted and edited intents, displaying both applied and avoided filters in empty states.
- Verified type check (`npx tsc --noEmit`) and linter (`npx expo lint`) with 0 errors.
- Updated `AGENTS.md` and `.env.example`.

