import React from "react";
import { ActivityIndicator, ActivityIndicatorProps, StyleProp, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";

export type SpinnerTone = "primary" | "ink" | "secondary" | "muted" | "white";

export interface SpinnerProps extends Omit<ActivityIndicatorProps, "color"> {
  tone?: SpinnerTone;
  color?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function Spinner({
  tone = "ink",
  color,
  size = "small",
  style,
  className,
  ...props
}: SpinnerProps) {
  const toneMap: Record<SpinnerTone, string> = {
    primary: colors.primaryYellow,
    ink: colors.textPrimary,
    secondary: colors.textSecondary,
    muted: colors.textMuted,
    white: colors.surfaceWhite,
  };

  const resolvedColor = color || toneMap[tone] || colors.textPrimary;

  return (
    <ActivityIndicator
      color={resolvedColor}
      size={size}
      style={style}
      className={className}
      {...props}
    />
  );
}
