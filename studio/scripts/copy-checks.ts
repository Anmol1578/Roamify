export interface GeneratedCopy {
  summary: string
  description: string
  highlights: string[]
}

export interface StaySource {
  title: string
  type: string
  city: string
  region?: string
  country: string
  neighborhood?: string
  bedrooms: number
  beds: number
  baths: number
  maxGuests: number
  pricePerNight: number
  minNights: number
  petsAllowed: boolean
  amenities: string[]
  facts: string[]
  vibes: string[]
}

export interface CheckFailure {
  rule: string
  detail: string
}

export function runDeterministicCopyChecks(
  source: StaySource,
  copy: GeneratedCopy
): CheckFailure[] {
  const failures: CheckFailure[] = []
  const fullCopyText = [copy.summary, copy.description, ...copy.highlights].join(' ')

  // 1. Length checks
  if (copy.summary.length > 90) {
    failures.push({
      rule: 'summary_length',
      detail: `Summary exceeds 90 characters (got ${copy.summary.length}): "${copy.summary}"`,
    })
  }

  if (copy.highlights.length > 4) {
    failures.push({
      rule: 'highlights_count',
      detail: `Highlights array exceeds 4 items (got ${copy.highlights.length})`,
    })
  }
  if (copy.highlights.length < 2) {
    failures.push({
      rule: 'highlights_count',
      detail: `Highlights array has fewer than 2 items (got ${copy.highlights.length})`,
    })
  }

  // Count sentences in description (period, exclamation, or question mark followed by space or end)
  const sentences = copy.description
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  if (sentences.length < 2 || sentences.length > 6) {
    failures.push({
      rule: 'description_sentences',
      detail: `Description should have 3-5 sentences (got ${sentences.length})`,
    })
  }

  // 2. Numbers check: every number in copy must come from source fields or facts
  const allowedNumbers = new Set<string>()
  const addNum = (val: number | undefined) => {
    if (val !== undefined && val !== null) {
      allowedNumbers.add(String(val))
      if (Number.isInteger(val)) {
        allowedNumbers.add(String(val))
      } else {
        allowedNumbers.add(String(val))
        allowedNumbers.add(val.toFixed(1))
      }
    }
  }

  addNum(source.bedrooms)
  addNum(source.beds)
  addNum(source.baths)
  addNum(source.maxGuests)
  addNum(source.pricePerNight)
  addNum(source.minNights)

  // Extract all numbers from facts
  const sourceFactsText = (source.facts || []).join(' ')
  const factNumbers = sourceFactsText.match(/\b\d+(\.\d+)?\b/g) || []
  factNumbers.forEach((n) => allowedNumbers.add(n))

  // Find numbers in copy
  const copyNumbers = fullCopyText.match(/\b\d+(\.\d+)?\b/g) || []
  for (const num of copyNumbers) {
    if (!allowedNumbers.has(num)) {
      failures.push({
        rule: 'invented_number',
        detail: `Copy mentions number "${num}" which is not in stay facts or specs`,
      })
    }
  }

  // 3. Pets check
  const copyMentionsPets = /\b(pets?|dogs?|cats?|pet-friendly)\b/i.test(fullCopyText)
  if (copyMentionsPets && !source.petsAllowed) {
    failures.push({
      rule: 'invented_pets',
      detail: `Copy mentions pets or dogs, but petsAllowed is false for this stay`,
    })
  }

  // 4. Standout amenities / features check
  const sourceAmenitiesNormalized = (source.amenities || []).map((a) =>
    a.toLowerCase().replace(/[-_]/g, '')
  )
  const factsNormalized = sourceFactsText.toLowerCase()

  const hasFeature = (keyKeywords: string[], amenityTokens: string[]) => {
    // Check if mentioned in copy
    const copyHasIt = keyKeywords.some((kw) =>
      new RegExp(`\\b${kw}\\b`, 'i').test(fullCopyText)
    )
    if (!copyHasIt) return true

    // If mentioned in copy, must be in amenities or facts
    const inAmenities = amenityTokens.some((tok) =>
      sourceAmenitiesNormalized.includes(tok.toLowerCase().replace(/[-_]/g, ''))
    )
    const inFacts = keyKeywords.some((kw) => factsNormalized.includes(kw.toLowerCase()))

    return inAmenities || inFacts
  }

  const guardedFeatures: Array<{ keywords: string[]; tokens: string[]; name: string }> = [
    { keywords: ['hot tub', 'soaking tub', 'jacuzzi', 'spa'], tokens: ['hotTub', 'hottub'], name: 'hot tub' },
    { keywords: ['pool', 'swimming pool', 'lap pool'], tokens: ['pool'], name: 'pool' },
    { keywords: ['sauna', 'steam room'], tokens: ['sauna'], name: 'sauna' },
    { keywords: ['fireplace', 'wood stove', 'wood-burning stove'], tokens: ['fireplace', 'woodstove'], name: 'fireplace' },
    { keywords: ['fire pit', 'firepit'], tokens: ['firePit', 'firepit'], name: 'fire pit' },
    { keywords: ['ocean view', 'oceanfront', 'sea view'], tokens: ['oceanView', 'oceanview'], name: 'ocean view' },
    { keywords: ['mountain view'], tokens: ['mountainView', 'mountainview'], name: 'mountain view' },
    { keywords: ['lake view'], tokens: ['lakeView', 'lakeview'], name: 'lake view' },
    { keywords: ['ev charger', 'electric vehicle charging'], tokens: ['evCharger', 'evcharger'], name: 'ev charger' },
    { keywords: ['gym', 'fitness center'], tokens: ['gym'], name: 'gym' },
    { keywords: ['private beach', 'beach access'], tokens: ['privateBeach', 'beachAccess'], name: 'beach access' },
  ]

  for (const feat of guardedFeatures) {
    if (!hasFeature(feat.keywords, feat.tokens)) {
      failures.push({
        rule: 'invented_amenity',
        detail: `Copy mentions "${feat.name}" which is not in stay amenities or facts`,
      })
    }
  }

  return failures
}
