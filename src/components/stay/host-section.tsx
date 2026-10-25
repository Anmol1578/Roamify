import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { Image } from "expo-image";
import { Award } from "lucide-react-native";
import { Host } from "@/lib/stays";
import { colors } from "@/theme";
import { ThemedText } from "@/components/themed-text";
import { Icon, IconName } from "@/components/ui/icons";
import { hostFacts, HostFactKey } from "@/lib/stay-details";

export interface HostSectionProps {
  host: Host;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function SuperhostLine() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <Award size={15} color="#B45309" strokeWidth={2.2} />
      <ThemedText
        style={{
          fontSize: 13,
          fontFamily: "PlusJakartaSans_600SemiBold",
          fontWeight: "600",
          color: colors.textSecondary,
        }}
      >
        Superhost
      </ThemedText>
    </View>
  );
}

const FACT_ICON_NAMES: Record<HostFactKey, IconName> = {
  since: "calendar",
  response: "clock",
  languages: "globe",
};

export function HostSection({ host, style, className }: HostSectionProps) {
  const facts = hostFacts(host);

  return (
    <View className={className} style={[{ gap: 16 }, style]}>
      {/* Title Heading */}
      <ThemedText
        variant="title"
        style={{
          fontSize: 20,
          lineHeight: 26,
          fontFamily: "PlusJakartaSans_700Bold",
          fontWeight: "700",
          color: colors.textPrimary,
        }}
      >
        Meet your host
      </ThemedText>

      {/* Host Row: Avatar (md: ~52x52) + Name & Superhost line */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Image
          source={{ uri: host.avatarUrl || host.photoUrl }}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: "#E5E7EB",
            borderWidth: 2,
            borderColor: colors.surfaceWhite,
          }}
          contentFit="cover"
        />

        <View style={{ gap: 2 }}>
          <ThemedText
            variant="subhead"
            style={{
              fontSize: 17,
              fontFamily: "PlusJakartaSans_700Bold",
              fontWeight: "700",
              color: colors.textPrimary,
            }}
          >
            {host.name}
          </ThemedText>
          {host.isSuperhost ? <SuperhostLine /> : null}
        </View>
      </View>

      {/* Bio Body */}
      {host.bio ? (
        <ThemedText
          variant="body"
          style={{
            fontSize: 14.5,
            lineHeight: 22,
            fontFamily: "PlusJakartaSans_400Regular",
            color: "#374151",
          }}
        >
          {host.bio}
        </ThemedText>
      ) : null}

      {/* Fact Rows: icon 20 + text, gap-3, gap-2.5 between rows */}
      {facts.length > 0 ? (
        <View style={{ gap: 10, marginTop: 2 }}>
          {facts.map((fact) => {
            const iconName = FACT_ICON_NAMES[fact.key];
            return (
              <View
                key={fact.key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Icon name={iconName} size={20} tone="secondary" />
                <ThemedText
                  variant="body"
                  style={{
                    fontSize: 14.5,
                    fontFamily: "PlusJakartaSans_500Medium",
                    color: colors.textPrimary,
                  }}
                >
                  {fact.text}
                </ThemedText>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
