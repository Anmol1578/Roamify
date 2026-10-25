import { useState, useCallback, useRef } from "react";
import { useAuth } from "@clerk/expo";
import { AnswerCard } from "@/lib/ask";

export interface AskApiResponse {
  cards: AnswerCard[];
  topics: string[];
  answeredBy: "gemini" | "fallback";
}

const sessionCache = new Map<string, AskApiResponse>();

export function useAsk() {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const activeAbortRef = useRef<AbortController | null>(null);

  const ask = useCallback(
    async (slug: string, question: string, externalSignal?: AbortSignal): Promise<AskApiResponse> => {
      const trimmed = question.trim();
      const cacheKey = `${slug}:${trimmed.toLowerCase()}`;

      // Check in-memory session cache
      const cached = sessionCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      setIsLoading(true);

      const controller = new AbortController();
      activeAbortRef.current = controller;

      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 10000); // 10s client timeout

      // Link external signal if provided
      if (externalSignal) {
        externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
      }

      try {
        const token = await getToken();
        if (!token) {
          throw new Error("No active Clerk session token");
        }

        const res = await fetch("/api/ask", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ slug, question: trimmed }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.error || `Server responded with ${res.status}`);
        }

        const data = (await res.json()) as AskApiResponse;
        sessionCache.set(cacheKey, data);
        return data;
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
      }
    },
    [getToken]
  );

  return { ask, isLoading };
}
