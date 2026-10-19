import React from "react";
import {
  Pressable,
  ActivityIndicator,
  View,
  ViewStyle,
  StyleProp,
} from "react-native";
import { ArrowRight } from "lucide-react-native";
import { colors, radius, spacing, shadows } from "@/theme";
import { ThemedText } from "./themed-text";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  title?: string;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  trailingIcon?: "arrowRight" | React.ReactNode;
  showArrow?: boolean;
  spreadIcons?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function Button({
  variant = "primary",
  size = "lg",
  title,
  loading = false,
  disabled = false,
  leftIcon,
  icon,
  rightIcon,
  trailingIcon,
  showArrow = false,
  spreadIcons = false,
  children,
  style,
  className,
  onPress,
  accessibilityLabel,
}: ButtonProps) {
  const effectiveLeft = leftIcon ?? icon;
  const effectiveShowArrow = showArrow || trailingIcon === "arrowRight";
  const effectiveRight = trailingIcon && trailingIcon !== "arrowRight" ? trailingIcon : rightIcon;
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  const isOutline = variant === "outline";

  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) return isPrimary ? "#FCD34D" : colors.surfaceGray;
    if (isPrimary) {
      return pressed ? "#F0B820" : colors.primaryYellow;
    }
    if (isSecondary || isOutline) {
      return pressed ? "#F4F5F7" : colors.surfaceWhite;
    }
    return pressed ? "#F4F5F7" : "transparent";
  };

  const getBorderColor = () => {
    if (isSecondary || isOutline) return colors.borderGray;
    return "transparent";
  };

  const sizeStyles: Record<ButtonSize, { minHeight: number; paddingHorizontal: number; py: number }> = {
    sm: { minHeight: 40, paddingHorizontal: spacing.md, py: spacing.xs },
    md: { minHeight: 48, paddingHorizontal: spacing.xl, py: spacing.sm },
    lg: { minHeight: 56, paddingHorizontal: spacing["2xl"], py: spacing.md },
  };

  const currentSize = sizeStyles[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      className={className}
      style={({ pressed }) => [
        {
          minHeight: currentSize.minHeight,
          paddingHorizontal: currentSize.paddingHorizontal,
          paddingVertical: currentSize.py,
          borderRadius: radius.full,
          borderCurve: "continuous",
          backgroundColor: getBackgroundColor(pressed),
          borderWidth: isSecondary || isOutline ? 1 : 0,
          borderColor: getBorderColor(),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.5 : pressed ? 0.88 : 1,
          boxShadow: isPrimary && !disabled ? shadows.buttonGlow : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} />
      ) : children ? (
        children
      ) : spreadIcons ? (
        <View style={{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          {effectiveLeft ? (
            <View style={{ position: "absolute", left: 0 }}>{effectiveLeft}</View>
          ) : null}
          {title ? (
            <ThemedText
              variant="button"
              color={colors.textPrimary}
              style={{ fontSize: size === "sm" ? 15 : 17 }}
            >
              {title}
            </ThemedText>
          ) : null}
          {effectiveShowArrow || effectiveRight ? (
            <View style={{ position: "absolute", right: 0 }}>
              {effectiveRight || (
                <ArrowRight size={20} color={colors.textPrimary} strokeWidth={2.5} />
              )}
            </View>
          ) : null}
        </View>
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {effectiveLeft}
          {title ? (
            <ThemedText
              variant="button"
              color={colors.textPrimary}
              style={{ fontSize: size === "sm" ? 15 : 17 }}
            >
              {title}
            </ThemedText>
          ) : null}
          {effectiveRight}
          {effectiveShowArrow ? (
            <ArrowRight size={20} color={colors.textPrimary} strokeWidth={2.5} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

export interface IconButtonProps {
  icon: React.ReactNode;
  size?: number;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  variant?: "outline" | "solid" | "glass";
  style?: StyleProp<ViewStyle>;
  className?: string;
  accessibilityLabel?: string;
}

export function IconButton({
  icon,
  size = 48,
  onPress,
  disabled = false,
  selected = false,
  variant = "outline",
  style,
  className,
  accessibilityLabel,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      className={className}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: radius.full,
          borderCurve: "continuous",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor:
            variant === "glass"
              ? "rgba(255, 255, 255, 0.9)"
              : variant === "solid"
              ? colors.surfaceGray
              : colors.surfaceWhite,
          borderWidth: variant === "glass" ? 0 : 1,
          borderColor: selected ? colors.lavender : colors.borderGray,
          opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
          boxShadow: variant === "glass" ? shadows.card : undefined,
        },
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
}
