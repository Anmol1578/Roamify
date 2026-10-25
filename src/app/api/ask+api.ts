import { requireSession, HttpError } from "@/lib/server/auth";
import { askRequestSchema } from "@/lib/server/ask-request";
import { sanityQuery } from "@/lib/sanity/fetch";
import { ASK_STAY_QUERY } from "@/lib/sanity/queries";
import { policyKnowledge } from "@/lib/server/policy-kb";
import { answerQuestion } from "@/lib/server/policy-answers";
import { Property } from "@/lib/stays";

export async function POST(request: Request): Promise<Response> {
  const start = Date.now();
  try {
    // 1. Authenticate with Clerk session token
    await requireSession(request);

    // 2. Validate request body
    const bodyJson = await request.json().catch(() => null);
    if (!bodyJson) {
      return Response.json({ error: "Missing JSON request body", code: "INVALID_BODY" }, { status: 400 });
    }

    const parsed = askRequestSchema.safeParse(bodyJson);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid request payload", details: parsed.error.flatten(), code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { slug, question } = parsed.data;

    // 3. Hydrate stay details and load Policy KB snapshot in parallel
    const [stay, snapshot] = await Promise.all([
      sanityQuery<Property | null>(ASK_STAY_QUERY, { slug }),
      policyKnowledge(),
    ]);

    if (!stay) {
      return Response.json({ error: "Stay not found", code: "STAY_NOT_FOUND" }, { status: 404 });
    }

    // 4. Answer question using Gemini passage picker over verified KB snapshot
    const answerResult = await answerQuestion(question, stay, snapshot);

    const durationMs = Date.now() - start;
    console.log(`[Ask API] ${slug}: answered in ${durationMs}ms via ${answerResult.answeredBy}`);

    return Response.json(
      {
        cards: answerResult.cards,
        topics: answerResult.topics,
        answeredBy: answerResult.answeredBy,
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
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("Unhandled error in /api/ask:", err);
    return Response.json({ error: message, code: "INTERNAL_ERROR" }, { status: 500 });
  }
}
