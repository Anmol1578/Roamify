import React from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing } from "@/theme";
import { ThemedText } from "@/components/themed-text";
import { EmptyState } from "@/components/ui/empty-state";

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceWhite }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText
          style={{
            fontSize: 34,
            lineHeight: 40,
            fontFamily: "PlusJakartaSans_800ExtraBold",
            fontWeight: "800",
            letterSpacing: -1.2,
            color: colors.textPrimary,
            marginBottom: spacing.xl,
          }}
        >
          Trips
        </ThemedText>

        <View style={{ marginTop: 24 }}>
          <EmptyState
            icon="calendar"
            title="No trips yet"
            message="Stays you book will show up here."
            action={{
              title: "Explore stays",
              onPress: () => router.navigate("/home"),
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
