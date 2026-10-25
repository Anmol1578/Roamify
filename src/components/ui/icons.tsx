import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { SymbolView } from "expo-symbols";
import type { SFSymbol } from "sf-symbols-typescript";
import type { AndroidSymbol } from "expo-symbols";
import { colors } from "@/theme/colors";

export type IconName =
  | "wave"
  | "globe"
  | "wifiOff"
  | "warning"
  | "searchOff"
  | "pinOff"
  | "search"
  | "calendar"
  | "clock";

export interface IconDefinition {
  ios: SFSymbol;
  android: AndroidSymbol;
}

export const ICONS: Record<IconName, IconDefinition> = {
  wave: {
    ios: "hand.wave.fill",
    android: "waving_hand",
  },
  globe: {
    ios: "globe",
    android: "language",
  },
  wifiOff: {
    ios: "wifi.slash",
    android: "wifi_off",
  },
  warning: {
    ios: "exclamationmark.triangle",
    android: "warning",
  },
  searchOff: {
    ios: "text.magnifyingglass",
    android: "search_off",
  },
  pinOff: {
    ios: "mappin.slash",
    android: "wrong_location",
  },
  search: {
    ios: "magnifyingglass",
    android: "search",
  },
  calendar: {
    ios: "calendar",
    android: "calendar_today",
  },
  clock: {
    ios: "clock",
    android: "schedule",
  },
};

export type IconTone =
  | "ink"
  | "primary"
  | "secondary"
  | "muted"
  | "ink-muted"
  | "danger"
  | "white";

export const toneColors: Record<IconTone, string> = {
  ink: colors.textPrimary,
  primary: colors.primaryYellow,
  secondary: colors.textSecondary,
  muted: colors.textMuted,
  "ink-muted": colors.textSecondary,
  danger: colors.statusError.icon,
  white: colors.surfaceWhite,
};

export interface IconProps {
  name: IconName;
  size?: number;
  tone?: IconTone;
  color?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
  "aria-hidden"?: boolean;
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: "no" | "yes" | "auto" | "no-hide-descendants";
}

export function Icon({
  name,
  size = 24,
  tone,
  color,
  style,
  className,
  "aria-hidden": ariaHidden,
  accessibilityElementsHidden,
  importantForAccessibility,
}: IconProps) {
  const iconDef = ICONS[name];
  if (!iconDef) {
    return null;
  }

  const tintColor = color || (tone ? toneColors[tone] : colors.textPrimary);

  return (
    <SymbolView
      name={{
        ios: iconDef.ios,
        android: iconDef.android,
        web: iconDef.android,
      }}
      size={size}
      tintColor={tintColor}
      style={style}
      className={className}
      aria-hidden={ariaHidden}
      accessibilityElementsHidden={accessibilityElementsHidden}
      importantForAccessibility={importantForAccessibility}
    />
  );
}
