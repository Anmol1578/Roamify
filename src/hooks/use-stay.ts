import { useState, useEffect, useMemo, useCallback } from "react";
import { Property } from "@/lib/stays";
import { sanityQuery } from "@/lib/sanity/fetch";
import { STAY_QUERY } from "@/lib/sanity/queries";

const stayCache = new Map<string, Property>();

export interface UseStayResult {
  stay: Property | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useStay(slug: string | undefined): UseStayResult {
  const cached = slug ? stayCache.get(slug) : undefined;
  const [liveData, setLiveData] = useState<{ slug: string; stay: Property | null } | null>(null);
  const [trigger, setTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(!cached && !!slug);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const stay = useMemo(() => {
    if (slug && liveData?.slug === slug) {
      return liveData.stay;
    }
    return cached ?? null;
  }, [slug, cached, liveData]);

  useEffect(() => {
    if (!slug) {
      return;
    }

    if (stayCache.has(slug) && trigger === 0) {
      return;
    }

    let isCurrent = true;

    const runFetch = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const data = await sanityQuery<Property>(STAY_QUERY, { slug });
        if (!isCurrent) return;
        if (data) {
          stayCache.set(slug, data);
          setLiveData({ slug, stay: data });
        } else {
          setLiveData({ slug, stay: null });
        }
        setIsLoading(false);
      } catch (err: unknown) {
        if (!isCurrent) return;
        setIsError(true);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    runFetch();

    return () => {
      isCurrent = false;
    };
  }, [slug, trigger]);

  const refetch = useCallback(() => {
    if (slug) {
      stayCache.delete(slug);
    }
    setTrigger((t) => t + 1);
  }, [slug]);

  return {
    stay,
    isLoading: isLoading && !cached,
    isError,
    error,
    refetch,
  };
}
