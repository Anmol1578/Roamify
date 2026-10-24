import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { Home, TreePine, Waves, Building2, Palmtree } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { PropertyType } from "@/lib/stays";
import { colors, radius, spacing } from "@/theme";
import { ThemedText } from "@/components/themed-text";
import { PressableScale } from "@/components/ui/pressable-scale";

export type CategoryFilter = "all" | PropertyType;

export interface CategoryOption {
  id: CategoryFilter;
  label: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number; fill?: string }>;
}

export const CATEGORIES: CategoryOption[] = [
  { id: "all", label: "All Stays", icon: Home },
  { id: "cabin", label: "Cabins", icon: TreePine },
  { id: "beach", label: "Beach", icon: Waves },
  { id: "city", label: "City", icon: Building2 },
  { id: "villa", label: "Villas", icon: Palmtree },
];

export interface CategoryChipsProps {
  selected: CategoryFilter;
  onSelect: (category: CategoryFilter) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function CategoryChips({
  selected,
  onSelect,
  style,
  className,
}: CategoryChipsProps) {
  const handleSelect = (category: CategoryFilter) => {
    if (category !== selected) {
      Haptics.selectionAsync().catch(() => {});
      onSelect(category);
    }
  };

  return (
    <View
      className={className}
      style={[
        {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
        },
        style,
      ]}
    >
      {CATEGORIES.map((cat) => {
        const isSelected = cat.id === selected;
        const IconComponent = cat.icon;

        return (
          <PressableScale
            key={cat.id}
            onPress={() => handleSelect(cat.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${cat.label} category`}
            hitSlop={6}
          >
            <View
              style={{
                height: 48,
                paddingHorizontal: spacing.lg + 2,
                borderRadius: radius.full,
                backgroundColor: isSelected ? colors.primaryYellow : "#ECEEF2",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <IconComponent
                size={20}
                color={colors.textPrimary}
                strokeWidth={isSelected ? 2.5 : 2}
                fill={cat.id === "all" && isSelected ? colors.textPrimary : "transparent"}
              />
              <ThemedText
                style={{
                  fontSize: 14.5,
                  lineHeight: 18,
                  fontFamily: isSelected
                    ? "PlusJakartaSans_700Bold"
                    : "PlusJakartaSans_600SemiBold",
                  fontWeight: isSelected ? "700" : "600",
                  color: colors.textPrimary,
                }}
              >
                {cat.label}
              </ThemedText>
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}
