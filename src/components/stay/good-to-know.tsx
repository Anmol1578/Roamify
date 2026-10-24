import React from "react";
import { View, Pressable } from "react-native";
import {
  Clock,
  Moon,
  Dog,
  Ban,
  PartyPopper,
} from "lucide-react-native";
import { ThemedText } from "@/components/themed-text";
import { colors } from "@/theme";
import { HouseRules } from "@/lib/stays";

export interface GoodToKnowProps {
  rules?: HouseRules | any;
  petsAllowed?: boolean;
  onShowAll?: () => void;
}

interface RuleItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
}

export function GoodToKnow({ rules, petsAllowed, onShowAll }: GoodToKnowProps) {
  const items: RuleItem[] = [];

  // Check-in
  const checkInTime = rules?.checkIn || rules?.checkInTime || "3:00 PM";
  items.push({
    key: "check-in",
    label: `Check-in after ${checkInTime}`,
    icon: Clock,
  });

  // Checkout
  const checkOutTime = rules?.checkOut || rules?.checkOutTime || "11:00 AM";
  items.push({
    key: "checkout",
    label: `Checkout before ${checkOutTime}`,
    icon: Clock,
  });

  // Quiet hours (only when set)
  const quietHours = rules?.quietHours;
  if (quietHours) {
    items.push({
      key: "quiet-hours",
      label: `Quiet hours: ${quietHours}`,
      icon: Moon,
    });
  }

  // Pets
  const isPetsAllowed =
    petsAllowed !== undefined
      ? petsAllowed
      : rules?.petsAllowed !== undefined
      ? !!rules.petsAllowed
      : false;
  items.push({
    key: "pets",
    label: isPetsAllowed ? "Pets allowed" : "No pets allowed",
    icon: Dog,
  });

  // Smoking
  const isSmokingAllowed = !!rules?.smokingAllowed;
  items.push({
    key: "smoking",
    label: isSmokingAllowed ? "Smoking allowed" : "No smoking allowed",
    icon: Ban,
  });

  // Parties
  const isPartiesAllowed = !!rules?.partiesAllowed;
  items.push({
    key: "parties",
    label: isPartiesAllowed ? "Parties or events allowed" : "No parties or events",
    icon: PartyPopper,
  });

  const hasAdditionalRules =
    Array.isArray(rules?.additionalRules) && rules.additionalRules.length > 0;

  return (
    <View style={{ marginTop: 20, gap: 12 }}>
      <ThemedText
        style={{
          fontSize: 18,
          fontFamily: "PlusJakartaSans_700Bold",
          fontWeight: "700",
          color: colors.textPrimary,
        }}
      >
        Good to know
      </ThemedText>

      <View style={{ gap: 10 }}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <View
              key={item.key}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Icon size={19} color={colors.textPrimary} strokeWidth={2.1} />
              <ThemedText
                style={{
                  fontSize: 14.5,
                  fontFamily: "PlusJakartaSans_500Medium",
                  color: colors.textPrimary,
                  flex: 1,
                }}
              >
                {item.label}
              </ThemedText>
            </View>
          );
        })}
      </View>

      {hasAdditionalRules && onShowAll && (
        <Pressable
          onPress={onShowAll}
          hitSlop={8}
          style={{ alignSelf: "flex-start", marginTop: 4 }}
        >
          <ThemedText
            style={{
              fontSize: 14.5,
              fontFamily: "PlusJakartaSans_600SemiBold",
              fontWeight: "600",
              color: "#7C3AED",
              textDecorationLine: "underline",
            }}
          >
            Show all rules
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}
