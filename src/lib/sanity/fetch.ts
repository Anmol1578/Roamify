import { SANITY_CDN_URL } from './config'

export interface SanityResponse<T> {
  query: string
  result: T
  syncTags?: string[]
  ms?: number
}

export async function sanityQuery<T>(
  query: string,
  params?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<T> {
  const url = new URL(SANITY_CDN_URL)
  url.searchParams.set('query', query)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(`$${key}`, JSON.stringify(value))
    }
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(
      `Sanity query failed (${response.status} ${response.statusText}): ${errorText}`
    )
  }

  const json = (await response.json()) as SanityResponse<T>
  return json.result
}
