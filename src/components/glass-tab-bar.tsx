import React from "react";
import { View, Platform, ViewStyle, StyleProp } from "react-native";
import { Home, Search, Calendar, User } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { colors, radius, spacing, shadows } from "@/theme";
import { ThemedText } from "./themed-text";
import { PressableScale } from "./ui/pressable-scale";

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
  const handleTabPress = (tabId: TabId) => {
    if (tabId !== activeTab) {
      Haptics.selectionAsync().catch(() => {});
    }
    onTabPress?.(tabId);
  };

  return (
    <View
      className={className}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
          backgroundColor:
            Platform.OS === "android"
              ? "rgba(255, 255, 255, 0.95)"
              : "rgba(255, 255, 255, 0.82)",
          borderWidth: 1.5,
          borderColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: radius.full,
          borderCurve: "continuous",
          paddingVertical: spacing.xs + 2,
          paddingHorizontal: spacing.md,
          boxShadow: shadows.glass,
          elevation: 8,
        },
        style,
      ]}
    >
      {defaultTabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <PressableScale
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            onPress={() => handleTabPress(tab.id)}
            hitSlop={6}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: spacing.sm + 2,
                paddingVertical: spacing.xs,
              }}
            >
              {isActive ? (
                <View
                  style={{
                    width: 54,
                    height: 38,
                    borderRadius: radius.full,
                    backgroundColor: colors.primaryYellow,
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(255, 198, 41, 0.5)",
                    elevation: 3,
                    marginBottom: 2,
                  }}
                >
                  {tab.icon(true)}
                </View>
              ) : (
                <View
                  style={{
                    width: 54,
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
            </View>
          </PressableScale>
        );
      })}
    </View>
  );
}
