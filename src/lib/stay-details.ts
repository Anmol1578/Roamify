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
