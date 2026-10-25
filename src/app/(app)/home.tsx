import React, { useState } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { Search } from "lucide-react-native";
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
import {
  CategoryChips,
  CategoryFilter,
  CATEGORY_ICONS,
} from "@/components/home/category-chips";
import { PropertyCard } from "@/components/stays/property-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadError } from "@/components/load-error";
import { Icon } from "@/components/ui/icons";
import { Alert } from "@/components/alert-banner";
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
        overflow: "hidden",
        position: "relative",
        backgroundColor: colors.surfaceWhite,
      }}
    >
      <Skeleton style={{ width: "100%", height: "100%", borderRadius: radius["2xl"] }} />
      <View
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          right: 24,
          gap: 10,
        }}
      >
        <Skeleton
          style={{
            width: "60%",
            height: 28,
            borderRadius: 8,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
          }}
        />
        <Skeleton
          style={{
            width: "40%",
            height: 18,
            borderRadius: 6,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
          }}
        />
        <Skeleton
          style={{
            width: "30%",
            height: 22,
            borderRadius: 6,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
          }}
        />
      </View>
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
    refreshing,
    isError,
    error,
    refreshError,
    clearRefreshError,
    refresh,
  } = useHomeStays(selectedCategory);

  const metadata = user?.unsafeMetadata as Record<string, string> | undefined;
  const firstName =
    user?.firstName ||
    metadata?.firstName ||
    metadata?.fullName?.split(" ")[0] ||
    "";

  const greetingAriaLabel = firstName ? `Hey, ${firstName}` : "Hey there";
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

  const CategoryEmptyIcon = CATEGORY_ICONS[selectedCategory] || CATEGORY_ICONS.all;

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
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
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

        {/* Greeting: Hey, {firstName} + wave icon */}
        <View
          accessibilityLabel={greetingAriaLabel}
          accessibilityRole="text"
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 14,
          }}
        >
          <ThemedText
            style={{
              fontSize: 20,
              lineHeight: 26,
              fontFamily: "PlusJakartaSans_600SemiBold",
              fontWeight: "600",
              color: colors.textSecondary,
            }}
          >
            {greetingAriaLabel}
          </ThemedText>
          <Icon
            name="wave"
            size={22}
            tone="primary"
            aria-hidden
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
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

        {/* Can't refresh failure Banner */}
        {refreshError && stays.length > 0 ? (
          <View style={{ marginTop: 20 }}>
            <Alert
              tone="danger"
              message="Couldn't refresh. Showing what you had."
              onDismiss={clearRefreshError}
            />
          </View>
        ) : null}

        {/* Content States: Loading, Error, Empty, or List */}
        {isLoading && stays.length === 0 ? (
          <View style={{ marginTop: 26, gap: 20 }}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </View>
        ) : isError && stays.length === 0 ? (
          <View style={{ marginTop: 32 }}>
            <LoadError subject="stays" error={error} onRetry={refresh} />
          </View>
        ) : stays.length === 0 ? (
          <View style={{ marginTop: 32 }}>
            <EmptyState
              icon={<CategoryEmptyIcon size={32} color={colors.textSecondary} />}
              title="No stays here yet"
              message="Try another category, or describe your stay above."
              action={
                selectedCategory !== "all"
                  ? {
                      title: "Show all stays",
                      onPress: () => setSelectedCategory("all"),
                    }
                  : undefined
              }
            />
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
                      const slug = stay.slug || stay.id;
                      posthog?.capture("listing_selected", {
                        listing_id: stay.id,
                        slug,
                        source: "home",
                      });
                      router.push(`/stay/${slug}` as any);
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
