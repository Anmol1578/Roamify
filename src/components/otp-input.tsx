import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";
import { colors, radius } from "@/theme";
import { ThemedText } from "./themed-text";

export interface OtpInputProps {
  length?: number;
  value: string;
  onChangeText: (code: string) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
  autoFocus?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChangeText,
  style,
  className,
  autoFocus = true,
}: OtpInputProps) {
  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const [isFocused, setIsFocused] = useState(false);

  const digits = value.split("");

  const handleChange = (text: string) => {
    // Only accept numeric digits up to length
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, length);
    onChangeText(cleaned);
  };

  const handleCellPress = () => {
    inputRef.current?.focus();
  };

  return (
    <Pressable
      onPress={handleCellPress}
      style={[{ width: "100%", position: "relative" }, style]}
      className={className}
      accessibilityRole="text"
      accessibilityLabel="6-digit verification code"
    >
      {/* Hidden native text input for reliable keyboard, paste & SMS autofill */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus={autoFocus}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.hiddenInput}
        caretHidden
      />

      {/* Visual digit cells */}
      <View style={styles.cellsContainer}>
        {Array.from({ length }).map((_, index) => {
          const char = digits[index] || "";
          const isCurrent = isFocused && index === Math.min(digits.length, length - 1);
          const isFilled = !!char;

          return (
            <View
              key={index}
              style={[
                styles.cell,
                isFilled && styles.cellFilled,
                isCurrent && styles.cellCurrent,
              ]}
            >
              <ThemedText
                style={{
                  fontSize: 22,
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontWeight: "700",
                  color: colors.textPrimary,
                  textAlign: "center",
                }}
              >
                {char}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hiddenInput: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0,
    zIndex: 2,
  },
  cellsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: 8,
  },
  cell: {
    flex: 1,
    height: 60,
    borderRadius: radius["2xl"],
    borderCurve: "continuous",
    backgroundColor: colors.surfaceGray,
    borderWidth: 1.5,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  cellFilled: {
    backgroundColor: colors.surfaceWhite,
    borderColor: colors.borderGray,
  },
  cellCurrent: {
    backgroundColor: colors.surfaceWhite,
    borderColor: colors.lavender,
    shadowColor: colors.lavender,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
});
