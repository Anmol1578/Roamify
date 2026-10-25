import React from "react";
import { ViewProps, StyleProp, ViewStyle } from "react-native";
import Animated, { css, useReducedMotion } from "react-native-reanimated";
import { motion } from "@/theme/motion";
import { radius } from "@/theme/radius";

const pulseAnimation = css.keyframes({
  from: {
    opacity: 1,
  },
  to: {
    opacity: 0.5,
  },
});

export interface SkeletonProps extends ViewProps {
  className?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function Skeleton({ className, style, children, ...props }: SkeletonProps) {
  const reducedMotion = useReducedMotion();

  return (
    <Animated.View
      className={`bg-surface-gray ${className || ""}`}
      style={[
        {
          backgroundColor: "#EBECEF",
          borderRadius: radius.md,
        },
        !reducedMotion && {
          animationName: pulseAnimation,
          animationDuration: motion.pulse,
          animationDirection: "alternate",
          animationIterationCount: "infinite",
          animationTimingFunction: motion.cssEaseInOut,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}
