export interface SeedHost {
  _id: string
  name: string
  slug: string
  avatarUrl: string
  isSuperhost: boolean
  bio: string
  joinedDate: string
  responseRate: string
  responseTime: string
  languages: string[]
}

export interface SeedPolicy {
  _id: string
  title: string
  slug: string
  category:
    | 'cancellation'
    | 'house-rules'
    | 'pets'
    | 'check-in'
    | 'damage'
    | 'payment'
    | 'guest-refund'
    | 'safety'
    | 'events'
    | 'parking'
  summary: string
  content: string
}

export interface SeedProperty {
  _id: string
  title: string
  slug: string
  type: 'cabin' | 'beach' | 'city' | 'villa'
  pricePerNight: number
  cleaningFee: number
  serviceFeePercent: number
  minNights: number
  weeklyDiscountPercent?: number
  maxGuests: number
  bedrooms: number
  beds: number
  baths: number
  petsAllowed: boolean
  amenities: string[]
  location: {
    city: string
    region: string
    regionName: string
    country: string
    neighborhood?: string
    lat: number
    lng: number
  }
  facts: string[]
  summary: string
  description: string
  spaceOverview: string
  neighborhood: string
  vibes: string[]
  hostId: string
  cancellationPolicyId: string
  houseRulesPolicyId: string
  additionalPolicyIds?: string[]
  mainImageUrl: string
  galleryUrls: {url: string; caption: string}[]
  rating: number
  reviewCount: number
  featured?: boolean
}

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`

// -------------------------------------------------------------
// 10 SHARED HOSTS
// -------------------------------------------------------------
export const SEED_HOSTS: SeedHost[] = [
  {
    _id: 'host-marcus-reed',
    name: 'Marcus Reed',
    slug: 'marcus-reed',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    isSuperhost: true,
    bio: 'Architectural designer and avid desert hiker. Welcoming guests to curated modern estates, hillside villas, and desert sanctuaries across Southern California and the Southwest since 2017.',
    joinedDate: 'June 2017',
    responseRate: '100%',
    responseTime: 'within an hour',
    languages: ['English', 'Spanish'],
  },
  {
    _id: 'host-sarah-jenkins',
    name: 'Sarah Jenkins',
    slug: 'sarah-jenkins',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    isSuperhost: true,
    bio: 'Architect and interior designer living between San Francisco and Lake Tahoe. I love designing warm, light-filled spaces surrounded by pine and cedar.',
    joinedDate: 'April 2019',
    responseRate: '100%',
    responseTime: 'within an hour',
    languages: ['English'],
  },
  {
    _id: 'host-marcus-thorne',
    name: 'Marcus Thorne',
    slug: 'marcus-thorne',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    isSuperhost: true,
    bio: 'Photographer and avid trail runner based in Southern California. Welcoming travelers to ocean bungalows and desert sanctuaries since 2018.',
    joinedDate: 'June 2018',
    responseRate: '99%',
    responseTime: 'within an hour',
    languages: ['English', 'French'],
  },
  {
    _id: 'host-elena-rostova',
    name: 'Elena Rostova',
    slug: 'elena-rostova',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    isSuperhost: true,
    bio: 'Sommelier and hospitality consultant curating peaceful vineyard estates and hillside retreats across California wine country.',
    joinedDate: 'September 2020',
    responseRate: '98%',
    responseTime: 'within a few hours',
    languages: ['English', 'Russian', 'Italian'],
  },
  {
    _id: 'host-david-kim',
    name: 'David Kim',
    slug: 'david-kim',
    avatarUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    isSuperhost: false,
    bio: 'Tech founder and urban design enthusiast. Offering minimalist lofts and coastal modern getaways designed for creative flow and calm.',
    joinedDate: 'January 2022',
    responseRate: '96%',
    responseTime: 'within an hour',
    languages: ['English', 'Korean'],
  },
  {
    _id: 'host-maya-lin',
    name: 'Maya Lin',
    slug: 'maya-lin',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    isSuperhost: true,
    bio: 'Landscape architect passionate about regenerative living, modern A-frame cabins, and native garden design throughout the Pacific Northwest.',
    joinedDate: 'May 2019',
    responseRate: '100%',
    responseTime: 'within an hour',
    languages: ['English', 'Mandarin'],
  },
  {
    _id: 'host-carlos-mendez',
    name: 'Carlos Mendez',
    slug: 'carlos-mendez',
    avatarUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    isSuperhost: true,
    bio: 'Restoration carpenter and culinary explorer. Dedicated to reviving historic Spanish Colonial Revival casitas and coastal haciendas.',
    joinedDate: 'November 2018',
    responseRate: '99%',
    responseTime: 'within an hour',
    languages: ['English', 'Spanish'],
  },
  {
    _id: 'host-chloe-bennett',
    name: 'Chloe Bennett',
    slug: 'chloe-bennett',
    avatarUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    isSuperhost: false,
    bio: 'Ceramicist and creative writer based in Seattle. Welcoming guests to light-filled studios and seaside artist lofts with curated book collections.',
    joinedDate: 'August 2021',
    responseRate: '95%',
    responseTime: 'within a day',
    languages: ['English'],
  },
  {
    _id: 'host-liam-oconnor',
    name: 'Liam O’Connor',
    slug: 'liam-oconnor',
    avatarUrl:
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    isSuperhost: true,
    bio: 'Mountain guide and alpine photographer. Managing timber lodges, ski chalets, and wilderness treehouses in the Sierra Nevada and Rocky Mountains.',
    joinedDate: 'October 2017',
    responseRate: '99%',
    responseTime: 'within an hour',
    languages: ['English', 'German'],
  },
  {
    _id: 'host-amara-okafor',
    name: 'Amara Okafor',
    slug: 'amara-okafor',
    avatarUrl:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
    isSuperhost: true,
    bio: 'Interior stylist and former travel editor curating peaceful desert retreats, warm adobe homesteads, and mid-century architectural gems.',
    joinedDate: 'February 2020',
    responseRate: '100%',
    responseTime: 'within an hour',
    languages: ['English', 'Igbo'],
  },
]

// -------------------------------------------------------------
// 10 SHARED POLICIES
// -------------------------------------------------------------
export const SEED_POLICIES: SeedPolicy[] = [
  {
    _id: 'policy-cancellation-flexible',
    title: 'Flexible Cancellation Policy',
    slug: 'cancellation-flexible',
    category: 'cancellation',
    summary:
      'Full refund up to 24 hours before check-in. Non-refundable after that except for cleaning and platform fees.',
    content:
      'Guests may cancel for a full refund of the nightly rate and cleaning fee up to 24 hours prior to standard local check-in time (3:00 PM on day of arrival). If canceled within 24 hours of arrival, the first night plus service fee are non-refundable, while remaining nights and the cleaning fee are refunded in full. Early check-outs after arrival are non-refundable for the subsequent 24 hours of scheduled stay.',
  },
  {
    _id: 'policy-cancellation-moderate',
    title: 'Moderate Cancellation Policy',
    slug: 'cancellation-moderate',
    category: 'cancellation',
    summary:
      'Full refund up to 5 days before check-in. 50% refund after that minus the first night and platform fee.',
    content:
      'Guests can cancel their booking up to 5 full days before scheduled arrival for a 100% refund of all fees. If a cancellation occurs less than 5 days before check-in, the first night plus 50% of the remaining nightly rate are retained, and the cleaning fee is refunded in full. Date alteration requests within 5 days of arrival are subject to individual host approval.',
  },
  {
    _id: 'policy-cancellation-strict',
    title: 'Strict Cancellation Policy',
    slug: 'cancellation-strict',
    category: 'cancellation',
    summary:
      'Full refund within 48 hours of booking if check-in is 14+ days away. 50% refund up to 7 days before check-in.',
    content:
      'Guests receive a full refund if canceled within 48 hours of initial booking confirmation, provided check-in is at least 14 days away. If canceled between 14 and 7 days prior to check-in, 50% of the accommodation fee plus full cleaning fee are refunded. Cancellations fewer than 7 days prior to arrival are entirely non-refundable.',
  },
  {
    _id: 'policy-house-rules-standard',
    title: 'Standard House Rules & Quiet Hours',
    slug: 'house-rules-standard',
    category: 'house-rules',
    summary:
      'Quiet hours 10:00 PM to 8:00 AM. No unauthorized parties, no indoor smoking, no commercial photography without host signoff.',
    content:
      'To preserve tranquility and respect residential neighbors, quiet hours are strictly enforced between 10:00 PM and 8:00 AM daily. Loud music, amplified sound systems, parties, and unauthorized gatherings exceeding registered guest capacity are strictly prohibited. Smoking, vaping, or burning candles/incense inside the home is prohibited and carries an automatic $350 deep-cleaning fee. Commercial filming or photography requires written permission prior to booking.',
  },
  {
    _id: 'policy-pet-etiquette',
    title: 'Pet Friendly Policy & Etiquette',
    slug: 'pet-policy-etiquette',
    category: 'pets',
    summary:
      'Well-behaved dogs welcome with prior notice. Pets must stay off furniture and cannot be left unattended indoors unless crated.',
    content:
      'We gladly welcome up to two well-behaved dogs per stay with advance notice. Dogs must be house-trained, up-to-date on vaccinations, and kept on leash in shared outdoor spaces. Pets are not permitted on beds or couches unless protective blankets are used. Pets must not be left unattended on the property unless crated. Guests are responsible for cleaning up waste immediately in the yard and any excess shedding or damage.',
  },
  {
    _id: 'policy-check-in-keyless',
    title: 'Self Check-in & Keyless Entry',
    slug: 'check-in-keyless',
    category: 'check-in',
    summary:
      'Keyless digital keypad access starting at 3:00 PM. Check-out is 11:00 AM. Access PIN sent 24 hours prior to arrival.',
    content:
      'Check-in begins at 3:00 PM local time and check-out is by 11:00 AM sharp to allow cleaning crews sufficient turnover time. Access is granted via digital electronic keypad on the main entryway. A unique 4-digit PIN is sent via SMS and email 24 hours before arrival and activates automatically at check-in time. Early check-in or late check-out requests must be submitted at least 24 hours ahead.',
  },
  {
    _id: 'policy-damage-security',
    title: 'Property Protection & Security Deposit',
    slug: 'damage-security-deposit',
    category: 'damage',
    summary:
      'Accidental damage protection up to $1,000 included. Pre-authorized $300 security hold released 48 hours post-checkout.',
    content:
      'Every stay includes Roamify Peace of Mind Protection covering minor accidental damages up to $1,000 when reported promptly before departure. A credit card authorization hold of $300 may be placed on your payment method 24 hours before check-in and is automatically released 48 hours after checkout following standard property inspection.',
  },
  {
    _id: 'policy-payment-booking',
    title: 'Payment Schedule & Reservation Terms',
    slug: 'payment-booking-terms',
    category: 'payment',
    summary:
      '50% due at reservation confirmation; remaining 50% billed 14 days prior to check-in. Bank-grade encrypted Stripe processing.',
    content:
      'Reservations confirmed more than 14 days prior to arrival are split into two equal installments: 50% charged upon booking confirmation, and the remaining 50% charged automatically 14 days before check-in. Reservations made within 14 days of arrival require 100% payment at booking. All transactions are securely processed with 256-bit encryption.',
  },
  {
    _id: 'policy-guest-refund',
    title: 'Guest Refund & Rebooking Guarantee',
    slug: 'guest-refund-guarantee',
    category: 'guest-refund',
    summary:
      'If an essential amenity is inoperable or the stay is inaccessible upon check-in, Roamify provides immediate alternative lodging or a full refund.',
    content:
      'In the rare event that access cannot be gained, heat/power/water are non-functioning, or the property materially diverges from its listing description, guests who notify Roamify support within 12 hours of check-in are eligible for prompt rebooking into an equivalent or superior stay, or a 100% refund of all fees paid.',
  },
  {
    _id: 'policy-events-commercial',
    title: 'Commercial Filming & Events Policy',
    slug: 'commercial-events-policy',
    category: 'events',
    summary:
      'Commercial shoots, ticketed events, and parties require written host authorization and separate location contracts.',
    content:
      'Stays are intended exclusively for private residential vacation accommodation. Commercial photography, filmmaking, promotional content creation with professional crews, weddings, receptions, and ticketed events are strictly prohibited without an executed commercial location agreement, proof of commercial liability insurance, and paid event fees.',
  },
]

// -------------------------------------------------------------
// 30 REALISTIC STAYS (MATCHING SCREENSHOT TITLES & DESTINATIONS)
// -------------------------------------------------------------
export const SEED_PROPERTIES: SeedProperty[] = [
  // 1. Hollywood Hills Modern Villa (Screenshot 1 & 3 item)
  {
    _id: 'property-modern-villa-hollywood-hills',
    title: 'Modern Villa in the Hollywood Hills',
    slug: 'modern-villa-hollywood-hills',
    type: 'villa',
    pricePerNight: 575,
    cleaningFee: 160,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 8,
    bedrooms: 4,
    beds: 5,
    baths: 4,
    petsAllowed: false,
    amenities: [
      'pool',
      'hot-tub',
      'skyline-view',
      'wifi',
      'kitchen',
      'workspace',
      'gym',
      'ac',
      'deck',
      'ev-charger',
    ],
    location: {
      city: 'Los Angeles',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      neighborhood: 'Hollywood Hills West',
      lat: 34.1184,
      lng: -118.3533,
    },
    facts: [
          "Architectural hilltop villa with floor-to-ceiling glass pocket doors in the Hollywood Hills",
          "Cantilevered heated infinity-edge pool and integrated spa with panoramic Los Angeles skyline views",
          "Italian custom kitchen equipped with Miele appliances and marble island",
          "Four ensuite bedrooms with private terraces accommodating up to 8 guests",
          "Private fitness gym and Level 2 EV charging station"
    ],
    summary:
      'Architectural hilltop sanctuary with cantilevered infinity pool and panoramic Los Angeles skyline views.',
    description:
      'Perched high in the Hollywood Hills, this striking glass and concrete architectural masterpiece offers dramatic indoor-outdoor living with 180-degree skyline vistas stretching from downtown LA to the Pacific Ocean.',
    spaceOverview:
      'Four ensuite bedrooms with private terraces, multi-level infinity edge heated pool and spa, custom Italian kitchen with Miele appliances, integrated Sonos sound system, and floor-to-ceiling glass pocket doors.',
    neighborhood:
      'Tucked away on a quiet hillside cul-de-sac above the Sunset Strip, offering tranquil seclusion just 8 minutes from West Hollywood dining, galleries, and nightlife.',
    vibes: ['luxury', 'modern', 'skyline view', 'secluded', 'iconic', 'romantic'],
    hostId: 'host-marcus-reed',
    cancellationPolicyId: 'policy-cancellation-strict',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: [
      'policy-check-in-keyless',
      'policy-damage-security',
      'policy-events-commercial',
    ],
    mainImageUrl: photo('1600585154340-be6161a56a0c'),
    galleryUrls: [
      {
        url: photo('1600607687939-ce8a6c25118c'),
        caption: 'Double-height living pavilion with disappearing glass walls',
      },
      {
        url: photo('1600566753190-17f0baa2a6c3'),
        caption: 'Gourmet kitchen with monolithic marble island',
      },
      {url: photo('1600585154526-990dced4db0d'), caption: 'Primary suite overlooking the canyon'},
      {url: photo('1600566753086-00f18fb6b3ea'), caption: 'Sun terrace lounge with fire feature'},
    ],
    rating: 4.6,
    reviewCount: 87,
    featured: true,
  },

  // 2. Hillside Villa with Ocean Views (Screenshot 1 item)
  {
    _id: 'property-hillside-villa-montecito',
    title: 'Hillside Villa with Ocean Views',
    slug: 'hillside-villa-montecito',
    type: 'villa',
    pricePerNight: 650,
    cleaningFee: 180,
    serviceFeePercent: 12,
    minNights: 3,
    weeklyDiscountPercent: 12,
    maxGuests: 8,
    bedrooms: 4,
    beds: 4,
    baths: 4.5,
    petsAllowed: true,
    amenities: [
      'pool',
      'hot-tub',
      'ocean-view',
      'mountain-view',
      'wifi',
      'kitchen',
      'fireplace',
      'deck',
    ],
    location: {
      city: 'Montecito',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      neighborhood: 'Upper Village',
      lat: 34.4367,
      lng: -119.6321,
    },
    facts: [
          "Upper Montecito hillside estate with terracotta tile floors and high timber ceilings",
          "Heated swimming pool and cedar hot tub with views of the Pacific Ocean and Santa Ynez mountains",
          "Wood-burning stone fireplace in the living room and an open chef kitchen with covered dining veranda",
          "Four private bedrooms and four and a half bathrooms for up to 8 guests",
          "Located moments from Santa Ynez mountain trailheads and 6 minutes from Butterfly Beach"
    ],
    summary:
      'Mediterranean olive grove estate overlooking the Santa Barbara coastline and Channel Islands.',
    description:
      'Surrounded by hundred-year-old olive trees and fragrant lavender gardens, this Montecito hillside villa captures endless ocean views and cool coastal breezes from its heated courtyard pool and stone terraces.',
    spaceOverview:
      'Grown terracotta tile floors, high timber ceilings, radiant floor heating, wood-burning stone fireplaces, and an expansive chef kitchen opening to covered dining verandas.',
    neighborhood:
      'Prestigious Upper Montecito setting moments from hiking trailheads into the Santa Ynez mountains and a quick 6-minute drive to Butterfly Beach and Coast Village Road shops.',
    vibes: ['peaceful', 'luxury', 'ocean view', 'romantic', 'secluded', 'pet friendly'],
    hostId: 'host-marcus-reed',
    cancellationPolicyId: 'policy-cancellation-strict',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1512917774080-9991f1c4c750'),
    galleryUrls: [
      {
        url: photo('1613490493576-7fde63acd811'),
        caption: 'Resort-style infinity pool and stone terrace',
      },
      {
        url: photo('1599809275671-b5942cabc7a2'),
        caption: 'Sunlit living salon opening to olive gardens',
      },
      {
        url: photo('1588880331179-bc9b93a8cb5e'),
        caption: 'Al fresco dining portico with Pacific breeze',
      },
    ],
    rating: 4.9,
    reviewCount: 112,
    featured: true,
  },

  // 3. Desert Villa with Infinity Pool (Screenshot 1 item)
  {
    _id: 'property-desert-villa-scottsdale',
    title: 'Desert Villa with Infinity Pool',
    slug: 'desert-villa-scottsdale',
    type: 'villa',
    pricePerNight: 525,
    cleaningFee: 150,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 10,
    bedrooms: 5,
    beds: 6,
    baths: 4.5,
    petsAllowed: false,
    amenities: [
      'pool',
      'hot-tub',
      'fire-pit',
      'mountain-view',
      'wifi',
      'kitchen',
      'ac',
      'patio',
      'ev-charger',
    ],
    location: {
      city: 'Scottsdale',
      region: 'AZ',
      regionName: 'Arizona',
      country: 'United States',
      neighborhood: 'North Scottsdale Pinnacle Peak',
      lat: 33.6846,
      lng: -111.8654,
    },
    facts: [
          "Single-level desert contemporary villa set in the North Scottsdale desert foothills",
          "Resort-style infinity pool, submerged fire pit lounge, and heated spa overlooking Pinnacle Peak",
          "Five spacious ensuite bedrooms accommodating up to 10 guests",
          "Outdoor Viking chef kitchen and shaded dining patio with desert landscape views",
          "High-capacity dual-zone air conditioning and dedicated EV charging station"
    ],
    summary:
      'Modern Sonoran desert villa with zero-edge pool framing dramatic McDowell Mountain sunsets.',
    description:
      'Immerse yourself in desert luxury with sweeping views of giant saguaros and granite boulder formations. This architectural villa blends earth-toned rammed earth walls with glass doors that open to stargazing patios.',
    spaceOverview:
      'Sprawling single-level layout featuring a resort-style infinity pool, submerged fire pit lounge, private bocce court, Viking outdoor kitchen, and five spacious ensuite suites.',
    neighborhood:
      'Peaceful North Scottsdale desert foothills near Troon North Golf Club and Pinnacle Peak hiking trail, 20 minutes from Old Town Scottsdale dining.',
    vibes: ['desert', 'stargazing', 'infinity pool', 'luxury', 'mountain view', 'peaceful'],
    hostId: 'host-marcus-reed',
    cancellationPolicyId: 'policy-cancellation-strict',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-check-in-keyless', 'policy-damage-security'],
    mainImageUrl: photo('1580587771525-78b9dba3b914'),
    galleryUrls: [
      {
        url: photo('1576941089067-2de3c901e126'),
        caption: 'Rammed earth courtyard with native saguaro garden',
      },
      {
        url: photo('1600585154363-67eb9e2e2099'),
        caption: 'Evening fire lounge with Camelback Mountain views',
      },
      {
        url: photo('1600573472591-ee6b68d14c68'),
        caption: 'Minimalist dining room with panoramic desert glass',
      },
    ],
    rating: 4.8,
    reviewCount: 94,
    featured: false,
  },

  // 4. Desert Modern Villa (Screenshot 1 item)
  {
    _id: 'property-desert-modern-palm-springs',
    title: 'Desert Modern Villa',
    slug: 'desert-modern-palm-springs',
    type: 'villa',
    pricePerNight: 379,
    cleaningFee: 125,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 15,
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    baths: 3,
    petsAllowed: true,
    amenities: ['pool', 'hot-tub', 'mountain-view', 'wifi', 'kitchen', 'fire-pit', 'ac', 'patio'],
    location: {
      city: 'Palm Springs',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      neighborhood: 'Old Las Palmas',
      lat: 33.8303,
      lng: -116.5453,
    },
    facts: [
          "Mid-century post-and-beam architectural villa located in Palm Springs",
          "Private saltwater swimming pool and integrated hot tub with San Jacinto mountain views",
          "Gas fire pit conversation area and terrazzo tiled outdoor dining patio",
          "Three ensuite bedrooms with private clerestory windows for up to 6 guests",
          "Central air conditioning and modern minimalist chef kitchen"
    ],
    summary:
      'Mid-century post-and-beam classic featuring mountain backdrop, turquoise pool, and fire pit.',
    description:
      'Classic mid-century Palm Springs architecture updated with contemporary bespoke finishes. Enjoy complete walled privacy, towering palm trees, a heated saltwater pool, and unobstructed San Jacinto mountain views.',
    spaceOverview:
      'Open plan living area with tongue-and-groove cedar ceilings, terrazzo tile floors, custom cocktail wet bar, and glass sliders opening from every bedroom directly to the pool deck.',
    neighborhood:
      'Walkable to downtown Palm Springs design district coffee shops and vintage boutiques, situated in the historic Old Las Palmas celebrity enclave.',
    vibes: ['mid-century', 'pool', 'mountain view', 'sunny', 'pet friendly', 'cozy'],
    hostId: 'host-amara-okafor',
    cancellationPolicyId: 'policy-cancellation-moderate',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1523217582562-09d0def993a6'),
    galleryUrls: [
      {
        url: photo('1584738766473-61c083514bf4'),
        caption: 'Turquoise pool and San Jacinto mountain backdrop',
      },
      {
        url: photo('1521208378950-d76bc11fb452'),
        caption: 'Open-air breezeway and outdoor conversation pit',
      },
      {
        url: photo('1600566753376-12c8ab7fb75b'),
        caption: 'Covered patio with mid-century modern loungers',
      },
    ],
    rating: 4.9,
    reviewCount: 168,
    featured: true,
  },

  // 5. Spanish Hacienda with Pool (Screenshot 1 item)
  {
    _id: 'property-spanish-hacienda-santa-barbara',
    title: 'Spanish Hacienda with Pool',
    slug: 'spanish-hacienda-santa-barbara',
    type: 'villa',
    pricePerNight: 498,
    cleaningFee: 140,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 8,
    bedrooms: 4,
    beds: 4,
    baths: 3.5,
    petsAllowed: true,
    amenities: ['pool', 'hot-tub', 'fireplace', 'wifi', 'kitchen', 'deck', 'patio', 'ac'],
    location: {
      city: 'Santa Barbara',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      neighborhood: 'Riviera',
      lat: 34.4208,
      lng: -119.6982,
    },
    facts: [
          "Restored Spanish Revival hacienda featuring white stucco walls and red-tile roofs in Santa Barbara",
          "Courtyard swimming pool and tiled soaking spa surrounded by olive trees and bougainvillea",
          "Handcrafted wood-burning fireplace in the central salon and artisan tile kitchen",
          "Four private bedrooms and three and a half baths accommodating up to 8 guests",
          "Gated private grounds with shaded outdoor dining patio"
    ],
    summary:
      'Historic Spanish Colonial estate on the Riviera with private courtyard pool and red tile roofs.',
    description:
      'Authentic Santa Barbara architectural romanticism featuring hand-painted Talavera tiles, whitewashed adobe walls, bougainvillea-draped archways, and a private courtyard pool overlooking coastal hills.',
    spaceOverview:
      'Central fountain courtyard, formal living room with exposed wood trusses, wood-burning hearth, chef-equipped kitchen with copper cookware, and tranquil private garden suites.',
    neighborhood:
      'Perched on Santa Barbara’s famed American Riviera, minutes from Mission Santa Barbara, El Presidio, and the Funk Zone wine tasting rooms.',
    vibes: ['historic', 'romantic', 'pool', 'peaceful', 'coastal', 'pet friendly'],
    hostId: 'host-carlos-mendez',
    cancellationPolicyId: 'policy-cancellation-moderate',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1564013799919-ab600027ffc6'),
    galleryUrls: [
      {
        url: photo('1560185127-6ed189bf02f4'),
        caption: 'Terracotta tiled loggia surrounded by bougainvillea',
      },
      {
        url: photo('1560185007-cde436f6a4d0'),
        caption: 'Warm Spanish living room with exposed wood beams',
      },
      {
        url: photo('1560185008-b033106af5c3'),
        caption: 'Fountain courtyard with hand-painted Andalusian tiles',
      },
    ],
    rating: 4.9,
    reviewCount: 145,
    featured: true,
  },

  // 6. Designer Home in Wine Country (Screenshot 1 item)
  {
    _id: 'property-designer-home-wine-country',
    title: 'Designer Home in Wine Country',
    slug: 'designer-home-wine-country',
    type: 'villa',
    pricePerNight: 365,
    cleaningFee: 120,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    baths: 2.5,
    petsAllowed: false,
    amenities: [
      'pool',
      'hot-tub',
      'vineyard-view',
      'wifi',
      'kitchen',
      'fireplace',
      'deck',
      'workspace',
    ],
    location: {
      city: 'Healdsburg',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      neighborhood: 'Dry Creek Valley',
      lat: 38.6105,
      lng: -122.8692,
    },
    facts: [
          "Contemporary wine country residence overlooking Russian River Valley vineyards in Healdsburg",
          "Outdoor heated pool and cedar hot tub overlooking private estate vines",
          "Indoor gas fireplace and open-concept chef kitchen with quartz countertops",
          "Three bedrooms and two and a half bathrooms accommodating up to 6 guests",
          "Dedicated remote work office and wide cedar viewing deck"
    ],
    summary:
      'Modern Scandinavian barn overlooking rolling Dry Creek zinfandel vineyards with private pool.',
    description:
      'Designed by a renowned architectural studio, this modern agrarian home features black cedar cladding, soaring gabled ceilings, a concrete swimming pool, and uninterrupted views across organic vineyard rows.',
    spaceOverview:
      'Sleek minimalist kitchen with induction cooktop and wine cooler, expansive deck with outdoor gas fireplace, custom cedar soaking tub, and floor-to-ceiling glass framing pastoral vines.',
    neighborhood:
      'Located along Dry Creek Road, 7 minutes to Healdsburg Plaza’s Michelin-starred restaurants, bakeries, and artisan wine cellars.',
    vibes: ['vineyard', 'modern', 'peaceful', 'wine country', 'scenic', 'romantic'],
    hostId: 'host-elena-rostova',
    cancellationPolicyId: 'policy-cancellation-moderate',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-check-in-keyless', 'policy-damage-security'],
    mainImageUrl: photo('1613977257363-707ba9348227'),
    galleryUrls: [
      {
        url: photo('1600210492493-0946911123ea'),
        caption: 'Airy great room framing vineyard knolls',
      },
      {
        url: photo('1600607687920-4e2a09cf159d'),
        caption: 'Reflecting pool courtyard among ancient valley oaks',
      },
      {url: photo('1506126613408-eca07ce68773'), caption: 'Sunlit wine tasting salon and lounge'},
    ],
    rating: 4.8,
    reviewCount: 78,
    featured: false,
  },

  // 7. Oceanview Villa with Private Pool (Screenshot 1 item)
  {
    _id: 'property-oceanview-villa-malibu',
    title: 'Oceanview Villa with Private Pool',
    slug: 'oceanview-villa-malibu',
    type: 'villa',
    pricePerNight: 412,
    cleaningFee: 135,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 6,
    bedrooms: 3,
    beds: 4,
    baths: 3,
    petsAllowed: true,
    amenities: ['pool', 'hot-tub', 'ocean-view', 'wifi', 'kitchen', 'balcony', 'ac', 'deck'],
    location: {
      city: 'Malibu',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      neighborhood: 'Point Dume Bluffs',
      lat: 34.005,
      lng: -118.807,
    },
    facts: [
          "Modern cliffside ocean villa on the Malibu coast with floor-to-ceiling glass",
          "Heated oceanfront lap pool and hot tub overlooking the Pacific surf",
          "Four ensuite bedrooms and four full bathrooms for up to 8 guests",
          "Expansive teak ocean-view deck and gourmet island kitchen",
          "High-speed EV charger and central air conditioning"
    ],
    summary:
      'Hilltop Malibu retreat overlooking Zuma Beach with heated horizon pool and expansive sunset terrace.',
    description:
      'Catch dolphins dancing in the surf from your private pool terrace. This coastal modern villa captures sweeping 180-degree Pacific horizons with sun-drenched interiors and breezy outdoor lounge decks.',
    spaceOverview:
      'Three peaceful bedroom suites, open-concept living area with whitewashed oak floors, chef kitchen with ocean-view dining island, and heated swimming pool with integrated spa.',
    neighborhood:
      'Moments from Point Dume Natural Preserve, Westward Beach surf breaks, and Malibu Country Mart organic cafes.',
    vibes: ['ocean view', 'coastal', 'pool', 'sunset', 'relaxing', 'pet friendly'],
    hostId: 'host-marcus-thorne',
    cancellationPolicyId: 'policy-cancellation-moderate',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1572120360610-d971b9d7767c'),
    galleryUrls: [
      {
        url: photo('1516334487528-c789d53353f5'),
        caption: 'Sunken oceanview pool deck facing Point Dume',
      },
      {
        url: photo('1613977257592-4871e5fcd7c4'),
        caption: 'Cantilevered glass balcony overlooking crashing waves',
      },
      {
        url: photo('1516455590571-18256e5bb9ff'),
        caption: 'Private Mediterranean terrace and ocean garden',
      },
    ],
    rating: 4.8,
    reviewCount: 92,
    featured: true,
  },

  // 8. Sunny Apartment near Roosevelt Arts (Screenshot 1 item)
  {
    _id: 'property-sunny-apartment-phoenix',
    title: 'Sunny Apartment near Roosevelt Arts',
    slug: 'sunny-apartment-phoenix',
    type: 'city',
    pricePerNight: 129,
    cleaningFee: 55,
    serviceFeePercent: 10,
    minNights: 1,
    weeklyDiscountPercent: 15,
    maxGuests: 3,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    petsAllowed: true,
    amenities: ['wifi', 'kitchen', 'workspace', 'ac', 'balcony'],
    location: {
      city: 'Phoenix',
      region: 'AZ',
      regionName: 'Arizona',
      country: 'United States',
      neighborhood: 'Roosevelt Row Arts District',
      lat: 33.4589,
      lng: -112.0722,
    },
    facts: [
          "Bright top-floor apartment in Phoenix near the Roosevelt Row Arts District",
          "Community rooftop swimming pool and 24-hour fitness center",
          "One bedroom with queen bed and one full bathroom for up to 2 guests",
          "Dedicated ergonomic desk workspace and high-speed fiber internet",
          "Full kitchen with stainless steel appliances and central air conditioning"
    ],
    summary:
      'Vibrant sunlit urban haven steps from indie galleries, third-wave coffee, and vibrant murals.',
    description:
      'Flooded with bright Arizona sunshine, this stylish one-bedroom apartment in Roosevelt Row offers an inspiring urban sanctuary with high ceilings, curated local artwork, and a private balcony overlooking street art murals.',
    spaceOverview:
      'Dedicated ergonomic work corner with 500 Mbps fiber internet, memory foam king mattress, full modern kitchen with espresso machine, and smart thermostat.',
    neighborhood:
      'Heart of Roosevelt Row (RoRo) arts district. Step right outside to First Friday art walks, craft breweries, and light rail access.',
    vibes: ['walkable', 'urban', 'arts district', 'sunny', 'cozy', 'pet friendly'],
    hostId: 'host-amara-okafor',
    cancellationPolicyId: 'policy-cancellation-flexible',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1502672260266-1c1ef2d93688'),
    galleryUrls: [
      {
        url: photo('1583847268964-b28dc8f51f92'),
        caption: 'Minimalist living room with warm desert textiles',
      },
      {
        url: photo('1598928506311-c55ded91a20c'),
        caption: 'Serene guest bedroom with organic linen bedding',
      },
      {
        url: photo('1556911220-e15b29be8c8f'),
        caption: 'Light Scandinavian kitchen with pour-over coffee bar',
      },
    ],
    rating: 4.8,
    reviewCount: 65,
    featured: false,
  },

  // 9. Industrial Loft Downtown (Screenshot 1 item)
  {
    _id: 'property-industrial-loft-salt-lake-city',
    title: 'Industrial Loft Downtown',
    slug: 'industrial-loft-salt-lake-city',
    type: 'city',
    pricePerNight: 149,
    cleaningFee: 65,
    serviceFeePercent: 11,
    minNights: 1,
    weeklyDiscountPercent: 12,
    maxGuests: 4,
    bedrooms: 1,
    beds: 2,
    baths: 1.5,
    petsAllowed: true,
    amenities: ['wifi', 'kitchen', 'workspace', 'gym', 'ac', 'mountain-view'],
    location: {
      city: 'Salt Lake City',
      region: 'UT',
      regionName: 'Utah',
      country: 'United States',
      neighborhood: 'Warehouse District',
      lat: 40.7608,
      lng: -111.891,
    },
    facts: [
          "Historic converted warehouse loft in downtown Salt Lake City with exposed brick walls",
          "Soaring 14-foot timber ceilings and oversized windows framing Wasatch mountain views",
          "One bedroom, two beds, and one and a half bathrooms accommodating up to 3 guests",
          "Full modern kitchen, dedicated workspace desk, and building fitness center",
          "Equipped with central climate control air conditioning and high-speed Wi-Fi"
    ],
    summary:
      'Historic exposed-brick warehouse loft with soaring 16-foot ceilings and Wasatch mountain views.',
    description:
      'Experience authentic warehouse architecture converted into a contemporary creative retreat. Features original timber support beams, steel-framed industrial factory windows, polished concrete, and snowcapped mountain views.',
    spaceOverview:
      'Elevated mezzanine sleeping loft, open concept kitchen with stainless steel appliances, dedicated workspace with dual monitors, and in-building fitness facility.',
    neighborhood:
      'Downtown Salt Lake City warehouse district, 5-minute walk to TRAX light rail, craft cideries, and 35 minutes to world-class ski resorts in Little Cottonwood Canyon.',
    vibes: ['industrial', 'loft', 'mountain view', 'walkable', 'creative', 'pet friendly'],
    hostId: 'host-david-kim',
    cancellationPolicyId: 'policy-cancellation-flexible',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1554995207-c18c203602cb'),
    galleryUrls: [
      {
        url: photo('1567496898669-ee935f5f647a'),
        caption: 'Floor-to-ceiling windows with Wasatch Mountain view',
      },
      {
        url: photo('1556910103-1c02745aae4d'),
        caption: 'Chef-grade kitchen with matte black steel fixtures',
      },
      {
        url: photo('1505691938895-1758d7feb511'),
        caption: 'Mezzanine bedroom with reclaimed factory brick',
      },
    ],
    rating: 4.8,
    reviewCount: 91,
    featured: false,
  },

  // 10. Modern Townhouse in RiNo (Screenshot 1 item)
  {
    _id: 'property-modern-townhouse-rino-denver',
    title: 'Modern Townhouse in RiNo',
    slug: 'modern-townhouse-rino-denver',
    type: 'city',
    pricePerNight: 205,
    cleaningFee: 80,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 6,
    bedrooms: 2,
    beds: 3,
    baths: 2.5,
    petsAllowed: true,
    amenities: ['wifi', 'kitchen', 'workspace', 'skyline-view', 'mountain-view', 'balcony', 'ac'],
    location: {
      city: 'Denver',
      region: 'CO',
      regionName: 'Colorado',
      country: 'United States',
      neighborhood: 'River North Arts District (RiNo)',
      lat: 39.7686,
      lng: -104.9818,
    },
    facts: [
          "Three-level contemporary townhouse in Denver River North Art District (RiNo)",
          "Private rooftop deck with fire feature and views of both the Denver skyline and Rocky Mountains",
          "Two ensuite bedrooms and two and a half bathrooms accommodating up to 4 guests",
          "Chef kitchen with gas range and dedicated home office workspace",
          "Private two-car garage and dual-zone air conditioning"
    ],
    summary:
      'Tri-level designer rowhome with private rooftop deck framing Rockies and Denver city skyline.',
    description:
      'Sleek contemporary townhouse situated in Denver’s most energetic creative enclave. Features custom steel staircases, wide-plank oak floors, and a private top-floor deck ideal for sunset craft beers.',
    spaceOverview:
      'Three levels of modern design including two ensuite bedrooms, radiant heated bath floors, open chef kitchen, and private rooftop terrace with fire table.',
    neighborhood:
      'Directly in RiNo surrounded by street art murals, artisan coffee roasters, food halls (Denver Central Market), and independent breweries.',
    vibes: ['walkable', 'city skyline', 'rooftop', 'creative', 'modern', 'pet friendly'],
    hostId: 'host-david-kim',
    cancellationPolicyId: 'policy-cancellation-moderate',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1513694203232-719a280e022f'),
    galleryUrls: [
      {
        url: photo('1524758631624-e2822e304c36'),
        caption: 'Open-concept living room with curated local artwork',
      },
      {
        url: photo('1617806118233-18e1de247200'),
        caption: 'Executive corner office with dual display workstation',
      },
      {
        url: photo('1618219908412-a29a1bb7b86e'),
        caption: 'Private rooftop deck with Denver skyline view',
      },
    ],
    rating: 4.9,
    reviewCount: 114,
    featured: true,
  },

  // 11. Modern Townhouse in the Pearl (Screenshot 1 item)
  {
    _id: 'property-modern-townhouse-pearl-portland',
    title: 'Modern Townhouse in the Pearl',
    slug: 'modern-townhouse-pearl-portland',
    type: 'city',
    pricePerNight: 158,
    cleaningFee: 70,
    serviceFeePercent: 11,
    minNights: 2,
    weeklyDiscountPercent: 12,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 2,
    petsAllowed: true,
    amenities: ['wifi', 'kitchen', 'workspace', 'patio', 'ac'],
    location: {
      city: 'Portland',
      region: 'OR',
      regionName: 'Oregon',
      country: 'United States',
      neighborhood: 'Pearl District',
      lat: 45.5284,
      lng: -122.6826,
    },
    facts: [
          "Modern multi-story townhouse located in Portland Pearl District",
          "Private covered balcony overlooking quiet tree-lined pedestrian streets",
          "Two quiet bedrooms and two full bathrooms accommodating up to 4 guests",
          "Custom European-style kitchen, dedicated desk workspace, and in-unit washer",
          "Air conditioning and high-speed Wi-Fi throughout"
    ],
    summary:
      'Warm Scandinavian townhouse with leafy interior courtyard in Portland’s vibrant Pearl District.',
    description:
      'Blends warm minimalist birch interiors with industrial loft accents. Enjoy morning coffee in your private courtyard and stroll to world-renowned bookstores, artisanal coffee roasteries, and art galleries.',
    spaceOverview:
      'Two sun-drenched bedrooms with organic cotton linens, deep soaking tub, fully equipped chef kitchen, and high-speed fiber internet.',
    neighborhood:
      'Premier Pearl District location, 3 blocks to Powell’s City of Books, Jamison Square fountain, and Portland streetcar lines.',
    vibes: ['walkable', 'scandinavian', 'peaceful', 'artsy', 'pet friendly', 'cozy'],
    hostId: 'host-chloe-bennett',
    cancellationPolicyId: 'policy-cancellation-flexible',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1504615755583-2916b52192a3'),
    galleryUrls: [
      {
        url: photo('1616046229478-9901c5536a45'),
        caption: 'Nordic living room with wood-burning Swedish hearth',
      },
      {
        url: photo('1507089947368-19c1da9775ae'),
        caption: 'Designer marble kitchen with custom walnut cabinets',
      },
      {
        url: photo('1505691723518-36a5ac3be353'),
        caption: 'Primary suite with private courtyard balcony',
      },
    ],
    rating: 4.8,
    reviewCount: 97,
    featured: false,
  },

  // 12. Light-Filled Condo with City Views (Screenshot 1 item)
  {
    _id: 'property-light-filled-condo-seattle',
    title: 'Light-Filled Condo with City Views',
    slug: 'light-filled-condo-seattle',
    type: 'city',
    pricePerNight: 176,
    cleaningFee: 75,
    serviceFeePercent: 12,
    minNights: 1,
    weeklyDiscountPercent: 10,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 2,
    petsAllowed: false,
    amenities: ['wifi', 'kitchen', 'workspace', 'skyline-view', 'gym', 'ac', 'balcony'],
    location: {
      city: 'Seattle',
      region: 'WA',
      regionName: 'Washington',
      country: 'United States',
      neighborhood: 'Belltown',
      lat: 47.6148,
      lng: -122.3458,
    },
    facts: [
          "High-rise corner condominium located in downtown Seattle Belltown neighborhood",
          "Private balcony with sweeping views of Elliott Bay and Puget Sound ferry traffic",
          "One bedroom with plush king bed and one bathroom for up to 2 guests",
          "Streamlined kitchen with premium appliances and dedicated work desk",
          "Access to residential fitness center, central AC, and high-speed Wi-Fi"
    ],
    summary: 'High-floor urban sanctuary with panoramic Puget Sound and Space Needle views.',
    description:
      'Gaze out over ferry boats crossing Elliott Bay and the illuminated Space Needle through walls of floor-to-ceiling glass in this sophisticated Belltown condo.',
    spaceOverview:
      'Designer open layout with custom Italian cabinetry, gas range, spa bathrooms with rain shower, corner balcony, and in-building wellness gym.',
    neighborhood:
      'Prime Belltown location just steps from Olympic Sculpture Park, Pike Place Market, and Seattle’s top dining spots.',
    vibes: ['skyline view', 'water view', 'modern', 'walkable', 'luxury'],
    hostId: 'host-chloe-bennett',
    cancellationPolicyId: 'policy-cancellation-moderate',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-check-in-keyless', 'policy-damage-security'],
    mainImageUrl: photo('1545324418-cc1a3fa10c00'),
    galleryUrls: [
      {
        url: photo('1582407947304-fd86f028f716'),
        caption: 'Glass dining corner overlooking Puget Sound ferries',
      },
      {
        url: photo('1512918728675-ed5a9ecdebfd'),
        caption: 'Living room with panoramic Olympic Mountain sunsets',
      },
      {
        url: photo('1584622650111-993a426fbf0a'),
        caption: 'Spa bathroom with rain shower and soaking tub',
      },
    ],
    rating: 4.9,
    reviewCount: 138,
    featured: true,
  },

  // 13. Modern Cabin with Hot Tub (Lake Arrowhead)
  {
    _id: 'property-modern-cabin-lake-arrowhead',
    title: 'Modern Cabin with Hot Tub',
    slug: 'modern-cabin-lake-arrowhead',
    type: 'cabin',
    pricePerNight: 289,
    cleaningFee: 95,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 6,
    bedrooms: 3,
    beds: 4,
    baths: 2,
    petsAllowed: true,
    amenities: ['hot-tub', 'fireplace', 'wifi', 'kitchen', 'mountain-view', 'deck', 'wood-stove'],
    location: {
      city: 'Lake Arrowhead',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      neighborhood: 'Arrowhead Woods',
      lat: 34.2439,
      lng: -117.1864,
    },
    facts: [
          "Custom mountain cabin set among mature pine and cedar trees in Lake Arrowhead",
          "Outdoor cedar hot tub on a private multi-level forest viewing deck",
          "Floor-to-ceiling stone wood-burning fireplace and open-beam timber ceilings",
          "Three bedrooms and two bathrooms accommodating up to 6 guests and up to two pets",
          "Propane BBQ grill on the deck and fully stocked family kitchen"
    ],
    summary: 'Glass-walled cedar cabin with sunken hot tub nestled in towering pine woods.',
    description:
      'Glass-walled cabin under tall pines with a cedar hot tub, a fire pit on the deck, and a quiet road with no through traffic in the San Bernardino National Forest.',
    spaceOverview:
      'Double-height vaulted cedar ceilings, wood-burning hearth, chef kitchen with gas range, and a sunken cedar hot tub embedded into the private pine deck.',
    neighborhood:
      'Tucked away on a quiet residential cul-de-sac just 7 minutes from Lake Arrowhead Village shops and alpine hiking trails.',
    vibes: ['quiet', 'cozy', 'secluded', 'forest', 'hot tub', 'pet friendly'],
    hostId: 'host-sarah-jenkins',
    cancellationPolicyId: 'policy-cancellation-flexible',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1568605114967-8130f3a36994'),
    galleryUrls: [
      {
        url: photo('1590490360182-c33d57733427'),
        caption: 'Cedar hot tub deck immersed in pine trees',
      },
      {
        url: photo('1510312305653-8ed496efae75'),
        caption: 'River rock fireplace in vaulted double-height living room',
      },
      {
        url: photo('1507038732509-8b1a9623223a'),
        caption: 'Back cantilevered deck with barbecue and mountain view',
      },
    ],
    rating: 4.9,
    reviewCount: 342,
    featured: true,
  },

  // 14. Log Cabin by Big Bear Lake
  {
    _id: 'property-log-cabin-big-bear-lake',
    title: 'Log Cabin by Big Bear Lake',
    slug: 'log-cabin-big-bear-lake',
    type: 'cabin',
    pricePerNight: 198,
    cleaningFee: 85,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 4,
    bedrooms: 2,
    beds: 3,
    baths: 1.5,
    petsAllowed: true,
    amenities: ['hot-tub', 'wood-stove', 'wifi', 'kitchen', 'deck', 'ski-storage'],
    location: {
      city: 'Big Bear Lake',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      lat: 34.2439,
      lng: -116.9114,
    },
    facts: [
          "Authentic hand-hewn log cabin situated near Big Bear Lake",
          "Private outdoor hot tub nestled on a secluded forested rear deck",
          "River rock wood-burning fireplace and cozy timber living room",
          "Three bedrooms, four beds, and two bathrooms accommodating up to 6 guests and pets",
          "Dedicated ski and snowboard storage room and outdoor BBQ grill"
    ],
    summary:
      'Authentic hand-hewn timber lodge near the lake with outdoor hot tub and stone hearth.',
    description:
      'Authentic hand-hewn log cabin nestled in pine woods near Big Bear Lake, equipped with a sunken hot tub and stone hearth for crisp alpine nights.',
    spaceOverview:
      'Handcrafted pine log construction, cozy reading loft, fully equipped country kitchen, and private rear deck with hot tub.',
    neighborhood:
      'Short 5-minute walk to lake access trails and 10 minutes to Bear Mountain Ski Resort.',
    vibes: ['rustic', 'quiet', 'cozy', 'mountain', 'forest', 'pet friendly'],
    hostId: 'host-sarah-jenkins',
    cancellationPolicyId: 'policy-cancellation-flexible',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1449158743715-0a90ebb6d2d8'),
    galleryUrls: [
      {
        url: photo('1515542622106-78bda8ba0e5b'),
        caption: 'Hand-hewn log interior with cast iron stove',
      },
      {
        url: photo('1470770841072-f978cf4d019e'),
        caption: 'Private lake dock and kayak launch at sunset',
      },
    ],
    rating: 4.8,
    reviewCount: 274,
    featured: false,
  },

  // 15. Beachfront Bungalow (Laguna Beach)
  {
    _id: 'property-beachfront-bungalow-laguna',
    title: 'Beachfront Bungalow',
    slug: 'beachfront-bungalow-laguna',
    type: 'beach',
    pricePerNight: 345,
    cleaningFee: 110,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 2,
    petsAllowed: false,
    amenities: ['ocean-view', 'wifi', 'deck', 'kitchen', 'private-beach', 'patio'],
    location: {
      city: 'Laguna Beach',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      lat: 33.5427,
      lng: -117.7854,
    },
    facts: [
          "Oceanfront coastal bungalow positioned right above the sand in Laguna Beach",
          "Private wooden staircase offering direct access to the beach and tide pools",
          "Sun deck with lounge chairs and panoramic Pacific Ocean sunset views",
          "Two light-filled bedrooms and two full bathrooms accommodating up to 4 guests",
          "Open coastal kitchen and split-system air conditioning"
    ],
    summary: 'Step directly onto the sand from this sunlit vintage beach bungalow in Laguna.',
    description:
      'Direct beach access bungalow perched right on the sands of Laguna Beach with unobstructed Pacific sunset views and a private wrap-around deck.',
    spaceOverview:
      'Breezy open floor plan with hardwood floors, coastal white linens, outdoor shower, and sliding glass doors facing the breaking surf.',
    neighborhood:
      'Walking distance to downtown Laguna Beach art galleries, tide pools, and seaside cafes.',
    vibes: ['oceanfront', 'beach', 'sunset', 'romantic', 'coastal'],
    hostId: 'host-marcus-thorne',
    cancellationPolicyId: 'policy-cancellation-moderate',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-check-in-keyless'],
    mainImageUrl: photo('1499793983690-e29da59ef1c2'),
    galleryUrls: [
      {
        url: photo('1544984243-ec57ea16fe25'),
        caption: 'Direct private boardwalk steps onto the sandy cove',
      },
      {
        url: photo('1506157786151-b8491531f063'),
        caption: 'Sun deck with Adirondack chairs and surf views',
      },
    ],
    rating: 4.9,
    reviewCount: 189,
    featured: true,
  },

  // 16. A-Frame in the Redwoods (Monte Rio)
  {
    _id: 'property-a-frame-redwoods-monte-rio',
    title: 'A-Frame in the Redwoods',
    slug: 'a-frame-redwoods-monte-rio',
    type: 'cabin',
    pricePerNight: 236,
    cleaningFee: 90,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 1,
    petsAllowed: true,
    amenities: ['hot-tub', 'wood-stove', 'wifi', 'kitchen', 'deck'],
    location: {
      city: 'Monte Rio',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      lat: 38.4705,
      lng: -123.0139,
    },
    facts: [
          "Iconic geometric mid-century A-frame surrounded by ancient redwood trees in Monte Rio",
          "Outdoor cedar soaking tub on the elevated redwood viewing deck",
          "Cast-iron wood-burning stove and soaring timber-framed glass prow",
          "Two sleeping bedrooms and one bathroom for up to 4 guests and well-behaved pets",
          "Full kitchen and peaceful woodland setting near the Russian River"
    ],
    summary:
      'Striking geometric A-frame surrounded by ancient redwood trees and Russian River fog.',
    description:
      'Iconic mid-century A-frame surrounded by old-growth redwoods near the Russian River with an outdoor cedar soaking tub and wood-burning stove.',
    spaceOverview:
      'Triangular architectural windows, sleeping loft under the pitched roof, redwood deck with barbecue, and tranquil forest trails starting right at the back door.',
    neighborhood:
      'Deep in Sonoma County redwood forests, minutes from Sonoma Coast beaches and Russian River wine country.',
    vibes: ['a-frame', 'redwoods', 'secluded', 'forest', 'hot tub', 'cozy', 'pet friendly'],
    hostId: 'host-maya-lin',
    cancellationPolicyId: 'policy-cancellation-flexible',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1510798831971-661eb04b3739'),
    galleryUrls: [
      {
        url: photo('1448630360428-65456885c650'),
        caption: 'Cathedral window sleeping loft under the pitched roof',
      },
      {
        url: photo('1469854523086-cc02fe5d8800'),
        caption: 'Old-growth redwood path leading to outdoor cedar bath',
      },
    ],
    rating: 4.9,
    reviewCount: 310,
    featured: true,
  },

  // 17. Architectural Hillside Villa (Palm Springs)
  {
    _id: 'property-architectural-hillside-villa',
    title: 'Architectural Hillside Villa',
    slug: 'architectural-hillside-villa',
    type: 'villa',
    pricePerNight: 420,
    cleaningFee: 140,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    baths: 3,
    petsAllowed: false,
    amenities: ['pool', 'hot-tub', 'mountain-view', 'wifi', 'kitchen', 'ac', 'deck'],
    location: {
      city: 'Palm Springs',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      lat: 33.8303,
      lng: -116.5453,
    },
    facts: [
          "Cantilevered architectural residence set in the Palm Springs hillside rocks",
          "Heated swimming pool and elevated spa with 180-degree Coachella Valley views",
          "Linear gas fire pit terrace and covered outdoor entertaining deck",
          "Four ensuite bedrooms and four full bathrooms accommodating up to 8 guests",
          "Custom chef kitchen and multi-zone central air conditioning"
    ],
    summary: 'Striking desert contemporary villa set against mountain rocks with infinity pool.',
    description:
      'Mid-century inspired architectural compound built into the rocky San Jacinto mountainside with glass walls, private saltwater pool, and desert views.',
    spaceOverview:
      'Seamless indoor-outdoor living, polished concrete floors, custom Walnut kitchen cabinetry, and shaded cabana seating.',
    neighborhood:
      'Prestigious Palm Springs hillside enclave minutes from design showrooms and tennis clubs.',
    vibes: ['luxury', 'mid-century', 'mountain view', 'pool', 'desert'],
    hostId: 'host-marcus-reed',
    cancellationPolicyId: 'policy-cancellation-strict',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-check-in-keyless', 'policy-damage-security'],
    mainImageUrl: photo('1570129477492-45c003edd2be'),
    galleryUrls: [
      {
        url: photo('1512915922686-57c11dde9b6b'),
        caption: 'Floor-to-ceiling glass pavilion overlooking valley lights',
      },
      {
        url: photo('1600585152220-90363fe7e115'),
        caption: 'Sunken conversation lounge and infinity water feature',
      },
    ],
    rating: 4.8,
    reviewCount: 142,
    featured: false,
  },

  // 18. Downtown Arts District Loft (Los Angeles)
  {
    _id: 'property-downtown-arts-district-loft',
    title: 'Downtown Arts District Loft',
    slug: 'downtown-arts-district-loft',
    type: 'city',
    pricePerNight: 195,
    cleaningFee: 75,
    serviceFeePercent: 12,
    minNights: 1,
    weeklyDiscountPercent: 15,
    maxGuests: 3,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    petsAllowed: true,
    amenities: ['wifi', 'kitchen', 'workspace', 'gym', 'ac'],
    location: {
      city: 'Los Angeles',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      neighborhood: 'Arts District',
      lat: 34.0407,
      lng: -118.2337,
    },
    facts: [
          "Spacious industrial brick loft located in the Downtown Los Angeles Arts District",
          "Oversized factory-style warehouse windows framing views of the downtown skyline",
          "One bedroom suite with king bed and one and a half bathrooms for up to 2 guests",
          "Custom stainless steel island kitchen and dedicated creative work desk",
          "Building rooftop deck, resident gym, and central air conditioning"
    ],
    summary:
      'Concrete and timber artist loft in the heart of DTLA’s premier dining and gallery district.',
    description:
      'Soaring ceilings and industrial heritage meet warm mid-century modern design in the heart of LA’s vibrant Arts District.',
    spaceOverview:
      'Polished concrete floors, steel casement windows, custom walnut work desk with high-speed wifi, and full kitchen.',
    neighborhood:
      'Walkable to Michelin-rated restaurants (Bavel, Bestia), artisan coffee roasteries, and art galleries.',
    vibes: ['urban', 'industrial', 'walkable', 'creative', 'modern', 'pet friendly'],
    hostId: 'host-david-kim',
    cancellationPolicyId: 'policy-cancellation-flexible',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1560448204-e02f11c3d0e2'),
    galleryUrls: [
      {
        url: photo('1586023492125-27b2c045efd7'),
        caption: 'Polished concrete living space with industrial steel windows',
      },
      {
        url: photo('1631679706909-1844bbd07221'),
        caption: 'Open chef kitchen with poured concrete island',
      },
    ],
    rating: 4.7,
    reviewCount: 95,
    featured: false,
  },

  // 19. Coastal Cliffside Haven (Carmel-by-the-Sea)
  {
    _id: 'property-coastal-cliffside-haven',
    title: 'Coastal Cliffside Haven',
    slug: 'coastal-cliffside-haven',
    type: 'beach',
    pricePerNight: 480,
    cleaningFee: 140,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    baths: 3,
    petsAllowed: true,
    amenities: ['ocean-view', 'fireplace', 'wifi', 'kitchen', 'deck', 'patio'],
    location: {
      city: 'Carmel-by-the-Sea',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      lat: 36.5552,
      lng: -121.9233,
    },
    facts: [
          "Custom stone and redwood residence overlooking the rocky Carmel-by-the-Sea coastline",
          "Direct unobstructed views of the Pacific Ocean and Point Lobos headlands",
          "Handcrafted stone wood-burning fireplace in the ocean-facing living room",
          "Three ocean-view bedrooms and three full bathrooms accommodating up to 6 guests",
          "Expansive weathered-cypress outdoor deck and fully appointed gourmet kitchen"
    ],
    summary:
      'Dramatic clifftop residence overlooking crashing waves of Carmel Bay with cypress trees.',
    description:
      'Perched on the granite bluffs of Carmel, this stone and redwood home captures panoramic ocean horizons and sunsets through expansive floor-to-ceiling glass.',
    spaceOverview:
      'Heated oceanfront flagstone patio, wood-burning stone fireplace, modern Viking kitchen, and three ensuite bedrooms.',
    neighborhood:
      'Quiet coastal avenue 15 minutes walk from Carmel Village art galleries and white sand Carmel Beach.',
    vibes: ['ocean view', 'romantic', 'clifftop', 'peaceful', 'cozy', 'pet friendly'],
    hostId: 'host-elena-rostova',
    cancellationPolicyId: 'policy-cancellation-moderate',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1507525428034-b723cf961d3e'),
    galleryUrls: [
      {
        url: photo('1544551763-46a013bb70d5'),
        caption: 'Weathered cedar ocean balcony suspended above rocky surf',
      },
      {
        url: photo('1488646953014-85cb44e25828'),
        caption: 'Panoramic coastal bluff views extending to Big Sur',
      },
    ],
    rating: 4.9,
    reviewCount: 165,
    featured: true,
  },

  // 20. High Sierra Pine Lodge (Lake Tahoe)
  {
    _id: 'property-high-sierra-pine-lodge',
    title: 'High Sierra Pine Lodge',
    slug: 'high-sierra-pine-lodge',
    type: 'cabin',
    pricePerNight: 310,
    cleaningFee: 110,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 8,
    bedrooms: 4,
    beds: 5,
    baths: 3,
    petsAllowed: true,
    amenities: [
      'hot-tub',
      'fireplace',
      'wifi',
      'kitchen',
      'mountain-view',
      'deck',
      'sauna',
      'ski-storage',
    ],
    location: {
      city: 'Lake Tahoe',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      lat: 39.0968,
      lng: -120.0324,
    },
    facts: [
          "Custom timber-frame mountain lodge surrounded by towering Jeffrey pines in Lake Tahoe",
          "Eight-person outdoor hot tub situated on a heated flagstone forest terrace",
          "Grand two-story stone wood-burning fireplace in the vaulted great room",
          "Four bedrooms, five beds, and three and a half baths for up to 8 guests and pets",
          "Heated ski and gear storage room and outdoor propane BBQ grill"
    ],
    summary:
      'Spacious alpine timber lodge with outdoor hot tub, cedar sauna, and mountain forest setting.',
    description:
      'Custom mountain chalet built with Douglas fir timbers, featuring a barrel sauna, sunken hot tub, and two-story river rock fireplace.',
    spaceOverview:
      'Large open family room, bunk room for kids, ski tuning room, expansive wraparound deck, and chef kitchen.',
    neighborhood:
      'West Shore of Lake Tahoe, 10 minutes to Homewood Mountain Resort and secluded lake coves.',
    vibes: ['alpine', 'sauna', 'hot tub', 'mountain view', 'family', 'pet friendly'],
    hostId: 'host-liam-oconnor',
    cancellationPolicyId: 'policy-cancellation-flexible',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1542314831-068cd1dbfeeb'),
    galleryUrls: [
      {
        url: photo('1476514525535-07fb3b4ae5f1'),
        caption: 'Vaulted timber beam great room with granite hearth',
      },
      {
        url: photo('1506905925346-21bda4d32df4'),
        caption: 'Snow-capped Sierra ridge view from private hot tub deck',
      },
    ],
    rating: 4.9,
    reviewCount: 220,
    featured: true,
  },

  // 21. Napa Valley Vineyard Estate (St. Helena)
  {
    _id: 'property-napa-valley-vineyard-estate',
    title: 'Napa Valley Vineyard Estate',
    slug: 'napa-valley-vineyard-estate',
    type: 'villa',
    pricePerNight: 780,
    cleaningFee: 200,
    serviceFeePercent: 12,
    minNights: 3,
    weeklyDiscountPercent: 12,
    maxGuests: 8,
    bedrooms: 4,
    beds: 4,
    baths: 4.5,
    petsAllowed: false,
    amenities: ['pool', 'hot-tub', 'vineyard-view', 'wifi', 'kitchen', 'fireplace', 'deck'],
    location: {
      city: 'St. Helena',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      lat: 38.5052,
      lng: -122.4704,
    },
    facts: [
          "Private wine estate surrounded by Cabernet Sauvignon vineyards in St. Helena",
          "Heated 40-foot swimming pool and spa overlooking Napa Valley vineyard rows",
          "Four ensuite king bedrooms and four and a half bathrooms for up to 8 guests",
          "Outdoor covered dining patio with wood-burning fireplace and summer kitchen",
          "Level 2 EV charging station and chef-grade indoor kitchen"
    ],
    summary:
      'Luxurious private estate surrounded by Cabernet vines with lap pool and outdoor kitchen.',
    description:
      'Set amid private vineyard rows in the heart of Napa Valley, this modern farmhouse estate combines wine country elegance with an infinity pool and olive grove.',
    spaceOverview:
      'Four private master suites with vineyard patios, outdoor pizza oven and kitchen, wine cellar, and open dining terrace.',
    neighborhood:
      'Minutes from world-class wineries, Meadowood resort, and St. Helena downtown boutique dining.',
    vibes: ['vineyard', 'luxury', 'wine country', 'pool', 'peaceful'],
    hostId: 'host-elena-rostova',
    cancellationPolicyId: 'policy-cancellation-strict',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-check-in-keyless', 'policy-damage-security'],
    mainImageUrl: photo('1600596542815-ffad4c1539a9'),
    galleryUrls: [
      {
        url: photo('1560185009-dddeb820c7b7'),
        caption: 'Rustic stone dining terrace overlooking Cabernet vines',
      },
      {
        url: photo('1600566752355-35792bedcfea'),
        caption: 'Lush olive grove courtyard and lap pool',
      },
    ],
    rating: 5.0,
    reviewCount: 88,
    featured: true,
  },

  // 22. Pacific Heights Victorian Suite (San Francisco)
  {
    _id: 'property-pacific-heights-victorian-suite',
    title: 'Pacific Heights Victorian Suite',
    slug: 'pacific-heights-victorian-suite',
    type: 'city',
    pricePerNight: 260,
    cleaningFee: 85,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 1.5,
    petsAllowed: false,
    amenities: ['wifi', 'kitchen', 'workspace', 'bay-view', 'fireplace'],
    location: {
      city: 'San Francisco',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      neighborhood: 'Pacific Heights',
      lat: 37.7925,
      lng: -122.4382,
    },
    facts: [
          "Restored Victorian residence in prestigious Pacific Heights in San Francisco",
          "Bay windows offering elevated views across San Francisco Bay and Alcatraz",
          "Two tranquil bedrooms and two full marble bathrooms accommodating up to 4 guests",
          "Historic gas fireplace, high coved plaster ceilings, and dedicated work desk",
          "Modernized gourmet kitchen with high-end gas range and high-speed Wi-Fi"
    ],
    summary:
      'Grand 1890s Victorian flat with bay views, ornate plaster moldings, and marble fireplace.',
    description:
      'Historic San Francisco grandeur preserved with modern luxury fixtures. Enjoy Bay and Golden Gate views from the elegant parlor bay windows.',
    spaceOverview:
      'High 12-foot ceilings, period molding, gourmet gas kitchen, marble bathroom, and light-filled study.',
    neighborhood:
      'Quiet tree-lined residential street two blocks from Fillmore Street boutiques and Alta Plaza Park.',
    vibes: ['historic', 'bay view', 'walkable', 'elegant', 'city'],
    hostId: 'host-sarah-jenkins',
    cancellationPolicyId: 'policy-cancellation-moderate',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-check-in-keyless'],
    mainImageUrl: photo('1522708323590-d24dbb6b0267'),
    galleryUrls: [
      {
        url: photo('1616594039964-ae9021a400a0'),
        caption: 'Bay window parlor with carved marble fireplace',
      },
      {
        url: photo('1493663284031-b7e3aefcae8e'),
        caption: 'Sunlit library and morning coffee parlor',
      },
    ],
    rating: 4.8,
    reviewCount: 140,
    featured: false,
  },

  // 23. Sedona Red Rock Sanctuary (Sedona)
  {
    _id: 'property-sedona-red-rock-sanctuary',
    title: 'Sedona Red Rock Sanctuary',
    slug: 'sedona-red-rock-sanctuary',
    type: 'cabin',
    pricePerNight: 510,
    cleaningFee: 140,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    baths: 2.5,
    petsAllowed: true,
    amenities: ['hot-tub', 'fireplace', 'mountain-view', 'wifi', 'kitchen', 'deck', 'patio'],
    location: {
      city: 'Sedona',
      region: 'AZ',
      regionName: 'Arizona',
      country: 'United States',
      lat: 34.8697,
      lng: -111.761,
    },
    facts: [
          "Handcrafted modern desert cabin framing direct views of Sedona Cathedral Rock",
          "Private stargazing hot tub and circular flagstone fire pit patio",
          "Three bedrooms and two and a half bathrooms accommodating up to 6 guests and pets",
          "Redwood viewing deck oriented toward sunset red rock canyon views",
          "Central air conditioning and open-plan kitchen with breakfast bar"
    ],
    summary: 'Adobe retreat framing Cathedral Rock with stargazing deck and cedar hot tub.',
    description:
      'Nestled against Sedona’s red rock canyon walls, this contemporary adobe sanctuary offers front-row views of Cathedral Rock and night skies full of stars.',
    spaceOverview:
      'Kiva fireplaces, flagstone patios, hot tub with red rock backdrop, outdoor meditation patio, and modern southwest interior styling.',
    neighborhood:
      'Immediate access to world-famous hiking trails and vortex locations, 10 minutes to Uptown Sedona galleries.',
    vibes: ['red rock', 'stargazing', 'spiritual', 'hot tub', 'mountain view', 'pet friendly'],
    hostId: 'host-amara-okafor',
    cancellationPolicyId: 'policy-cancellation-moderate',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1518780664697-55e3ad937233'),
    galleryUrls: [
      {
        url: photo('1464822759023-fed622ff2c3b'),
        caption: 'Stargazing roof deck framing Cathedral Rock',
      },
      {
        url: photo('1520975916090-3105956dac38'),
        caption: 'Kiva fireplace with native piñon wood and meditation nook',
      },
    ],
    rating: 4.9,
    reviewCount: 178,
    featured: true,
  },

  // 24. Little Italy Sunlit Penthouse (San Diego)
  {
    _id: 'property-little-italy-sunlit-penthouse',
    title: 'Little Italy Sunlit Penthouse',
    slug: 'little-italy-sunlit-penthouse',
    type: 'city',
    pricePerNight: 220,
    cleaningFee: 80,
    serviceFeePercent: 12,
    minNights: 1,
    weeklyDiscountPercent: 12,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 2,
    petsAllowed: true,
    amenities: ['wifi', 'kitchen', 'workspace', 'bay-view', 'balcony', 'ac'],
    location: {
      city: 'San Diego',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      neighborhood: 'Little Italy',
      lat: 32.7238,
      lng: -117.1687,
    },
    facts: [
          "Top-floor penthouse residence in San Diego vibrant Little Italy neighborhood",
          "Wraparound private terrace balcony overlooking San Diego Bay and harbor sailings",
          "Two bedroom suites and two full designer bathrooms for up to 4 guests",
          "Gourmet kitchen with island seating and dedicated sunlit workspace desk",
          "Building fitness gym, central air conditioning, and secure garage parking"
    ],
    summary:
      'Modern top-floor corner penthouse with sweeping San Diego Bay views and sunset terrace.',
    description:
      'Flooded with Southern California sun, this designer penthouse offers high ceilings, private balcony over the harbor, and an unbeatable walkable location.',
    spaceOverview:
      'Corner layout with floor-to-ceiling windows, modern chef kitchen, king master suite, and private harbor-view patio.',
    neighborhood:
      'Heart of Little Italy, surrounded by San Diego’s top trattorias, bakeries, and the famous Saturday Mercato.',
    vibes: ['walkable', 'bay view', 'sunny', 'penthouse', 'pet friendly'],
    hostId: 'host-marcus-thorne',
    cancellationPolicyId: 'policy-cancellation-flexible',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1536376072261-38c75010e6c9'),
    galleryUrls: [
      {
        url: photo('1566665797739-1674de7a421a'),
        caption: 'Corner terrace with San Diego Bay and harbor views',
      },
      {
        url: photo('1505692952047-1a78307da8f2'),
        caption: 'Sunlit open kitchen with bar seating and espresso setup',
      },
    ],
    rating: 4.8,
    reviewCount: 132,
    featured: false,
  },

  // 25. Malibu Oceanfront Glass House (Malibu)
  {
    _id: 'property-malibu-oceanfront-glass-house',
    title: 'Malibu Oceanfront Glass House',
    slug: 'malibu-oceanfront-glass-house',
    type: 'beach',
    pricePerNight: 690,
    cleaningFee: 190,
    serviceFeePercent: 12,
    minNights: 3,
    weeklyDiscountPercent: 10,
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    baths: 3.5,
    petsAllowed: false,
    amenities: ['ocean-view', 'wifi', 'kitchen', 'private-beach', 'deck', 'fireplace', 'ac'],
    location: {
      city: 'Malibu',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      lat: 34.0259,
      lng: -118.7798,
    },
    facts: [
          "Architectural glass and steel beach house perched directly over the Malibu surf",
          "Private cantilevered oceanfront deck with sunken cedar hot tub over the water",
          "Private stairs descending directly to the sandy beach below",
          "Three ensuite bedrooms with ocean views and three full baths for up to 6 guests",
          "Stainless steel chef kitchen, central AC, and high-speed Wi-Fi"
    ],
    summary:
      'Cantilevered directly over the Pacific waves with private stairs down to sandy tide pools.',
    description:
      'Built right on the water’s edge in Malibu, this glass pavilion allows you to watch whales and dolphins directly from your living room sofa.',
    spaceOverview:
      'Over-water cantilevered deck, fireplace facing the breakers, designer kitchen, and three ensuite oceanfront bedrooms.',
    neighborhood:
      'Secluded Malibu ocean road, 10 minutes to Malibu Country Mart and seafood restaurants.',
    vibes: ['oceanfront', 'luxury', 'modern', 'dolphin watching', 'romantic'],
    hostId: 'host-marcus-thorne',
    cancellationPolicyId: 'policy-cancellation-strict',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-check-in-keyless', 'policy-damage-security'],
    mainImageUrl: photo('1515238152791-8216bfdf89a7'),
    galleryUrls: [
      {
        url: photo('1578683010236-d716f9a3f461'),
        caption: 'Disappearing glass walls opening straight to the Pacific',
      },
      {
        url: photo('1510414842594-a61c69b5ae57'),
        caption: 'Private tidepool staircase and sunset cocktail deck',
      },
    ],
    rating: 4.9,
    reviewCount: 156,
    featured: true,
  },

  // 26. Big Sur Redwood Sanctuary (Big Sur)
  {
    _id: 'property-big-sur-redwood-sanctuary',
    title: 'Big Sur Redwood Sanctuary',
    slug: 'big-sur-redwood-sanctuary',
    type: 'cabin',
    pricePerNight: 475,
    cleaningFee: 130,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 2,
    petsAllowed: false,
    amenities: ['hot-tub', 'wood-stove', 'ocean-view', 'wifi', 'kitchen', 'deck'],
    location: {
      city: 'Big Sur',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      lat: 36.2704,
      lng: -121.8081,
    },
    facts: [
          "Off-grid inspired luxury cabin nestled in a private coastal redwood grove in Big Sur",
          "Cedar soaking hot tub on the edge of the redwood forest with Pacific horizon glimpses",
          "Handmade river-stone wood fireplace and Douglas fir interior paneling",
          "Two bedrooms and two full bathrooms accommodating up to 4 guests",
          "Full kitchen and wide cantilevered timber deck"
    ],
    summary: 'Off-grid architectural treehouse perched high above the Pacific fogline in redwoods.',
    description:
      'Set among ancient giant coastal redwoods with ocean views, this hand-built cedar sanctuary is the ultimate peaceful getaway to disconnect and recharge.',
    spaceOverview:
      'Outdoor Japanese cedar soaking tub, wood-burning hearth, solar power with battery backup, and panoramic redwood decks.',
    neighborhood:
      'Private 10-acre ridge property in Big Sur, 15 minutes to Nepenthe restaurant and coastal trailheads.',
    vibes: ['off-grid', 'redwoods', 'ocean view', 'hot tub', 'peaceful', 'secluded'],
    hostId: 'host-maya-lin',
    cancellationPolicyId: 'policy-cancellation-strict',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-check-in-keyless'],
    mainImageUrl: photo('1449157291145-7efd050a4d0e'),
    galleryUrls: [
      {
        url: photo('1470071459604-3b5ec3a7fe05'),
        caption: 'Mossy forest pathway leading to secluded outdoor cedar tub',
      },
      {
        url: photo('1527030280862-64139fba04ca'),
        caption: 'Timber sanctuary interior framing redwood canopy views',
      },
    ],
    rating: 4.9,
    reviewCount: 204,
    featured: true,
  },

  // 27. Yosemite Valley Alpine Chalet (Oakhurst)
  {
    _id: 'property-yosemite-valley-alpine-chalet',
    title: 'Yosemite Valley Alpine Chalet',
    slug: 'yosemite-valley-alpine-chalet',
    type: 'cabin',
    pricePerNight: 295,
    cleaningFee: 100,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 6,
    bedrooms: 3,
    beds: 4,
    baths: 2,
    petsAllowed: true,
    amenities: ['hot-tub', 'fireplace', 'wifi', 'kitchen', 'mountain-view', 'deck'],
    location: {
      city: 'Oakhurst',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      lat: 37.328,
      lng: -119.6493,
    },
    facts: [
          "Custom cedar alpine chalet located in Oakhurst near Yosemite South Entrance",
          "Private outdoor hot tub set on a covered pine deck with Sierra foothill views",
          "River stone hearth wood-burning fireplace in the vaulted pine living room",
          "Three bedrooms, four beds, and two bathrooms accommodating up to 6 guests and pets",
          "Outdoor BBQ grill, high-speed Wi-Fi, and fully equipped family kitchen"
    ],
    summary: 'Pine timber cabin just outside Yosemite South Gate with mountain deck and hot tub.',
    description:
      'Warm mountain lodge crafted from natural timber and granite stone, just 20 minutes from the southern entrance of Yosemite National Park.',
    spaceOverview:
      'Outdoor hot tub under starry skies, river rock fireplace, fully equipped family kitchen, and comfortable pine bedrooms.',
    neighborhood:
      'Quiet mountain foothills near Bass Lake boating and Yosemite Mariposa Grove of Giant Sequoias.',
    vibes: ['national park', 'mountain view', 'hot tub', 'family', 'cozy', 'pet friendly'],
    hostId: 'host-liam-oconnor',
    cancellationPolicyId: 'policy-cancellation-flexible',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1587061949409-02df41d5e562'),
    galleryUrls: [
      {
        url: photo('1506744038136-46273834b3fb'),
        caption: 'Yosemite Valley vista with Half Dome and Merced River',
      },
      {
        url: photo('1718307776863-3571e8d6161c'),
        caption: 'Historic stone and timber mountain lodge in Yosemite',
      },
    ],
    rating: 4.8,
    reviewCount: 289,
    featured: false,
  },

  // 28. Mendocino Sea Cliff Retreat (Mendocino)
  {
    _id: 'property-mendocino-sea-cliff-retreat',
    title: 'Mendocino Sea Cliff Retreat',
    slug: 'mendocino-sea-cliff-retreat',
    type: 'beach',
    pricePerNight: 380,
    cleaningFee: 110,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 2,
    petsAllowed: true,
    amenities: ['ocean-view', 'hot-tub', 'fireplace', 'wifi', 'kitchen', 'deck'],
    location: {
      city: 'Mendocino',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      lat: 39.3077,
      lng: -123.7995,
    },
    facts: [
          "Weathered cedar coastal house perched on Mendocino headland ocean cliffs",
          "Outdoor ocean-view hot tub overlooking crashing Pacific whitewater waves",
          "Wood-burning fireplace in the great room with sweeping ocean vistas",
          "Two bedrooms and two full bathrooms for up to 4 guests and well-behaved dogs",
          "Private cliffside viewing deck and full kitchen with ocean panorama"
    ],
    summary:
      'Weathered cedar cottage overlooking dramatic coastal bluffs, sea stacks, and crashing surf.',
    description:
      'Watch waves crash against sea arches from the cliffside hot tub of this peaceful Mendocino coast sanctuary.',
    spaceOverview:
      'Wood-burning stove, soaking tub with ocean views, wrap-around deck, and private coastal trail.',
    neighborhood:
      'Moments from Mendocino Headlands State Park and historic Mendocino village bakeries.',
    vibes: ['wild coast', 'ocean view', 'hot tub', 'romantic', 'peaceful', 'pet friendly'],
    hostId: 'host-maya-lin',
    cancellationPolicyId: 'policy-cancellation-moderate',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1537726235470-8504e3beef77'),
    galleryUrls: [
      {
        url: photo('1584132967334-10e028bd69f7'),
        caption: 'Bluff-top cedar hot tub overlooking misty sea arches',
      },
      {
        url: photo('1473496169904-658ba7c44d8a'),
        caption: 'Coastal headland wildflower trail leading to secluded beach',
      },
    ],
    rating: 4.9,
    reviewCount: 198,
    featured: true,
  },

  // 29. Mammoth Lakes Ski Lodge (Mammoth Lakes)
  {
    _id: 'property-mammoth-lakes-ski-lodge',
    title: 'Mammoth Lakes Ski Lodge',
    slug: 'mammoth-lakes-ski-lodge',
    type: 'cabin',
    pricePerNight: 350,
    cleaningFee: 120,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 8,
    bedrooms: 3,
    beds: 5,
    baths: 2.5,
    petsAllowed: true,
    amenities: ['hot-tub', 'fireplace', 'sauna', 'wifi', 'kitchen', 'mountain-view', 'ski-storage'],
    location: {
      city: 'Mammoth Lakes',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      lat: 37.6485,
      lng: -118.9721,
    },
    facts: [
          "Timber and granite alpine chalet in Mammoth Lakes minutes from the ski lifts",
          "Private outdoor hot tub and indoor dry cedar sauna for post-ski recovery",
          "Two-story granite wood-burning fireplace in the vaulted timber living room",
          "Four bedrooms, five beds, and three bathrooms accommodating up to 8 guests",
          "Heated ski and snowboard boot locker and gourmet mountain kitchen"
    ],
    summary: 'Alpine mountain chalet with private hot tub, sauna, and direct shuttle to ski lifts.',
    description:
      'The quintessential Eastern Sierra ski retreat featuring an outdoor hot tub under the pines, cedar sauna, and stone fireplace.',
    spaceOverview:
      'Boot warmers and gear storage in the foyer, open great room with vaulted ceilings, and mountain vistas.',
    neighborhood: 'Walk to the Canyon Lodge shuttle and Mammoth village restaurants and breweries.',
    vibes: ['ski lodge', 'alpine', 'hot tub', 'sauna', 'mountain view', 'pet friendly'],
    hostId: 'host-liam-oconnor',
    cancellationPolicyId: 'policy-cancellation-flexible',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1571896349842-33c89424de2d'),
    galleryUrls: [
      {
        url: photo('1519681393784-d120267933ba'),
        caption: 'Two-story stone hearth and cozy après-ski lounge',
      },
      {
        url: photo('1506973035872-a4ec16b8e8d9'),
        caption: 'Heated boot room and private snowy forest deck',
      },
    ],
    rating: 4.8,
    reviewCount: 245,
    featured: false,
  },

  // 30. Santa Cruz Surf Haven (Santa Cruz)
  {
    _id: 'property-santa-cruz-surf-haven',
    title: 'Santa Cruz Surf Haven',
    slug: 'santa-cruz-surf-haven',
    type: 'beach',
    pricePerNight: 275,
    cleaningFee: 95,
    serviceFeePercent: 12,
    minNights: 2,
    weeklyDiscountPercent: 10,
    maxGuests: 5,
    bedrooms: 2,
    beds: 3,
    baths: 2,
    petsAllowed: true,
    amenities: ['ocean-view', 'hot-tub', 'wifi', 'kitchen', 'deck', 'patio'],
    location: {
      city: 'Santa Cruz',
      region: 'CA',
      regionName: 'California',
      country: 'United States',
      neighborhood: 'Pleasure Point',
      lat: 36.9622,
      lng: -121.9688,
    },
    facts: [
          "Modern beach house located along Santa Cruz West Cliff coastal bluffs",
          "Front viewing deck and gas fire pit overlooking famous Monterey Bay surf breaks",
          "Two bedrooms and one and a half bathrooms accommodating up to 4 guests and pets",
          "Outdoor hot-water surfboard shower and propane BBQ grill",
          "Full kitchen with stainless appliances and high-speed Wi-Fi"
    ],
    summary:
      'Laid-back coastal surf cottage steps from Pleasure Point surf break with outdoor hot tub.',
    description:
      'Live the classic California surf life. Stroll down to the waves with your board, rinse off in the outdoor heated shower, and unwind in the garden hot tub.',
    spaceOverview:
      'Vaulted ceilings, surf racks, sun deck with fire table, and bright modern kitchen.',
    neighborhood:
      'Heart of Pleasure Point, steps to East Cliff Drive coastal path, surf shops, and local bakeries.',
    vibes: ['surf', 'laid back', 'hot tub', 'coastal', 'beach', 'pet friendly'],
    hostId: 'host-carlos-mendez',
    cancellationPolicyId: 'policy-cancellation-moderate',
    houseRulesPolicyId: 'policy-house-rules-standard',
    additionalPolicyIds: ['policy-pet-etiquette', 'policy-check-in-keyless'],
    mainImageUrl: photo('1510069551606-f9ec0a62fe28'),
    galleryUrls: [
      {
        url: photo('1519046904884-53103b34b206'),
        caption: 'Outdoor heated surf shower and private board storage rack',
      },
      {
        url: photo('1579517899846-6d72987bd376'),
        caption: 'Sunny California coastal terrace and palm trees',
      },
    ],
    rating: 4.9,
    reviewCount: 215,
    featured: false,
  },
]
