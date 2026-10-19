import React from "react";
import { View, Pressable, ViewStyle, StyleProp } from "react-native";
import { Minus, Plus } from "lucide-react-native";
import { colors, radius, spacing } from "@/theme";
import { ThemedText } from "./themed-text";

export interface StepperProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function Stepper({
  value,
  onValueChange,
  min = 1,
  max = 99,
  step = 1,
  style,
  className,
}: StepperProps) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  const handleDecrement = () => {
    if (canDecrement) {
      onValueChange(value - step);
    }
  };

  const handleIncrement = () => {
    if (canIncrement) {
      onValueChange(value + step);
    }
  };

  return (
    <View
      className={className}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surfaceWhite,
          borderWidth: 1,
          borderColor: colors.borderGray,
          borderRadius: radius.full,
          borderCurve: "continuous",
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          alignSelf: "flex-start",
          gap: spacing.lg,
        },
        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease value"
        disabled={!canDecrement}
        onPress={handleDecrement}
        style={({ pressed }) => [
          {
            width: 32,
            height: 32,
            borderRadius: radius.full,
            alignItems: "center",
            justifyContent: "center",
            opacity: !canDecrement ? 0.3 : pressed ? 0.6 : 1,
          },
        ]}
      >
        <Minus size={18} color={colors.textPrimary} />
      </Pressable>

      <ThemedText
        variant="button"
        style={{ minWidth: 20, textAlign: "center", fontFamily: "PlusJakartaSans_700Bold" }}
      >
        {value}
      </ThemedText>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase value"
        disabled={!canIncrement}
        onPress={handleIncrement}
        style={({ pressed }) => [
          {
            width: 32,
            height: 32,
            borderRadius: radius.full,
            alignItems: "center",
            justifyContent: "center",
            opacity: !canIncrement ? 0.3 : pressed ? 0.6 : 1,
          },
        ]}
      >
        <Plus size={18} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}
