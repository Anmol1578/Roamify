import React, { useState } from "react";
import Animated, { cubicBezier, useReducedMotion } from "react-native-reanimated";
import {
  Pressable,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
  AccessibilityRole,
  AccessibilityState,
} from "react-native";

const CSS_EASE_OUT = cubicBezier(0.23, 1, 0.32, 1);

export interface PressableScaleProps {
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  className?: string;
  disabled?: boolean;
  scale?: number;
  hitSlop?: number;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  accessibilityState?: AccessibilityState;
}

export function PressableScale({
  onPress,
  onLongPress,
  children,
  style,
  contentStyle,
  className,
  disabled = false,
  scale = 0.97,
  hitSlop = 12,
  accessibilityRole = "button",
  accessibilityLabel,
  accessibilityState,
}: PressableScaleProps) {
  const [pressed, setPressed] = useState(false);
  const reduced = useReducedMotion();

  const targetScale = reduced ? 1 : scale;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      hitSlop={hitSlop}
      pressRetentionOffset={16}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      className={className}
      style={style}
    >
      <Animated.View
        style={[
          {
            transform: [{ scale: pressed && !disabled ? targetScale : 1 }],
            transitionProperty: "transform",
            transitionDuration: "120ms",
            transitionTimingFunction: CSS_EASE_OUT,
          },
          contentStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
