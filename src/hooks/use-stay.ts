import { useState, useEffect, useMemo, useCallback } from "react";
import { Property } from "@/lib/stays";
import { sanityQuery } from "@/lib/sanity/fetch";
import { STAY_QUERY } from "@/lib/sanity/queries";
import { posthog } from "@/lib/posthog";

const stayCache = new Map<string, Property>();

export interface UseStayResult {
  stay: Property | null;
  isLoading: boolean;
  refreshing: boolean;
  isError: boolean;
  error: Error | null;
  refreshError: Error | null;
  clearRefreshError: () => void;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useStay(slug: string | undefined): UseStayResult {
  const cached = slug ? stayCache.get(slug) : undefined;
  const [loaded, setLoaded] = useState<{ slug: string; stay: Property | null } | null>(
    cached && slug ? { slug, stay: cached } : null
  );
  const [shown, setShown] = useState<Property | null>(cached ?? null);

  // Synchronize shown during render when slug changes if cached
  const [prevSlug, setPrevSlug] = useState(slug);
  if (slug !== prevSlug) {
    setPrevSlug(slug);
    if (slug) {
      const entry = stayCache.get(slug);
      if (entry) {
        setShown(entry);
      }
    }
  }

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshError, setRefreshError] = useState<Error | null>(null);

  const stay = useMemo(() => {
    if (slug && loaded?.slug === slug) {
      return loaded.stay;
    }
    if (slug && stayCache.has(slug)) {
      return stayCache.get(slug)!;
    }
    return shown;
  }, [slug, loaded, shown]);

  useEffect(() => {
    let cancelled = false;

    if (slug && !stayCache.has(slug)) {
      sanityQuery<Property>(STAY_QUERY, { slug })
        .then((data) => {
          if (cancelled) return;
          if (data) {
            stayCache.set(slug, data);
            setLoaded({ slug, stay: data });
            setShown(data);
          } else {
            setLoaded({ slug, stay: null });
          }
          setIsError(false);
          setError(null);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          const e = err instanceof Error ? err : new Error(String(err));
          setIsError(true);
          setError(e);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const refresh = useCallback(async () => {
    if (!slug) return;
    setRefreshing(true);
    setRefreshError(null);
    try {
      const data = await sanityQuery<Property>(STAY_QUERY, { slug });
      if (data) {
        stayCache.set(slug, data);
        setLoaded({ slug, stay: data });
        setShown(data);
      }
      setRefreshing(false);
      posthog?.capture("stays_refreshed", { screen: "stay" });
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      setRefreshing(false);
      setRefreshError(e);
    }
  }, [slug]);

  const refetch = useCallback(async () => {
    if (!slug) return;
    stayCache.delete(slug);
    try {
      const data = await sanityQuery<Property>(STAY_QUERY, { slug });
      if (data) {
        stayCache.set(slug, data);
        setLoaded({ slug, stay: data });
        setShown(data);
      } else {
        setLoaded({ slug, stay: null });
      }
      setIsError(false);
      setError(null);
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      setIsError(true);
      setError(e);
    }
  }, [slug]);

  const clearRefreshError = useCallback(() => {
    setRefreshError(null);
  }, []);

  const isFetching = Boolean(slug && !stayCache.has(slug) && loaded?.slug !== slug);
  const isLoading = isFetching && !stay;

  return {
    stay,
    isLoading,
    refreshing,
    isError,
    error,
    refreshError,
    clearRefreshError,
    refetch,
    refresh,
  };
}
