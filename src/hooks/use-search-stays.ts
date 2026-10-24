import { useState, useEffect, useMemo, useCallback } from "react";
import { Property } from "@/lib/stays";
import { sanityQuery } from "@/lib/sanity/fetch";
import { parseQuery, ParsedQuery } from "@/lib/search/parse";
import { buildSearchQuery, SortOption } from "@/lib/search/query";
import { posthog } from "@/lib/posthog";

const searchCache = new Map<string, Property[]>();

export interface UseSearchStaysResult {
  stays: Property[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  parsed: ParsedQuery;
  refetch: () => void;
}

export function useSearchStays(
  queryText: string,
  activeFilterChips: Set<string>,
  sortOption: SortOption
): UseSearchStaysResult {
  const [liveData, setLiveData] = useState<{ key: string; stays: Property[] } | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Compute parsed query combining input text and manual filter chips
  const parsed = useMemo<ParsedQuery>(() => {
    const baseParsed = parseQuery(queryText);
    if (activeFilterChips.has("cabin")) baseParsed.type = "cabin";
    if (activeFilterChips.has("beach")) baseParsed.type = "beach";
    if (activeFilterChips.has("villa")) baseParsed.type = "villa";
    if (activeFilterChips.has("city")) baseParsed.type = "city";

    if (activeFilterChips.has("under-300")) {
      baseParsed.maxPrice = 300;
      if (!baseParsed.appliedFilters.includes("Under $300")) {
        baseParsed.appliedFilters.push("Under $300");
      }
    }

    if (activeFilterChips.has("pet-friendly")) {
      baseParsed.pets = true;
      if (!baseParsed.appliedFilters.includes("Pet friendly")) {
        baseParsed.appliedFilters.push("Pet friendly");
      }
    }

    if (activeFilterChips.has("hot-tub")) {
      if (!baseParsed.amenities.includes("hot-tub") && !baseParsed.amenities.includes("hot tub")) {
        baseParsed.amenities.push("hot tub");
      }
    }

    if (activeFilterChips.has("pool")) {
      if (!baseParsed.amenities.includes("pool")) {
        baseParsed.amenities.push("pool");
      }
    }

    return baseParsed;
  }, [queryText, activeFilterChips]);

  const chipsKey = useMemo(
    () => Array.from(activeFilterChips).sort().join(","),
    [activeFilterChips]
  );
  const cacheKey = `${queryText.trim().toLowerCase()}|${chipsKey}|${sortOption}`;
  const cached = searchCache.get(cacheKey);

  const [isLoading, setIsLoading] = useState<boolean>(!cached);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const stays = useMemo(() => {
    if (liveData?.key === cacheKey) {
      return liveData.stays;
    }
    return cached ?? [];
  }, [cacheKey, cached, liveData]);

  useEffect(() => {
    if (searchCache.has(cacheKey) && fetchTrigger === 0) {
      return;
    }

    let isCurrent = true;
    const abortController = new AbortController();

    const runFetch = async () => {
      setIsLoading(true);
      setIsError(false);

      const { query, params } = buildSearchQuery(parsed, sortOption);

      try {
        const results = await sanityQuery<Property[]>(query, params, abortController.signal);
        if (!isCurrent) return;
        const validResults = results || [];
        searchCache.set(cacheKey, validResults);
        setLiveData({ key: cacheKey, stays: validResults });
        setIsLoading(false);

        // Track in PostHog
        if (validResults.length === 0) {
          posthog?.capture("search_empty", {
            query: queryText,
            filters: Array.from(activeFilterChips),
            sort_option: sortOption,
          });
        } else {
          posthog?.capture("search_results_returned", {
            query: queryText,
            results_count: validResults.length,
            sort_option: sortOption,
          });
        }
      } catch (err: unknown) {
        if (!isCurrent) return;
        const e = err as Error;
        if (e.name === "AbortError") return;
        setIsError(true);
        setError(e);
        setIsLoading(false);
      }
    };

    runFetch();

    return () => {
      isCurrent = false;
      abortController.abort();
    };
  }, [cacheKey, fetchTrigger, parsed, sortOption, queryText, activeFilterChips]);

  const refetch = useCallback(() => {
    searchCache.delete(cacheKey);
    setFetchTrigger((t) => t + 1);
  }, [cacheKey]);

  return {
    stays,
    isLoading: isLoading && !cached,
    isError,
    error,
    parsed,
    refetch,
  };
}
