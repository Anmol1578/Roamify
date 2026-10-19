export const shadows = {
  card: "0 2px 8px rgba(11, 11, 26, 0.04)",
  raised: "0 6px 16px rgba(11, 11, 26, 0.08)",
  overlay: "0 12px 32px rgba(11, 11, 26, 0.12)",
  glass: "0 8px 32px rgba(11, 11, 26, 0.08)",
  buttonGlow: "0 4px 14px rgba(255, 198, 41, 0.35)",
} as const;

export type ShadowToken = keyof typeof shadows;
