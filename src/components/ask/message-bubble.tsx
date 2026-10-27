import React from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, radius } from "@/theme";
import { ThemedText } from "@/components/themed-text";

export interface MessageBubbleProps {
  from: "roam" | "guest";
  text: string;
}

export function MessageBubble({ from, text }: MessageBubbleProps) {
  const isRoam = from === "roam";

  if (isRoam) {
    return (
      <Animated.View
        entering={FadeInDown.duration(200)}
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 10,
          alignSelf: "flex-start",
          maxWidth: "88%",
        }}
      >
        {/* Roamify Brand Avatar */}
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            overflow: "hidden",
            backgroundColor: "#0B0C13",
            borderWidth: 1,
            borderColor: "#E5E7EB",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
            marginTop: 2,
          }}
        >
          <Image
            source={require("../../../assets/images/icon.png")}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        </View>

        <View
          style={{
            flex: 1,
            borderRadius: radius["2xl"],
            borderTopLeftRadius: 6,
            backgroundColor: "#F3F4F6",
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <ThemedText
            style={{
              fontSize: 14.5,
              lineHeight: 21,
              fontFamily: "PlusJakartaSans_500Medium",
              color: colors.textPrimary,
            }}
          >
            {text}
          </ThemedText>
        </View>
      </Animated.View>
    );
  }

  // Guest bubble - exact match to screenshot (soft lavender pill)
  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      style={{
        alignSelf: "flex-end",
        borderRadius: radius["2xl"],
        borderBottomRightRadius: 6,
        backgroundColor: "#D8B4FE",
        paddingHorizontal: 18,
        paddingVertical: 11,
        maxWidth: "85%",
        shadowColor: "#7C3AED",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 1,
      }}
    >
      <ThemedText
        style={{
          fontSize: 15,
          lineHeight: 21,
          fontFamily: "PlusJakartaSans_600SemiBold",
          fontWeight: "600",
          color: "#111827",
        }}
      >
        {text}
      </ThemedText>
    </Animated.View>
  );
}
