import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Image } from "expo-image";
import { MapPin, Star, ChevronRight } from "lucide-react-native";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { Property } from "@/lib/stays";
import { colors, radius } from "@/theme";
import { ThemedText } from "@/components/themed-text";
import { PressableScale } from "@/components/ui/pressable-scale";

export interface PropertyCardProps {
  property: Property;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function PropertyCard({
  property,
  onPress,
  style,
  className,
}: PropertyCardProps) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${property.title}, in ${property.city}, ${property.region}. Rated ${property.rating} stars.`}
      className={className}
      style={[{ width: "100%" }, style]}
    >
      <View
        style={{
          width: "100%",
          height: 272,
          borderRadius: radius["2xl"],
          overflow: "hidden",
          position: "relative",
          backgroundColor: colors.surfaceGray,
        }}
      >
        {/* Full-bleed Photo */}
        <Image
          source={{ uri: property.imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
        />

        {/* Scrim Gradient on lower half for text legibility */}
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 160,
          }}
          pointerEvents="none"
        >
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id={`scrim-${property.id}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#000000" stopOpacity="0" />
                <Stop offset="35%" stopColor="#000000" stopOpacity="0.35" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0.88" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill={`url(#scrim-${property.id})`} />
          </Svg>
        </View>

        {/* Rating Pill Badge (top right) */}
        <View
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            height: 40,
            paddingHorizontal: 16,
            borderRadius: radius.full,
            backgroundColor: colors.surfaceWhite,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
          }}
        >
          <Star size={18} color={colors.textPrimary} fill={colors.textPrimary} />
          <ThemedText
            style={{
              fontSize: 16,
              lineHeight: 20,
              fontFamily: "PlusJakartaSans_700Bold",
              fontWeight: "700",
              color: colors.textPrimary,
            }}
          >
            {property.rating.toFixed(1)}
          </ThemedText>
        </View>

        {/* Location & Title block (bottom left) */}
        <View
          style={{
            position: "absolute",
            left: 20,
            right: 88,
            bottom: 20,
            gap: 4,
          }}
        >
          {/* Location row */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <MapPin size={18} color="#FFFFFF" fill="#FFFFFF" />
            <ThemedText
              style={{
                fontSize: 14,
                lineHeight: 18,
                fontFamily: "PlusJakartaSans_600SemiBold",
                fontWeight: "600",
                color: "#FFFFFF",
                textShadowColor: "rgba(0, 0, 0, 0.4)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              {`${property.city}, ${property.region}`}
            </ThemedText>
          </View>

          {/* Title */}
          <ThemedText
            numberOfLines={2}
            style={{
              fontSize: 24,
              lineHeight: 28,
              fontFamily: "PlusJakartaSans_800ExtraBold",
              fontWeight: "800",
              color: "#FFFFFF",
              letterSpacing: -0.6,
              textShadowColor: "rgba(0, 0, 0, 0.45)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {property.title}
          </ThemedText>
        </View>

        {/* Chevron Action Button (bottom right) */}
        <View
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={{
            position: "absolute",
            right: 16,
            bottom: 16,
            width: 56,
            height: 56,
            borderRadius: radius.full,
            backgroundColor: colors.surfaceWhite,
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          <ChevronRight size={24} color={colors.textPrimary} strokeWidth={2.5} />
        </View>
      </View>
    </PressableScale>
  );
}
