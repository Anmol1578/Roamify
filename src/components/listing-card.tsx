import React from "react";
import { View, Pressable, ViewStyle, StyleProp } from "react-native";
import { Image } from "expo-image";
import { Heart, MapPin, Star, Sparkles, Dog } from "lucide-react-native";
import { colors, radius, spacing, shadows } from "@/theme";
import { ThemedText } from "./themed-text";
import { Badge } from "./badge";
import { IconButton } from "./button";

export interface ListingCardProps {
  title?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  pricePerNight?: number;
  imageUrl?: string;
  amenities?: { label: string; icon?: React.ReactNode }[];
  isFavorite?: boolean;
  onFavoritePress?: () => void;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function ListingCard({
  title = "Modern Cabin with Hot Tub",
  location = "Lake Arrowhead, CA",
  rating = 4.9,
  reviewCount = 342,
  pricePerNight = 280,
  imageUrl = "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
  amenities = [
    { label: "Hot Tub", icon: <Sparkles size={14} color={colors.textPrimary} /> },
    { label: "Pet Friendly", icon: <Dog size={14} color={colors.textPrimary} /> },
  ],
  isFavorite = false,
  onFavoritePress,
  onPress,
  style,
  className,
}: ListingCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, in ${location}, $${pricePerNight} per night`}
      onPress={onPress}
      className={className}
      style={({ pressed }) => [
        {
          backgroundColor: colors.surfaceWhite,
          borderRadius: radius["2xl"],
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colors.borderGray,
          padding: spacing.md,
          gap: spacing.md,
          boxShadow: shadows.card,
          opacity: pressed ? 0.96 : 1,
        },
        style,
      ]}
    >
      {/* Property Image & Heart Favorite Button */}
      <View
        style={{
          height: 180,
          borderRadius: radius.xl,
          borderCurve: "continuous",
          overflow: "hidden",
          position: "relative",
          backgroundColor: colors.surfaceGray,
        }}
      >
        <Image
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={300}
        />
        <View
          style={{
            position: "absolute",
            top: spacing.sm + 2,
            right: spacing.sm + 2,
          }}
        >
          <IconButton
            size={38}
            variant="glass"
            accessibilityLabel={isFavorite ? "Remove from favorites" : "Save to favorites"}
            onPress={onFavoritePress}
            icon={
              <Heart
                size={18}
                color={isFavorite ? "#EF4444" : colors.textPrimary}
                fill={isFavorite ? "#EF4444" : "transparent"}
              />
            }
          />
        </View>
      </View>

      {/* Property Details */}
      <View style={{ gap: spacing.xs + 2 }}>
        <ThemedText
          variant="title"
          style={{ fontSize: 19, lineHeight: 24 }}
          numberOfLines={1}
        >
          {title}
        </ThemedText>

        <View className="flex-row items-center gap-1.5">
          <MapPin size={15} color={colors.lavender} />
          <ThemedText variant="caption" color={colors.textSecondary}>
            {location}
          </ThemedText>
        </View>

        <View className="flex-row items-center gap-1 mt-0.5">
          <Star size={15} color={colors.primaryYellow} fill={colors.primaryYellow} />
          <ThemedText
            variant="caption"
            color={colors.textPrimary}
            style={{ fontFamily: "PlusJakartaSans_700Bold" }}
          >
            {rating}
          </ThemedText>
          <ThemedText variant="caption" color={colors.textSecondary}>
            ({reviewCount})
          </ThemedText>
        </View>
      </View>

      {/* Amenity Badges */}
      <View className="flex-row flex-wrap gap-2 mt-0.5">
        {amenities.map((amenity, idx) => (
          <Badge
            key={idx}
            variant="amenity"
            label={amenity.label}
            icon={amenity.icon}
          />
        ))}
      </View>

      {/* Price */}
      <View className="flex-row items-baseline gap-1 pt-1 border-t border-gray-100">
        <ThemedText
          variant="title"
          style={{ fontSize: 22, fontFamily: "PlusJakartaSans_800ExtraBold" }}
        >
          ${pricePerNight}
        </ThemedText>
        <ThemedText variant="caption" color={colors.textSecondary}>
          / night
        </ThemedText>
      </View>
    </Pressable>
  );
}
