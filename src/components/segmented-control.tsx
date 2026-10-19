import React from "react";
import { View, Pressable, ViewStyle, StyleProp } from "react-native";
import { colors, radius, spacing } from "@/theme";
import { ThemedText } from "./themed-text";

export interface SegmentItem {
  id: string;
  label: string;
  icon?: (selected: boolean) => React.ReactNode;
}

export interface SegmentedControlProps {
  items: SegmentItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function SegmentedControl({
  items,
  selectedId,
  onSelect,
  style,
  className,
}: SegmentedControlProps) {
  return (
    <View
      className={className}
      style={[
        {
          flexDirection: "row",
          backgroundColor: colors.surfaceGray,
          borderRadius: radius.full,
          borderCurve: "continuous",
          padding: spacing.xs,
          alignSelf: "flex-start",
          borderWidth: 1,
          borderColor: colors.borderGray,
        },
        style,
      ]}
    >
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(item.id)}
            style={({ pressed }) => [
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.xl,
                borderRadius: radius.full,
                borderCurve: "continuous",
                backgroundColor: isSelected
                  ? colors.textPrimary
                  : pressed
                  ? "#EAECEF"
                  : "transparent",
                gap: spacing.sm,
              },
            ]}
          >
            {item.icon ? item.icon(isSelected) : null}
            <ThemedText
              variant="caption"
              color={isSelected ? colors.textWhite : colors.textPrimary}
              style={{
                fontFamily: isSelected
                  ? "PlusJakartaSans_700Bold"
                  : "PlusJakartaSans_500Medium",
              }}
            >
              {item.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
