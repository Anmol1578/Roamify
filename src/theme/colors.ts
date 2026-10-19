export const colors = {
  // Brand & Accent
  primary: "#FFC629",
  primaryYellow: "#FFC629",
  lavender: "#C9B4FF",
  lavenderLight: "#F2EDFF",

  // Text
  textPrimary: "#0B0B1A",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  textWhite: "#FFFFFF",

  // Surfaces & Backgrounds
  surfaceWhite: "#FFFFFF",
  surfaceGray: "#F4F5F7",
  surfaceCard: "#FFFFFF",
  borderGray: "#E5E7EB",
  borderLight: "#F0F1F3",
  glassBlur: "rgba(255, 255, 255, 0.7)",
  glassDark: "rgba(11, 11, 26, 0.75)",
  scrim: "rgba(11, 11, 26, 0.45)",
  scrimBorder: "rgba(255, 255, 255, 0.35)",

  // Status Alerts
  statusSuccess: {
    bg: "#EAF7EE",
    text: "#15803D",
    icon: "#16A34A",
  },
  statusError: {
    bg: "#FEECEE",
    text: "#B91C1C",
    icon: "#DC2626",
  },

  // Tags & Badges
  badge: {
    favorite: { bg: "#FEF7E6", text: "#0B0B1A" },
    new: { bg: "#E8FAF3", text: "#047857" },
    discount: { bg: "#FDF2F4", text: "#BE123C" },
    superhost: { bg: "#EEF2FF", border: "#C7D2FE", text: "#4338CA" },
  },
} as const;

export type ColorToken = keyof typeof colors;
