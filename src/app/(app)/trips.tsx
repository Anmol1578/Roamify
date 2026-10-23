import React from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Calendar } from "lucide-react-native";
import { colors, radius, spacing } from "@/theme";
import { ThemedText } from "@/components/themed-text";
import { PressableScale } from "@/components/ui/pressable-scale";

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

        <View
          style={{
            marginTop: 40,
            paddingVertical: 56,
            paddingHorizontal: 24,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F8F9FA",
            borderRadius: radius["2xl"],
            borderWidth: 1,
            borderColor: colors.borderGray,
            gap: 16,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: colors.surfaceWhite,
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            }}
          >
            <Calendar size={32} color={colors.textPrimary} strokeWidth={2} />
          </View>

          <ThemedText
            style={{
              fontSize: 22,
              lineHeight: 28,
              fontFamily: "PlusJakartaSans_700Bold",
              fontWeight: "700",
              color: colors.textPrimary,
              textAlign: "center",
            }}
          >
            No trips booked yet
          </ThemedText>

          <ThemedText
            style={{
              fontSize: 15,
              lineHeight: 22,
              fontFamily: "PlusJakartaSans_400Regular",
              color: colors.textSecondary,
              textAlign: "center",
              maxWidth: 280,
            }}
          >
            When you book a stay, your upcoming reservation details will appear here.
          </ThemedText>

          <PressableScale
            onPress={() => router.navigate("/home")}
            style={{
              marginTop: 8,
              paddingHorizontal: 28,
              paddingVertical: 14,
              borderRadius: radius.full,
              backgroundColor: colors.primaryYellow,
            }}
          >
            <ThemedText
              style={{
                fontSize: 16,
                fontFamily: "PlusJakartaSans_700Bold",
                fontWeight: "700",
                color: colors.textPrimary,
              }}
            >
              Start exploring
            </ThemedText>
          </PressableScale>
        </View>
      </ScrollView>
    </View>
  );
}
