import { useState, useEffect, useCallback, useMemo } from 'react'
import { Property, properties as fallbackProperties } from '@/data/properties'
import { CategoryFilter } from '@/components/home/category-chips'
import { sanityQuery } from '@/lib/sanity/fetch'
import { HOME_STAYS_QUERY } from '@/lib/sanity/queries'
import { posthogLog } from '@/lib/posthog'

const memoryCache = new Map<CategoryFilter, Property[]>()

export interface UseHomeStaysResult {
  stays: Property[]
  isLoading: boolean
  isFetching: boolean
  isRefreshing: boolean
  isError: boolean
  error: Error | null
  refetch: () => Promise<void>
  refresh: () => Promise<void>
}

export function useHomeStays(category: CategoryFilter): UseHomeStaysResult {
  const cached = memoryCache.get(category)
  const [liveData, setLiveData] = useState<{ category: CategoryFilter; stays: Property[] } | null>(null)
  const [fetchCounter, setFetchCounter] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(!cached)
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  // Derive active stays during render
  const stays = useMemo(() => {
    if (liveData?.category === category) {
      return liveData.stays
    }
    if (cached) {
      return cached
    }
    // Fallback if network had failed previously
    if (isError) {
      return category === 'all'
        ? fallbackProperties
        : fallbackProperties.filter((p) => p.type === category)
    }
    return []
  }, [category, cached, liveData, isError])

  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()

    // If already cached and not forced refetch, do nothing
    if (memoryCache.has(category) && fetchCounter === 0) {
      return
    }

    const runFetch = async () => {
      setIsFetching(true)
      if (!memoryCache.has(category)) {
        setIsLoading(true)
      }
      setIsError(false)
      setError(null)

      try {
        const results = await sanityQuery<Property[]>(
          HOME_STAYS_QUERY,
          { type: category },
          abortController.signal
        )

        if (isMounted) {
          posthogLog.info('home_stays_loaded', {
            category,
            listing_count: results.length,
          })
          memoryCache.set(category, results)
          setLiveData({ category, stays: results })
          setIsLoading(false)
          setIsFetching(false)
          setIsRefreshing(false)
        }
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') {
          return
        }

        if (isMounted) {
          posthogLog.warn('home_stays_fallback_activated', { category })
          console.warn('[useHomeStays] Sanity query error, falling back:', err)
          setIsError(true)
          setError(err instanceof Error ? err : new Error(String(err)))
          setIsLoading(false)
          setIsFetching(false)
          setIsRefreshing(false)
        }
      }
    }

    void runFetch()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [category, fetchCounter])

  const refetch = useCallback(async () => {
    setFetchCounter((c) => c + 1)
  }, [])

  const refresh = useCallback(async () => {
    memoryCache.delete(category)
    setIsRefreshing(true)
    setFetchCounter((c) => c + 1)
  }, [category])

  return {
    stays,
    isLoading: isLoading && stays.length === 0,
    isFetching,
    isRefreshing,
    isError,
    error,
    refetch,
    refresh,
  }
}
