import { z } from "zod";

export const askRequestSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Stay slug is required")
    .max(96, "Stay slug too long")
    .regex(/^[a-z0-9-]+$/, "Invalid slug format"),
  question: z
    .string()
    .trim()
    .min(1, "Question cannot be empty")
    .max(300, "Question cannot exceed 300 characters"),
});

export type AskRequest = z.infer<typeof askRequestSchema>;
