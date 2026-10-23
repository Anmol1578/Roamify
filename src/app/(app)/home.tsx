import React, { useState } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { Search, AlertCircle, RefreshCw } from "lucide-react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  ReduceMotion,
  LayoutAnimationConfig,
} from "react-native-reanimated";
import { colors, radius } from "@/theme";
import { easeInOut } from "@/theme/motion";
import { ThemedText } from "@/components/themed-text";
import { PressableScale } from "@/components/ui/pressable-scale";
import { SearchPrompt } from "@/components/stays/search-prompt";
import { CategoryChips, CategoryFilter } from "@/components/home/category-chips";
import { PropertyCard } from "@/components/stays/property-card";
import { useHomeStays } from "@/hooks/use-home-stays";
import { posthog } from "@/lib/posthog";

const CARD_LAYOUT = LinearTransition.duration(250)
  .easing(easeInOut)
  .reduceMotion(ReduceMotion.System);
const CARD_ENTER = FadeIn.duration(200).reduceMotion(ReduceMotion.System);
const CARD_EXIT = FadeOut.duration(150).reduceMotion(ReduceMotion.System);

function CardSkeleton() {
  return (
    <View
      style={{
        width: "100%",
        height: 272,
        borderRadius: radius["2xl"],
        backgroundColor: "#EBECEF",
        overflow: "hidden",
        position: "relative",
        padding: 24,
        justifyContent: "flex-end",
      }}
    >
      <View
        style={{
          width: "60%",
          height: 28,
          borderRadius: 8,
          backgroundColor: "#D9DBE0",
          marginBottom: 10,
        }}
      />
      <View
        style={{
          width: "40%",
          height: 18,
          borderRadius: 6,
          backgroundColor: "#D9DBE0",
          marginBottom: 12,
        }}
      />
      <View
        style={{
          width: "30%",
          height: 22,
          borderRadius: 6,
          backgroundColor: "#D9DBE0",
        }}
      />
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");

  const {
    stays,
    isLoading,
    isRefreshing,
    isError,
    refetch,
    refresh,
  } = useHomeStays(selectedCategory);

  const metadata = user?.unsafeMetadata as Record<string, string> | undefined;
  const firstName =
    user?.firstName ||
    metadata?.firstName ||
    metadata?.fullName?.split(" ")[0] ||
    "";

  const greetingText = firstName ? `Hey, ${firstName} 👋` : "Hey there 👋";
  const hasCustomAvatar = Boolean(user?.hasImage && user?.imageUrl);
  const userAvatarUrl = user?.imageUrl || "";
  const userInitial = (firstName || "E").charAt(0).toUpperCase();

  const handleSearchSubmit = (query: string) => {
    posthog?.capture("search_submitted", {
      source: "home",
      query_length: query.trim().length,
    });
    router.navigate({
      pathname: "/search",
      params: { q: query },
    });
  };

  const handleOpenSearchTab = () => {
    router.navigate("/search");
  };

  const handleCategorySelect = (category: CategoryFilter) => {
    posthog?.capture("category_selected", { category });
    setSelectedCategory(category);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceWhite }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header Row: Wordmark & Avatar */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* roamify Wordmark */}
          <ThemedText
            style={{
              fontSize: 42,
              lineHeight: 46,
              fontFamily: "PlusJakartaSans_800ExtraBold",
              fontWeight: "800",
              letterSpacing: -1.8,
              color: colors.textPrimary,
            }}
          >
            roamify
          </ThemedText>

          {/* User Avatar */}
          <PressableScale
            onPress={() => router.navigate("/profile")}
            accessibilityRole="button"
            accessibilityLabel="View profile"
          >
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                overflow: "hidden",
                backgroundColor: "#FCE790",
                borderWidth: 3,
                borderColor: colors.surfaceWhite,
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              }}
            >
              {hasCustomAvatar ? (
                <Image
                  source={{ uri: userAvatarUrl }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <ThemedText
                  style={{
                    fontSize: 34,
                    lineHeight: 40,
                    fontFamily: "PlusJakartaSans_800ExtraBold",
                    fontWeight: "800",
                    color: colors.textPrimary,
                  }}
                >
                  {userInitial}
                </ThemedText>
              )}
            </View>
          </PressableScale>
        </View>

        {/* Greeting: Hey, {firstName} 👋 */}
        <View style={{ marginTop: 14 }}>
          <ThemedText
            style={{
              fontSize: 20,
              lineHeight: 26,
              fontFamily: "PlusJakartaSans_600SemiBold",
              fontWeight: "600",
              color: colors.textSecondary,
            }}
          >
            {greetingText}
          </ThemedText>
        </View>

        {/* Headline Row: "Find your next stay" + Search Button */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 4,
            gap: 16,
          }}
        >
          <ThemedText
            style={{
              fontSize: 52,
              lineHeight: 48,
              fontFamily: "PlusJakartaSans_800ExtraBold",
              fontWeight: "800",
              letterSpacing: -2,
              color: colors.textPrimary,
              flex: 1,
            }}
          >
            {"Find your\nnext stay"}
          </ThemedText>

          {/* Search Button Pill (64 x 88 tall pill) */}
          <PressableScale
            onPress={handleOpenSearchTab}
            accessibilityRole="button"
            accessibilityLabel="Open search"
          >
            <View
              style={{
                width: 64,
                height: 88,
                borderRadius: 24,
                backgroundColor: "#F4F5F7",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Search size={26} color={colors.textPrimary} strokeWidth={2.4} />
            </View>
          </PressableScale>
        </View>

        {/* Search Prompt Bar */}
        <View style={{ marginTop: 22 }}>
          <SearchPrompt onSubmit={handleSearchSubmit} />
        </View>

        {/* Category Chips */}
        <View style={{ marginTop: 22 }}>
          <CategoryChips
            selected={selectedCategory}
            onSelect={handleCategorySelect}
          />
        </View>

        {/* Content States: Loading, Error, Empty, or List */}
        {isLoading && stays.length === 0 ? (
          <View style={{ marginTop: 26, gap: 20 }}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </View>
        ) : isError && stays.length === 0 ? (
          <View
            style={{
              marginTop: 40,
              padding: 24,
              borderRadius: radius.xl,
              backgroundColor: "#FFF8F7",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <AlertCircle size={32} color={colors.statusError.icon} />
            <ThemedText
              style={{
                fontSize: 16,
                lineHeight: 22,
                fontFamily: "PlusJakartaSans_600SemiBold",
                fontWeight: "600",
                color: colors.textPrimary,
                textAlign: "center",
              }}
            >
              {"We couldn't load stays right now."}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 14,
                lineHeight: 20,
                color: colors.textSecondary,
                textAlign: "center",
              }}
            >
              Check your connection and try again.
            </ThemedText>
            <PressableScale
              onPress={() => refetch()}
              accessibilityRole="button"
              accessibilityLabel="Try again"
              style={{ marginTop: 8 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: radius.full,
                  backgroundColor: colors.textPrimary,
                }}
              >
                <RefreshCw size={16} color={colors.surfaceWhite} />
                <ThemedText
                  style={{
                    fontSize: 14,
                    fontFamily: "PlusJakartaSans_700Bold",
                    fontWeight: "700",
                    color: colors.surfaceWhite,
                  }}
                >
                  Try again
                </ThemedText>
              </View>
            </PressableScale>
          </View>
        ) : stays.length === 0 ? (
          <View
            style={{
              marginTop: 48,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 20,
            }}
          >
            <ThemedText
              style={{
                fontSize: 18,
                fontFamily: "PlusJakartaSans_600SemiBold",
                fontWeight: "600",
                color: colors.textSecondary,
                textAlign: "center",
              }}
            >
              No stays found in this category yet.
            </ThemedText>
          </View>
        ) : (
          <LayoutAnimationConfig skipEntering>
            <View style={{ marginTop: 26, gap: 20 }}>
              {stays.map((stay) => (
                <Animated.View
                  key={stay.id}
                  entering={CARD_ENTER}
                  exiting={CARD_EXIT}
                  layout={CARD_LAYOUT}
                >
                  <PropertyCard
                    property={stay}
                    onPress={() => {
                      posthog?.capture("listing_selected", {
                        listing_id: stay.id,
                        source: "home",
                      });
                      router.navigate({
                        pathname: "/search",
                        params: { q: stay.title },
                      });
                    }}
                  />
                </Animated.View>
              ))}
            </View>
          </LayoutAnimationConfig>
        )}
      </ScrollView>
    </View>
  );
}
