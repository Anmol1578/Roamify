import React from "react";
import { View, Pressable, ViewStyle, StyleProp } from "react-native";
import { ChevronRight, MessageSquareCode } from "lucide-react-native";
import { colors, radius, spacing, shadows } from "@/theme";
import { ThemedText } from "./themed-text";

export interface PolicyCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function PolicyCard({
  title,
  description,
  icon,
  onPress,
  style,
  className,
}: PolicyCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      onPress={onPress}
      className={className}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surfaceWhite,
          borderRadius: radius.xl,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colors.borderGray,
          padding: spacing.lg,
          gap: spacing.md,
          boxShadow: shadows.card,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.lg,
          borderCurve: "continuous",
          backgroundColor: colors.lavenderLight,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon || <MessageSquareCode size={22} color="#7C3AED" />}
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <ThemedText
          variant="subhead"
          style={{ fontFamily: "PlusJakartaSans_700Bold" }}
        >
          {title}
        </ThemedText>
        <ThemedText
          variant="small"
          color={colors.textSecondary}
          style={{ lineHeight: 17 }}
        >
          {description}
        </ThemedText>
      </View>

      <ChevronRight size={20} color="#7C3AED" />
    </Pressable>
  );
}
