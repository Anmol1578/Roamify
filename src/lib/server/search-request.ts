import { z } from "zod";

const sortOptionSchema = z.enum(["best_match", "price_low", "price_high", "rating"]).default("best_match");

const weightedPropertyTypeSchema = z.object({
  value: z.enum(["cabin", "beach", "city", "villa"]),
  weight: z.number().min(0).max(1),
});

const weightedAmenitySchema = z.object({
  value: z.string(),
  weight: z.number().min(0).max(1),
});

const weightedVibeSchema = z.object({
  value: z.string(),
  weight: z.number().min(0).max(1),
});

const searchIntentSchema = z.object({
  text: z.string().max(300),
  source: z.enum(["model", "parser"]),
  place: z.string().optional(),
  maxPrice: z.number().int().min(1).max(100000).optional(),
  minPrice: z.number().int().min(1).max(100000).optional(),
  guests: z.number().int().min(1).max(50).optional(),
  bedrooms: z.number().int().min(0).max(20).optional(),
  pets: z.enum(["wanted", "avoided"]).optional(),
  petsWeight: z.number().min(0).max(1).optional(),
  types: z.object({
    required: z.array(z.enum(["cabin", "beach", "city", "villa"])),
    avoided: z.array(z.enum(["cabin", "beach", "city", "villa"])),
    preferred: z.array(weightedPropertyTypeSchema),
  }),
  amenities: z.object({
    required: z.array(z.string()),
    avoided: z.array(z.string()),
    preferred: z.array(weightedAmenitySchema),
  }),
  vibes: z.object({
    preferred: z.array(weightedVibeSchema),
    avoided: z.array(z.string()),
  }),
});

export const searchRequestSchema = z.union([
  z.object({
    q: z.string().max(300),
    sort: sortOptionSchema.optional(),
  }),
  z.object({
    intent: searchIntentSchema,
    sort: sortOptionSchema.optional(),
  }),
]);

export type ValidatedSearchRequest = z.infer<typeof searchRequestSchema>;
