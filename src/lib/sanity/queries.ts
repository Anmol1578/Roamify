export const HOME_STAYS_QUERY = `
  *[_type == "property" && defined(slug.current) && ($type == "all" || type == $type)] | order(rating desc, reviewCount desc)[0...30]{
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
  }
`;

export const STAY_QUERY = `
  *[_type == "property" && (slug.current == $slug || _id == $slug)][0]{
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
    ),
    "reviews": reviews[]->{
      "id": _id,
      author,
      rating,
      date,
      comment
    }
  }
`;

export const PLACES_QUERY = `
  *[_type == "property" && defined(slug.current)]{
    "city": coalesce(city, location.city),
    "region": coalesce(region, location.region),
    "country": coalesce(country, location.country),
    "neighborhood": coalesce(neighborhood, location.neighborhood)
  }
`;

export const POLICY_TEXT_QUERY = `
  *[_type == "policy"]{
    "id": _id,
    title,
    "kind": coalesce(kind, category),
    "category": coalesce(kind, category),
    summary,
    "text": coalesce(pt::text(body), content, summary, "")
  }
`;

export const ASK_STAY_QUERY = `
  *[_type == "property" && slug.current == $slug][0]{
    "id": _id,
    "slug": slug.current,
    title,
    type,
    "city": coalesce(city, location.city),
    "region": coalesce(region, location.region),
    maxGuests,
    bedrooms,
    beds,
    "baths": coalesce(bathrooms, baths),
    "petsAllowed": coalesce(houseRules.petsAllowed, petsAllowed),
    amenities,
    "cancellationPolicy": cancellationPolicy->{
      "id": _id,
      title,
      "kind": coalesce(kind, category),
      summary,
      "content": coalesce(content, body[0].children[0].text)
    },
    "houseRules": select(
      defined(houseRules._type) && houseRules._type == "reference" => houseRules->{
        "id": _id,
        title,
        summary,
        "content": coalesce(content, body[0].children[0].text)
      },
      houseRules
    )
  }
`;


