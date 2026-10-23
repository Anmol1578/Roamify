import React from "react";
import { View } from "react-native";
import { ThemedText } from "../themed-text";

// PLACEHOLDER: real roamify wordmark asset will go in assets/images/
export function Wordmark() {
  return (
    <View>
      <ThemedText
        variant="display"
        style={{
          fontSize: 32,
          lineHeight: 36,
          fontFamily: "PlusJakartaSans_800ExtraBold",
          fontWeight: "800",
          letterSpacing: -1.2,
          color: "#0B0B1A",
        }}
      >
        roamify
      </ThemedText>
    </View>
  );
}
