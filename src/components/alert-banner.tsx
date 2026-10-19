import React from "react";
import { View, Pressable, ViewStyle, StyleProp } from "react-native";
import { Check, AlertCircle, X } from "lucide-react-native";
import { colors, radius, spacing } from "@/theme";
import { ThemedText } from "./themed-text";

export type AlertType = "success" | "error";

export interface AlertBannerProps {
  type?: AlertType;
  message: string;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function AlertBanner({
  type = "success",
  message,
  onDismiss,
  style,
  className,
}: AlertBannerProps) {
  const isSuccess = type === "success";
  const config = isSuccess ? colors.statusSuccess : colors.statusError;

  return (
    <View
      className={className}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: config.bg,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.xl,
          borderCurve: "continuous",
          gap: spacing.md,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: radius.full,
          backgroundColor: config.icon,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isSuccess ? (
          <Check size={16} color={colors.textWhite} strokeWidth={3} />
        ) : (
          <AlertCircle size={18} color={colors.textWhite} strokeWidth={2.5} />
        )}
      </View>

      <ThemedText
        variant="caption"
        color={config.text}
        style={{ flex: 1, fontFamily: "PlusJakartaSans_600SemiBold" }}
      >
        {message}
      </ThemedText>

      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss alert"
          onPress={onDismiss}
          hitSlop={10}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <X size={18} color={config.text} />
        </Pressable>
      ) : null}
    </View>
  );
}
