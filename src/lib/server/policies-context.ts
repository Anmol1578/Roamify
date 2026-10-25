import { ROAM_POLICIES } from "../ask";

export interface PolicyEntryContent {
  path: string;
  title: string;
  summary: string;
  fullText: string;
  quotes: { quote: string; source: string }[];
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id?: string | number;
  result?: {
    content?: { type: string; text: string }[];
    isError?: boolean;
    meta?: Record<string, unknown>;
  };
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

const KB_ID = "kbHPPfGlUOvp";

// In-memory cache for policy entries (1-hour TTL)
const cache = new Map<string, { entry: PolicyEntryContent; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

function resolvePoliciesMcpUrl(): string {
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

/**
 * Parses markdown text from a Knowledge Base entry into title, summary, and footnote quotes.
 */
export function parsePolicyEntry(path: string, rawMarkdown: string): PolicyEntryContent {
  const lines = rawMarkdown.split("\n");
  let title = path.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  let summary = "";
  const quotes: { quote: string; source: string }[] = [];

  // Extract title from first # Header
  const titleLine = lines.find((l) => l.startsWith("# "));
  if (titleLine) {
    title = titleLine.replace(/^#\s+/, "").trim();
  }

  // Extract footnote definitions: [^id]: "Quote" (Source, line X)
  const footnoteRegex = /\[\^([a-zA-Z0-9]+)\]:\s*"([^"]+)"\s*\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = footnoteRegex.exec(rawMarkdown)) !== null) {
    quotes.push({
      quote: match[2],
      source: match[3],
    });
  }

  // Extract clean introductory paragraph (excluding headers and footnotes)
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("[^") || trimmed.startsWith("---")) {
      continue;
    }
    // Remove footnote markers [^xxx]
    const cleanLine = trimmed.replace(/\[\^[a-zA-Z0-9]+\]/g, "");
    if (cleanLine.length > 20) {
      summary = cleanLine;
      break;
    }
  }

  if (!summary && quotes.length > 0) {
    summary = quotes[0].quote;
  }

  return {
    path,
    title,
    summary,
    fullText: rawMarkdown,
    quotes,
  };
}

/**
 * Reads policy entries from the roamify-policies Knowledge Base endpoint via MCP tools/call.
 * Uses 1-hour in-memory cache and falls back to deterministic local policies if offline.
 */
export async function readPolicyEntries(
  paths: string[],
  signal?: AbortSignal
): Promise<Record<string, PolicyEntryContent>> {
  const now = Date.now();
  const result: Record<string, PolicyEntryContent> = {};
  const pathsToFetch: string[] = [];

  for (const path of paths) {
    const cached = cache.get(path);
    if (cached && cached.expiresAt > now) {
      result[path] = cached.entry;
    } else {
      pathsToFetch.push(path);
    }
  }

  if (pathsToFetch.length === 0) {
    return result;
  }

  const mcpUrl = resolvePoliciesMcpUrl();
  const orgToken = process.env.SANITY_ORGANIZATION_TOKEN;

  if (mcpUrl && orgToken) {
    try {
      const res = await fetch(mcpUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${orgToken}`,
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/call",
          params: {
            name: "knowledge_base_read",
            arguments: {
              knowledgeBase: KB_ID,
              paths: pathsToFetch,
            },
          },
        }),
        signal,
      });

      if (res.ok) {
        const json = (await res.json()) as JsonRpcResponse;
        if (!json.error && !json.result?.isError && json.result?.content) {
          const rawText = json.result.content.map((c) => c.text).join("\n\n---\n\n");
          // Split content into entries by top-level headers or match per path
          const sections = rawText.split(/(?=\n# |\n---\n# )/);

          pathsToFetch.forEach((p, idx) => {
            const sectionText = sections[idx] || rawText;
            const parsed = parsePolicyEntry(p, sectionText);
            cache.set(p, { entry: parsed, expiresAt: now + CACHE_TTL_MS });
            result[p] = parsed;
          });

          return result;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch Knowledge Base entries from Context MCP:", err);
    }
  }

  // Resilient fallback to local definitions
  for (const p of pathsToFetch) {
    const fallback = getFallbackPolicyEntry(p);
    result[p] = fallback;
    cache.set(p, { entry: fallback, expiresAt: now + CACHE_TTL_MS });
  }

  return result;
}

function getFallbackPolicyEntry(path: string): PolicyEntryContent {
  const keyMap: Record<string, string> = {
    check_in_and_check_out: "checkIn",
    pets: "pets",
    payments_and_fees: "payment",
    damage_and_liability: "damage",
    cancellation_and_refunds: "guestRefund",
    house_rules: "houseRules",
    guest_conduct: "guestConduct",
  };

  const localKey = keyMap[path] || path;
  const localDef = ROAM_POLICIES[localKey] || {
    title: path.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    summary: "Please review the stay details and Roamify booking terms for complete guidance.",
  };

  return {
    path,
    title: localDef.title,
    summary: localDef.summary,
    fullText: localDef.summary,
    quotes: [
      {
        quote: localDef.summary,
        source: `${localDef.title} · Roamify policy`,
      },
    ],
  };
}
