import React from "react";
import { Text, TextProps, TextStyle } from "react-native";
import { type, TypographyVariant } from "@/theme";

export interface ThemedTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  className?: string;
}

export function ThemedText({
  variant = "body",
  color,
  style,
  children,
  className,
  ...props
}: ThemedTextProps) {
  const baseStyle: TextStyle = type[variant];
  const combinedStyle = [
    baseStyle,
    color ? { color } : null,
    style,
  ];

  return (
    <Text
      style={combinedStyle}
      className={className}
      {...props}
    >
      {children}
    </Text>
  );
}
