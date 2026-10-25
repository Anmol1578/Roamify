import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  Keyboard,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Search,
  ChevronLeft,
  SlidersHorizontal,
  ChevronDown,
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
import {
  SearchListingCard,
  ResultCardSkeleton,
} from "@/components/stays/search-listing-card";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadError } from "@/components/load-error";
import { Alert } from "@/components/alert-banner";
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

const SUGGESTIONS = [
  "cabin with a hot tub",
  "beach house under $400",
  "city apartment with a workspace",
];

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
  const {
    stays,
    intent: returnedIntent,
    total,
    isLoading,
    pending,
    refreshing,
    isError,
    error,
    refreshError,
    clearRefreshError,
    refresh,
  } = useSearchStays(searchRequest, sortOption);

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

  const handleSuggestionTap = (suggestion: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    posthog?.capture("search_suggestion_tapped", { index });
    setQueryText(suggestion);
    setActiveQuery(suggestion);
    setEdited(null);
    router.setParams({ q: suggestion });
  };

  const { applied: appliedFilters, avoided: avoidedFilters } = useMemo(() => {
    return describeIntent(effectiveIntent);
  }, [effectiveIntent]);

  const hasHardConstraints = appliedFilters.length > 0 || avoidedFilters.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceWhite }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
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

        {/* Can't refresh failure Alert */}
        {refreshError && stays.length > 0 ? (
          <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
            <Alert
              tone="danger"
              message="Couldn't refresh. Showing what you had."
              onDismiss={clearRefreshError}
            />
          </View>
        ) : null}

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
              fontFamily: isLoading || pending ? "PlusJakartaSans_500Medium" : "PlusJakartaSans_700Bold",
              fontWeight: isLoading || pending ? "500" : "700",
              color: isLoading || pending ? colors.textSecondary : colors.textPrimary,
            }}
          >
            {isLoading
              ? "Finding stays…"
              : pending
              ? "Updating…"
              : `${total} ${total === 1 ? "stay" : "stays"}`}
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
                <ResultCardSkeleton key={key} />
              ))}
            </View>
          ) : isError && stays.length === 0 ? (
            /* Error State */
            <View style={{ marginTop: 24 }}>
              <LoadError subject="stays" error={error} onRetry={refresh} />
            </View>
          ) : stays.length === 0 ? (
            /* Empty State */
            <View style={{ marginTop: 24 }}>
              <EmptyState
                icon="searchOff"
                title="No stays match that yet"
                message={
                  hasHardConstraints
                    ? "Try adjusting your search criteria or explore recommendations below."
                    : "Try describing your stay another way."
                }
                action={{
                  title: "Clear search",
                  onPress: handleResetFilters,
                }}
              >
                {/* Constraint Badges */}
                {hasHardConstraints ? (
                  <View style={{ alignItems: "center", gap: 8, marginTop: 6 }}>
                    <ThemedText
                      style={{
                        fontSize: 13,
                        fontFamily: "PlusJakartaSans_600SemiBold",
                        color: colors.textSecondary,
                      }}
                    >
                      Every stay has to meet these:
                    </ThemedText>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      {appliedFilters.map((filter, i) => (
                        <View
                          key={i}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: radius.full,
                            backgroundColor: "#F4EDFF",
                          }}
                        >
                          <ThemedText
                            style={{
                              fontSize: 12,
                              fontFamily: "PlusJakartaSans_600SemiBold",
                              color: "#6D28D9",
                            }}
                          >
                            {filter}
                          </ThemedText>
                        </View>
                      ))}
                      {avoidedFilters.map((filter, i) => (
                        <View
                          key={`avoided-${i}`}
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: radius.full,
                            backgroundColor: "#FEF2F2",
                          }}
                        >
                          <ThemedText
                            style={{
                              fontSize: 12,
                              fontFamily: "PlusJakartaSans_600SemiBold",
                              color: "#DC2626",
                            }}
                          >
                            {`No ${filter}`}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {/* Suggestion Chips */}
                <View style={{ alignItems: "center", gap: 10, marginTop: 14 }}>
                  <ThemedText
                    style={{
                      fontSize: 13,
                      fontFamily: "PlusJakartaSans_600SemiBold",
                      color: colors.textSecondary,
                    }}
                  >
                    Try one of these:
                  </ThemedText>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {SUGGESTIONS.map((suggestion, idx) => (
                      <PressableScale
                        key={idx}
                        onPress={() => handleSuggestionTap(suggestion, idx)}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 7,
                          borderRadius: radius.full,
                          backgroundColor: "#F3F4F6",
                          borderWidth: 1,
                          borderColor: "#E5E7EB",
                        }}
                      >
                        <ThemedText
                          style={{
                            fontSize: 13,
                            fontFamily: "PlusJakartaSans_600SemiBold",
                            color: colors.textPrimary,
                          }}
                        >
                          {suggestion}
                        </ThemedText>
                      </PressableScale>
                    ))}
                  </View>
                </View>
              </EmptyState>
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
