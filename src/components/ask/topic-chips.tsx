import React from "react";
import { View, ScrollView } from "react-native";
import { TOPICS, TopicDefinition } from "@/lib/ask";
import { ThemedText } from "@/components/themed-text";
import { PressableScale } from "@/components/ui/pressable-scale";
import { radius } from "@/theme";

export interface TopicChipsProps {
  onSelectTopic: (topic: TopicDefinition) => void;
}

export function TopicChips({ onSelectTopic }: TopicChipsProps) {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 2,
        }}
      >
        {TOPICS.map((topic) => (
          <PressableScale
            key={topic.key}
            onPress={() => onSelectTopic(topic)}
            scale={0.96}
            accessibilityRole="button"
            accessibilityLabel={`Ask about ${topic.chipLabel}`}
            style={{
              paddingHorizontal: 18,
              paddingVertical: 9,
              borderRadius: radius.full,
              backgroundColor: "#F3F4F6",
              borderWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <ThemedText
              style={{
                fontSize: 14,
                fontFamily: "PlusJakartaSans_600SemiBold",
                fontWeight: "600",
                color: "#1F2937",
              }}
            >
              {topic.chipLabel}
            </ThemedText>
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  );
}
