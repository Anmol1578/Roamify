import { SEED_PROPERTIES } from './seed-data'

console.log('--- Roamify Photo Duplication Check ---')
console.log('Total properties:', SEED_PROPERTIES.length)

const photoMap = new Map<string, string[]>()
let totalPhotos = 0

SEED_PROPERTIES.forEach((p) => {
  const allUrls = [
    { url: p.mainImageUrl, type: 'cover' },
    ...(p.galleryUrls || []).map((g) => ({ url: g.url, type: 'gallery' })),
  ]
  totalPhotos += allUrls.length

  allUrls.forEach((item) => {
    const match = item.url.match(/photo-([a-zA-Z0-9_-]+)/)
    const id = match ? match[1] : item.url
    if (!photoMap.has(id)) {
      photoMap.set(id, [])
    }
    photoMap.get(id)!.push(`${p.title} (${item.type})`)
  })
})

console.log('Total photo slots across all properties:', totalPhotos)
console.log('Unique photos across all properties:', photoMap.size)

let duplicatesFound = 0
for (const [id, usages] of photoMap.entries()) {
  if (usages.length > 1) {
    duplicatesFound++
    console.error(`❌ Duplicate [${id}] used in:`, usages)
  }
}

if (duplicatesFound === 0) {
  console.log('✅ Success: 0 duplicate images found across all properties and galleries!')
} else {
  console.error(`❌ Found ${duplicatesFound} duplicate photo set(s).`)
  process.exit(1)
}
