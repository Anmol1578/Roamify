import React, { useState, useMemo } from "react";

import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Search,
  ChevronLeft,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  ReduceMotion,
} from "react-native-reanimated";
import { colors, radius } from "@/theme";
import { SortOption } from "@/lib/search/query";
import {
  SearchIntent,
  emptyIntent,
  hasChip,
  toggleChip,
  describeIntent,
} from "@/lib/search/intent";
import { useSearchStays, SearchRequest } from "@/hooks/use-search-stays";
import { ThemedText } from "@/components/themed-text";
import { PressableScale } from "@/components/ui/pressable-scale";
import { SearchListingCard } from "@/components/stays/search-listing-card";
import { posthog } from "@/lib/posthog";

interface FilterChipItem {
  id: string;
  label: string;
}

const FILTER_CHIPS: FilterChipItem[] = [
  { id: "cabin", label: "Cabins" },
  { id: "under-300", label: "Under $300" },
  { id: "pet-friendly", label: "Pet Friendly" },
  { id: "beach", label: "Beach" },
  { id: "villa", label: "Villas" },
  { id: "city", label: "City" },
  { id: "hot-tub", label: "Hot Tub" },
  { id: "pool", label: "Pool" },
];

const SORT_LABELS: Record<SortOption, string> = {
  best_match: "Best match",
  price_low: "Price: low to high",
  price_high: "Price: high to low",
  rating: "Highest rated",
};

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const paramQuery = typeof params.q === "string" ? params.q : "";

  const [queryText, setQueryText] = useState(paramQuery);
  const [prevParamQ, setPrevParamQ] = useState(paramQuery);
  const [activeQuery, setActiveQuery] = useState(paramQuery);
  const [edited, setEdited] = useState<SearchIntent | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("best_match");


  // Synchronize during render when route params change
  if (paramQuery !== prevParamQ) {
    setPrevParamQ(paramQuery);
    setQueryText(paramQuery);
    setActiveQuery(paramQuery);
    setEdited(null);
  }

  // If chips were manually edited, send intent directly; otherwise send raw search string
  const searchRequest: SearchRequest = edited ? { intent: edited } : { q: activeQuery };



  // Live server search hook
  const { stays, intent: returnedIntent, total, isLoading, isError, error, refetch } = useSearchStays(
    searchRequest,
    sortOption
  );

  // Active intent represents edited chips over returned server response or empty
  const effectiveIntent = useMemo<SearchIntent>(() => {
    return edited ?? (returnedIntent?.text ? returnedIntent : null) ?? emptyIntent(queryText);
  }, [edited, returnedIntent, queryText]);


  const handleQuerySubmit = () => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    posthog?.capture("search_submitted", {
      source: "search",
      query_length: queryText.trim().length,
    });
    setEdited(null);
    setActiveQuery(queryText);
    router.setParams({ q: queryText });
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate("/home");
    }
  };

  const handleToggleChip = (chipId: string) => {
    Haptics.selectionAsync().catch(() => {});
    const next = toggleChip(effectiveIntent, chipId);
    setEdited(next);
    posthog?.capture("search_filter_toggled", {
      filter_id: chipId,
      enabled: hasChip(next, chipId),
    });
  };

  const handleCycleSort = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const sortKeys: SortOption[] = ["best_match", "price_low", "price_high", "rating"];
    const currentIndex = sortKeys.indexOf(sortOption);
    const nextSort = sortKeys[(currentIndex + 1) % sortKeys.length];
    posthog?.capture("search_sort_changed", {
      previous_sort: sortOption,
      sort_option: nextSort,
    });
    setSortOption(nextSort);
  };

  const handleResetFilters = () => {
    setQueryText("");
    setActiveQuery("");
    setEdited(null);
    setSortOption("best_match");
    router.setParams({ q: "" });
  };

  const { applied: appliedFilters, avoided: avoidedFilters } = useMemo(() => {
    return describeIntent(effectiveIntent);
  }, [effectiveIntent]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceWhite }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Row: Circular Back Button & Search Input Pill */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            gap: 12,
          }}
        >
          {/* Circular Back Button */}
          <PressableScale
            onPress={handleBackPress}
            scale={0.92}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#F3EFFE",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={20} color={colors.textPrimary} strokeWidth={2.4} />
          </PressableScale>

          {/* Search Input Pill */}
          <View
            style={{
              flex: 1,
              height: 48,
              borderRadius: radius.full,
              backgroundColor: "#F3EFFE",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              gap: 10,
            }}
          >
            <Search size={18} color="#6B7280" strokeWidth={2.2} />
            <TextInput
              value={queryText}
              onChangeText={setQueryText}
              onSubmitEditing={handleQuerySubmit}
              placeholder="Describe your stay..."
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              clearButtonMode="while-editing"
              autoCapitalize="none"
              style={{
                flex: 1,
                fontSize: 15,
                fontFamily: "PlusJakartaSans_500Medium",
                color: colors.textPrimary,
                paddingVertical: 0,
              }}
            />
            <Pressable
              onPress={handleQuerySubmit}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Filter sliders"
            >
              <SlidersHorizontal size={18} color="#6B7280" strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>

        {/* Filter Chips Horizontal Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 8,
          }}
        >
          {FILTER_CHIPS.map((chip) => {
            const active = hasChip(effectiveIntent, chip.id);
            return (
              <PressableScale
                key={chip.id}
                onPress={() => handleToggleChip(chip.id)}
                scale={0.96}
                accessibilityRole="button"
                accessibilityLabel={`${chip.label} filter, ${active ? "active" : "inactive"}`}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: radius.full,
                  backgroundColor: active ? "#D4C4FC" : colors.surfaceWhite,
                  borderWidth: active ? 0 : 1,
                  borderColor: active ? "transparent" : "#E5E7EB",
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 13.5,
                    fontFamily: active
                      ? "PlusJakartaSans_600SemiBold"
                      : "PlusJakartaSans_500Medium",
                    fontWeight: active ? "600" : "500",
                    color: active ? "#0B0B1A" : "#374151",
                  }}
                >
                  {chip.label}
                </ThemedText>
              </PressableScale>
            );
          })}
        </ScrollView>

        {/* Sub-header Row: Stays Count & Sort Selector */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          <ThemedText
            style={{
              fontSize: 16,
              fontFamily: "PlusJakartaSans_700Bold",
              fontWeight: "700",
              color: colors.textPrimary,
            }}
          >
            {isLoading ? "Searching stays..." : `${total} ${total === 1 ? "stay" : "stays"}`}
          </ThemedText>

          <PressableScale
            onPress={handleCycleSort}
            scale={0.96}
            accessibilityRole="button"
            accessibilityLabel={`Sort by: ${SORT_LABELS[sortOption]}`}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: radius.md,
                backgroundColor: "#F3F4F6",
              }}
            >
              <ThemedText
                style={{
                  fontSize: 13,
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontWeight: "700",
                  color: colors.textPrimary,
                }}
              >
                {SORT_LABELS[sortOption]}
              </ThemedText>
              <ChevronDown size={14} color={colors.textPrimary} strokeWidth={2.4} />
            </View>
          </PressableScale>
        </View>

        {/* Results List */}
        <View style={{ paddingHorizontal: 16 }}>
          {isLoading ? (
            /* Loading Skeleton Placeholders */
            <View style={{ gap: 12, marginTop: 12 }}>
              {[1, 2, 3].map((key) => (
                <View
                  key={key}
                  style={{
                    flexDirection: "row",
                    gap: 14,
                    paddingVertical: 8,
                    width: "100%",
                  }}
                >
                  <View
                    style={{
                      width: 130,
                      height: 130,
                      borderRadius: radius["2xl"],
                      backgroundColor: "#F3F4F6",
                    }}
                  />
                  <View style={{ flex: 1, gap: 10, justifyContent: "center" }}>
                    <View
                      style={{
                        width: "80%",
                        height: 18,
                        borderRadius: 6,
                        backgroundColor: "#F3F4F6",
                      }}
                    />
                    <View
                      style={{
                        width: "50%",
                        height: 14,
                        borderRadius: 6,
                        backgroundColor: "#F3F4F6",
                      }}
                    />
                    <View
                      style={{
                        width: "60%",
                        height: 18,
                        borderRadius: 6,
                        backgroundColor: "#F3F4F6",
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : isError ? (
            /* Error State */
            <View
              style={{
                marginTop: 24,
                paddingVertical: 40,
                paddingHorizontal: 20,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#FEF2F2",
                borderRadius: radius["2xl"],
                borderWidth: 1,
                borderColor: "#FCA5A5",
                gap: 12,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 18,
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontWeight: "700",
                  color: "#991B1B",
                  textAlign: "center",
                }}
              >
                Could not load stays
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 13.5,
                  fontFamily: "PlusJakartaSans_500Medium",
                  color: "#7F1D1D",
                  textAlign: "center",
                }}
              >
                {error?.message || "Check your internet connection and try again."}
              </ThemedText>
              <PressableScale
                onPress={refetch}
                style={{
                  marginTop: 6,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: radius.full,
                  backgroundColor: colors.surfaceWhite,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  borderWidth: 1,
                  borderColor: "#FCA5A5",
                }}
              >
                <RotateCcw size={16} color="#991B1B" />
                <ThemedText
                  style={{
                    fontSize: 14,
                    fontFamily: "PlusJakartaSans_700Bold",
                    fontWeight: "700",
                    color: "#991B1B",
                  }}
                >
                  Try again
                </ThemedText>
              </PressableScale>
            </View>
          ) : stays.length === 0 ? (
            /* Empty State */
            <View
              style={{
                marginTop: 24,
                paddingVertical: 48,
                paddingHorizontal: 20,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#F9FAFB",
                borderRadius: radius["2xl"],
                borderWidth: 1,
                borderColor: colors.borderGray,
                gap: 12,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 19,
                  lineHeight: 25,
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontWeight: "700",
                  color: colors.textPrimary,
                  textAlign: "center",
                }}
              >
                No stays match your criteria
              </ThemedText>

              {appliedFilters.length > 0 ? (
                <ThemedText
                  style={{
                    fontSize: 13.5,
                    lineHeight: 19,
                    fontFamily: "PlusJakartaSans_500Medium",
                    color: colors.textSecondary,
                    textAlign: "center",
                  }}
                >
                  {`Filters applied: ${appliedFilters.join(", ")}`}
                </ThemedText>
              ) : null}

              {avoidedFilters.length > 0 ? (
                <ThemedText
                  style={{
                    fontSize: 13.5,
                    lineHeight: 19,
                    fontFamily: "PlusJakartaSans_500Medium",
                    color: "#B45309",
                    textAlign: "center",
                  }}
                >
                  {`Excluded: ${avoidedFilters.join(", ")}`}
                </ThemedText>
              ) : null}

              <PressableScale
                onPress={handleResetFilters}
                style={{
                  marginTop: 8,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: radius.full,
                  backgroundColor: colors.primaryYellow,
                }}
              >
                <ThemedText
                  style={{
                    fontSize: 14.5,
                    fontFamily: "PlusJakartaSans_700Bold",
                    fontWeight: "700",
                    color: colors.textPrimary,
                  }}
                >
                  Reset filters
                </ThemedText>
              </PressableScale>
            </View>
          ) : (
            /* Compact Listing Cards with Staggered Entrance */
            <View style={{ gap: 10 }}>
              {stays.map((stay, idx) => {
                const delay = Math.min(idx, 6) * 35;
                const slug = stay.slug || stay.id;
                return (
                  <Animated.View
                    key={`${effectiveIntent.text}-${sortOption}-${stay.id}`}
                    entering={FadeInDown.duration(200)
                      .delay(delay)
                      .reduceMotion(ReduceMotion.System)}
                  >
                    <SearchListingCard
                      property={stay}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        posthog?.capture("listing_selected", {
                          listing_id: stay.id,
                          slug,
                          source: "search",
                        });
                        router.push(`/stay/${slug}` as any);
                      }}
                    />
                  </Animated.View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
