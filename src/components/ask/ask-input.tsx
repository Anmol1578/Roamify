import React, { useState } from "react";
import { View, TextInput } from "react-native";
import { MessageSquare, ArrowUp } from "lucide-react-native";
import { colors, radius } from "@/theme";
import { PressableScale } from "@/components/ui/pressable-scale";

export interface AskInputProps {
  onSend: (text: string) => void;
  placeholder?: string;
}

export function AskInput({
  onSend,
  placeholder = "Ask about this stay...",
}: AskInputProps) {
  const [text, setText] = useState("");

  const trimmed = text.trim();
  const canSend = trimmed.length > 0;

  const handleSend = () => {
    if (!canSend) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <View
      style={{
        marginHorizontal: 16,
        height: 52,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderRadius: radius.full,
        backgroundColor: "#F3F4F6",
        paddingLeft: 16,
        paddingRight: 6,
        borderWidth: 1,
        borderColor: "#E5E7EB",
      }}
    >
      <MessageSquare size={19} color="#9CA3AF" strokeWidth={2.2} />

      <TextInput
        value={text}
        onChangeText={setText}
        maxLength={300}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        onSubmitEditing={handleSend}
        returnKeyType="send"
        submitBehavior="submit"
        style={{
          flex: 1,
          fontSize: 14.5,
          fontFamily: "PlusJakartaSans_500Medium",
          color: colors.textPrimary,
          paddingVertical: 0,
        }}
      />

      <PressableScale
        onPress={handleSend}
        disabled={!canSend}
        scale={0.92}
        accessibilityRole="button"
        accessibilityLabel="Send"
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: canSend ? "#7C3AED" : "#E5E7EB",
          alignItems: "center",
          justifyContent: "center",
          opacity: canSend ? 1 : 0.6,
        }}
      >
        <ArrowUp
          size={19}
          color={canSend ? "#FFFFFF" : "#9CA3AF"}
          strokeWidth={2.5}
        />
      </PressableScale>
    </View>
  );
}
