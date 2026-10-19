import React from "react";
import { Pressable, View, ViewStyle, StyleProp } from "react-native";
import { colors, radius } from "@/theme";

export interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
  accessibilityLabel?: string;
}

export function Toggle({
  value,
  onValueChange,
  disabled = false,
  style,
  className,
  accessibilityLabel = "Toggle",
}: ToggleProps) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      className={className}
      style={[
        {
          width: 52,
          height: 32,
          borderRadius: radius.full,
          backgroundColor: value ? colors.primaryYellow : colors.borderGray,
          padding: 3,
          justifyContent: "center",
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: radius.full,
          backgroundColor: colors.surfaceWhite,
          alignSelf: value ? "flex-end" : "flex-start",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
        }}
      />
    </Pressable>
  );
}
