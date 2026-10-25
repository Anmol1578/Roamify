import { Property } from "../stays";
import { houseRuleParts, houseRuleLines } from "../stay-details";
import { AnswerCard, matchTopics, answerFor } from "../ask";
import { PolicyKbSnapshot, VerifiedKbSection } from "./policy-kb";
import { generateText, Output } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

interface CandidatePassage {
  id: string;
  category: "stay" | "kb";
  title: string;
  text: string;
  section?: VerifiedKbSection;
}

const answerSelectionSchema = z.object({
  pickedIds: z
    .array(z.string())
    .describe("List of candidate IDs that directly answer the guest's question, or part of it"),
  confidence: z
    .enum(["low", "medium", "high"])
    .describe("Confidence that the selected passages answer the question"),
});

export interface AnswerResult {
  cards: AnswerCard[];
  topics: string[];
  answeredBy: "gemini" | "fallback";
}

/**
 * Builds candidate passages from stay-specific fields and verified KB sections.
 */
function buildCandidates(stay: Property, snapshot: PolicyKbSnapshot): CandidatePassage[] {
  const candidates: CandidatePassage[] = [];
  const parts = houseRuleParts(stay.houseRules);

  // 1. Stay Check-in / Checkout
  if (parts.checkIn || parts.checkout) {
    candidates.push({
      id: "stay:check_in_out",
      category: "stay",
      title: "This stay's check-in and checkout times",
      text: `${parts.checkIn}. ${parts.checkout}.`,
    });
  }

  // 2. Stay Pet Policy
  const petsText = stay.petsAllowed
    ? "Pets are welcome at this stay."
    : parts.pets || "Pets are not allowed at this stay.";
  candidates.push({
    id: "stay:pets",
    category: "stay",
    title: "This stay's pet allowance",
    text: petsText,
  });

  // 3. Stay House Rules
  const ruleLines = houseRuleLines(stay.houseRules);
  if (ruleLines.length > 0) {
    candidates.push({
      id: "stay:house_rules",
      category: "stay",
      title: "This stay's house rules (quiet hours, smoking, gatherings)",
      text: ruleLines.join(". "),
    });
  }

  // 4. Stay Cancellation Policy
  if (stay.cancellationPolicy) {
    const summary =
      stay.cancellationPolicy.summary ||
      stay.cancellationPolicy.content ||
      "Flexible refund prior to arrival.";
    candidates.push({
      id: "stay:cancellation",
      category: "stay",
      title: `This stay's cancellation policy: ${stay.cancellationPolicy.title}`,
      text: summary,
    });
  }

  // 5. KB Sections (excluding tiers other than this stay's tier)
  const stayTier = (
    stay.cancellationPolicy?.kind ||
    stay.cancellationPolicy?.category ||
    ""
  ).toLowerCase();

  for (const sec of snapshot.sections) {
    // If section belongs to cancellation and explicitly names another tier, drop it
    if (sec.path === "cancellation_and_refunds") {
      const headingLower = (sec.heading || "").toLowerCase();
      if (stayTier.includes("flexible") && (headingLower.includes("strict") || headingLower.includes("moderate"))) {
        continue;
      }
      if (stayTier.includes("moderate") && (headingLower.includes("strict") || headingLower.includes("flexible"))) {
        continue;
      }
      if (stayTier.includes("strict") && (headingLower.includes("flexible") || headingLower.includes("moderate"))) {
        continue;
      }
    }

    candidates.push({
      id: sec.id,
      category: "kb",
      title: `${sec.entryTitle}${sec.heading ? ` > ${sec.heading}` : ""}`,
      text: sec.plainText,
      section: sec,
    });
  }

  return candidates;
}

/**
 * Maps picked passage IDs into structured, grounded AnswerCard objects.
 */
function buildCardsFromPicks(
  stay: Property,
  pickedIds: string[],
  candidateMap: Map<string, CandidatePassage>
): AnswerCard[] {
  const cards: AnswerCard[] = [];
  const parts = houseRuleParts(stay.houseRules);

  // 1. Stay Check-in / Checkout Card
  if (pickedIds.includes("stay:check_in_out")) {
    cards.push({
      key: "stay-check-in-out",
      title: "Check-in and checkout",
      iconType: "clock",
      lines: [parts.checkIn, parts.checkout].filter(Boolean),
      source: { label: "This stay's house rules", icon: "home" },
      sourceText: "House rules · this stay",
      link: { label: "See all policies", section: "houseRules" },
    });
  }

  // 2. Stay Pets Card
  if (pickedIds.includes("stay:pets")) {
    const petsLine = stay.petsAllowed
      ? "Pets are welcome at this stay"
      : parts.pets || "Pets are not permitted at this stay";
    cards.push({
      key: "stay-pets",
      title: "Pets at this stay",
      iconType: "paw",
      lines: [petsLine],
      source: { label: "This stay's house rules", icon: "home" },
      sourceText: "House rules · this stay",
      link: { label: "See all policies", section: "houseRules" },
    });
  }

  // 3. Stay House Rules Card
  if (pickedIds.includes("stay:house_rules")) {
    const allRules = houseRuleLines(stay.houseRules);
    cards.push({
      key: "stay-house-rules",
      title: "House rules",
      iconType: "home",
      lines: allRules.length > 0 ? allRules : ["Standard quiet hours and smoke-free guidelines apply."],
      source: { label: "This stay's house rules", icon: "home" },
      sourceText: "House rules · this stay",
      link: { label: "See all policies", section: "houseRules" },
    });
  }

  // 4. Stay Cancellation Policy Card
  if (pickedIds.includes("stay:cancellation") && stay.cancellationPolicy) {
    const title = stay.cancellationPolicy.title || "Cancellation policy";
    const summary =
      stay.cancellationPolicy.summary ||
      stay.cancellationPolicy.content ||
      "Full refund up to 7 days before check-in.";
    cards.push({
      key: "stay-cancellation",
      title,
      iconType: "shield",
      lines: [summary],
      source: { label: "Cancellation policy", icon: "policy" },
      sourceText: "Cancellation policy · this stay",
      link: { label: "Read full policy", section: "cancellation" },
    });
  }

  // 5. KB Policy Cards (Cap at 3, deduplicate by policy topic)
  const kbPickedSections: VerifiedKbSection[] = [];
  const seenPaths = new Set<string>();

  for (const id of pickedIds) {
    if (!id.startsWith("kb:")) continue;
    const cand = candidateMap.get(id);
    if (cand?.section && !seenPaths.has(cand.section.path)) {
      seenPaths.add(cand.section.path);
      kbPickedSections.push(cand.section);
    }
    if (kbPickedSections.length >= 3) break;
  }

  for (const sec of kbPickedSections) {
    let iconType: "paw" | "clock" | "home" | "shield" | "card" | "refund" = "shield";
    if (sec.path === "pets") iconType = "paw";
    else if (sec.path === "check_in_and_check_out") iconType = "clock";
    else if (sec.path === "house_rules" || sec.path === "guest_conduct") iconType = "home";
    else if (sec.path === "payments_and_fees") iconType = "card";
    else if (sec.path === "cancellation_and_refunds") iconType = "refund";

    const sourceLabel = sec.policyTitle
      ? `${sec.policyTitle} · Roamify policy`
      : `${sec.entryTitle} · Roamify policy`;

    cards.push({
      key: `kb-${sec.path}`,
      title: sec.heading ? `${sec.entryTitle}: ${sec.heading}` : sec.entryTitle,
      iconType,
      lines: sec.lines.slice(0, 4),
      source: { label: "Roamify policy", icon: "policy" },
      sourceText: sourceLabel,
      link: { label: "Read full policy", section: sec.policyKind || sec.path },
    });
  }

  if (cards.length === 0) {
    return [
      {
        key: "no-answer",
        title: "No answer in this stay's details",
        lines: ["Roamify's policies and this stay's details don't cover this. Contact Roamify support."],
        iconType: "shield",
        sourceText: "Roamify Support",
      },
    ];
  }

  return cards;
}

/**
 * Answers a guest question by evaluating against stay facts and verified KB sections using Gemini.
 */
export async function answerQuestion(
  question: string,
  stay: Property,
  snapshot: PolicyKbSnapshot,
  signal?: AbortSignal
): Promise<AnswerResult> {
  const trimmed = question.trim();
  const apiKey =
    process.env.Gemini_API_Key ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  const candidates = buildCandidates(stay, snapshot);
  const candidateMap = new Map<string, CandidatePassage>();
  candidates.forEach((c) => candidateMap.set(c.id, c));

  if (!apiKey) {
    console.warn("Gemini API key is not configured, using deterministic keyword fallback");
    const matched = matchTopics(trimmed);
    const fallbackCards = answerFor(stay, matched);
    return {
      cards: fallbackCards,
      topics: matched.map((t) => `fallback:${t}`),
      answeredBy: "fallback",
    };
  }

  try {
    const google = createGoogleGenerativeAI({ apiKey });

    const prompt = `You are the policy knowledge engine for Roamify.
A guest looking at the stay "${stay.title}" asked: "${trimmed}".

Select which candidate passages directly answer the question, or part of it.
If the passage is about a different situation or does not say what the guest wants to know, do NOT pick it.

Candidate Passages:
${candidates
  .map(
    (c) =>
      `[ID: ${c.id}]\nTitle: ${c.title}\nPassage Text: ${c.text.slice(0, 300)}`
  )
  .join("\n\n")}

Instructions:
- Pick only candidates that truly answer what the guest asked.
- Assign confidence: "high", "medium", or "low".
- If no passage answers the question, return an empty pickedIds list.`;

    const { output } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt,
      output: Output.object({ schema: answerSelectionSchema }),
      abortSignal: signal || AbortSignal.timeout(10000),
      maxRetries: 0,
    });



    if (output.confidence === "low" || output.pickedIds.length === 0) {
      // If low confidence, try deterministic keyword matching
      const matched = matchTopics(trimmed);
      if (matched.length > 0) {
        const fallbackCards = answerFor(stay, matched);
        return {
          cards: fallbackCards,
          topics: matched.map((t) => `fallback:${t}`),
          answeredBy: "fallback",
        };
      }

      return {
        cards: [
          {
            key: "no-answer",
            title: "No answer in this stay's details",
            lines: ["Roamify's policies and this stay's details don't cover this. Contact Roamify support."],
            iconType: "shield",
            sourceText: "Roamify Support",
          },
        ],
        topics: ["none"],
        answeredBy: "gemini",
      };
    }

    const cards = buildCardsFromPicks(stay, output.pickedIds, candidateMap);
    return {
      cards,
      topics: output.pickedIds,
      answeredBy: "gemini",
    };
  } catch (err) {
    console.warn("Gemini answerQuestion failed, falling back to local matching:", err);
    const matched = matchTopics(trimmed);
    const fallbackCards = answerFor(stay, matched);
    return {
      cards: fallbackCards,
      topics: matched.map((t) => `fallback:${t}`),
      answeredBy: "fallback",
    };
  }
}
