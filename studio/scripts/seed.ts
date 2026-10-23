import { createClient } from '@sanity/client'
import { getCliClient } from 'sanity/cli'
import { SEED_HOSTS, SEED_POLICIES, SEED_PROPERTIES } from './seed-data'

const client = typeof getCliClient === 'function'
  ? getCliClient({ apiVersion: '2024-01-01' })
  : createClient({
      projectId: 'ird6lvzh',
      dataset: 'production',
      apiVersion: '2024-01-01',
      useCdn: false,
      token: process.env.SANITY_AUTH_TOKEN || process.env.SANITY_WRITE_TOKEN,
    })

async function runSeed() {
  console.log('--- Starting Roamify Sanity Idempotent Seeding ---')

  // 1. Seed 10 Shared Hosts
  console.log(`\nSeeding ${SEED_HOSTS.length} shared hosts...`)
  for (const h of SEED_HOSTS) {
    const doc = {
      _id: h._id,
      _type: 'host',
      name: h.name,
      slug: { _type: 'slug', current: h.slug },
      avatar: {
        _type: 'image',
        url: h.avatarUrl,
        alt: `${h.name} avatar`,
      },
      isSuperhost: h.isSuperhost,
      bio: h.bio,
      joinedDate: h.joinedDate,
      responseRate: h.responseRate,
      responseTime: h.responseTime,
      languages: h.languages,
    }
    await client.createOrReplace(doc)
    console.log(`  ✓ Host: ${h.name} (${h._id})`)
  }

  // 2. Seed 10 Shared Policies
  console.log(`\nSeeding ${SEED_POLICIES.length} shared policies...`)
  for (const p of SEED_POLICIES) {
    const doc = {
      _id: p._id,
      _type: 'policy',
      title: p.title,
      slug: { _type: 'slug', current: p.slug },
      category: p.category,
      summary: p.summary,
      content: p.content,
    }
    await client.createOrReplace(doc)
    console.log(`  ✓ Policy: ${p.title} (${p._id})`)
  }

  // 3. Seed 30 Properties
  console.log(`\nSeeding ${SEED_PROPERTIES.length} properties...`)
  for (const prop of SEED_PROPERTIES) {
    const doc = {
      _id: prop._id,
      _type: 'property',
      title: prop.title,
      slug: { _type: 'slug', current: prop.slug },
      type: prop.type,
      featured: !!prop.featured,
      host: { _type: 'reference', _ref: prop.hostId },
      rating: prop.rating,
      reviewCount: prop.reviewCount,
      location: {
        city: prop.location.city,
        region: prop.location.region,
        regionName: prop.location.regionName,
        country: prop.location.country,
        neighborhood: prop.location.neighborhood,
        coordinates: {
          _type: 'geopoint',
          lat: prop.location.lat,
          lng: prop.location.lng,
        },
      },
      pricePerNight: prop.pricePerNight,
      cleaningFee: prop.cleaningFee,
      serviceFeePercent: prop.serviceFeePercent,
      minNights: prop.minNights,
      weeklyDiscountPercent: prop.weeklyDiscountPercent || 0,
      maxGuests: prop.maxGuests,
      bedrooms: prop.bedrooms,
      beds: prop.beds,
      baths: prop.baths,
      amenities: prop.amenities,
      facts: prop.facts,
      summary: prop.summary,
      description: prop.description,
      spaceOverview: prop.spaceOverview,
      neighborhood: prop.neighborhood,
      vibes: prop.vibes,
      mainImage: {
        _type: 'image',
        url: prop.mainImageUrl,
        alt: prop.title,
      },
      gallery: prop.galleryUrls.map((g, idx) => ({
        _type: 'image',
        _key: `gallery-${idx}`,
        url: g.url,
        caption: g.caption,
        alt: g.caption,
      })),
      petsAllowed: prop.petsAllowed,
      cancellationPolicy: { _type: 'reference', _ref: prop.cancellationPolicyId },
      houseRules: { _type: 'reference', _ref: prop.houseRulesPolicyId },
      additionalPolicies: (prop.additionalPolicyIds || []).map((id) => ({
        _type: 'reference',
        _ref: id,
        _key: id,
      })),
      houseRulesSpecs: {
        checkInTime: '15:00',
        checkOutTime: '11:00',
        quietHoursFrom: '22:00',
        quietHoursTo: '08:00',
        maxPets: prop.petsAllowed ? 2 : 0,
        petFee: prop.petsAllowed ? 50 : 0,
        smokingAllowed: false,
        partiesAllowed: false,
        additionalRules: ['No commercial photography without host approval'],
      },
    }
    await client.createOrReplace(doc)
    console.log(`  ✓ Property: ${prop.title} ($${prop.pricePerNight}/night)`)
  }

  console.log('\n--- Seeding completed successfully! ---')
}

runSeed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
