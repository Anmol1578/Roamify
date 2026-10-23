import { PropertyType } from "../../data/properties";

export interface ParsedQuery {
  raw: string;
  maxPrice?: number;
  guests?: number;
  type?: PropertyType;
  amenities: string[];
  pets?: boolean;
  terms: string[];
  appliedFilters: string[];
}

const KNOWN_AMENITIES = [
  "hot tub",
  "fire pit",
  "fireplace",
  "wood stove",
  "sauna",
  "pool",
  "private beach",
  "ocean view",
  "mountain view",
  "skyline view",
  "bay view",
  "wifi",
  "kitchen",
  "workspace",
  "gym",
  "balcony",
  "deck",
  "patio",
  "ac",
];

const KNOWN_TYPES: Record<string, PropertyType> = {
  cabin: "cabin",
  cabins: "cabin",
  lodge: "cabin",
  beach: "beach",
  ocean: "beach",
  coastal: "beach",
  villa: "villa",
  villas: "villa",
  estate: "villa",
  city: "city",
  loft: "city",
  apartment: "city",
  penthouse: "city",
  studio: "city",
};

const STOP_WORDS = new Set([
  "a", "an", "the", "in", "on", "at", "with", "and", "or", "for", "to", "of",
  "under", "below", "night", "per", "stay", "stays", "place", "places", "home", "homes",
]);

export function parseQuery(rawText: string): ParsedQuery {
  const text = rawText.trim().toLowerCase();
  if (!text) {
    return {
      raw: rawText,
      amenities: [],
      terms: [],
      appliedFilters: [],
    };
  }

  let working = text;
  const appliedFilters: string[] = [];

  // 1. Max price ("under $300", "below 250", "$300 a night", "under 300")
  let maxPrice: number | undefined;
  const priceMatches = [
    /(?:under|below|less than|max)\s+\$?(\d+)/i,
    /\$(\d+)\s*(?:a\s+night|per\s+night|\/night)/i,
  ];

  for (const regex of priceMatches) {
    const match = working.match(regex);
    if (match) {
      maxPrice = parseInt(match[1], 10);
      appliedFilters.push(`Under $${maxPrice}`);
      working = working.replace(match[0], " ");
      break;
    }
  }

  // 2. Guests ("for 4", "4 guests", "sleeps 6")
  let guests: number | undefined;
  const guestMatches = [
    /(?:for|sleeps|accommodates)\s+(\d+)(?:\s+(?:guests|people|adults))?/i,
    /(\d+)\s*(?:guests|people|adults)/i,
  ];

  for (const regex of guestMatches) {
    const match = working.match(regex);
    if (match) {
      guests = parseInt(match[1], 10);
      appliedFilters.push(`${guests}+ guests`);
      working = working.replace(match[0], " ");
      break;
    }
  }

  // 3. Pets ("pet friendly", "pets allowed", "dog", "dogs", "pets")
  let pets: boolean | undefined;
  const petRegex = /\b(?:pet[ -]friendly|pets allowed|pets|dog|dogs)\b/i;
  if (petRegex.test(working)) {
    pets = true;
    appliedFilters.push("Pet friendly");
    working = working.replace(petRegex, " ");
  }

  // 4. Property Type
  let propertyType: PropertyType | undefined;
  for (const [token, mappedType] of Object.entries(KNOWN_TYPES)) {
    const typeRegex = new RegExp(`\\b${token}\\b`, "i");
    if (typeRegex.test(working)) {
      propertyType = mappedType;
      const label = mappedType.charAt(0).toUpperCase() + mappedType.slice(1);
      appliedFilters.push(label);
      working = working.replace(typeRegex, " ");
      break;
    }
  }

  // 5. Amenities
  const foundAmenities: string[] = [];
  for (const amenity of KNOWN_AMENITIES) {
    const pattern = amenity.replace(/\s+/g, "[ -]");
    const amenityRegex = new RegExp(`\\b${pattern}\\b`, "i");
    if (amenityRegex.test(working)) {
      foundAmenities.push(amenity);
      appliedFilters.push(
        amenity
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      );
      working = working.replace(amenityRegex, " ");
    }
  }

  // 6. Remaining words -> soft terms (e.g. "quiet", "cozy", "secluded", "scenic")
  const rawWords = working
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));

  return {
    raw: rawText,
    maxPrice,
    guests,
    type: propertyType,
    amenities: foundAmenities,
    pets,
    terms: rawWords,
    appliedFilters,
  };
}
