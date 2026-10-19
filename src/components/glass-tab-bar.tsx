import React from "react";
import { View, Pressable, ViewStyle, StyleProp } from "react-native";
import { Home, Search, Calendar, User } from "lucide-react-native";
import { colors, radius, spacing, shadows } from "@/theme";
import { ThemedText } from "./themed-text";

export type TabId = "home" | "search" | "trips" | "profile";

export interface TabItem {
  id: TabId;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

export interface GlassTabBarProps {
  activeTab?: TabId;
  onTabPress?: (tabId: TabId) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const defaultTabs: TabItem[] = [
  {
    id: "home",
    label: "Home",
    icon: (active) => (
      <Home size={22} color={colors.textPrimary} strokeWidth={active ? 2.5 : 2} />
    ),
  },
  {
    id: "search",
    label: "Search",
    icon: (active) => (
      <Search size={22} color={colors.textPrimary} strokeWidth={active ? 2.5 : 2} />
    ),
  },
  {
    id: "trips",
    label: "Trips",
    icon: (active) => (
      <Calendar size={22} color={colors.textPrimary} strokeWidth={active ? 2.5 : 2} />
    ),
  },
  {
    id: "profile",
    label: "Profile",
    icon: (active) => (
      <User size={22} color={colors.textPrimary} strokeWidth={active ? 2.5 : 2} />
    ),
  },
];

export function GlassTabBar({
  activeTab = "home",
  onTabPress,
  style,
  className,
}: GlassTabBarProps) {
  return (
    <View
      className={className}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          backgroundColor: colors.glassBlur,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: radius.full,
          borderCurve: "continuous",
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          boxShadow: shadows.glass,
        },
        style,
      ]}
    >
      {defaultTabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            onPress={() => onTabPress?.(tab.id)}
            style={({ pressed }) => [
              {
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            {isActive ? (
              <View
                style={{
                  width: 52,
                  height: 38,
                  borderRadius: radius.full,
                  backgroundColor: colors.primaryYellow,
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(255, 198, 41, 0.45)",
                  marginBottom: 2,
                }}
              >
                {tab.icon(true)}
              </View>
            ) : (
              <View
                style={{
                  height: 38,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 2,
                }}
              >
                {tab.icon(false)}
              </View>
            )}

            <ThemedText
              variant="small"
              color={isActive ? colors.textPrimary : colors.textSecondary}
              style={{
                fontFamily: isActive
                  ? "PlusJakartaSans_700Bold"
                  : "PlusJakartaSans_500Medium",
                fontSize: 11,
              }}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
