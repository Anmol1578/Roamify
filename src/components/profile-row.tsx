import React from "react";
import { View, Pressable, ViewStyle, StyleProp } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors, radius, spacing } from "@/theme";
import { ThemedText } from "./themed-text";

export interface ProfileRowProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  showDivider?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function ProfileRow({
  icon,
  label,
  onPress,
  showDivider = true,
  style,
  className,
}: ProfileRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={className}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.md,
          backgroundColor: pressed ? colors.surfaceGray : "transparent",
          borderRadius: radius.md,
          borderCurve: "continuous",
          gap: spacing.lg,
          borderBottomWidth: showDivider ? 1 : 0,
          borderBottomColor: colors.borderGray,
        },
        style,
      ]}
    >
      <View style={{ width: 24, alignItems: "center", justifyContent: "center" }}>
        {icon}
      </View>
      <ThemedText
        variant="bodyMedium"
        color={colors.textPrimary}
        style={{ flex: 1 }}
      >
        {label}
      </ThemedText>
      <ChevronRight size={18} color={colors.textSecondary} />
    </Pressable>
  );
}
