import { generateText, Output } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";


import {
  SearchIntent,
  emptyIntent,
  intentFromParsed,
  AMENITIES,
  VIBES,
} from "../search/intent";
import { parseQuery, takePlace } from "../search/parse";
import { Amenity } from "../stays";

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
};

interface NumberCandidate {
  raw: string;
  value: number;
  occurrence: number;
}

export function extractNumberCandidates(text: string): NumberCandidate[] {
  const candidates: NumberCandidate[] = [];
  const lower = text.toLowerCase();

  // 1. Matches digits e.g. "$300", "1,200", "1.5k", "4"
  const digitRegex = /(?:\$)?(\d+(?:,\d{3})*(?:\.\d+)?)(k)?\b/gi;
  let match: RegExpExecArray | null;

  while ((match = digitRegex.exec(lower)) !== null) {
    const rawMatch = match[0];
    const numPart = match[1].replace(/,/g, "");
    let val = parseFloat(numPart);
    if (match[2] && match[2].toLowerCase() === "k") {
      val *= 1000;
    }
    if (!isNaN(val) && val > 0 && val <= 100000) {
      candidates.push({
        raw: rawMatch,
        value: Math.round(val),
        occurrence: candidates.length,
      });
    }
  }

  // 2. Number words from one to twenty
  for (const [word, val] of Object.entries(NUMBER_WORDS)) {
    const wordRegex = new RegExp(`\\b${word}\\b`, "gi");
    while ((match = wordRegex.exec(lower)) !== null) {
      candidates.push({
        raw: match[0],
        value: val,
        occurrence: candidates.length,
      });
    }
  }

  return candidates;
}

const confidenceEnum = z.enum(["low", "medium", "high"]);
const stanceEnum = z.enum(["wanted", "implied", "avoided", "not_mentioned"]);
const numberRoleEnum = z.enum(["maxPrice", "minPrice", "guests", "bedrooms", "other"]);

const evaluationSchema = z.object({
  pets: z.object({
    stance: stanceEnum.describe("wanted: guest wants pets/dogs; implied: guest mentions pets favorably; avoided: guest is allergic or doesn't want pets; not_mentioned: not mentioned"),
    confidence: confidenceEnum,
  }),
  types: z.array(
    z.object({
      type: z.enum(["cabin", "beach", "city", "villa"]),
      stance: stanceEnum,
      confidence: confidenceEnum,
    })
  ),
  amenities: z.array(
    z.object({
      amenity: z.string().describe("The amenity key, e.g. hotTub, pool, wifi, fireplace, etc."),
      stance: stanceEnum,
      confidence: confidenceEnum,
    })
  ),
  vibes: z.array(
    z.object({
      vibe: z.string().describe("The vibe name e.g. quiet, cozy, secluded, modern, etc."),
      stance: stanceEnum,
      confidence: confidenceEnum,
    })
  ),
  numbers: z.array(
    z.object({
      index: z.number().describe("Index of candidate number"),
      role: numberRoleEnum.describe("maxPrice: ceiling/under; minPrice: floor/above; guests: people count; bedrooms: bedroom count; other: nights, distance, unrelated"),
      confidence: confidenceEnum,
    })
  ),
});

export async function readIntent(
  sentence: string,
  placesMap: Record<string, string>
): Promise<SearchIntent> {
  const trimmed = sentence.slice(0, 300).replace(/[\r\n\u2028\u2029]/g, " ").trim();
  if (!trimmed) {
    return emptyIntent("");
  }

  // 1. Extract place deterministically in code
  const { place, remaining } = takePlace(trimmed, placesMap);

  // 2. Extract candidate numbers in code
  const numberCandidates = extractNumberCandidates(remaining);

  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.Gemini_API_Key ||
    process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.warn("Gemini API key is not configured, using deterministic parser fallback");
    const parsed = parseQuery(trimmed);
    if (place) parsed.place = place;
    return intentFromParsed(parsed);
  }

  const google = createGoogleGenerativeAI({ apiKey });


  try {
    const prompt = `You are the decision engine for Roamify, an upscale travel stay discovery platform.
Evaluate how the guest's search sentence treats each stay feature (pets, stay types, amenities, vibes) and what each identified number means.

Guest Search Sentence: "${trimmed}"

Defined Options Code Owns:
- Property Types:
  - cabin (cabins, chalets, A-frames, lodges)
  - beach (beachfront, seaside, coastal, bungalows)
  - city (apartments, lofts, studios, condos, urban)
  - villa (villas, estates, mansions)
- Amenities:
  ${AMENITIES.map((a) => `- ${a.value} (${a.title}; synonyms: ${a.synonyms.join(", ")})`).join("\n  ")}
- Vibes:
  ${VIBES.map((v) => `- ${v.value} (${v.label})`).join("\n  ")}
- Candidate Numbers Found in Sentence:
  ${numberCandidates.length > 0
    ? numberCandidates.map((c, i) => `[Index ${i}]: raw "${c.raw}", value ${c.value}`).join("\n  ")
    : "None"}

Instructions:
1. For pets and every type, amenity, and vibe:
   - "wanted": guest explicitly asks for it by name or synonym.
   - "implied": guest does not name it directly, but it directly fits what they describe.
   - "avoided": guest explicitly says they do not want it, cannot have it, or are allergic.
   - "not_mentioned": nothing in the sentence is about it.
   - Assign confidence: "high", "medium", or "low".
2. For each candidate number by Index:
   - "maxPrice": maximum budget or under $X per night.
   - "minPrice": minimum budget or from $X per night.
   - "guests": count of guests, people, adults, friends.
   - "bedrooms": number of bedrooms.
   - "other": number of nights (e.g. "for 2 nights"), distance, addresses, or dates.
   - Assign confidence: "high", "medium", or "low".`;

    const { output: object } = await generateText({
      model: google("gemini-2.5-flash"),
      output: Output.object({ schema: evaluationSchema }),
      prompt,
      temperature: 0.1,
    });


    const intent = emptyIntent(trimmed);
    intent.source = "model";
    if (place) intent.place = place;

    // Retune confidence thresholds to labels:
    // 1. Pets
    if (object.pets.confidence === "high") {
      if (object.pets.stance === "wanted") {
        intent.pets = "wanted";
        intent.petsWeight = 1.0;
      } else if (object.pets.stance === "avoided") {
        intent.pets = "avoided";
      }
    } else if (object.pets.confidence === "medium") {
      if (object.pets.stance === "wanted" || object.pets.stance === "implied") {
        intent.pets = "wanted";
        intent.petsWeight = 0.6;
      }
    }

    // 2. Types
    for (const t of object.types) {
      if (t.confidence === "high") {
        if (t.stance === "wanted") {
          intent.types.required.push(t.type);
        } else if (t.stance === "avoided") {
          intent.types.avoided.push(t.type);
        }
      } else if (t.confidence === "medium") {
        if (t.stance === "wanted") {
          intent.types.preferred.push({ value: t.type, weight: 0.8 });
        } else if (t.stance === "implied") {
          intent.types.preferred.push({ value: t.type, weight: 0.5 });
        }
      }
    }

    // 3. Amenities
    for (const a of object.amenities) {
      const canonical = a.amenity as Amenity;
      if (a.confidence === "high") {
        if (a.stance === "wanted") {
          intent.amenities.required.push(canonical);
        } else if (a.stance === "avoided") {
          intent.amenities.avoided.push(canonical);
        }
      } else if (a.confidence === "medium") {
        if (a.stance === "wanted") {
          intent.amenities.preferred.push({ value: canonical, weight: 0.8 });
        } else if (a.stance === "implied") {
          intent.amenities.preferred.push({ value: canonical, weight: 0.5 });
        }
      }
    }

    // 4. Vibes (Vibes never hard filter; high/medium wanted boosts ranking; high avoided demotes)
    for (const v of object.vibes) {
      if (v.confidence === "high") {
        if (v.stance === "wanted") {
          intent.vibes.preferred.push({ value: v.vibe, weight: 1.0 });
        } else if (v.stance === "avoided") {
          intent.vibes.avoided.push(v.vibe);
        }
      } else if (v.confidence === "medium") {
        if (v.stance === "wanted" || v.stance === "implied") {
          intent.vibes.preferred.push({ value: v.vibe, weight: 0.6 });
        }
      }
    }

    // 5. Numbers
    for (const numEval of object.numbers) {
      const candidate = numberCandidates[numEval.index];
      if (!candidate) continue;

      if (numEval.confidence === "high" || numEval.confidence === "medium") {
        const val = candidate.value;
        switch (numEval.role) {
          case "maxPrice":
            if (val >= 1 && val <= 100000) {
              if (intent.maxPrice === undefined || numEval.confidence === "high") {
                intent.maxPrice = val;
              }
            }
            break;
          case "minPrice":
            if (val >= 1 && val <= 100000) {
              if (intent.minPrice === undefined || numEval.confidence === "high") {
                intent.minPrice = val;
              }
            }
            break;
          case "guests":
            if (val >= 1 && val <= 50) {
              if (intent.guests === undefined || numEval.confidence === "high") {
                intent.guests = val;
              }
            }
            break;
          case "bedrooms":
            if (val >= 0 && val <= 20) {
              if (intent.bedrooms === undefined || numEval.confidence === "high") {
                intent.bedrooms = val;
              }
            }
            break;
          case "other":
            // e.g. "2 nights" -> correctly identified as not price or guests
            break;
        }
      }
    }

    return intent;
  } catch (err: unknown) {
    console.warn("Gemini structured decision failed, falling back to code parser:", err);
    const parsed = parseQuery(trimmed);
    if (place) parsed.place = place;
    return intentFromParsed(parsed);
  }
}
