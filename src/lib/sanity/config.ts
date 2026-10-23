export const SANITY_PROJECT_ID =
  process.env.EXPO_PUBLIC_SANITY_PROJECT_ID || 'ird6lvzh'

export const SANITY_DATASET =
  process.env.EXPO_PUBLIC_SANITY_DATASET || 'production'

export const SANITY_API_VERSION = '2025-08-15'

export const SANITY_CDN_URL = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`
