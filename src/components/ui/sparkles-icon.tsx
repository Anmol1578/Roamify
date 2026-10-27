import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "@/theme/colors";

export interface SparklesIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function SparklesIcon({
  size = 24,
  color = colors.textPrimary,
  style,
  className,
}: SparklesIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={style}
      className={className}
    >
      {/* 3-star AI Sparkles cluster matching Roamify search design */}
      <Path
        fill={color}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 4.5Q9 13 17.5 13Q9 13 9 21.5Q9 13 0.5 13Q9 13 9 4.5ZM19 1Q19 5.5 23.5 5.5Q19 5.5 19 10Q19 5.5 14.5 5.5Q19 5.5 19 1ZM19.5 15.5Q19.5 18.5 22.5 18.5Q19.5 18.5 19.5 21.5Q19.5 18.5 16.5 18.5Q19.5 18.5 19.5 15.5Z"
      />
    </Svg>
  );
}
