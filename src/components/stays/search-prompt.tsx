import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleProp,
  ViewStyle,
  Keyboard,
} from "react-native";
import { Sparkles, ArrowUpRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { colors, radius } from "@/theme";
import { PressableScale } from "@/components/ui/pressable-scale";

export const DEFAULT_SEARCH_PLACEHOLDER = "quiet pet friendly cabin with hot tub";

export interface SearchPromptProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
  editable?: boolean;
  onPressBar?: () => void;
}

export function SearchPrompt({
  value,
  onChangeText,
  onSubmit,
  placeholder = DEFAULT_SEARCH_PLACEHOLDER,
  autoFocus = false,
  style,
  className,
  editable = true,
  onPressBar,
}: SearchPromptProps) {
  const [internalText, setInternalText] = useState("");
  const currentText = value !== undefined ? value : internalText;

  const handleTextChange = (text: string) => {
    if (value === undefined) {
      setInternalText(text);
    }
    onChangeText?.(text);
  };

  const handleReturnSubmit = () => {
    Keyboard.dismiss();
    if (currentText.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onSubmit?.(currentText.trim());
    }
  };

  const handleArrowSubmit = () => {
    Keyboard.dismiss();
    const query = currentText.trim() ? currentText.trim() : placeholder;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSubmit?.(query);
  };

  return (
    <View
      className={className}
      style={[
        {
          height: 64,
          borderRadius: radius.full,
          backgroundColor: "#D9C9FE",
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 20,
          paddingRight: 8,
          gap: 12,
        },
        style,
      ]}
    >
      {/* Sparkles icon */}
      <Sparkles size={24} color={colors.textPrimary} strokeWidth={2.2} />

      {/* TextInput */}
      <TextInput
        value={currentText}
        onChangeText={handleTextChange}
        onSubmitEditing={handleReturnSubmit}
        placeholder={placeholder}
        placeholderTextColor="rgba(11, 11, 26, 0.5)"
        autoFocus={autoFocus}
        editable={editable}
        onPress={onPressBar}
        returnKeyType="search"
        submitBehavior="blurAndSubmit"
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          flex: 1,
          fontFamily: "PlusJakartaSans_500Medium",
          fontSize: 15,
          color: colors.textPrimary,
          paddingVertical: 0,
        }}
      />

      {/* Send Arrow Button */}
      <PressableScale
        onPress={handleArrowSubmit}
        accessibilityRole="button"
        accessibilityLabel="Search stays"
        hitSlop={8}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: radius.full,
            backgroundColor: colors.surfaceWhite,
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
          }}
        >
          <ArrowUpRight size={22} color={colors.textPrimary} strokeWidth={2.4} />
        </View>
      </PressableScale>
    </View>
  );
}
