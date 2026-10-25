import { Property, PropertyType, Amenity } from "../stays";
import { ParsedQuery } from "./parse";

export interface Weighted<T> {
  value: T;
  weight: number;
}

export type Vibe =
  | "quiet"
  | "cozy"
  | "secluded"
  | "romantic"
  | "peaceful"
  | "luxury"
  | "modern"
  | "rustic"
  | "scenic"
  | "walkable"
  | "urban"
  | "coastal"
  | "alpine"
  | "sunny"
  | "historic"
  | "family";

export const PROPERTY_TYPES = [
  { value: "cabin" as PropertyType, label: "Cabin", synonyms: "cabins, chalets, A-frames, lodges" },
  { value: "beach" as PropertyType, label: "Beach house", synonyms: "beachfront, seaside, coastal, bungalows" },
  { value: "city" as PropertyType, label: "City stay", synonyms: "apartments, lofts, studios, condos, urban" },
  { value: "villa" as PropertyType, label: "Villa", synonyms: "villas, estates, mansions" },
];

export const AMENITIES: { value: Amenity; title: string; synonyms: string[] }[] = [
  { value: "hotTub", title: "Hot tub", synonyms: ["hot tub", "hottub", "jacuzzi", "spa"] },
  { value: "pool", title: "Pool", synonyms: ["pool", "swimming pool"] },
  { value: "fireplace", title: "Fireplace", synonyms: ["fireplace", "wood stove", "hearth"] },
  { value: "firePit", title: "Fire pit", synonyms: ["fire pit", "firepit", "bonfire"] },
  { value: "sauna", title: "Sauna", synonyms: ["sauna", "steam room"] },
  { value: "wifi", title: "Wifi", synonyms: ["wifi", "wi-fi", "internet", "high speed internet"] },
  { value: "kitchen", title: "Kitchen", synonyms: ["kitchen", "cooking", "chef kitchen", "full kitchen"] },
  { value: "workspace", title: "Workspace", synonyms: ["workspace", "desk", "work from home", "office", "remote work"] },
  { value: "parking", title: "Parking", synonyms: ["parking", "garage", "free parking"] },
  { value: "washer", title: "Washer", synonyms: ["washer", "laundry", "washing machine", "dryer"] },
  { value: "ac", title: "Air conditioning", synonyms: ["air conditioning", "ac", "a/c", "cooling"] },
  { value: "oceanView", title: "Ocean view", synonyms: ["ocean view", "sea view", "coastal view", "waterfront view"] },
  { value: "lakeView", title: "Lake view", synonyms: ["lake view", "lakefront view"] },
  { value: "mountainView", title: "Mountain view", synonyms: ["mountain view", "alpine view"] },
  { value: "beachAccess", title: "Beach access", synonyms: ["beach access", "walk to beach", "steps to beach", "private beach"] },
  { value: "bbq", title: "BBQ grill", synonyms: ["bbq", "grill", "barbecue"] },
  { value: "evCharger", title: "EV charger", synonyms: ["ev charger", "electric vehicle charging", "tesla charger"] },
];

export const VIBES: { value: Vibe; label: string }[] = [
  { value: "quiet", label: "Quiet" },
  { value: "cozy", label: "Cozy" },
  { value: "secluded", label: "Secluded" },
  { value: "romantic", label: "Romantic" },
  { value: "peaceful", label: "Peaceful" },
  { value: "luxury", label: "Luxury" },
  { value: "modern", label: "Modern" },
  { value: "rustic", label: "Rustic" },
  { value: "scenic", label: "Scenic" },
  { value: "walkable", label: "Walkable" },
  { value: "urban", label: "Urban" },
  { value: "coastal", label: "Coastal" },
  { value: "alpine", label: "Alpine" },
  { value: "sunny", label: "Sunny" },
  { value: "historic", label: "Historic" },
  { value: "family", label: "Family" },
];

export interface SearchIntent {
  text: string;
  source: "model" | "parser";
  place?: string;
  maxPrice?: number;
  minPrice?: number;
  guests?: number;
  bedrooms?: number;
  pets?: "wanted" | "avoided";
  petsWeight?: number;
  types: {
    required: PropertyType[];
    avoided: PropertyType[];
    preferred: Weighted<PropertyType>[];
  };
  amenities: {
    required: Amenity[];
    avoided: Amenity[];
    preferred: Weighted<Amenity>[];
  };
  vibes: {
    preferred: Weighted<string>[];
    avoided: string[];
  };
}

export function emptyIntent(text: string = ""): SearchIntent {
  return {
    text,
    source: "parser",
    types: { required: [], avoided: [], preferred: [] },
    amenities: { required: [], avoided: [], preferred: [] },
    vibes: { preferred: [], avoided: [] },
  };
}

// Convert legacy ParsedQuery to SearchIntent for fallback or client compatibility
export function intentFromParsed(parsed: ParsedQuery): SearchIntent {
  const intent = emptyIntent(parsed.raw);
  intent.source = "parser";

  if (parsed.place) intent.place = parsed.place;
  if (parsed.maxPrice !== undefined) intent.maxPrice = parsed.maxPrice;
  if (parsed.guests !== undefined) intent.guests = parsed.guests;
  if (parsed.pets === true) {
    intent.pets = "wanted";
    intent.petsWeight = 1.0;
  }

  if (parsed.type) {
    intent.types.required.push(parsed.type);
  }

  // Map amenity string names to canonical schema values
  const amenityMap: Record<string, Amenity> = {
    "hot tub": "hotTub",
    "hot-tub": "hotTub",
    pool: "pool",
    fireplace: "fireplace",
    "fire pit": "firePit",
    "fire-pit": "firePit",
    "wood stove": "fireplace",
    sauna: "sauna",
    wifi: "wifi",
    kitchen: "kitchen",
    workspace: "workspace",
    gym: "workspace",
    parking: "parking",
    washer: "washer",
    ac: "ac",
    "air conditioning": "ac",
    "ocean view": "oceanView",
    "lake view": "lakeView",
    "mountain view": "mountainView",
    "beach access": "beachAccess",
    "private beach": "beachAccess",
    bbq: "bbq",
    "bbq grill": "bbq",
    "ev charger": "evCharger",
  };

  for (const item of parsed.amenities) {
    const canonical = amenityMap[item.toLowerCase()];
    if (canonical && !intent.amenities.required.includes(canonical)) {
      intent.amenities.required.push(canonical);
    }
  }

  // Remaining terms mapped to preferred vibes
  for (const term of parsed.terms) {
    const matchedVibe = VIBES.find((v) => v.value.toLowerCase() === term.toLowerCase());
    if (matchedVibe && !intent.vibes.preferred.some((p) => p.value === matchedVibe.value)) {
      intent.vibes.preferred.push({ value: matchedVibe.value, weight: 1.0 });
    }
  }

  return intent;
}

// Helper to determine active chips from intent
export function chipsFor(intent: SearchIntent): string[] {
  const chips: string[] = [];

  if (intent.types.required.includes("cabin")) chips.push("cabin");
  if (intent.types.required.includes("beach")) chips.push("beach");
  if (intent.types.required.includes("villa")) chips.push("villa");
  if (intent.types.required.includes("city")) chips.push("city");

  if (intent.maxPrice !== undefined && intent.maxPrice <= 300) {
    chips.push("under-300");
  }

  if (intent.pets === "wanted") {
    chips.push("pet-friendly");
  }

  if (intent.amenities.required.includes("hotTub")) chips.push("hot-tub");
  if (intent.amenities.required.includes("pool")) chips.push("pool");

  return chips;
}

export function hasChip(intent: SearchIntent, chipId: string): boolean {
  return chipsFor(intent).includes(chipId);
}

export function toggleChip(intent: SearchIntent, chipId: string): SearchIntent {
  const next: SearchIntent = {
    ...intent,
    types: {
      required: [...intent.types.required],
      avoided: [...intent.types.avoided],
      preferred: [...intent.types.preferred],
    },
    amenities: {
      required: [...intent.amenities.required],
      avoided: [...intent.amenities.avoided],
      preferred: [...intent.amenities.preferred],
    },
    vibes: {
      preferred: [...intent.vibes.preferred],
      avoided: [...intent.vibes.avoided],
    },
  };

  switch (chipId) {
    case "cabin":
    case "beach":
    case "villa":
    case "city": {
      const type = chipId as PropertyType;
      const idx = next.types.required.indexOf(type);
      if (idx >= 0) {
        next.types.required.splice(idx, 1);
      } else {
        next.types.required.push(type);
        // Remove from avoided if present
        next.types.avoided = next.types.avoided.filter((t) => t !== type);
      }
      break;
    }
    case "under-300": {
      if (next.maxPrice === 300) {
        delete next.maxPrice;
      } else {
        next.maxPrice = 300;
      }
      break;
    }
    case "pet-friendly": {
      if (next.pets === "wanted") {
        delete next.pets;
        delete next.petsWeight;
      } else {
        next.pets = "wanted";
        next.petsWeight = 1.0;
      }
      break;
    }
    case "hot-tub": {
      const idx = next.amenities.required.indexOf("hotTub");
      if (idx >= 0) {
        next.amenities.required.splice(idx, 1);
      } else {
        next.amenities.required.push("hotTub");
        next.amenities.avoided = next.amenities.avoided.filter((a) => a !== "hotTub");
      }
      break;
    }
    case "pool": {
      const idx = next.amenities.required.indexOf("pool");
      if (idx >= 0) {
        next.amenities.required.splice(idx, 1);
      } else {
        next.amenities.required.push("pool");
        next.amenities.avoided = next.amenities.avoided.filter((a) => a !== "pool");
      }
      break;
    }
  }

  return next;
}

export function describeIntent(intent: SearchIntent): { applied: string[]; avoided: string[] } {
  const applied: string[] = [];
  const avoided: string[] = [];

  if (intent.maxPrice !== undefined) applied.push(`Under $${intent.maxPrice}`);
  if (intent.minPrice !== undefined) applied.push(`From $${intent.minPrice}`);
  if (intent.guests !== undefined) applied.push(`${intent.guests}+ guests`);
  if (intent.bedrooms !== undefined) applied.push(`${intent.bedrooms}+ bedrooms`);
  if (intent.place) applied.push(intent.place);

  if (intent.pets === "wanted") applied.push("Pet friendly");
  if (intent.pets === "avoided") avoided.push("No pets");

  for (const t of intent.types.required) {
    applied.push(t.charAt(0).toUpperCase() + t.slice(1));
  }
  for (const t of intent.types.avoided) {
    avoided.push(`Not ${t.charAt(0).toUpperCase() + t.slice(1)}`);
  }

  const amenityTitles: Record<string, string> = {
    hotTub: "Hot tub",
    pool: "Pool",
    fireplace: "Fireplace",
    firePit: "Fire pit",
    sauna: "Sauna",
    wifi: "Wifi",
    kitchen: "Kitchen",
    workspace: "Workspace",
    parking: "Parking",
    washer: "Washer",
    ac: "Air conditioning",
    oceanView: "Ocean view",
    lakeView: "Lake view",
    mountainView: "Mountain view",
    beachAccess: "Beach access",
    bbq: "BBQ grill",
    evCharger: "EV charger",
  };

  for (const a of intent.amenities.required) {
    applied.push(amenityTitles[a] || a);
  }
  for (const a of intent.amenities.avoided) {
    avoided.push(`No ${amenityTitles[a] || a}`);
  }

  for (const v of intent.vibes.preferred) {
    applied.push(v.value.charAt(0).toUpperCase() + v.value.slice(1));
  }
  for (const v of intent.vibes.avoided) {
    avoided.push(`Not ${v.charAt(0).toUpperCase() + v.slice(1)}`);
  }

  return { applied, avoided };
}

export function stayTags(stay: Property, intent?: SearchIntent): string[] {
  const tags: string[] = [];
  const requiredAmenities = intent?.amenities.required || [];

  const displayTitles: Record<string, string> = {
    hotTub: "Hot tub",
    pool: "Pool",
    fireplace: "Fireplace",
    firePit: "Fire pit",
    sauna: "Sauna",
    wifi: "Fast Wifi",
    kitchen: "Kitchen",
    workspace: "Workspace",
    oceanView: "Ocean view",
    lakeView: "Lake view",
    mountainView: "Mountain view",
    beachAccess: "Beach access",
  };

  // 1. Matched required amenities first
  for (const req of requiredAmenities) {
    if (stay.amenities?.includes(req) && displayTitles[req]) {
      tags.push(displayTitles[req]);
    }
  }

  // 2. Pets allowed if wanted
  if (intent?.pets === "wanted" && stay.petsAllowed) {
    tags.push("Pet friendly");
  }

  // 3. Fallback to stay's top amenities if tags < 3
  if (tags.length < 3 && stay.amenities) {
    for (const a of stay.amenities) {
      const title = displayTitles[a];
      if (title && !tags.includes(title)) {
        tags.push(title);
        if (tags.length >= 3) break;
      }
    }
  }

  return tags;
}
