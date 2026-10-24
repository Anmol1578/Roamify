import { ParsedQuery } from "./parse";

export type SortOption = "best_match" | "price_low" | "price_high" | "rating";

export interface BuiltSearchQuery {
  query: string;
  params: Record<string, unknown>;
}

export const PROPERTY_PROJECTION = `{
  "id": _id,
  "slug": slug.current,
  title,
  type,
  "city": coalesce(city, location.city),
  "region": coalesce(region, location.region),
  "regionName": coalesce(region, location.regionName, location.region),
  "country": coalesce(country, location.country),
  "neighborhood": coalesce(neighborhood, location.neighborhood),
  pricePerNight,
  cleaningFee,
  serviceFeePercent,
  minNights,
  weeklyDiscountPercent,
  maxGuests,
  bedrooms,
  beds,
  "baths": coalesce(bathrooms, baths),
  "bathrooms": coalesce(bathrooms, baths),
  "petsAllowed": coalesce(houseRules.petsAllowed, petsAllowed),
  amenities,
  vibes,
  summary,
  description,
  spaceOverview,
  facts,
  highlights,
  copyReview,
  "imageUrl": coalesce(photos[0].asset->url, photos[0].url, mainImage.url, mainImage.asset->url),
  "image": coalesce(photos[0].asset->url, photos[0].url, mainImage.url, mainImage.asset->url),
  "photos": photos[]{ "url": coalesce(asset->url, url), alt },
  "coordinates": coalesce(location, location.coordinates),
  "location": coalesce(location, location.coordinates),
  "isFeatured": featured,
  "featured": featured,
  "rating": coalesce(rating, 4.8),
  "reviewCount": coalesce(reviewCount, 0),
  "host": host->{
    "id": _id,
    name,
    "avatarUrl": coalesce(photo.asset->url, avatar.url),
    isSuperhost,
    bio,
    hostingSince,
    joinedDate,
    responseRate,
    responseTime,
    languages
  },
  "cancellationPolicy": cancellationPolicy->{
    "id": _id,
    title,
    "slug": slug.current,
    "kind": coalesce(kind, category),
    "category": coalesce(kind, category),
    summary,
    "content": coalesce(content, body[0].children[0].text)
  },
  "houseRules": select(
    defined(houseRules._type) && houseRules._type == "reference" => houseRules->{
      "id": _id,
      title,
      "slug": slug.current,
      "kind": coalesce(kind, category),
      "category": coalesce(kind, category),
      summary,
      "content": coalesce(content, body[0].children[0].text)
    },
    houseRules
  )
}`;

export function buildSearchQuery(
  parsed: ParsedQuery,
  sortOption: SortOption = "best_match"
): BuiltSearchQuery {
  const filters: string[] = ['_type == "property"', "defined(slug.current)"];
  const params: Record<string, unknown> = {};

  if (parsed.type) {
    filters.push("type == $type");
    params.type = parsed.type;
  }

  if (parsed.maxPrice !== undefined) {
    filters.push("pricePerNight <= $maxPrice");
    params.maxPrice = parsed.maxPrice;
  }

  if (parsed.guests !== undefined) {
    filters.push("maxGuests >= $guests");
    params.guests = parsed.guests;
  }

  if (parsed.pets === true) {
    filters.push("(petsAllowed == true || houseRules.petsAllowed == true)");
  }

  if (parsed.place) {
    filters.push(
      "(city match $place || region match $place || location.city match $place || location.region match $place)"
    );
    params.place = `*${parsed.place}*`;
  }

  if (parsed.amenities && parsed.amenities.length > 0) {
    parsed.amenities.forEach((amenity, index) => {
      const paramKey = `amenity_${index}`;
      params[paramKey] = `*${amenity}*`;
      filters.push(`amenities[] match $${paramKey}`);
    });
  }

  if (parsed.terms && parsed.terms.length > 0) {
    parsed.terms.forEach((term, index) => {
      const paramKey = `term_${index}`;
      params[paramKey] = `*${term}*`;
      filters.push(
        `(title match $${paramKey} || summary match $${paramKey} || description match $${paramKey} || vibes[] match $${paramKey} || facts[] match $${paramKey})`
      );
    });
  }

  let orderClause = "order(rating desc, reviewCount desc)";
  if (sortOption === "price_low") {
    orderClause = "order(pricePerNight asc)";
  } else if (sortOption === "price_high") {
    orderClause = "order(pricePerNight desc)";
  } else if (sortOption === "rating") {
    orderClause = "order(rating desc, reviewCount desc)";
  }

  const query = `*[${filters.join(" && ")}] | ${orderClause}[0...50] ${PROPERTY_PROJECTION}`;

  return { query, params };
}
