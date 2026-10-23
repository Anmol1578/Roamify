import { createHash } from 'crypto'
import { getCliClient } from 'sanity/cli'
import {
  GeneratedCopy,
  StaySource,
  runDeterministicCopyChecks,
} from './copy-checks'

const client = getCliClient({ apiVersion: 'vX' })

function computeSourceHash(source: StaySource): string {
  const normalized = {
    title: source.title,
    type: source.type,
    city: source.city,
    region: source.region,
    bedrooms: source.bedrooms,
    beds: source.beds,
    baths: source.baths,
    maxGuests: source.maxGuests,
    pricePerNight: source.pricePerNight,
    petsAllowed: source.petsAllowed,
    amenities: [...(source.amenities || [])].sort(),
    facts: source.facts || [],
    vibes: source.vibes || [],
  }
  return createHash('sha256').update(JSON.stringify(normalized)).digest('hex')
}

interface PromptGenerateResponse {
  summary?: string
  description?: string
  highlights?: string[]
}

interface PromptAuditResponse {
  unsupported?: Array<{ claim: string; reason: string }>
}

async function generateStayCopy(
  source: StaySource,
  extraFeedback?: string
): Promise<GeneratedCopy> {
  const instruction = `You are Roamify's professional stay copywriter.
Generate concise, evocative, and strictly factual rental listing copy based EXCLUSIVELY on the provided stay facts and specs.

Return a JSON object with:
- "summary": A one-line summary under 90 characters. Must be a clean, appealing single sentence.
- "description": 3 to 5 clear sentences describing the stay's layout, setting, and key factual features.
- "highlights": An array of 3 to 4 concise bullet points (each 3 to 8 words long).

STRICT COMPLIANCE RULES:
1. Use ONLY the facts, vibes, and typed specs in $stay. NEVER invent or extrapolate unstated amenities, distances, views, numbers, or nearby points of interest.
2. Every number in your text must match a number from the specs (bedrooms, beds, baths, guests, price, nights) or facts. Do not invent any numbers.
3. If petsAllowed is false, do not mention pets or dogs anywhere.
4. Keep the summary under 90 characters.
${extraFeedback ? `\nCRITICAL FIXES REQUIRED FROM PREVIOUS REJECTION:\n${extraFeedback}` : ''}`

  const response = (await client.agent.action.prompt({
    instruction,
    instructionParams: {
      stay: JSON.stringify(source, null, 2),
    },
    format: 'json',
  })) as PromptGenerateResponse

  const summary = (response.summary || '').trim()
  const description = (response.description || '').trim()
  const highlights = (response.highlights || []).map((h) => h.trim()).filter(Boolean)

  return { summary, description, highlights }
}

async function verifyCopyClaims(
  source: StaySource,
  copy: GeneratedCopy
): Promise<Array<{ claim: string; reason: string }>> {
  const instruction = `You are an uncompromising content compliance auditor.
Audit the generated copy $copy against the source facts $source.
List any claim, number, amenity, feature, or location assertion in $copy that is NOT explicitly supported by $source.

Output your audit strictly as a JSON object:
If all claims in the copy are strictly supported by the source facts, return {"unsupported": []}.
Otherwise return {"unsupported": [{"claim": "the unsupported claim", "reason": "why it is not in the source"}]}.`

  try {
    const response = (await client.agent.action.prompt({
      instruction,
      instructionParams: {
        source: JSON.stringify(source, null, 2),
        copy: JSON.stringify(copy, null, 2),
      },
      format: 'json',
    })) as PromptAuditResponse

    return Array.isArray(response.unsupported) ? response.unsupported : []
  } catch (err: any) {
    console.warn('  [Prompt audit error]:', err?.message || err)
    return [{ claim: 'audit_execution', reason: `Audit execution failed: ${err?.message || err}` }]
  }
}

async function processStayCopy(
  stayDoc: any,
  options: { force?: boolean; dryRun?: boolean } = {}
) {
  const source: StaySource = {
    title: stayDoc.title,
    type: stayDoc.type,
    city: stayDoc.city || stayDoc.location?.city || '',
    region: stayDoc.region || stayDoc.location?.region || '',
    country: stayDoc.country || stayDoc.location?.country || '',
    neighborhood: stayDoc.neighborhood || stayDoc.location?.neighborhood || '',
    bedrooms: stayDoc.bedrooms,
    beds: stayDoc.beds,
    baths: stayDoc.baths ?? stayDoc.bathrooms ?? 1,
    maxGuests: stayDoc.maxGuests,
    pricePerNight: stayDoc.pricePerNight,
    minNights: stayDoc.minNights || 1,
    petsAllowed: !!(stayDoc.petsAllowed ?? stayDoc.houseRules?.petsAllowed),
    amenities: stayDoc.amenities || [],
    facts: stayDoc.facts || [],
    vibes: stayDoc.vibes || [],
  }

  const sourceHash = computeSourceHash(source)
  const existingReview = stayDoc.copyReview

  if (
    !options.force &&
    existingReview?.status === 'passed' &&
    existingReview?.sourceHash === sourceHash &&
    stayDoc.summary &&
    stayDoc.description
  ) {
    return {
      slug: stayDoc.slug,
      status: 'skipped (already passed)',
      attempts: 0,
      summary: stayDoc.summary,
      unsupported: [],
    }
  }

  let attempts = 0
  let finalCopy: GeneratedCopy | null = null
  let finalFailures: Array<{ claim: string; reason: string }> = []
  let extraFeedback = ''

  while (attempts < 3) {
    attempts++
    console.log(`  -> Generating copy (attempt ${attempts}/3)...`)
    const copy = await generateStayCopy(source, extraFeedback)

    // Layer 1: Code check
    const codeFailures = runDeterministicCopyChecks(source, copy)
    if (codeFailures.length > 0) {
      console.log(`     Layer 1 code check flagged ${codeFailures.length} issue(s):`)
      codeFailures.forEach((f) => console.log(`       - [${f.rule}] ${f.detail}`))
      extraFeedback = codeFailures.map((f) => `- ${f.detail}`).join('\n')
      finalFailures = codeFailures.map((f) => ({ claim: f.rule, reason: f.detail }))
      continue
    }

    // Layer 2: Prompt check
    console.log(`  -> Running Layer 2 AI claim verification...`)
    const auditUnsupported = await verifyCopyClaims(source, copy)
    if (auditUnsupported.length > 0) {
      console.log(`     Layer 2 audit flagged ${auditUnsupported.length} unsupported claim(s):`)
      auditUnsupported.forEach((u) => console.log(`       - "${u.claim}": ${u.reason}`))
      extraFeedback = auditUnsupported.map((u) => `- Claim "${u.claim}" was rejected: ${u.reason}`).join('\n')
      finalFailures = auditUnsupported
      continue
    }

    // Both passed!
    finalCopy = copy
    finalFailures = []
    break
  }

  const passed = finalCopy !== null && finalFailures.length === 0
  const reviewDoc = {
    status: passed ? 'passed' : 'failed',
    checkedAt: new Date().toISOString(),
    sourceHash,
    unsupportedClaims: finalFailures,
  }

  if (passed && finalCopy) {
    if (!options.dryRun) {
      await client
        .patch(stayDoc._id)
        .set({
          summary: finalCopy.summary,
          description: finalCopy.description,
          highlights: finalCopy.highlights,
          copyReview: reviewDoc,
        })
        .commit()
    }
    return {
      slug: stayDoc.slug,
      status: 'passed',
      attempts,
      summary: finalCopy.summary,
      unsupported: [],
    }
  } else {
    if (!options.dryRun) {
      await client
        .patch(stayDoc._id)
        .set({
          copyReview: reviewDoc,
        })
        .commit()
    }
    return {
      slug: stayDoc.slug,
      status: 'failed',
      attempts,
      summary: finalCopy?.summary || '',
      unsupported: finalFailures,
    }
  }
}

async function main() {
  const args = process.argv.slice(2)
  const slugArgIdx = args.indexOf('--slug')
  const targetSlug = slugArgIdx !== -1 ? args[slugArgIdx + 1] : null
  const force = args.includes('--force')
  const dryRun = args.includes('--dry-run')

  console.log('=====================================================')
  console.log(' Roamify Sanity Agent Actions Copy Generator & Audit ')
  console.log('=====================================================')
  if (targetSlug) console.log(`Targeting single stay: ${targetSlug}`)
  if (force) console.log('Mode: --force (re-generating all regardless of cache)')
  if (dryRun) console.log('Mode: --dry-run (no database writes)')

  const query = `*[_type == "property" && defined(slug.current) ${
    targetSlug ? '&& slug.current == $slug' : ''
  }] | order(title asc){
    _id,
    title,
    "slug": slug.current,
    type,
    city,
    region,
    country,
    neighborhood,
    location,
    bedrooms,
    beds,
    baths,
    bathrooms,
    maxGuests,
    pricePerNight,
    minNights,
    petsAllowed,
    houseRules,
    amenities,
    facts,
    vibes,
    summary,
    description,
    highlights,
    copyReview
  }`

  const stays = await client.fetch(query, targetSlug ? { slug: targetSlug } : {})
  console.log(`\nFound ${stays.length} stay(s) to process.\n`)

  const results: any[] = []

  for (let i = 0; i < stays.length; i++) {
    const stay = stays[i]
    console.log(`[${i + 1}/${stays.length}] Processing stay: "${stay.title}" (${stay.slug})`)
    const res = await processStayCopy(stay, { force, dryRun })
    results.push(res)
    console.log(`  => Status: ${res.status.toUpperCase()} (${res.attempts} attempt(s))\n`)
  }

  console.log('\n=====================================================')
  console.log(' COPY GENERATION & FACT-CHECK AUDIT SUMMARY ')
  console.log('=====================================================')
  console.table(
    results.map((r) => ({
      Slug: r.slug,
      Status: r.status,
      Attempts: r.attempts,
      Summary: r.summary.slice(0, 50) + (r.summary.length > 50 ? '...' : ''),
      Unsupported: r.unsupported.length,
    }))
  )

  const passedCount = results.filter((r) => r.status === 'passed').length
  const failedCount = results.filter((r) => r.status === 'failed').length
  const skippedCount = results.filter((r) => r.status.includes('skipped')).length
  console.log(`\nPassed: ${passedCount} | Failed: ${failedCount} | Skipped: ${skippedCount}\n`)

  if (failedCount > 0) {
    console.error('Some stays failed the strict fact-checking audit!')
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Fatal error in copy script:', err)
  process.exit(1)
})
