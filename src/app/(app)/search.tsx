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
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  ReduceMotion,
} from "react-native-reanimated";
import { colors, radius } from "@/theme";
import { searchProperties, SortOption } from "@/lib/search/search";
import { parseQuery, ParsedQuery } from "@/lib/search/parse";
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
  const [activeFilterChips, setActiveFilterChips] = useState<Set<string>>(new Set());
  const [sortOption, setSortOption] = useState<SortOption>("best_match");

  // Synchronize during render when route params change
  if (paramQuery !== prevParamQ) {
    setPrevParamQ(paramQuery);
    setQueryText(paramQuery);
    setActiveQuery(paramQuery);
  }

  const handleQuerySubmit = () => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    posthog?.capture("search_submitted", {
      source: "search",
      query_length: queryText.trim().length,
    });
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
    posthog?.capture("search_filter_toggled", {
      filter_id: chipId,
      enabled: !isChipActive(chipId),
    });
    setActiveFilterChips((prev) => {
      const next = new Set(prev);
      if (next.has(chipId)) {
        next.delete(chipId);
      } else {
        next.add(chipId);
      }
      return next;
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
    setActiveFilterChips(new Set());
    setSortOption("best_match");
    router.setParams({ q: "" });
  };

  // Run search with combined query and active filter chips
  const { results, parsed } = useMemo(() => {
    const baseParsed: ParsedQuery = parseQuery(activeQuery);

    // Merge manual filter chips into parsed query
    if (activeFilterChips.has("cabin")) baseParsed.type = "cabin";
    if (activeFilterChips.has("beach")) baseParsed.type = "beach";
    if (activeFilterChips.has("villa")) baseParsed.type = "villa";
    if (activeFilterChips.has("city")) baseParsed.type = "city";

    if (activeFilterChips.has("under-300")) {
      baseParsed.maxPrice = 300;
      if (!baseParsed.appliedFilters.includes("Under $300")) {
        baseParsed.appliedFilters.push("Under $300");
      }
    }

    if (activeFilterChips.has("pet-friendly")) {
      baseParsed.pets = true;
      if (!baseParsed.appliedFilters.includes("Pet friendly")) {
        baseParsed.appliedFilters.push("Pet friendly");
      }
    }

    if (activeFilterChips.has("hot-tub")) {
      if (!baseParsed.amenities.includes("hot-tub") && !baseParsed.amenities.includes("hot tub")) {
        baseParsed.amenities.push("hot tub");
      }
    }

    if (activeFilterChips.has("pool")) {
      if (!baseParsed.amenities.includes("pool")) {
        baseParsed.amenities.push("pool");
      }
    }

    return searchProperties(baseParsed, undefined, sortOption);
  }, [activeQuery, activeFilterChips, sortOption]);

  // Determine which chips should appear active based on parsed query or manual toggle
  const isChipActive = (chipId: string) => {
    if (activeFilterChips.has(chipId)) return true;
    if (chipId === "cabin" && parsed.type === "cabin") return true;
    if (chipId === "beach" && parsed.type === "beach") return true;
    if (chipId === "villa" && parsed.type === "villa") return true;
    if (chipId === "city" && parsed.type === "city") return true;
    if (chipId === "under-300" && parsed.maxPrice !== undefined && parsed.maxPrice <= 300) return true;
    if (chipId === "pet-friendly" && parsed.pets === true) return true;
    if (
      chipId === "hot-tub" &&
      parsed.amenities.some((a) => a.toLowerCase().includes("hot tub") || a.toLowerCase().includes("hot-tub"))
    )
      return true;
    if (chipId === "pool" && parsed.amenities.some((a) => a.toLowerCase().includes("pool"))) return true;
    return false;
  };

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
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#F4F5F7",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.4} />
            </View>
          </PressableScale>

          {/* Search Input Bar with Filter Sliders Icon */}
          <View
            style={{
              flex: 1,
              height: 48,
              borderRadius: radius.full,
              backgroundColor: "#F3EFFE",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              gap: 10,
            }}
          >
            <Search size={19} color={colors.textPrimary} strokeWidth={2.2} />

            <TextInput
              value={queryText}
              onChangeText={setQueryText}
              onSubmitEditing={handleQuerySubmit}
              placeholder="Describe your stay"
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              submitBehavior="blurAndSubmit"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                flex: 1,
                fontSize: 15,
                fontFamily: "PlusJakartaSans_500Medium",
                color: colors.textPrimary,
                paddingVertical: 0,
              }}
            />

            {/* Filter Sliders Button */}
            <Pressable
              onPress={() => handleToggleChip("under-300")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Filter options"
            >
              <SlidersHorizontal size={18} color={colors.textPrimary} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>

        {/* Horizontal Filter Chips Row */}
        <View style={{ marginTop: 14 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              gap: 8,
            }}
          >
            {FILTER_CHIPS.map((chip) => {
              const active = isChipActive(chip.id);
              return (
                <Pressable
                  key={chip.id}
                  onPress={() => handleToggleChip(chip.id)}
                  hitSlop={6}
                  style={({ pressed }) => ({
                    paddingHorizontal: 16,
                    paddingVertical: 9,
                    borderRadius: radius.full,
                    backgroundColor: active ? "#D4C4FC" : "#FFFFFF",
                    borderWidth: active ? 0 : 1.2,
                    borderColor: active ? "transparent" : "#E5E7EB",
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <ThemedText
                    style={{
                      fontSize: 13.5,
                      lineHeight: 18,
                      fontFamily: active
                        ? "PlusJakartaSans_600SemiBold"
                        : "PlusJakartaSans_500Medium",
                      fontWeight: active ? "600" : "500",
                      color: active ? colors.textPrimary : "#374151",
                    }}
                  >
                    {chip.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Results Count & Sort Dropdown Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            marginTop: 18,
            marginBottom: 10,
          }}
        >
          {/* Stays Count */}
          <ThemedText
            style={{
              fontSize: 16,
              lineHeight: 22,
              fontFamily: "PlusJakartaSans_700Bold",
              fontWeight: "700",
              color: colors.textPrimary,
            }}
          >
            {`${results.length} ${results.length === 1 ? "stay" : "stays"}`}
          </ThemedText>

          {/* Sort Selector */}
          <PressableScale
            onPress={handleCycleSort}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Sort by ${SORT_LABELS[sortOption]}`}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 13.5,
                  lineHeight: 18,
                  fontFamily: "PlusJakartaSans_500Medium",
                  color: colors.textSecondary,
                }}
              >
                {"Sort by "}
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 13.5,
                  lineHeight: 18,
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
          {results.length === 0 ? (
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

              {parsed.appliedFilters.length > 0 ? (
                <ThemedText
                  style={{
                    fontSize: 13.5,
                    lineHeight: 19,
                    fontFamily: "PlusJakartaSans_500Medium",
                    color: colors.textSecondary,
                    textAlign: "center",
                  }}
                >
                  {`Filters applied: ${parsed.appliedFilters.join(", ")}`}
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
              {results.map((stay, idx) => {
                const delay = Math.min(idx, 6) * 35;
                return (
                  <Animated.View
                    key={`${activeQuery}-${sortOption}-${stay.id}`}
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
                          source: "search",
                        });
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
