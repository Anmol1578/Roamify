import React from "react";
import { View, ViewStyle, StyleProp } from "react-native";
import { Image } from "expo-image";
import { colors } from "@/theme";
import { ThemedText } from "./themed-text";

export type WordmarkSize = "sm" | "md" | "lg" | "xl" | "2xl";

export interface BrandWordmarkProps {
  size?: WordmarkSize;
  variant?: "image" | "text";
  color?: string;
  text?: string;
  fontSize?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function BrandWordmark({
  size = "xl",
  variant = "image",
  color = colors.textPrimary,
  text = "roamify",
  fontSize,
  style,
  className,
}: BrandWordmarkProps) {
  const dimensions: Record<
    WordmarkSize,
    { width: number; height: number; fontSize: number; lineHeight: number }
  > = {
    sm: { width: 120, height: 38, fontSize: 32, lineHeight: 36 },
    md: { width: 180, height: 56, fontSize: 46, lineHeight: 50 },
    lg: { width: 250, height: 78, fontSize: 62, lineHeight: 66 },
    xl: { width: 320, height: 98, fontSize: 78, lineHeight: 82 },
    "2xl": { width: 380, height: 118, fontSize: 94, lineHeight: 98 },
  };

  const dim = dimensions[size];
  const targetFontSize = fontSize || dim.fontSize;

  if (variant === "text") {
    return (
      <View style={style} className={className}>
        <ThemedText
          style={{
            fontSize: targetFontSize,
            lineHeight: targetFontSize * 1.05,
            fontFamily: "PlusJakartaSans_800ExtraBold",
            fontWeight: "800",
            color,
            letterSpacing: -1.2,
          }}
        >
          {text}
        </ThemedText>
      </View>
    );
  }

  return (
    <View
      style={[
        {
          width: dim.width,
          height: dim.height,
          maxWidth: "100%",
        },
        style,
      ]}
      className={className}
    >
      <Image
        source={require("../../assets/images/roamify-wordmark.png")}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain"
      />
    </View>
  );
}
