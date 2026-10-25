import { SearchIntent } from "../search/intent";
import { SortOption, PROPERTY_PROJECTION } from "../search/query";

export function lit(val: unknown): string {
  if (typeof val === "number") {
    if (!Number.isFinite(val)) throw new Error("Invalid number literal: must be finite");
    return String(val);
  }
  if (typeof val === "string") {
    const sanitized = val.slice(0, 300).replace(/[\u2028\u2029]/g, " ");
    return JSON.stringify(sanitized);
  }
  if (typeof val === "boolean") {
    return val ? "true" : "false";
  }
  throw new Error(`Unsupported literal type: ${typeof val}`);
}

export function buildSearchGroq(
  intent: SearchIntent,
  sortOption: SortOption = "best_match"
): string {
  const filters: string[] = ['_type == "property"', "defined(slug.current)"];

  // 1. Property types
  if (intent.types.required.length > 0) {
    const list = intent.types.required.map(lit).join(", ");
    filters.push(`type in [${list}]`);
  }
  if (intent.types.avoided.length > 0) {
    const list = intent.types.avoided.map(lit).join(", ");
    filters.push(`!(type in [${list}])`);
  }

  // 2. Price constraints
  if (intent.maxPrice !== undefined) {
    filters.push(`pricePerNight <= ${lit(intent.maxPrice)}`);
  }
  if (intent.minPrice !== undefined) {
    filters.push(`pricePerNight >= ${lit(intent.minPrice)}`);
  }

  // 3. Guests and bedrooms
  if (intent.guests !== undefined) {
    filters.push(`maxGuests >= ${lit(intent.guests)}`);
  }
  if (intent.bedrooms !== undefined) {
    filters.push(`bedrooms >= ${lit(intent.bedrooms)}`);
  }

  // 4. Pets
  if (intent.pets === "wanted") {
    filters.push(`(petsAllowed == true || houseRules.petsAllowed == true)`);
  } else if (intent.pets === "avoided") {
    filters.push(`(petsAllowed != true && houseRules.petsAllowed != true)`);
  }

  // 5. Amenities
  if (intent.amenities.required.length > 0) {
    const list = intent.amenities.required.map(lit).join(", ");
    filters.push(`count(amenities[@ in [${list}]]) == ${intent.amenities.required.length}`);
  }
  if (intent.amenities.avoided.length > 0) {
    const list = intent.amenities.avoided.map(lit).join(", ");
    filters.push(`count(amenities[@ in [${list}]]) == 0`);
  }

  // 6. Places
  if (intent.place) {
    const p = intent.place.toLowerCase();
    filters.push(
      `count([lower(city), lower(region), lower(country), lower(neighborhood), lower(location.city), lower(location.region)][@ in [${lit(p)}]]) > 0`
    );
  }

  const filterExpression = `*[${filters.join(" && ")}]`;

  // Avoided vibes demote term
  let demoteTerm = "";
  if (intent.vibes.avoided.length > 0) {
    const avoidedList = intent.vibes.avoided.map(lit).join(", ");
    demoteTerm = `count(vibes[@ in [${avoidedList}]]) asc, `;
  }

  // Build ranking / scoring clause
  let orderAndScoreClause = "";
  const isSemanticCandidate =
    sortOption === "best_match" &&
    (intent.text.trim().length > 0 ||
      intent.vibes.preferred.length > 0 ||
      intent.amenities.preferred.length > 0 ||
      intent.types.preferred.length > 0);

  if (isSemanticCandidate) {
    const boosts: string[] = [];

    // Preferred amenities boost
    for (const a of intent.amenities.preferred) {
      const weight = Number((2 * a.weight).toFixed(2));
      boosts.push(`boost(${lit(a.value)} in amenities, ${weight})`);
    }

    // Preferred vibes boost
    for (const v of intent.vibes.preferred) {
      const weight = Number((3 * v.weight).toFixed(2));
      boosts.push(`boost(vibes match ${lit(v.value)}, ${weight})`);
    }

    // Preferred types boost
    for (const t of intent.types.preferred) {
      const weight = Number((2 * t.weight).toFixed(2));
      boosts.push(`boost(type == ${lit(t.value)}, ${weight})`);
    }

    // Implied pets boost
    if (intent.pets === "wanted" && intent.petsWeight && intent.petsWeight < 1.0) {
      const weight = Number((2 * intent.petsWeight).toFixed(2));
      boosts.push(`boost(petsAllowed == true || houseRules.petsAllowed == true, ${weight})`);
    }

    const similarityTerm = intent.text.trim().length > 0
      ? `text::semanticSimilarity(${lit(intent.text)})`
      : "";

    const scoreArgs = [similarityTerm, ...boosts].filter(Boolean).join(", ");

    if (scoreArgs) {
      orderAndScoreClause = `| score(${scoreArgs}) | order(${demoteTerm}_score desc, rating desc, reviewCount desc)[0...50]`;
    } else {
      orderAndScoreClause = `| order(${demoteTerm}rating desc, reviewCount desc)[0...50]`;
    }
  } else {
    let baseOrder = "rating desc, reviewCount desc";
    if (sortOption === "price_low") {
      baseOrder = "pricePerNight asc";
    } else if (sortOption === "price_high") {
      baseOrder = "pricePerNight desc";
    } else if (sortOption === "rating") {
      baseOrder = "rating desc, reviewCount desc";
    }
    orderAndScoreClause = `| order(${demoteTerm}${baseOrder})[0...50]`;
  }

  return `{
    "total": count(${filterExpression}),
    "stays": ${filterExpression} ${orderAndScoreClause} ${PROPERTY_PROJECTION}
  }`;
}
