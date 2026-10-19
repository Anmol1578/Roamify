import React, { useState } from "react";
import {
  View,
  TextInput,
  TextInputProps,
  Pressable,
  ViewStyle,
  StyleProp,
} from "react-native";
import { Eye, EyeOff, Search, SlidersHorizontal } from "lucide-react-native";
import { colors, radius, spacing, fontFamilies } from "@/theme";
import { ThemedText } from "./themed-text";

export interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  error?: boolean;
  errorMessage?: string;
  containerStyle?: StyleProp<ViewStyle>;
  containerClassName?: string;
  className?: string;
  onFilterPress?: () => void;
  showFilterButton?: boolean;
}

export function Input({
  label,
  leftIcon,
  rightIcon,
  isPassword = false,
  error = false,
  errorMessage,
  containerStyle,
  containerClassName,
  className,
  value,
  onChangeText,
  placeholder,
  onFocus,
  onBlur,
  secureTextEntry,
  showFilterButton = false,
  onFilterPress,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const effectiveSecure = isPassword ? !showPassword : secureTextEntry;
  const hasError = !!error || !!errorMessage;

  const getBackgroundColor = () => {
    if (hasError) return "#FEECEE";
    if (isFocused) return colors.surfaceWhite;
    return colors.surfaceGray;
  };

  const getBorderColor = () => {
    if (hasError) return colors.statusError.icon; // #DC2626
    if (isFocused) return colors.lavender;
    return "transparent";
  };

  return (
    <View style={{ width: "100%" }}>
      <View
        className={containerClassName}
        style={[
          {
            minHeight: label ? 64 : 52,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: getBackgroundColor(),
            borderRadius: radius.xl,
            borderCurve: "continuous",
            borderWidth: 1.5,
            borderColor: getBorderColor(),
            paddingHorizontal: spacing.lg,
            gap: spacing.md,
          },
          containerStyle,
        ]}
      >
        {leftIcon ? (
          <View className="items-center justify-center">{leftIcon}</View>
        ) : null}

        {label ? (
          <View style={{ flex: 1, justifyContent: "center", paddingVertical: spacing.xs }}>
            <ThemedText
              variant="caption"
              color={colors.textPrimary}
              style={{ fontSize: 13, fontFamily: fontFamilies.semibold, marginBottom: 2 }}
            >
              {label}
            </ThemedText>
            <TextInput
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={colors.textMuted}
              secureTextEntry={effectiveSecure}
              onFocus={(e) => {
                setIsFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                onBlur?.(e);
              }}
              style={{
                fontSize: 15,
                fontFamily: fontFamilies.medium,
                color: colors.textPrimary,
                paddingVertical: 0,
                paddingHorizontal: 0,
              }}
              className={className}
              {...props}
            />
          </View>
        ) : (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            secureTextEntry={effectiveSecure}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            style={{
              flex: 1,
              fontSize: 16,
              fontFamily: fontFamilies.medium,
              color: colors.textPrimary,
              paddingVertical: spacing.md,
            }}
            className={className}
            {...props}
          />
        )}

        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={10}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </Pressable>
        ) : null}

        {showFilterButton ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open filters"
            onPress={onFilterPress}
            hitSlop={10}
            className="p-1"
          >
            <SlidersHorizontal size={20} color={colors.textPrimary} />
          </Pressable>
        ) : null}

        {rightIcon && !isPassword && !showFilterButton ? (
          <View className="items-center justify-center">{rightIcon}</View>
        ) : null}
      </View>

      {errorMessage ? (
        <ThemedText
          style={{
            marginTop: 5,
            marginLeft: 4,
            fontSize: 13.5,
            lineHeight: 18,
            fontFamily: fontFamilies.medium,
            color: colors.statusError.text,
          }}
        >
          {errorMessage}
        </ThemedText>
      ) : null}
    </View>
  );
}

export interface SearchInputProps extends Omit<InputProps, "leftIcon" | "showFilterButton"> {
  onFilterPress?: () => void;
}

export function SearchInput({
  placeholder = "Cabins in California",
  onFilterPress,
  ...props
}: SearchInputProps) {
  return (
    <Input
      leftIcon={<Search size={20} color={colors.textPrimary} />}
      showFilterButton
      onFilterPress={onFilterPress}
      placeholder={placeholder}
      {...props}
    />
  );
}
