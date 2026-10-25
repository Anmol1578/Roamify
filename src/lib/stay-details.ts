import { HouseRules } from "./stays";

export interface HouseRuleParts {
  checkIn: string;
  checkout: string;
  quietHours?: string;
  pets: string;
  smoking: string;
  parties: string;
  additional?: string[];
}

export function houseRuleParts(rules?: HouseRules | any): HouseRuleParts {
  const checkInTime = rules?.checkIn || rules?.checkInTime || "3:00 PM";
  const checkOutTime = rules?.checkOut || rules?.checkOutTime || "11:00 AM";

  const isPetsAllowed =
    rules?.petsAllowed !== undefined ? !!rules.petsAllowed : false;
  const isSmokingAllowed = !!rules?.smokingAllowed;
  const isPartiesAllowed = !!rules?.partiesAllowed;

  return {
    checkIn: `Check-in after ${checkInTime}`,
    checkout: `Checkout before ${checkOutTime}`,
    quietHours: rules?.quietHours ? `Quiet hours: ${rules.quietHours}` : undefined,
    pets: isPetsAllowed ? "Pets allowed" : "No pets allowed",
    smoking: isSmokingAllowed ? "Smoking allowed" : "No smoking allowed",
    parties: isPartiesAllowed ? "Parties or events allowed" : "No parties or events",
    additional: Array.isArray(rules?.additionalRules) ? rules.additionalRules : undefined,
  };
}

export function houseRuleLines(rules?: HouseRules | any): string[] {
  const parts = houseRuleParts(rules);
  const lines: string[] = [parts.checkIn, parts.checkout];

  if (parts.quietHours) {
    lines.push(parts.quietHours);
  }

  lines.push(parts.pets);
  lines.push(parts.smoking);
  lines.push(parts.parties);

  if (parts.additional && parts.additional.length > 0) {
    lines.push(...parts.additional);
  }

  return lines;
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString("en-US");
}

export interface PriceLine {
  label: string;
  amount: string;
}

export interface PriceDetails {
  lines: PriceLine[];
  total: string;
  basePrice: number;
  cleaningFee: number;
  totalAmount: number;
}

export function priceLines(stay: { pricePerNight?: number; cleaningFee?: number }, nights = 2): PriceDetails {
  const pricePerNight = stay.pricePerNight ?? 0;
  const base = pricePerNight * nights;
  const cleaning = stay.cleaningFee ?? 0;
  const totalAmount = base + cleaning;

  const lines: PriceLine[] = [
    {
      label: `$${formatPrice(pricePerNight)} × ${nights} nights`,
      amount: `$${formatPrice(base)}`,
    },
  ];

  if (cleaning > 0) {
    lines.push({
      label: "Cleaning fee",
      amount: `$${formatPrice(cleaning)}`,
    });
  }

  return {
    lines,
    total: `$${formatPrice(totalAmount)}`,
    basePrice: base,
    cleaningFee: cleaning,
    totalAmount,
  };
}

export function stayTotal(stay: { pricePerNight?: number; cleaningFee?: number }, nights = 2): number {
  return (stay.pricePerNight ?? 0) * nights + (stay.cleaningFee ?? 0);
}

export type HostFactKey = "since" | "response" | "languages";

export interface KeyedHostFact {
  key: HostFactKey;
  text: string;
}

export function hostFacts(host?: {
  hostingSince?: string;
  joinedDate?: string;
  responseTime?: string;
  responseRate?: string;
  languages?: string[];
} | null): KeyedHostFact[] {
  if (!host) return [];
  const facts: KeyedHostFact[] = [];

  const since = host.hostingSince || host.joinedDate;
  if (since) {
    facts.push({
      key: "since",
      text: `Hosting since ${since}`,
    });
  }

  if (host.responseTime) {
    const resp = host.responseTime.trim();
    facts.push({
      key: "response",
      text: resp.toLowerCase().startsWith("responds")
        ? resp
        : resp.toLowerCase().startsWith("within")
        ? `Responds ${resp}`
        : `Responds within ${resp}`,
    });
  } else if (host.responseRate) {
    facts.push({
      key: "response",
      text: `Responds within an hour · ${host.responseRate}`,
    });
  }

  if (host.languages && host.languages.length > 0) {
    facts.push({
      key: "languages",
      text: `Speaks ${host.languages.join(" and ")}`,
    });
  }

  return facts;
}
