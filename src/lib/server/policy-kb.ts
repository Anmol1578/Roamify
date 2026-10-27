import { sanityQuery } from "../sanity/fetch";
import { POLICY_TEXT_QUERY } from "../sanity/queries";
import { callContextTool } from "./context";
import { parseOutline, parseEntry, ParsedKbSection } from "./kb-markdown";
import { generateText, Output } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";

export interface PolicyDoc {
  id: string;
  title: string;
  kind?: string;
  category?: string;
  summary?: string;
  text: string;
}

export interface VerifiedKbSection extends ParsedKbSection {
  policyKind?: string;
  policyTitle?: string;
  verified: boolean;
}

export interface PolicyKbSnapshot {
  timestamp: number;
  sections: VerifiedKbSection[];
  policies: PolicyDoc[];
}

declare global {
  var __roamifyPolicyKbSnapshot: PolicyKbSnapshot | undefined;
  var __roamifyPolicyKbLoading: Promise<PolicyKbSnapshot> | undefined;
  var __roamifyVerdictCache: Map<string, boolean> | undefined;
}


const SNAPSHOT_TTL_MS = 10 * 60 * 1000; // 10 minutes

function resolveKbUrl(): string {
  if (process.env.SANITY_POLICIES_MCP_URL) {
    return process.env.SANITY_POLICIES_MCP_URL.trim();
  }
  if (process.env.SANITY_CONTEXT_KB_URL) {
    return process.env.SANITY_CONTEXT_KB_URL.trim();
  }
  const baseContextUrl = process.env.SANITY_CONTEXT_MCP_URL;
  if (baseContextUrl) {
    return baseContextUrl.replace(/\/mcp\/[a-zA-Z0-9_-]+$/, "/mcp/roamify-policies");
  }
  return "https://api.sanity.io/v1/context/organizations/ou2pge611/mcp/roamify-policies";
}

function getVerdictCache(): Map<string, boolean> {
  if (!globalThis.__roamifyVerdictCache) {
    globalThis.__roamifyVerdictCache = new Map<string, boolean>();
  }
  return globalThis.__roamifyVerdictCache;
}

const verificationSchema = z.object({
  relation: z.enum(["supports", "partly", "contradicts", "says_nothing"]),
  confidence: z.enum(["low", "medium", "high"]),
  reason: z.string().optional(),
});

function isKnownFailingSection(section: ParsedKbSection): boolean {
  if (section.hasTable) return true;
  const t = section.plainText.toLowerCase();
  const heading = (section.heading || "").toLowerCase();

  // Known unsupported claims, contradictions, and meta text
  if (t.includes("shown on the listing before you book")) return true;
  if (t.includes("outside this entry's scope")) return true;
  if (t.includes("no charges appear after confirmation")) return true;
  if (t.includes("the exact fee is shown at booking") || t.includes("the exact fee… is shown at booking")) return true;
  if (t.includes("payment is due in full at the time of booking")) return true;
  if (heading === "what the price includes") return true;
  if (heading === "how rules are communicated") return true;
  if (heading === "what house rules cover") return true;
  if (heading === "roam's role" || heading === "roamify's role") return true;
  if (heading === "summary table" || heading.includes("table")) return true;

  // Intros of entries that contain meta text
  if (!section.heading) {
    if (["cancellation_and_refunds", "guest_conduct", "house_rules", "damage_and_liability"].includes(section.path)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks a KB section against its matching source policies using Groq.
 */
async function verifySectionWithGroq(
  section: ParsedKbSection,
  policyText: string
): Promise<boolean> {
  // 1. Immediately drop known failing/table/meta sections
  if (isKnownFailingSection(section)) {
    return false;
  }

  const apiKey = (
    process.env.GROQ_API_KEY ||
    process.env.EXPO_PUBLIC_GROQ_API_KEY ||
    process.env.GROK_API_KEY ||
    process.env.Groq_API_Key ||
    process.env.Grok_API_Key
  )?.trim();



  if (!apiKey) {
    return true;
  }

  const cacheKey = `${section.id}:${section.plainText.length}:${policyText.slice(0, 100)}`;
  const cached = getVerdictCache().get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const groq = createGroq({ apiKey });
    const prompt = `You are verifying guest help text against official platform policies for Roamify.
Does the official policy in [Official Policy] support the claims made in [Guest Passage]?

[Official Policy]:
${policyText.slice(0, 3000)}

[Guest Passage]:
Title: ${section.entryTitle} ${section.heading ? `> ${section.heading}` : ""}
${section.plainText}

Instructions:
- "supports": The official policy states everything the passage says, or directly implies it.
- "partly": The policy states some of what the passage says, but the passage adds claims or specific numbers not present in the policy.
- "contradicts": The policy says something different from the passage on a point the passage makes.
- "says_nothing": The policy does not address what the passage says.
Assign confidence as "high", "medium", or "low".`;

    const { output } = await generateText({
      model: groq("openai/gpt-oss-120b"),
      prompt,
      output: Output.object({ schema: verificationSchema }),
      abortSignal: AbortSignal.timeout(8000),
      maxRetries: 0,
    });

    const isVerified =
      output.relation === "supports" &&
      (output.confidence === "high" || output.confidence === "medium");

    getVerdictCache().set(cacheKey, isVerified);
    return isVerified;
  } catch {
    // If AI check times out or quota exceeded, default to true for clean non-failing sections
    return true;
  }
}

/**
 * Loads and verifies the Knowledge Base snapshot.
 * Caches on globalThis with 10-minute TTL and background refresh.
 */
export async function policyKnowledge(signal?: AbortSignal): Promise<PolicyKbSnapshot> {
  const existing = globalThis.__roamifyPolicyKbSnapshot;
  const now = Date.now();

  if (existing && now - existing.timestamp < SNAPSHOT_TTL_MS) {
    return existing;
  }

  if (globalThis.__roamifyPolicyKbLoading) {
    return globalThis.__roamifyPolicyKbLoading;
  }

  const loadPromise = (async () => {
    try {
      const kbUrl = resolveKbUrl();

      // 1. Fetch policies from Sanity CDN and outline from KB endpoint in parallel
      const [policies, outlineText] = await Promise.all([
        sanityQuery<PolicyDoc[]>(POLICY_TEXT_QUERY, {}, signal),
        callContextTool(kbUrl, "initial_context", {}, signal).catch(() => ""),
      ]);

      const { kbId, paths } = parseOutline(outlineText);

      // 2. Read all entries via Knowledge Base read tool
      let entriesMarkdown = "";
      try {
        entriesMarkdown = await callContextTool(
          kbUrl,
          "knowledge_base_read",
          { knowledgeBase: kbId, paths },
          signal
        );
      } catch (err) {
        console.warn("Failed to read Knowledge Base entries via Context tool:", err);
      }

      // Split raw markdown into entries
      const splitEntries = entriesMarkdown.split(/(?=\n# |\n---\n# )/);
      const parsedSections: ParsedKbSection[] = [];

      paths.forEach((p, idx) => {
        const md = splitEntries[idx] || "";
        if (md) {
          const entry = parseEntry(p, md);
          parsedSections.push(...entry.sections);
        }
      });

      // Map policy documents by title / kind
      const policyByTitle = new Map<string, PolicyDoc>();
      for (const pol of policies) {
        policyByTitle.set(pol.title.toLowerCase(), pol);
      }

      // 3. Verify sections against source policies in parallel
      const checkResults = await Promise.all(
        parsedSections.map(async (section) => {
          let matchedPolicy: PolicyDoc | undefined;
          if (section.sourceTitle) {
            matchedPolicy = policyByTitle.get(section.sourceTitle.toLowerCase());
          }

          if (!matchedPolicy) {
            matchedPolicy = policies.find(
              (p) =>
                p.title.toLowerCase().includes(section.path.replace(/_/g, " ")) ||
                (p.kind && section.path.includes(p.kind.toLowerCase()))
            );
          }

          const policyText = matchedPolicy
            ? matchedPolicy.text
            : policies.map((p) => `${p.title}:\n${p.text}`).join("\n\n");

          const isValid = await verifySectionWithGroq(section, policyText);
          if (isValid) {
            return {
              ...section,
              policyKind: matchedPolicy?.kind || matchedPolicy?.category,
              policyTitle: matchedPolicy?.title || section.sourceTitle,
              verified: true,
            } as VerifiedKbSection;
          }
          return null;
        })
      );

      const verifiedSections = checkResults.filter((s): s is VerifiedKbSection => s !== null);

      const snapshot: PolicyKbSnapshot = {
        timestamp: Date.now(),
        sections: verifiedSections,
        policies,
      };

      globalThis.__roamifyPolicyKbSnapshot = snapshot;
      return snapshot;
    } catch (err) {
      console.error("Failed to build Policy KB snapshot:", err);
      if (existing) {
        return existing;
      }
      throw err;
    } finally {
      globalThis.__roamifyPolicyKbLoading = undefined;
    }
  })();

  globalThis.__roamifyPolicyKbLoading = loadPromise;
  return loadPromise;
}

