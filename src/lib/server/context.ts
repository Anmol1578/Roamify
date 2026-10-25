import { HttpError } from "./auth";
import { sanityQuery } from "../sanity/fetch";

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

export async function callContextTool(
  url: string,
  name: string,
  args: Record<string, unknown>,
  signal?: AbortSignal
): Promise<string> {
  const orgToken = process.env.SANITY_ORGANIZATION_TOKEN;
  if (!orgToken) {
    throw new HttpError(500, "SANITY_ORGANIZATION_TOKEN is not configured on the server", "CONFIG_ERROR");
  }

  const res = await fetch(url, {
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
        name,
        arguments: args,
      },
    }),
    signal,
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.warn(`Context MCP responded with HTTP ${res.status}:`, errBody);
    throw new HttpError(502, `Context MCP error HTTP ${res.status}`);
  }

  const json = (await res.json()) as JsonRpcResponse;
  if (json.error) {
    console.warn("Context MCP JSON-RPC error:", json.error);
    throw new HttpError(502, json.error.message);
  }

  if (json.result?.isError) {
    const errorText = json.result.content?.[0]?.text || "Context tool error";
    console.warn(`Context MCP ${name} failed:`, errorText);
    throw new HttpError(502, errorText);
  }

  return json.result?.content?.[0]?.text || "";
}

export async function contextQuery<T>(query: string, signal?: AbortSignal): Promise<T> {
  const mcpUrl = process.env.SANITY_CONTEXT_MCP_URL;

  if (mcpUrl && process.env.SANITY_ORGANIZATION_TOKEN) {
    try {
      const contentText = await callContextTool(mcpUrl, "groq_query", { query }, signal);
      if (contentText) {
        const parsed = JSON.parse(contentText);
        return (parsed.result !== undefined ? parsed.result : parsed) as T;
      }
    } catch (err: unknown) {
      if (err instanceof HttpError && err.status === 502) {
        console.warn("Falling back to Sanity CDN Client after Context MCP error:", err.message);
      } else {
        console.warn("Context MCP fetch error, falling back to Sanity CDN:", err);
      }
    }
  }

  // Resilient fallback: Direct Sanity Client query on production dataset
  try {
    const fallbackResult = await sanityQuery<T>(query, {}, signal);
    return fallbackResult;
  } catch (err) {
    console.error("Direct Sanity query fallback failed:", err);
    throw new HttpError(502, "Failed to execute search query against content store", "DATABASE_ERROR");
  }
}

