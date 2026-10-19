import React from "react";
import { View, ViewStyle, StyleProp } from "react-native";
import { Star } from "lucide-react-native";
import { colors, radius, spacing } from "@/theme";
import { ThemedText } from "./themed-text";

export type BadgeVariant =
  | "favorite"
  | "new"
  | "discount"
  | "superhost"
  | "amenity"
  | "neutral";

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function Badge({
  label,
  variant = "neutral",
  icon,
  style,
  className,
}: BadgeProps) {
  const getBadgeStyle = () => {
    switch (variant) {
      case "favorite":
        return {
          backgroundColor: colors.badge.favorite.bg,
          color: colors.badge.favorite.text,
          borderWidth: 0,
          borderColor: "transparent",
        };
      case "new":
        return {
          backgroundColor: colors.badge.new.bg,
          color: colors.badge.new.text,
          borderWidth: 0,
          borderColor: "transparent",
        };
      case "discount":
        return {
          backgroundColor: colors.badge.discount.bg,
          color: colors.badge.discount.text,
          borderWidth: 0,
          borderColor: "transparent",
        };
      case "superhost":
        return {
          backgroundColor: colors.badge.superhost.bg,
          color: colors.badge.superhost.text,
          borderWidth: 1,
          borderColor: colors.badge.superhost.border,
        };
      case "amenity":
        return {
          backgroundColor: colors.surfaceGray,
          color: colors.textPrimary,
          borderWidth: 0,
          borderColor: "transparent",
        };
      case "neutral":
      default:
        return {
          backgroundColor: colors.surfaceGray,
          color: colors.textSecondary,
          borderWidth: 0,
          borderColor: "transparent",
        };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <View
      className={className}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: badgeStyle.backgroundColor,
          borderWidth: badgeStyle.borderWidth,
          borderColor: badgeStyle.borderColor,
          paddingVertical: spacing.xs + 2,
          paddingHorizontal: spacing.md,
          borderRadius: radius.full,
          borderCurve: "continuous",
          gap: spacing.xs + 2,
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      {icon ? (
        icon
      ) : variant === "favorite" ? (
        <Star size={13} color={colors.primaryYellow} fill={colors.primaryYellow} />
      ) : null}
      <ThemedText
        variant="small"
        color={badgeStyle.color}
        style={{ fontFamily: "PlusJakartaSans_600SemiBold" }}
      >
        {label}
      </ThemedText>
    </View>
  );
}
