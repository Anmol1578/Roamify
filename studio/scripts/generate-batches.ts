import fs from 'fs'
import path from 'path'
import { SEED_PROPERTIES } from './seed-data'

function buildDocument(prop: typeof SEED_PROPERTIES[0]) {
  return {
    type: 'property',
    content: {
      _id: prop._id,
      title: prop.title,
      slug: { _type: 'slug', current: prop.slug },
      type: prop.type,
      pricePerNight: prop.pricePerNight,
      cleaningFee: prop.cleaningFee,
      serviceFeePercent: prop.serviceFeePercent,
      maxGuests: prop.maxGuests,
      bedrooms: prop.bedrooms,
      beds: prop.beds,
      baths: prop.baths,
      petsAllowed: prop.petsAllowed,
      amenities: prop.amenities,
      location: {
        city: prop.location.city,
        region: prop.location.region,
        regionName: prop.location.regionName,
        country: prop.location.country,
        coordinates: {
          _type: 'geopoint',
          lat: prop.location.lat,
          lng: prop.location.lng,
        },
      },
      description: prop.description,
      spaceOverview: prop.spaceOverview,
      neighborhood: prop.neighborhood,
      vibes: prop.vibes,
      host: { _type: 'reference', _ref: prop.hostId },
      cancellationPolicy: { _type: 'reference', _ref: prop.cancellationPolicyId },
      houseRules: { _type: 'reference', _ref: prop.houseRulesPolicyId },
      additionalPolicies: (prop.additionalPolicyIds || []).map((id) => ({
        _type: 'reference',
        _ref: id,
        _key: id,
      })),
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
      rating: prop.rating,
      reviewCount: prop.reviewCount,
      featured: !!prop.featured,
    },
  }
}

const batch1 = SEED_PROPERTIES.slice(0, 10).map(buildDocument)
const batch2 = SEED_PROPERTIES.slice(10, 20).map(buildDocument)
const batch3 = SEED_PROPERTIES.slice(20, 30).map(buildDocument)

const outDir = path.resolve(__dirname, '../../scratch/batches')
fs.mkdirSync(outDir, { recursive: true })

fs.writeFileSync(path.join(outDir, 'batch1.json'), JSON.stringify(batch1, null, 2))
fs.writeFileSync(path.join(outDir, 'batch2.json'), JSON.stringify(batch2, null, 2))
fs.writeFileSync(path.join(outDir, 'batch3.json'), JSON.stringify(batch3, null, 2))

console.log('Saved 3 batches of 10 properties to', outDir)
