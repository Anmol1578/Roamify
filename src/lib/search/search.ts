import { Property, properties as defaultProperties } from "../../data/properties";
import { ParsedQuery, parseQuery } from "./parse";

export type SortOption = "best_match" | "price_low" | "price_high" | "rating";

export interface SearchResult {
  property: Property;
  score: number;
}

export function searchProperties(
  query: string | ParsedQuery,
  dataset: Property[] = defaultProperties,
  sortOption: SortOption = "best_match"
): { results: Property[]; parsed: ParsedQuery } {
  const parsed = typeof query === "string" ? parseQuery(query) : query;

  // 1. Hard filters
  const filtered = dataset.filter((stay) => {
    // Max price
    if (parsed.maxPrice !== undefined && stay.pricePerNight > parsed.maxPrice) {
      return false;
    }

    // Min guests
    if (parsed.guests !== undefined && stay.maxGuests < parsed.guests) {
      return false;
    }

    // Property type
    if (parsed.type && stay.type !== parsed.type) {
      return false;
    }

    // Pets
    if (parsed.pets === true && !stay.petsAllowed) {
      return false;
    }

    // Amenities
    if (parsed.amenities.length > 0) {
      const stayAmenities = stay.amenities.map((a) =>
        a.toLowerCase().replace(/-/g, " ")
      );
      const stayDesc = `${stay.title} ${stay.description || (stay.facts || []).join(" ")}`.toLowerCase();
      const hasAll = parsed.amenities.every((req) => {
        const lowerReq = req.toLowerCase().replace(/-/g, " ");
        return (
          stayAmenities.some((a) => a.includes(lowerReq)) ||
          stayDesc.includes(lowerReq)
        );
      });
      if (!hasAll) return false;
    }

    return true;
  });

  // 2. Score remaining stays by soft terms
  const scored: SearchResult[] = filtered.map((stay) => {
    let score = 0;
    const lowerTitle = stay.title.toLowerCase();
    const lowerCity = stay.city.toLowerCase();
    const lowerRegion = stay.region.toLowerCase();
    const lowerRegionName = (stay.regionName || "").toLowerCase();
    const lowerDesc = (stay.description || (stay.facts || []).join(" ")).toLowerCase();
    const vibes = stay.vibes.map((v) => v.toLowerCase());

    for (const term of parsed.terms) {
      const lowerTerm = term.toLowerCase();

      // City / region / regionName match
      if (
        lowerCity.includes(lowerTerm) ||
        lowerRegion.includes(lowerTerm) ||
        lowerRegionName.includes(lowerTerm)
      ) {
        score += 8;
      }
      // Vibe match
      if (vibes.some((v) => v.includes(lowerTerm))) {
        score += 5;
      }
      // Title match
      if (lowerTitle.includes(lowerTerm)) {
        score += 4;
      }
      // Description match
      if (lowerDesc.includes(lowerTerm)) {
        score += 2;
      }
    }

    return { property: stay, score };
  });

  // 3. Sort by requested sort option
  if (sortOption === "price_low") {
    scored.sort((a, b) => a.property.pricePerNight - b.property.pricePerNight);
  } else if (sortOption === "price_high") {
    scored.sort((a, b) => b.property.pricePerNight - a.property.pricePerNight);
  } else if (sortOption === "rating") {
    scored.sort((a, b) => b.property.rating - a.property.rating);
  } else {
    // default: "best_match"
    scored.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.property.rating - a.property.rating;
    });
  }

  return {
    results: scored.map((s) => s.property),
    parsed,
  };
}
