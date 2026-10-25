import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import Animated, { FadeIn, ReduceMotion } from "react-native-reanimated";
import { colors } from "@/theme/colors";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/button";
import { Icon, IconName } from "./icons";

export interface EmptyStateAction {
  title: string;
  onPress: () => void;
}

export interface EmptyStateProps {
  icon: IconName | React.ReactNode;
  title: string;
  message: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  message,
  action,
  secondaryAction,
  children,
  style,
  className,
}: EmptyStateProps) {
  const renderIcon = () => {
    if (typeof icon === "string") {
      return <Icon name={icon as IconName} size={32} tone="secondary" />;
    }
    return icon;
  };

  return (
    <Animated.View
      entering={FadeIn.duration(200).reduceMotion(ReduceMotion.Never)}
      accessibilityLiveRegion="polite"
      className={`items-center gap-3 px-6 ${className || ""}`}
      style={[
        {
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 24,
          paddingVertical: 32,
        },
        style,
      ]}
    >
      {/* Icon tile 72x72 */}
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: colors.surfaceGray,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {renderIcon()}
      </View>

      {/* Title */}
      <ThemedText
        variant="title"
        style={{
          fontSize: 20,
          lineHeight: 26,
          fontFamily: "PlusJakartaSans_700Bold",
          fontWeight: "700",
          color: colors.textPrimary,
          textAlign: "center",
        }}
      >
        {title}
      </ThemedText>

      {/* Message */}
      <ThemedText
        variant="body"
        style={{
          fontSize: 14.5,
          lineHeight: 21,
          fontFamily: "PlusJakartaSans_500Medium",
          color: colors.textSecondary,
          textAlign: "center",
          maxWidth: 320,
        }}
      >
        {message}
      </ThemedText>

      {/* Children */}
      {children}

      {/* Actions */}
      {action || secondaryAction ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginTop: 8,
          }}
        >
          {secondaryAction ? (
            <Button
              size="sm"
              variant="secondary"
              title={secondaryAction.title}
              onPress={secondaryAction.onPress}
            />
          ) : null}
          {action ? (
            <Button
              size="sm"
              variant="primary"
              title={action.title}
              onPress={action.onPress}
            />
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
}
