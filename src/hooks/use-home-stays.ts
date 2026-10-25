import { useState, useEffect, useCallback, useMemo } from "react";
import { Property } from "@/lib/stays";
import { CategoryFilter } from "@/components/home/category-chips";
import { sanityQuery } from "@/lib/sanity/fetch";
import { HOME_STAYS_QUERY } from "@/lib/sanity/queries";
import { posthog, posthogLog } from "@/lib/posthog";

const memoryCache = new Map<CategoryFilter, Property[]>();

export interface UseHomeStaysResult {
  stays: Property[];
  isLoading: boolean;
  isFetching: boolean;
  isRefreshing: boolean;
  refreshing: boolean;
  isError: boolean;
  error: Error | null;
  refreshError: Error | null;
  clearRefreshError: () => void;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useHomeStays(category: CategoryFilter): UseHomeStaysResult {
  const cached = memoryCache.get(category);
  const [loaded, setLoaded] = useState<{ key: CategoryFilter; data: Property[] } | null>(
    cached ? { key: category, data: cached } : null
  );
  const [shown, setShown] = useState<Property[]>(cached ?? []);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshError, setRefreshError] = useState<Error | null>(null);

  // Synchronize during render when category changes if cached
  const [prevCategory, setPrevCategory] = useState(category);
  if (category !== prevCategory) {
    setPrevCategory(category);
    const entry = memoryCache.get(category);
    if (entry) {
      setShown(entry);
    }
  }

  const stays = useMemo(() => {
    if (loaded?.key === category) {
      return loaded.data;
    }
    const fromCache = memoryCache.get(category);
    if (fromCache) {
      return fromCache;
    }
    return shown;
  }, [category, loaded, shown]);

  useEffect(() => {
    let cancelled = false;

    if (!memoryCache.has(category)) {
      sanityQuery<Property[]>(HOME_STAYS_QUERY, { type: category })
        .then((results) => {
          if (cancelled) return;
          posthogLog.info("home_stays_loaded", {
            category,
            listing_count: results.length,
          });
          memoryCache.set(category, results);
          setLoaded({ key: category, data: results });
          setShown(results);
          setIsError(false);
          setError(null);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          const fetchErr = err instanceof Error ? err : new Error(String(err));
          console.warn("[useHomeStays] Sanity query error:", err);
          setIsError(true);
          setError(fetchErr);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [category]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshError(null);
    try {
      const results = await sanityQuery<Property[]>(HOME_STAYS_QUERY, {
        type: category,
      });
      memoryCache.set(category, results);
      setLoaded({ key: category, data: results });
      setShown(results);
      setRefreshing(false);
      posthog?.capture("stays_refreshed", { screen: "home" });
    } catch (err: unknown) {
      const fetchErr = err instanceof Error ? err : new Error(String(err));
      setRefreshing(false);
      setRefreshError(fetchErr);
    }
  }, [category]);

  const refetch = useCallback(async () => {
    memoryCache.delete(category);
    try {
      const results = await sanityQuery<Property[]>(HOME_STAYS_QUERY, {
        type: category,
      });
      memoryCache.set(category, results);
      setLoaded({ key: category, data: results });
      setShown(results);
      setIsError(false);
      setError(null);
    } catch (err: unknown) {
      const fetchErr = err instanceof Error ? err : new Error(String(err));
      setIsError(true);
      setError(fetchErr);
    }
  }, [category]);

  const clearRefreshError = useCallback(() => {
    setRefreshError(null);
  }, []);

  const isFetching = !memoryCache.has(category) && loaded?.key !== category;
  const isLoading = isFetching && stays.length === 0;

  return {
    stays,
    isLoading,
    isFetching,
    isRefreshing: refreshing,
    refreshing,
    isError,
    error,
    refreshError,
    clearRefreshError,
    refetch,
    refresh,
  };
}
