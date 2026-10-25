import { requireSession, HttpError } from "@/lib/server/auth";
import { searchRequestSchema } from "@/lib/server/search-request";
import { knownPlaces } from "@/lib/server/places";
import { readIntent } from "@/lib/server/evaluator";
import { buildSearchGroq } from "@/lib/server/search-groq";
import { contextQuery } from "@/lib/server/context";
import { Property } from "@/lib/stays";
import { SearchIntent } from "@/lib/search/intent";

export async function POST(request: Request): Promise<Response> {
  try {
    // 1. Authenticate with Clerk session token
    await requireSession(request);

    // 2. Validate request body
    const bodyJson = await request.json().catch(() => null);
    if (!bodyJson) {
      return Response.json({ error: "Missing JSON request body" }, { status: 400 });
    }

    const parsedBody = searchRequestSchema.safeParse(bodyJson);
    if (!parsedBody.success) {
      return Response.json(
        { error: "Invalid request payload", details: parsedBody.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsedBody.data;
    const sort = payload.sort || "best_match";
    const places = await knownPlaces();

    let intent: SearchIntent;
    if ("q" in payload) {
      intent = await readIntent(payload.q, places);
    } else {
      intent = payload.intent as SearchIntent;
    }

    // 3. Build GROQ query with literals, filters, and semantic embeddings
    const query = buildSearchGroq(intent, sort);

    // 4. Execute query through Sanity Context endpoint (with resilient fallback)
    const data = await contextQuery<{ total: number; stays: Property[] }>(query);

    const validStays = data?.stays || [];
    const total = data?.total !== undefined ? data.total : validStays.length;

    return Response.json(
      {
        intent,
        total,
        stays: validStays,
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: unknown) {
    if (err instanceof HttpError) {
      return Response.json({ error: err.message, code: err.code }, { status: err.status });
    }
    console.error("Unhandled error in /api/search:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
