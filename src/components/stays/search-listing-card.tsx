import React from "react";
import { View, StyleProp, ViewStyle, Pressable } from "react-native";
import { Image } from "expo-image";
import {
  MapPin,
  Star,
  Heart,
  Bath,
  Dog,
  Waves,
  Wifi,
  Flame,
} from "lucide-react-native";
import { Property } from "@/lib/stays";
import { colors, radius } from "@/theme";
import { ThemedText } from "@/components/themed-text";
import { PressableScale } from "@/components/ui/pressable-scale";
import { useFavorites } from "@/lib/favorites";

export interface SearchListingCardProps {
  property: Property;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function SearchListingCard({
  property,
  onPress,
  style,
  className,
}: SearchListingCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const stayId = property.slug || property.id;
  const favorite = isFavorite(stayId);

  const handleToggleFavorite = () => {
    toggleFavorite(stayId);
  };

  // Determine top 2 amenities with badges matching screenshots
  const badges: { label: string; icon: React.ReactNode }[] = [];

  const rawAmenities = property.amenities.map((a) => a.toLowerCase().replace(/_/g, "-"));

  if (rawAmenities.some((a) => a.includes("hot-tub") || a.includes("hot tub"))) {
    badges.push({
      label: "Hot Tub",
      icon: <Bath size={12} color="#4B5563" strokeWidth={2} />,
    });
  }

  if (
    property.petsAllowed ||
    rawAmenities.some((a) => a.includes("pet-friendly") || a.includes("pet friendly"))
  ) {
    badges.push({
      label: "Pet Friendly",
      icon: <Dog size={12} color="#4B5563" strokeWidth={2} />,
    });
  }

  if (rawAmenities.some((a) => a.includes("ocean-view") || a.includes("ocean view"))) {
    badges.push({
      label: "Ocean View",
      icon: <Waves size={12} color="#4B5563" strokeWidth={2} />,
    });
  }

  if (rawAmenities.some((a) => a.includes("wifi"))) {
    badges.push({
      label: "Wifi",
      icon: <Wifi size={12} color="#4B5563" strokeWidth={2} />,
    });
  }

  if (rawAmenities.some((a) => a.includes("fireplace") || a.includes("fire-pit"))) {
    badges.push({
      label: "Fireplace",
      icon: <Flame size={12} color="#4B5563" strokeWidth={2} />,
    });
  }

  const visibleBadges = badges.slice(0, 2);

  return (
    <PressableScale
      onPress={onPress}
      scale={0.98}
      accessibilityRole="button"
      accessibilityLabel={`${property.title}, $${property.pricePerNight} per night in ${property.city}`}
      className={className}
      style={[{ width: "100%" }, style]}
    >
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          paddingVertical: 8,
          gap: 14,
        }}
      >
        {/* Left: Square Photo */}
        <View
          style={{
            width: 130,
            height: 130,
            borderRadius: radius["2xl"],
            overflow: "hidden",
            backgroundColor: colors.surfaceGray,
          }}
        >
          <Image
            source={{ uri: property.imageUrl || property.image }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        </View>

        {/* Right: Content Info */}
        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            paddingVertical: 2,
          }}
        >
          {/* Header Row: Title & Heart Favorite */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <ThemedText
              numberOfLines={2}
              style={{
                fontSize: 16.5,
                lineHeight: 21,
                fontFamily: "PlusJakartaSans_700Bold",
                fontWeight: "700",
                color: colors.textPrimary,
                flex: 1,
              }}
            >
              {property.title}
            </ThemedText>

            {/* Favorite Heart Button */}
            <Pressable
              onPress={handleToggleFavorite}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Add to favorites"
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#F7F8FA",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Heart
                size={18}
                color={favorite ? "#EF4444" : "#9CA3AF"}
                fill={favorite ? "#EF4444" : "transparent"}
                strokeWidth={2}
              />
            </Pressable>
          </View>

          {/* Location Row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              marginTop: 2,
            }}
          >
            <MapPin size={13} color="#9CA3AF" />
            <ThemedText
              numberOfLines={1}
              style={{
                fontSize: 13,
                lineHeight: 17,
                fontFamily: "PlusJakartaSans_500Medium",
                color: colors.textSecondary,
              }}
            >
              {`${property.city}, ${property.region}`}
            </ThemedText>
          </View>

          {/* Rating Row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              marginTop: 2,
            }}
          >
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <ThemedText
              style={{
                fontSize: 13.5,
                lineHeight: 18,
                fontFamily: "PlusJakartaSans_700Bold",
                fontWeight: "700",
                color: colors.textPrimary,
              }}
            >
              {property.rating.toFixed(1)}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 13,
                lineHeight: 18,
                fontFamily: "PlusJakartaSans_500Medium",
                color: colors.textSecondary,
              }}
            >
              {`(${property.reviewCount})`}
            </ThemedText>
          </View>

          {/* Amenity Pill Badges */}
          {visibleBadges.length > 0 ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 6,
                marginTop: 4,
              }}
            >
              {visibleBadges.map((badge, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    paddingHorizontal: 8,
                    paddingVertical: 3.5,
                    borderRadius: 8,
                    backgroundColor: "#F4F5F7",
                  }}
                >
                  {badge.icon}
                  <ThemedText
                    style={{
                      fontSize: 11.5,
                      lineHeight: 15,
                      fontFamily: "PlusJakartaSans_600SemiBold",
                      fontWeight: "600",
                      color: "#4B5563",
                    }}
                  >
                    {badge.label}
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : null}

          {/* Costing / Price Row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              marginTop: 6,
            }}
          >
            <ThemedText
              style={{
                fontSize: 19,
                lineHeight: 23,
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontWeight: "800",
                color: colors.textPrimary,
              }}
            >
              {`$${property.pricePerNight}`}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 13.5,
                lineHeight: 18,
                fontFamily: "PlusJakartaSans_500Medium",
                color: colors.textSecondary,
              }}
            >
              {" / night"}
            </ThemedText>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}
