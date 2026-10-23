import {HomeIcon} from '@sanity/icons/Home'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {amenities, isTime, propertyTypes} from './lists'

export const property = defineType({
  name: 'property',
  title: 'Stay',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {name: 'basics', title: 'Basics', default: true},
    {name: 'location', title: 'Location'},
    {name: 'roomsAndPrice', title: 'Rooms & price'},
    {name: 'amenities', title: 'Amenities'},
    {name: 'description', title: 'Description'},
    {name: 'photos', title: 'Photos'},
    {name: 'rules', title: 'Rules'},
  ],
  fields: [
    // -------------------------------------------------------------
    // BASICS (Matches Reference Screenshot: Title, Slug, Type, Featured, Host, Rating, Review Count)
    // -------------------------------------------------------------
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'basics',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'basics',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      group: 'basics',
      options: {list: [...propertyTypes], layout: 'radio', direction: 'horizontal'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      description: 'Shown in the Home feed',
      type: 'boolean',
      group: 'basics',
      initialValue: false,
    }),
    defineField({
      name: 'host',
      title: 'Host',
      type: 'reference',
      group: 'basics',
      to: [{type: 'host'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      group: 'basics',
      description: 'Average guest rating across all reviews.',
      validation: (rule) => rule.min(0).max(5).precision(2),
    }),
    defineField({
      name: 'reviewCount',
      title: 'Review Count',
      type: 'number',
      group: 'basics',
      description: 'Total reviews, including ones not stored as documents.',
      validation: (rule) => rule.integer().min(0),
    }),

    // -------------------------------------------------------------
    // LOCATION
    // -------------------------------------------------------------
    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      group: 'location',
      fields: [
        defineField({name: 'city', title: 'City', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'region', title: 'Region / State Code', type: 'string'}),
        defineField({name: 'regionName', title: 'State Name', type: 'string'}),
        defineField({name: 'country', title: 'Country', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'neighborhood', title: 'Neighborhood', type: 'string'}),
        defineField({name: 'coordinates', title: 'Coordinates', type: 'geopoint'}),
      ],
    }),

    // -------------------------------------------------------------
    // ROOMS & PRICE
    // -------------------------------------------------------------
    defineField({
      name: 'pricePerNight',
      title: 'Price per night (USD)',
      type: 'number',
      group: 'roomsAndPrice',
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: 'cleaningFee',
      title: 'Cleaning fee (USD)',
      type: 'number',
      group: 'roomsAndPrice',
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: 'serviceFeePercent',
      title: 'Service fee (%)',
      type: 'number',
      group: 'roomsAndPrice',
      initialValue: 12,
      validation: (rule) => rule.integer().min(0).max(30),
    }),
    defineField({
      name: 'minNights',
      title: 'Minimum nights',
      type: 'number',
      group: 'roomsAndPrice',
      initialValue: 1,
      validation: (rule) => rule.integer().min(1),
    }),
    defineField({
      name: 'weeklyDiscountPercent',
      title: 'Weekly discount (%)',
      type: 'number',
      group: 'roomsAndPrice',
      initialValue: 0,
      validation: (rule) => rule.integer().min(0).max(50),
    }),
    defineField({
      name: 'maxGuests',
      title: 'Max guests',
      type: 'number',
      group: 'roomsAndPrice',
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'number',
      group: 'roomsAndPrice',
      description: '0 for a studio.',
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: 'beds',
      title: 'Beds',
      type: 'number',
      group: 'roomsAndPrice',
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: 'baths',
      title: 'Bathrooms',
      type: 'number',
      group: 'roomsAndPrice',
      validation: (rule) => rule.required().min(0.5).precision(1),
    }),

    // -------------------------------------------------------------
    // AMENITIES
    // -------------------------------------------------------------
    defineField({
      name: 'amenities',
      title: 'Amenities',
      type: 'array',
      group: 'amenities',
      of: [defineArrayMember({type: 'string'})],
      options: {list: [...amenities], layout: 'grid'},
      validation: (rule) => rule.unique(),
    }),

    // -------------------------------------------------------------
    // DESCRIPTION
    // -------------------------------------------------------------
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'string',
      group: 'description',
      description: 'One-line summary generated from stay facts.',
      validation: (rule) => rule.max(90),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      group: 'description',
      description: 'Descriptive text (3-5 sentences) generated from stay facts.',
    }),
    defineField({
      name: 'spaceOverview',
      title: 'Space overview',
      type: 'text',
      group: 'description',
    }),
    defineField({
      name: 'neighborhood',
      title: 'Neighborhood details',
      type: 'text',
      group: 'description',
    }),
    defineField({
      name: 'vibes',
      title: 'Vibes',
      type: 'array',
      group: 'description',
      description: 'Soft qualities guests ask for: quiet, cozy, secluded…',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
    }),
    defineField({
      name: 'facts',
      title: 'Facts',
      type: 'array',
      group: 'description',
      description: 'Plain facts about this stay.',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.min(3),
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      group: 'description',
      description: 'Key stay highlights generated from facts (max 4).',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'copyReview',
      title: 'Copy review audit',
      type: 'object',
      group: 'description',
      readOnly: true,
      fields: [
        defineField({name: 'status', type: 'string', options: {list: ['passed', 'failed']}}),
        defineField({name: 'checkedAt', type: 'datetime'}),
        defineField({name: 'sourceHash', type: 'string'}),
        defineField({
          name: 'unsupportedClaims',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({name: 'claim', type: 'string'}),
                defineField({name: 'reason', type: 'string'}),
              ],
            }),
          ],
        }),
      ],
    }),

    // -------------------------------------------------------------
    // PHOTOS
    // -------------------------------------------------------------
    defineField({
      name: 'mainImage',
      title: 'Cover photo',
      type: 'image',
      group: 'photos',
      options: {hotspot: true},
      fields: [
        defineField({name: 'alt', title: 'Alt text', type: 'string'}),
        defineField({name: 'url', title: 'External URL', type: 'url'}),
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery photos',
      type: 'array',
      group: 'photos',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'caption', title: 'Caption', type: 'string'}),
            defineField({name: 'alt', title: 'Alt text', type: 'string'}),
            defineField({name: 'url', title: 'External URL', type: 'url'}),
          ],
        }),
      ],
    }),

    // -------------------------------------------------------------
    // RULES
    // -------------------------------------------------------------
    defineField({
      name: 'petsAllowed',
      title: 'Pets allowed',
      type: 'boolean',
      group: 'rules',
      initialValue: false,
    }),
    defineField({
      name: 'cancellationPolicy',
      title: 'Cancellation policy',
      type: 'reference',
      group: 'rules',
      to: [{type: 'policy'}],
      options: {filter: 'category == "cancellation" || kind == "cancellation"'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'houseRules',
      title: 'House rules policy',
      type: 'reference',
      group: 'rules',
      to: [{type: 'policy'}],
    }),
    defineField({
      name: 'additionalPolicies',
      title: 'Additional policies',
      type: 'array',
      group: 'rules',
      of: [defineArrayMember({type: 'reference', to: [{type: 'policy'}]})],
    }),
    defineField({
      name: 'houseRulesSpecs',
      title: 'Structured house rules',
      type: 'object',
      group: 'rules',
      options: {collapsible: true, collapsed: false},
      fields: [
        defineField({name: 'checkInTime', title: 'Check-in from', type: 'string', initialValue: '15:00', validation: (rule) => rule.custom(isTime)}),
        defineField({name: 'checkOutTime', title: 'Check-out by', type: 'string', initialValue: '11:00', validation: (rule) => rule.custom(isTime)}),
        defineField({name: 'quietHoursFrom', title: 'Quiet hours from', type: 'string', validation: (rule) => rule.custom(isTime)}),
        defineField({name: 'quietHoursTo', title: 'Quiet hours to', type: 'string', validation: (rule) => rule.custom(isTime)}),
        defineField({name: 'maxPets', title: 'Max pets', type: 'number'}),
        defineField({name: 'petFee', title: 'Pet fee per stay (USD)', type: 'number'}),
        defineField({name: 'smokingAllowed', title: 'Smoking allowed', type: 'boolean', initialValue: false}),
        defineField({name: 'partiesAllowed', title: 'Parties allowed', type: 'boolean', initialValue: false}),
        defineField({name: 'additionalRules', title: 'Additional rules', type: 'array', of: [defineArrayMember({type: 'string'})]}),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      city: 'location.city',
      region: 'location.region',
      price: 'pricePerNight',
      media: 'mainImage',
    },
    prepare: ({title, city, region, price, media}) => ({
      title,
      subtitle: [city && region ? `${city}, ${region}` : city, price ? `$${price}/night` : null]
        .filter(Boolean)
        .join(' · '),
      media,
    }),
  },
  orderings: [
    {title: 'Rating', name: 'ratingDesc', by: [{field: 'rating', direction: 'desc'}]},
    {title: 'Price', name: 'priceAsc', by: [{field: 'pricePerNight', direction: 'asc'}]},
  ],
})
