import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAuth } from "@clerk/expo";
import { Property } from "@/lib/stays";
import { SearchIntent, emptyIntent } from "@/lib/search/intent";
import { SortOption } from "@/lib/search/query";
import { posthog } from "@/lib/posthog";

export type SearchRequest = { q: string } | { intent: SearchIntent };

export interface CachedResult {
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
  pending: boolean;
  isFetching: boolean;
  refreshing: boolean;
  isError: boolean;
  error: Error | null;
  refreshError: Error | null;
  clearRefreshError: () => void;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSearchStays(
  request: SearchRequest | undefined,
  sortOption: SortOption = "best_match"
): UseSearchStaysResult {
  const { getToken } = useAuth();
  const requestRef = useRef(request);
  useEffect(() => {
    requestRef.current = request;
  }, [request]);

  const requestKey = useMemo(() => {
    if (!request) return "";
    if ("q" in request) {
      return `q:${request.q.trim().toLowerCase()}|sort:${sortOption}`;
    }
    return `intent:${JSON.stringify(request.intent)}|sort:${sortOption}`;
  }, [request, sortOption]);

  const cached = requestKey ? searchCache.get(requestKey) : undefined;

  const [loaded, setLoaded] = useState<{ key: string; result: CachedResult } | null>(
    cached && requestKey ? { key: requestKey, result: cached } : null
  );
  const [shown, setShown] = useState<CachedResult>(
    cached ?? {
      stays: [],
      intent:
        request && "intent" in request
          ? request.intent
          : emptyIntent(request && "q" in request ? request.q : ""),
      total: 0,
    }
  );

  // Synchronize during render when requestKey changes
  const [prevKey, setPrevKey] = useState(requestKey);
  if (requestKey !== prevKey) {
    setPrevKey(requestKey);
    if (requestKey) {
      const entry = searchCache.get(requestKey);
      if (entry) {
        setShown(entry);
      }
    }
  }

  const [isFetchingState, setIsFetchingState] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshError, setRefreshError] = useState<Error | null>(null);

  const currentResult = useMemo<CachedResult>(() => {
    if (loaded?.key === requestKey) {
      return loaded.result;
    }
    if (requestKey && searchCache.has(requestKey)) {
      return searchCache.get(requestKey)!;
    }
    return shown;
  }, [requestKey, loaded, shown]);

  const lastSuccessfulIntentRef = useRef<SearchIntent | null>(null);
  useEffect(() => {
    if (currentResult.intent && currentResult.intent.text) {
      lastSuccessfulIntentRef.current = currentResult.intent;
    }
  }, [currentResult.intent]);

  useEffect(() => {
    let cancelled = false;

    if (requestKey && !searchCache.has(requestKey)) {
      (async () => {
        try {
          const token = await getToken();
          if (cancelled) return;

          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }

          const currentReq = requestRef.current;
          const bodyPayload = {
            ...currentReq,
            sort: sortOption,
          };

          const res = await fetch("/api/search", {
            method: "POST",
            headers,
            body: JSON.stringify(bodyPayload),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Search failed with status ${res.status}`);
          }

          const data = await res.json();
          if (cancelled) return;

          const result: CachedResult = {
            stays: data.stays || [],
            intent: data.intent || emptyIntent(),
            total: data.total !== undefined ? data.total : data.stays?.length || 0,
          };

          searchCache.set(requestKey, result);

          if (currentReq && "q" in currentReq && data.intent) {
            const intentKey = `intent:${JSON.stringify(data.intent)}|sort:${sortOption}`;
            searchCache.set(intentKey, result);
          }

          setLoaded({ key: requestKey, result });
          setShown(result);
          setIsError(false);
          setError(null);
          setIsFetchingState(false);

          const queryText = currentReq && "q" in currentReq ? currentReq.q : data.intent?.text || "";
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
          if (cancelled) return;
          const e = err instanceof Error ? err : new Error(String(err));
          setIsError(true);
          setError(e);
          setIsFetchingState(false);
        }
      })();
    }

    return () => {
      cancelled = true;
    };
  }, [requestKey, sortOption, getToken]);

  const refresh = useCallback(async () => {
    if (!requestKey) return;
    setRefreshing(true);
    setRefreshError(null);

    const currentReq = requestRef.current;
    const override =
      lastSuccessfulIntentRef.current && (!currentReq || !("intent" in currentReq))
        ? { intent: lastSuccessfulIntentRef.current }
        : currentReq;

    try {
      const token = await getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const bodyPayload = {
        ...override,
        sort: sortOption,
      };

      const res = await fetch("/api/search", {
        method: "POST",
        headers,
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Search failed with status ${res.status}`);
      }

      const data = await res.json();
      const result: CachedResult = {
        stays: data.stays || [],
        intent: data.intent || emptyIntent(),
        total: data.total !== undefined ? data.total : data.stays?.length || 0,
      };

      searchCache.set(requestKey, result);
      setLoaded({ key: requestKey, result });
      setShown(result);
      setRefreshing(false);
      posthog?.capture("stays_refreshed", { screen: "search" });
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      setRefreshing(false);
      setRefreshError(e);
    }
  }, [requestKey, sortOption, getToken]);

  const refetch = useCallback(async () => {
    if (!requestKey) return;
    searchCache.delete(requestKey);
    setIsFetchingState(true);
    try {
      const token = await getToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const currentReq = requestRef.current;
      const bodyPayload = {
        ...currentReq,
        sort: sortOption,
      };

      const res = await fetch("/api/search", {
        method: "POST",
        headers,
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Search failed with status ${res.status}`);
      }

      const data = await res.json();
      const result: CachedResult = {
        stays: data.stays || [],
        intent: data.intent || emptyIntent(),
        total: data.total !== undefined ? data.total : data.stays?.length || 0,
      };

      searchCache.set(requestKey, result);
      setLoaded({ key: requestKey, result });
      setShown(result);
      setIsError(false);
      setError(null);
      setIsFetchingState(false);
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      setIsError(true);
      setError(e);
      setIsFetchingState(false);
    }
  }, [requestKey, sortOption, getToken]);

  const clearRefreshError = useCallback(() => {
    setRefreshError(null);
  }, []);

  const hasLoadedCurrentKey = Boolean(
    requestKey && (loaded?.key === requestKey || searchCache.has(requestKey))
  );
  const isFetching = Boolean(requestKey && (!hasLoadedCurrentKey || isFetchingState));
  const isLoading = Boolean(requestKey && !hasLoadedCurrentKey && shown.stays.length === 0);
  const pending = Boolean(requestKey && !hasLoadedCurrentKey && isFetching && shown.stays.length > 0);

  return {
    stays: currentResult.stays,
    intent: currentResult.intent,
    total: currentResult.total,
    isLoading,
    pending,
    isFetching,
    refreshing,
    isError,
    error,
    refreshError,
    clearRefreshError,
    refetch,
    refresh,
  };
}
