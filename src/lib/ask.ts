import { Property } from "./stays";
import { houseRuleParts, houseRuleLines } from "./stay-details";

export type TopicKey =
  | "cancellation"
  | "checkIn"
  | "pets"
  | "houseRules"
  | "payment"
  | "damage"
  | "guestRefund";

export interface TopicDefinition {
  key: TopicKey;
  chipLabel: string;
  question: string;
  keywords: string[];
}

export const TOPICS: TopicDefinition[] = [
  {
    key: "checkIn",
    chipLabel: "Check-in",
    question: "When are check-in and checkout?",
    keywords: [
      "check in",
      "check-in",
      "checkin",
      "checkout",
      "check out",
      "arriv",
      "leave",
      "late",
      "early",
    ],
  },
  {
    key: "pets",
    chipLabel: "Pets",
    question: "Can I bring my pet?",
    keywords: ["pet", "dog", "cat", "animal"],
  },
  {
    key: "houseRules",
    chipLabel: "House rules",
    question: "What are the house rules?",
    keywords: ["rule", "smok", "part", "quiet", "noise", "event"],
  },
  {
    key: "payment",
    chipLabel: "Fees",
    question: "How does payment and fees work?",
    keywords: ["pay", "charge", "price", "cost", "fee", "card", "tax"],
  },
  {
    key: "cancellation",
    chipLabel: "Cancellation",
    question: "What's the cancellation policy?",
    keywords: ["cancel", "refund before"],
  },
  {
    key: "damage",
    chipLabel: "Damage",
    question: "What if something gets damaged?",
    keywords: ["damage", "deposit", "broke"],
  },
  {
    key: "guestRefund",
    chipLabel: "Refunds",
    question: "What if the stay isn't as described?",
    keywords: ["refund", "as described", "issue", "problem"],
  },
];

export interface AnswerCard {
  key: string;
  title: string;
  lines: string[];
  iconType?: "paw" | "clock" | "home" | "shield" | "card" | "refund";
  source?: { label: string; icon: "home" | "policy" };
  sourceText?: string;
  link?: { label: string; section?: string };
}

export const ROAM_POLICIES: Record<string, { title: string; summary: string }> = {
  checkIn: {
    title: "Check-in & Access",
    summary:
      "Self check-in with keypad or smart lockbox. Your host provides secure arrival codes 24 hours prior to check-in.",
  },
  pets: {
    title: "Pets and service animals",
    summary:
      "Pets are welcome only at stays marked pet friendly. At those stays, up to two dogs or cats are allowed unless the stay's house rules say otherwise. Pets must not be left alone in the stay unless they are crated. Guests are responsible for cleaning up after their pets indoors and outside. Damage caused by a pet is handled under the guest protection policy.",
  },
  payment: {
    title: "Fees and payment processing",
    summary:
      "Payments are securely processed through Roamify. Accommodation charges, cleaning fees, and applicable local taxes are transparently itemized with no hidden fees.",
  },
  damage: {
    title: "Damage & Security Protection",
    summary:
      "Guests are responsible for excessive wear or damage. Unforeseen issues are reviewed transparently through the Roamify Resolution Center.",
  },
  guestRefund: {
    title: "Guest Refund Policy",
    summary:
      "If the stay differs materially from its description or is inaccessible, notify Roamify Support within 24 hours for rebooking or a refund.",
  },
};

export function matchTopics(text: string): TopicKey[] {
  const lower = text.toLowerCase();
  const matched: TopicKey[] = [];

  for (const topic of TOPICS) {
    const hasMatch = topic.keywords.some((kw) => lower.includes(kw));
    if (hasMatch) {
      matched.push(topic.key);
    }
  }

  return matched;
}

export function answerFor(stay: Property, topics: TopicKey[]): AnswerCard[] {
  if (!topics || topics.length === 0) {
    return [
      {
        key: "no-answer",
        title: "No answer in this stay's details",
        lines: [
          "Roam's policies and this stay's details don't cover this. Contact Roam support.",
        ],
        iconType: "shield",
        sourceText: "Roam Support",
      },
    ];
  }

  const cards: AnswerCard[] = [];
  const parts = houseRuleParts(stay.houseRules);

  for (const topicKey of topics) {
    switch (topicKey) {
      case "cancellation": {
        const title = stay.cancellationPolicy?.title || "Cancellation policy";
        const summary =
          stay.cancellationPolicy?.summary ||
          stay.cancellationPolicy?.content ||
          "Full refund up to 7 days before check-in. Non-refundable within 48 hours.";
        cards.push({
          key: `cancellation-${cards.length}`,
          title,
          iconType: "shield",
          lines: [summary],
          source: { label: "Cancellation policy", icon: "policy" },
          sourceText: "Cancellation policy · this stay",
          link: { label: "Read full policy", section: "cancellation" },
        });
        break;
      }

      case "checkIn": {
        // 1. House rule check-in / check-out lines
        cards.push({
          key: `checkin-rules-${cards.length}`,
          title: "Check-in and checkout",
          iconType: "clock",
          lines: [parts.checkIn, parts.checkout],
          source: { label: "This stay's house rules", icon: "home" },
          sourceText: "House rules · this stay",
          link: { label: "See all policies", section: "houseRules" },
        });
        // 2. Roam policy summary
        cards.push({
          key: `checkin-policy-${cards.length}`,
          title: ROAM_POLICIES.checkIn.title,
          iconType: "clock",
          lines: [ROAM_POLICIES.checkIn.summary],
          source: { label: "Roam policy", icon: "policy" },
          sourceText: "Check-in and access · Roam policy",
          link: { label: "Read full policy", section: "checkIn" },
        });
        break;
      }

      case "pets": {
        // 1. House rule pets line
        const petsLine = stay.petsAllowed ? "Pets allowed" : (parts.pets || "No pets allowed");
        cards.push({
          key: `pets-rules-${cards.length}`,
          title: "Pets",
          iconType: "paw",
          lines: [petsLine],
          source: { label: "This stay's house rules", icon: "home" },
          sourceText: "House rules · this stay",
          link: { label: "See all policies", section: "houseRules" },
        });
        // 2. Roam policy summary
        cards.push({
          key: `pets-policy-${cards.length}`,
          title: ROAM_POLICIES.pets.title,
          iconType: "paw",
          lines: [ROAM_POLICIES.pets.summary],
          source: { label: "Roam policy", icon: "policy" },
          sourceText: "Guest conduct and parties · Roam policy",
          link: { label: "Read full policy", section: "pets" },
        });
        break;
      }

      case "houseRules": {
        const allRules = houseRuleLines(stay.houseRules);
        cards.push({
          key: `houserules-${cards.length}`,
          title: "House rules",
          iconType: "home",
          lines: allRules,
          source: { label: "This stay's house rules", icon: "home" },
          sourceText: "House rules · this stay",
          link: { label: "See all policies", section: "houseRules" },
        });
        break;
      }

      case "payment": {
        cards.push({
          key: `payment-${cards.length}`,
          title: ROAM_POLICIES.payment.title,
          iconType: "card",
          lines: [ROAM_POLICIES.payment.summary],
          source: { label: "Roam policy", icon: "policy" },
          sourceText: "Fees & Payment · Roam policy",
          link: { label: "Read full policy", section: "payment" },
        });
        break;
      }

      case "damage": {
        cards.push({
          key: `damage-${cards.length}`,
          title: ROAM_POLICIES.damage.title,
          iconType: "shield",
          lines: [ROAM_POLICIES.damage.summary],
          source: { label: "Roam policy", icon: "policy" },
          sourceText: "Damage protection · Roam policy",
          link: { label: "Read full policy", section: "damage" },
        });
        break;
      }

      case "guestRefund": {
        cards.push({
          key: `guestrefund-${cards.length}`,
          title: ROAM_POLICIES.guestRefund.title,
          iconType: "refund",
          lines: [ROAM_POLICIES.guestRefund.summary],
          source: { label: "Roam policy", icon: "policy" },
          sourceText: "Refund policy · Roam policy",
          link: { label: "Read full policy", section: "guestRefund" },
        });
        break;
      }
    }
  }

  if (cards.length === 0) {
    return [
      {
        key: "no-answer",
        title: "No answer in this stay's details",
        lines: [
          "Roam's policies and this stay's details don't cover this. Contact Roam support.",
        ],
        iconType: "shield",
        sourceText: "Roam Support",
      },
    ];
  }

  return cards;
}
