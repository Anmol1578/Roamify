# 15 · Ask Answers from Policy Knowledge Base with Gemini

Status: done


## Goal

In "Ask about this stay", every question (typed or chip) goes to `POST /api/ask`. The route has Google Gemini (`gemini-2.5-flash` via AI SDK structured outputs) pick which passages answer it: sections of Roamify's guest-policy Knowledge Base (`roamify-policies`) and this stay's own verified rules. The chat displays them as answer cards, word for word, each with its exact source citation. A Knowledge Base section is shown only after Gemini has verified it against the source policies from Sanity. If nothing answers, the reply states so and points to support. If the route fails, the chat falls back to local keyword matching.

## Decisions

- **Endpoint**:
  - `roamify-policies` on Sanity Context in Knowledge Base mode (KB id `kbHPPfGlUOvp`, built from Roamify's 10 seeded policies in project `ird6lvzh`).
  - Read via stateless JSON-RPC `tools/call` (`knowledge_base_read`) with `SANITY_ORGANIZATION_TOKEN` (Context Viewer).
  - Falls back to `SANITY_POLICIES_MCP_URL` or `SANITY_CONTEXT_KB_URL` if set in `.env.local`.
- **Model & AI SDK Integration**:
  - Uses Google Gemini (`gemini-2.5-flash`) through `@ai-sdk/google` + `ai`'s structured outputs (`generateText` with `Output.object` + Zod schemas).
  - Model strictly selects among typed choices defined in code; the model NEVER generates GROQ, writes arbitrary prose, or invents facts.
  - Confidence ratings: `low`, `medium`, `high`. Only `high` and `medium` confidence decisions are accepted.
  - Secrets: Resolves `Gemini_API_Key`, `GEMINI_API_KEY`, or `GOOGLE_GENERATIVE_AI_API_KEY`.
- **Card Text & Two-Layer Grounding**:
  - **Layer 1: Policy Verification Check (Once per Snapshot)**:
    - KB entries are parsed into sections by `##` headers. Tables (`|`) are excluded. Footnote markers (`[^...]`) are parsed into source citations.
    - Each section is verified against the raw source policy text (`*[_type == "policy"]{ title, kind, "text": pt::text(body) }`) from Sanity CDN.
    - Gemini evaluates whether source policies support the section (`supports`, `partly`, `contradicts`, `says_nothing`). Only sections where Gemini affirms `supports` with `high` confidence are kept.
  - **Layer 2: Passage Picking (Once per Question)**:
    - Candidate passages provided in code:
      - Stay-specific passages: Check-in & checkout times, pet policy, quiet hours, house rules, and cancellation summary.
      - Verified KB section passages.
    - Gemini evaluates which candidate passages answer the guest's question and returns `{ pickedPassageIds: string[], confidence: "low" | "medium" | "high" }`.
- **From Picks to Cards (Deterministic Code Rules)**:
  - Code drops cancellation sections for tiers other than this stay's own tier (e.g. if the stay has Moderate cancellation, Flexible and Strict sections are dropped).
  - Deduplication: When sections from multiple entries cover the same policy topic, keeps the best-matching entry.
  - Cap: At most 3 KB cards.
  - Stay cards always come first (check-in/checkout, pets, house rules, cancellation).
  - No card matches: Return the standard `NO_ANSWER` card ("No answer in this stay's details · Roamify's policies and this stay's details don't cover this. Contact Roamify support.").
- **Caching & Expo Dev Server Resilience**:
  - Expo dev server re-evaluates API routes per request; verified KB snapshots and source policy cache live on `globalThis` with a 10-minute TTL and background refresh.
  - Client session caches answers per `slug + question`.
- **API Contract (`POST /api/ask`)**:
  - Requires valid Clerk Bearer session token via `requireSession(request)`.
  - Body validated via Zod in `src/lib/server/ask-request.ts`: `{ slug: string, question: string }` (`slug` ≤ 96 chars, `question` 1–300 chars).
  - Response: `{ cards: AnswerCard[], topics: string[] }`.
  - Errors: 401 (session), 400 (body), 404 (`stay_not_found`), 502 (`knowledge_unavailable` / `model_failed`).
- **Client UI (`src/app/stay/[slug]/ask.tsx`)**:
  - Both typed questions and quick topic chips go through `/api/ask`.
  - Shows pending message bubble ("Checking Roamify's policies…"), replaced in place by answer cards.
  - On any network or server error, falls back seamlessly to local `answerFor(stay, matchTopics(text))`.
  - Welcome copy: "Ask about check-in, pets, cancellation and more. Answers quote this stay's details and Roamify's guest policies as written."
  - PostHog: `stay_ask_sent` captures `{ slug, from, topics, answered, answeredBy: "gemini" | "fallback" }`. Never sends guest typed text.

## Steps

### 1. Context Tool Calling & Environment (`src/lib/server/context.ts`, `.env.example`)
- Export `callContextTool(url, name, args, signal)` in `src/lib/server/context.ts` returning `result.content[0].text`.
- Update `contextQuery` to use `callContextTool`.
- Add `SANITY_POLICIES_MCP_URL=` and `SANITY_CONTEXT_KB_URL=` to `.env.example`.

### 2. Markdown Parsing & Verification Snapshot (`src/lib/server/kb-markdown.ts`, `src/lib/server/policy-kb.ts`)
- Implement `src/lib/server/kb-markdown.ts`:
  - `parseEntry(path, markdown)`: splits by `##` headers, excludes tables, strips inline footnote markers while capturing footnotes as citations, returns structured sections with clean plain text lines.
- Add `POLICY_TEXT_QUERY` in `src/lib/sanity/queries.ts` (`*[_type == "policy"]{ _id, title, kind, "text": pt::text(body) }`).
- Implement `src/lib/server/policy-kb.ts`:
  - Fetches policies from Sanity CDN.
  - Reads the 7 KB entries from `roamify-policies` via `knowledge_base_read`.
  - Runs Gemini verification check on each section against source policies, caching verdicts by hash on `globalThis`.
  - Returns verified sections list with policy attributions.

### 3. Answer Evaluator & Card Assembler (`src/lib/server/policy-answers.ts`)
- Implement `answerQuestion(question, stay, verifiedKnowledge)`:
  - Builds candidate passages from stay fields and verified KB sections.
  - Uses `gemini-2.5-flash` with Zod structured output to select answering passage IDs with confidence.
  - Applies cancellation tier filtering, policy deduplication, and 3-card cap.
  - Assembles exact-text `AnswerCard[]` with stay citations and policy source badges.

### 4. API Route (`src/app/api/ask+api.ts`, `src/lib/server/ask-request.ts`)
- Create `src/lib/server/ask-request.ts`: Zod schema for `{ slug, question }`.
- Create `src/app/api/ask+api.ts`:
  - `requireSession(request)` for Clerk auth.
  - Validates request body.
  - Fetches stay via `STAY_QUERY`.
  - Loads verified KB snapshot and evaluates answer.
  - Returns JSON `{ cards, topics }`.

### 5. Client Chat UI (`src/app/stay/[slug]/ask.tsx`, `src/hooks/use-ask.ts`)
- Create `src/hooks/use-ask.ts`: handles `POST /api/ask` with Clerk session token, session cache, and 10s timeout.
- Update `src/app/stay/[slug]/ask.tsx`:
  - Adds pending message state ("Checking Roamify's policies…").
  - Routes typed text and chip selections through `useAsk`.
  - Falls back to local `answerFor(stay, matchTopics(text))` on error.
  - Updates welcome text and PostHog analytics tracking (`answeredBy: "gemini" | "fallback"`).

### 6. Verification
- Run `npx tsc --noEmit` and `npx expo lint`.
- Test `/api/ask` with curl: 401 unauthenticated, 400 invalid inputs, 200 with valid session.
- Test realistic questions (check-in, pets, cancellation, house rules, uncovered topics).
- Verify zero invented claims: all text is verbatim stay facts or verified policy text.

## Result

Built as planned across all five modules:
1. **Context Tool Calling**: `callContextTool` extracted into `src/lib/server/context.ts` supporting generic JSON-RPC tools with bearer authentication and event-stream acceptance headers.
2. **Markdown Parsing & Policy Verification**:
   - `src/lib/server/kb-markdown.ts` pure parser parses entry titles, footnote source citations, and splits into clean sections at `##` headers while dropping tables.
   - `src/lib/server/policy-kb.ts` verifies sections against source policy text (`POLICY_TEXT_QUERY`) using Gemini structured outputs (`gemini-2.5-flash`), filtering known meta text and unsupported claims, and caching verified snapshots on `globalThis` for 10 minutes.
3. **Passage Picking & Card Assembly**:
   - `src/lib/server/policy-answers.ts` maps stay fields (check-in/out, pets, house rules, cancellation) and verified KB sections into candidate passages.
   - Gemini evaluates answering passages with confidence ratings.
   - Code enforces cancellation tier alignment, topic deduplication, and a 3-card cap.
   - Fallback seamlessly routes to deterministic local policy matching if Gemini times out or quota is exceeded.
4. **Server API Route**:
   - `POST /api/ask` in `src/app/api/ask+api.ts` enforces Clerk session tokens via `requireSession`, validates `{ slug, question }`, hydrates the stay via `ASK_STAY_QUERY`, and returns `{ cards, topics, answeredBy }`.
5. **Client Chat UI**:
   - `src/hooks/use-ask.ts` handles Clerk session bearer requests with 10s client timeout and session caching.
   - `src/app/stay/[slug]/ask.tsx` renders pending message bubble ("Checking Roamify's policies…") and replaces it in place with verified answer cards and sources, tracking `stay_ask_sent` in PostHog.
   - `src/components/ask/ask-input.tsx` enforces `maxLength={300}`.

