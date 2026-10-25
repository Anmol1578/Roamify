import { cubicBezier, Easing } from "react-native-reanimated";

// transitionTimingFunction / animationTimingFunction (CSS-compatible)
export const easeOutBezier = cubicBezier(0.23, 1, 0.32, 1);
export const easeInOutBezier = cubicBezier(0.77, 0, 0.175, 1);

// withTiming / .easing(...) (Reanimated worklets)
export const easeOut = Easing.bezier(0.23, 1, 0.32, 1);
export const easeInOut = Easing.bezier(0.77, 0, 0.175, 1);

export const motion = {
  fast: 150,
  base: 250,
  slow: 400,
  stagger: 40,
  pulse: 900,
  cssEaseInOut: cubicBezier(0.77, 0, 0.175, 1),
  press: {
    scale: 0.97,
    duration: 120,
  },
  spring: {
    duration: 400,
    dampingRatio: 1,
  },
} as const;

export type MotionToken = keyof typeof motion;
