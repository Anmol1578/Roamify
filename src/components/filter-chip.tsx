import React from "react";
import {
  Pressable,
  View,
  ViewStyle,
  StyleProp,
} from "react-native";
import { colors, radius, spacing } from "@/theme";
import { ThemedText } from "./themed-text";

export type ChipVariant = "default" | "yellow" | "lavender";

export interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  variant?: ChipVariant;
  style?: StyleProp<ViewStyle>;
  className?: string;
  disabled?: boolean;
}

export function FilterChip({
  label,
  selected = false,
  onPress,
  icon,
  variant = "default",
  style,
  className,
  disabled = false,
}: FilterChipProps) {
  // Determine active background
  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) return "#E5E7EB";
    if (selected) {
      if (variant === "yellow") {
        return pressed ? "#F0B820" : colors.primaryYellow;
      }
      return pressed ? "#B89EFF" : colors.lavender;
    }
    return pressed ? "#EAECEF" : colors.surfaceGray;
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      className={className}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: getBackgroundColor(pressed),
          borderRadius: radius.full,
          borderCurve: "continuous",
          paddingVertical: spacing.sm + 2,
          paddingHorizontal: spacing.lg,
          gap: spacing.sm,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {icon ? <View className="items-center justify-center">{icon}</View> : null}
      <ThemedText
        variant="caption"
        color={colors.textPrimary}
        style={{
          fontFamily: selected
            ? "PlusJakartaSans_600SemiBold"
            : "PlusJakartaSans_500Medium",
        }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}
