export type PropertyType = "cabin" | "beach" | "city" | "villa";

export type Amenity =
  | "hot-tub"
  | "pool"
  | "sauna"
  | "fireplace"
  | "fire-pit"
  | "wood-stove"
  | "ocean-view"
  | "mountain-view"
  | "lake-view"
  | "beach-access"
  | "wifi"
  | "kitchen"
  | "workspace"
  | "gym"
  | "ev-charger"
  | "air-conditioning"
  | "heating"
  | "washer-dryer"
  | "bbq-grill"
  | "patio"
  | "balcony"
  | string;

export interface Host {
  id: string;
  name: string;
  avatarUrl: string;
  photoUrl?: string;
  isSuperhost: boolean;
  bio?: string;
  hostingSince?: string;
  joinedDate?: string;
  responseRate?: string;
  responseTime?: string;
  languages?: string[];
}

export interface Policy {
  id: string;
  title: string;
  slug: string;
  kind?: string;
  category?:
    | "cancellation"
    | "house-rules"
    | "pets"
    | "check-in"
    | "damage"
    | "payment"
    | "guest-refund"
    | "safety"
    | "events"
    | "parking"
    | string;
  summary: string;
  content?: string;
  body?: any;
}

export interface HouseRules {
  checkIn?: string;
  checkInTime?: string;
  checkOut?: string;
  checkOutTime?: string;
  quietHours?: string;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  partiesAllowed?: boolean;
  additionalRules?: string[];
  [key: string]: any;
}

export interface Review {
  id: string;
  author: string;
  avatarUrl?: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Property {
  id: string;
  title: string;
  slug?: string;
  type: PropertyType;
  city: string;
  region: string;
  regionName?: string;
  country?: string;
  neighborhood?: string;
  pricePerNight: number;
  cleaningFee?: number;
  serviceFeePercent?: number;
  minNights?: number;
  weeklyDiscountPercent?: number;
  rating: number;
  reviewCount: number;
  maxGuests: number;
  bedrooms?: number;
  beds?: number;
  baths?: number;
  bathrooms?: number;
  petsAllowed: boolean;
  amenities: string[];
  vibes: string[];
  summary?: string;
  description?: string;
  spaceOverview?: string;
  imageUrl: string;
  image?: string;
  gallery?: { url: string; caption?: string }[];
  photos?: { url: string; alt?: string }[];
  coordinates?: { lat: number; lng: number };
  location?: { lat: number; lng: number } | [number, number];
  host?: Host;
  cancellationPolicy?: Policy;
  houseRules?: Policy | HouseRules | any;
  additionalPolicies?: Policy[];
  isFeatured?: boolean;
  featured?: boolean;
  facts?: string[];
  highlights?: string[];
  copyReview?: {
    status: "passed" | "failed";
    checkedAt?: string;
    sourceHash?: string;
    unsupportedClaims?: { claim: string; reason: string }[];
  };
  reviews?: Review[];
}

export const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

export function formatPrice(price: number): string {
  return `$${Math.round(price)}`;
}

export function formatLocation(stay: {
  city?: string;
  region?: string;
  country?: string;
}): string {
  if (stay.city && stay.region) {
    return `${stay.city}, ${stay.region}`;
  }
  if (stay.city && stay.country) {
    return `${stay.city}, ${stay.country}`;
  }
  return stay.city || stay.region || stay.country || "";
}

export function formatRating(rating: number, reviewCount?: number): string {
  const formatted = rating.toFixed(1);
  if (reviewCount !== undefined && reviewCount > 0) {
    return `${formatted} (${reviewCount})`;
  }
  return formatted;
}
