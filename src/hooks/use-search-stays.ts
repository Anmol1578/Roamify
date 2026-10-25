import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@clerk/expo";
import { Property } from "@/lib/stays";
import { SearchIntent, emptyIntent } from "@/lib/search/intent";
import { SortOption } from "@/lib/search/query";
import { posthog } from "@/lib/posthog";

export type SearchRequest = { q: string } | { intent: SearchIntent };

interface CachedResult {
  stays: Property[];
  intent: SearchIntent;
  total: number;
}

const searchCache = new Map<string, CachedResult>();

export interface UseSearchStaysResult {
  stays: Property[];
  intent: SearchIntent;
  total: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useSearchStays(
  request: SearchRequest | undefined,
  sortOption: SortOption = "best_match"
): UseSearchStaysResult {
  const { getToken } = useAuth();
  const [liveData, setLiveData] = useState<{ key: string; result: CachedResult } | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const requestKey = useMemo(() => {
    if (!request) return "";
    if ("q" in request) {
      return `q:${request.q.trim().toLowerCase()}|sort:${sortOption}`;
    }
    return `intent:${JSON.stringify(request.intent)}|sort:${sortOption}`;
  }, [request, sortOption]);

  const cached = requestKey ? searchCache.get(requestKey) : undefined;

  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const currentResult = useMemo<CachedResult>(() => {
    if (liveData?.key === requestKey) {
      return liveData.result;
    }
    if (cached) {
      return cached;
    }
    return {
      stays: [],
      intent: request && "intent" in request ? request.intent : emptyIntent(request && "q" in request ? request.q : ""),
      total: 0,
    };
  }, [requestKey, cached, liveData, request]);

  useEffect(() => {
    if (!requestKey || (searchCache.has(requestKey) && fetchTrigger === 0)) {
      return;
    }

    let isCurrent = true;
    const abortController = new AbortController();

    const runFetch = async () => {
      setIsFetching(true);
      setIsError(false);
      setError(null);


      try {
        const token = await getToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const bodyPayload = {
          ...request,
          sort: sortOption,
        };

        const res = await fetch("/api/search", {
          method: "POST",
          headers,
          body: JSON.stringify(bodyPayload),
          signal: abortController.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Search failed with status ${res.status}`);
        }

        const data = await res.json();
        if (!isCurrent) return;

        const result: CachedResult = {
          stays: data.stays || [],
          intent: data.intent || emptyIntent(),
          total: data.total !== undefined ? data.total : (data.stays?.length || 0),
        };

        // Cache result
        searchCache.set(requestKey, result);

        // Also cache under intent key if this was a `q` request
        if (request && "q" in request && data.intent) {
          const intentKey = `intent:${JSON.stringify(data.intent)}|sort:${sortOption}`;
          searchCache.set(intentKey, result);
        }

        setLiveData({ key: requestKey, result });
        setIsFetching(false);

        // PostHog Telemetry
        const queryText = request && "q" in request ? request.q : data.intent?.text || "";
        if (result.stays.length === 0) {
          posthog?.capture("search_empty", {
            query: queryText,
            sort_option: sortOption,
          });
        } else {
          posthog?.capture("search_results_returned", {
            query: queryText,
            results_count: result.stays.length,
            sort_option: sortOption,
          });
        }
      } catch (err: unknown) {
        if (!isCurrent) return;
        const e = err as Error;
        if (e.name === "AbortError") return;
        setIsError(true);
        setError(e);
        setIsFetching(false);
      }
    };

    runFetch();

    return () => {
      isCurrent = false;
      abortController.abort();
    };
  }, [requestKey, fetchTrigger, request, sortOption, getToken]);

  const refetch = useCallback(() => {
    if (requestKey) {
      searchCache.delete(requestKey);
      setFetchTrigger((t) => t + 1);
    }
  }, [requestKey]);

  const isLoading = Boolean(requestKey && !cached && (isFetching || liveData?.key !== requestKey));

  return {
    stays: currentResult.stays,
    intent: currentResult.intent,
    total: currentResult.total,
    isLoading,
    isError,
    error,
    refetch,
  };
}
