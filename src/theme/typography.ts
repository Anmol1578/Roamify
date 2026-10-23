import { TextStyle } from "react-native";
import { colors } from "./colors";

export const fontFamilies = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
} as const;

export const type = {
  display: {
    fontSize: 56,
    lineHeight: 58,
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
    letterSpacing: -1.5,
  },
  displayLarge: {
    fontSize: 64,
    lineHeight: 64,
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
    letterSpacing: -2,
  },
  hero: {
    fontSize: 44,
    lineHeight: 42,
    fontFamily: fontFamilies.extrabold,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -1.5,
  },
  jumbo: {
    fontSize: 52,
    lineHeight: 48,
    fontFamily: fontFamilies.extrabold,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -2,
  },
  lead: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fontFamilies.medium,
    color: colors.textSecondary,
  },
  heading: {
    fontSize: 30,
    lineHeight: 36,
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
    letterSpacing: -0.8,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fontFamilies.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fontFamilies.regular,
    color: colors.textSecondary,
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  subhead: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: fontFamilies.medium,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamilies.medium,
    color: colors.textSecondary,
  },
  button: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: fontFamilies.semibold,
    color: colors.textPrimary,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fontFamilies.medium,
    color: colors.textSecondary,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof type;
