import { sanityQuery } from "../sanity/fetch";
import { PLACES_QUERY } from "../sanity/queries";
import { KNOWN_PLACES } from "../search/parse";

interface PlaceRecord {
  city?: string;
  region?: string;
  country?: string;
  neighborhood?: string;
}

let cachedPlaces: Record<string, string> | null = null;
let lastFetchedAt = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function knownPlaces(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedPlaces && now - lastFetchedAt < CACHE_TTL_MS) {
    return cachedPlaces;
  }

  const places: Record<string, string> = { ...KNOWN_PLACES };

  try {
    const records = await sanityQuery<PlaceRecord[]>(PLACES_QUERY);
    if (records && Array.isArray(records)) {
      for (const rec of records) {
        if (rec.city) {
          places[rec.city.toLowerCase()] = rec.city;
        }
        if (rec.region) {
          places[rec.region.toLowerCase()] = rec.region;
        }
        if (rec.country) {
          places[rec.country.toLowerCase()] = rec.country;
        }
        if (rec.neighborhood) {
          places[rec.neighborhood.toLowerCase()] = rec.neighborhood;
        }
      }
    }
    cachedPlaces = places;
    lastFetchedAt = now;
  } catch (err) {
    console.warn("Failed to fetch dynamic places from Sanity CDN, using base set:", err);
    return KNOWN_PLACES;
  }

  return places;
}
