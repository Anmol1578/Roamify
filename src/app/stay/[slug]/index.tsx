import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Share,
  Dimensions,
  Modal,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Share2,
  Heart,
  Star,
  MapPin,
  Bath,
  Dog,
  Wifi,
  Trees,
  ChevronRight,
  MessageSquare,
  FileText,
  X,
  Clock,
  ShieldCheck,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { colors, radius } from "@/theme";
import { useStay } from "@/hooks/use-stay";
import { useFavorites } from "@/lib/favorites";
import { formatLocation, formatPrice } from "@/lib/stays";
import { ThemedText } from "@/components/themed-text";
import { PressableScale } from "@/components/ui/pressable-scale";
import { GoodToKnow } from "@/components/stay/good-to-know";
import { HostSection } from "@/components/stay/host-section";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadError } from "@/components/load-error";
import { Alert } from "@/components/alert-banner";
import { posthog } from "@/lib/posthog";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = 370;

export default function StayDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const {
    stay,
    isLoading,
    refreshing,
    isError,
    error,
    refreshError,
    clearRefreshError,
    refresh,
  } = useStay(slug);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showAllRulesModal, setShowAllRulesModal] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);

  const stayId = stay?.slug || stay?.id || slug || "";
  const favorited = isFavorite(stayId);

  // Track stay opened in PostHog
  useEffect(() => {
    if (stay) {
      posthog?.capture("stay_opened", {
        stay_id: stay.id,
        slug: stay.slug ?? "",
        title: stay.title,
        price: stay.pricePerNight,
      });
    }
  }, [stay]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate("/home");
    }
  };

  const handleToggleFav = () => {
    if (stayId) {
      toggleFavorite(stayId);
    }
  };

  const handleShare = async () => {
    if (!stay) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await Share.share({
        title: stay.title,
        message: `Check out ${stay.title} in ${stay.city} on Roamify!`,
      });
      posthog?.capture("stay_shared", { stay_id: stay.id });
    } catch {}
  };

  const handleAskPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    posthog?.capture("stay_ask_opened", {
      stay_id: stay?.id ?? "",
      from: "details_card",
    });
    router.push(`/stay/${slug}/ask` as any);
  };

  const handleBookPress = () => {
    posthog?.capture("stay_book_tapped", { slug: stay?.slug ?? slug });
    router.push(`/stay/${slug}/book` as any);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surfaceWhite }}>
        <Skeleton style={{ height: HERO_HEIGHT, width: "100%" }} />
        <View style={{ padding: 20, gap: 16 }}>
          <Skeleton style={{ width: "70%", height: 28, borderRadius: 6 }} />
          <Skeleton style={{ width: "40%", height: 18, borderRadius: 6 }} />
          <Skeleton style={{ width: "100%", height: 80, borderRadius: radius.xl }} />
          <Skeleton style={{ width: "100%", height: 140, borderRadius: radius.xl }} />
        </View>
      </View>
    );
  }

  if (isError && !stay) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surfaceWhite, paddingTop: insets.top }}>
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <PressableScale
            onPress={handleBack}
            scale={0.92}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={20} color="#111827" strokeWidth={2.4} />
          </PressableScale>
        </View>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <LoadError
            error={error}
            subject="this stay"
            onRetry={refresh}
          />
        </View>
      </View>
    );
  }

  if (!stay) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surfaceWhite, paddingTop: insets.top }}>
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <PressableScale
            onPress={handleBack}
            scale={0.92}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={20} color="#111827" strokeWidth={2.4} />
          </PressableScale>
        </View>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState
            icon="pinOff"
            title="This stay isn't available"
            message="It may have been removed by its host."
            action={{
              title: "Back",
              onPress: handleBack,
            }}
          />
        </View>
      </View>
    );
  }

  // Extract photos
  const photosList =
    stay.photos && stay.photos.length > 0
      ? stay.photos.map((p) => p.url)
      : [stay.imageUrl || stay.image || ""];

  const totalEstimate = stay.pricePerNight * 3;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceWhite }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 110,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        {/* Hero Photo Carousel with 1 / 24 counter badge */}
        <View style={{ height: HERO_HEIGHT, width: SCREEN_WIDTH, position: "relative" }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const offsetX = e.nativeEvent.contentOffset.x;
              const idx = Math.round(offsetX / SCREEN_WIDTH);
              setActivePhotoIndex(idx);
            }}
            scrollEventThrottle={16}
          >
            {photosList.map((url, i) => (
              <Image
                key={i}
                source={{ uri: url }}
                style={{ width: SCREEN_WIDTH, height: HERO_HEIGHT }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
            ))}
          </ScrollView>

          {/* Floating Top Nav Buttons */}
          <View
            style={{
              position: "absolute",
              top: insets.top + 8,
              left: 16,
              right: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <PressableScale
              onPress={handleBack}
              scale={0.92}
              accessibilityRole="button"
              accessibilityLabel="Back"
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 5,
              }}
            >
              <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.4} />
            </PressableScale>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <PressableScale
                onPress={handleShare}
                scale={0.92}
                accessibilityRole="button"
                accessibilityLabel="Share"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.12,
                  shadowRadius: 5,
                }}
              >
                <Share2 size={19} color={colors.textPrimary} strokeWidth={2.2} />
              </PressableScale>

              <PressableScale
                onPress={handleToggleFav}
                scale={0.92}
                accessibilityRole="button"
                accessibilityLabel="Favorite"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.12,
                  shadowRadius: 5,
                }}
              >
                <Heart
                  size={20}
                  color={favorited ? "#EF4444" : colors.textPrimary}
                  fill={favorited ? "#EF4444" : "transparent"}
                  strokeWidth={2.2}
                />
              </PressableScale>
            </View>
          </View>

          {/* Photo Counter Badge (e.g. 1 / 24) */}
          <View
            style={{
              position: "absolute",
              bottom: 42,
              right: 18,
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: radius.full,
            }}
          >
            <ThemedText
              style={{
                fontSize: 12.5,
                fontFamily: "PlusJakartaSans_700Bold",
                fontWeight: "700",
                color: "#FFFFFF",
              }}
            >
              {`${activePhotoIndex + 1} / ${photosList.length}`}
            </ThemedText>
          </View>
        </View>

        {/* Curved White Sheet Overlapping Hero */}
        <View
          style={{
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            marginTop: -28,
            backgroundColor: colors.surfaceWhite,
            paddingTop: 24,
            paddingHorizontal: 20,
            gap: 20,
          }}
        >
          {refreshError ? (
            <View style={{ marginBottom: 4 }}>
              <Alert
                tone="danger"
                message="Couldn't refresh. Showing what you had."
                onDismiss={clearRefreshError}
              />
            </View>
          ) : null}
          {/* Header Row: Extra Bold & Thick Title + Rating Box */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <ThemedText
              style={{
                fontSize: 27,
                lineHeight: 33,
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontWeight: "800",
                color: "#0B0B1A",
                letterSpacing: -0.6,
                flex: 1,
              }}
            >
              {stay.title}
            </ThemedText>

            {/* Rating Box */}
            <View
              style={{
                backgroundColor: "#F9FAFB",
                borderWidth: 1,
                borderColor: "#F3F4F6",
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <ThemedText
                  style={{
                    fontSize: 16.5,
                    fontFamily: "PlusJakartaSans_800ExtraBold",
                    fontWeight: "800",
                    color: colors.textPrimary,
                  }}
                >
                  {stay.rating.toFixed(1)}
                </ThemedText>
              </View>
              <ThemedText
                style={{
                  fontSize: 12,
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontWeight: "600",
                  color: colors.textSecondary,
                  marginTop: 1,
                }}
              >
                {`(${stay.reviewCount})`}
              </ThemedText>
            </View>
          </View>

          {/* Location Row */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: -4 }}>
            <MapPin size={16} color={colors.textPrimary} strokeWidth={2.4} />
            <ThemedText
              style={{
                fontSize: 15.5,
                fontFamily: "PlusJakartaSans_700Bold",
                fontWeight: "700",
                color: colors.textPrimary,
              }}
            >
              {formatLocation(stay)}
            </ThemedText>
          </View>

          {/* 4 Feature Amenities Row (Icons with text underneath) */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 10,
              alignItems: "center",
            }}
          >
            {/* Hot Tub */}
            <View style={{ alignItems: "center", flex: 1, gap: 6 }}>
              <Bath size={24} color={colors.textPrimary} strokeWidth={2.2} />
              <ThemedText
                style={{
                  fontSize: 12.5,
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontWeight: "600",
                  color: colors.textPrimary,
                  textAlign: "center",
                }}
              >
                Hot Tub
              </ThemedText>
            </View>

            {/* Pet Friendly */}
            <View style={{ alignItems: "center", flex: 1, gap: 6 }}>
              <Dog size={24} color={colors.textPrimary} strokeWidth={2.2} />
              <ThemedText
                style={{
                  fontSize: 12.5,
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontWeight: "600",
                  color: colors.textPrimary,
                  textAlign: "center",
                }}
              >
                Pet Friendly
              </ThemedText>
            </View>

            {/* Fast Wi-Fi */}
            <View style={{ alignItems: "center", flex: 1, gap: 6 }}>
              <Wifi size={24} color={colors.textPrimary} strokeWidth={2.2} />
              <ThemedText
                style={{
                  fontSize: 12.5,
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontWeight: "600",
                  color: colors.textPrimary,
                  textAlign: "center",
                }}
              >
                Fast Wi-Fi
              </ThemedText>
            </View>

            {/* Forest Views */}
            <View style={{ alignItems: "center", flex: 1, gap: 6 }}>
              <Trees size={24} color={colors.textPrimary} strokeWidth={2.2} />
              <ThemedText
                style={{
                  fontSize: 12.5,
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontWeight: "600",
                  color: colors.textPrimary,
                  textAlign: "center",
                }}
              >
                Forest Views
              </ThemedText>
            </View>
          </View>

          {/* Card 1: Ask about policies / Ask about this stay */}
          <PressableScale
            onPress={handleAskPress}
            scale={0.98}
            accessibilityRole="button"
            accessibilityLabel="Ask about policies"
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderRadius: 20,
              backgroundColor: "#F4F0FF",
              gap: 14,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: "#EBE3FE",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageSquare size={22} color="#7C3AED" strokeWidth={2.2} />
            </View>

            <View style={{ flex: 1, gap: 3 }}>
              <ThemedText
                style={{
                  fontSize: 16,
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontWeight: "700",
                  color: colors.textPrimary,
                }}
              >
                Ask about policies
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 13,
                  lineHeight: 18,
                  fontFamily: "PlusJakartaSans_500Medium",
                  color: "#6B7280",
                }}
              >
                Cancellation, house rules, pets, check-in and more.
              </ThemedText>
            </View>

            <ChevronRight size={20} color="#7C3AED" strokeWidth={2.4} />
          </PressableScale>

          {/* Card 2: Free cancellation (Clickable to open rich detailed modal) */}
          <PressableScale
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setShowCancellationModal(true);
            }}
            scale={0.98}
            accessibilityRole="button"
            accessibilityLabel="Free cancellation"
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderRadius: 20,
              backgroundColor: "#F0F4FF",
              gap: 14,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: "#E0EBFE",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={22} color="#2563EB" strokeWidth={2.2} />
            </View>

            <View style={{ flex: 1, gap: 3 }}>
              <ThemedText
                style={{
                  fontSize: 16,
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontWeight: "700",
                  color: colors.textPrimary,
                }}
              >
                Free cancellation
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 13,
                  lineHeight: 18,
                  fontFamily: "PlusJakartaSans_500Medium",
                  color: "#6B7280",
                }}
              >
                {stay.cancellationPolicy?.summary || "Full refund up to 7 days before check-in."}
              </ThemedText>
            </View>

            <ChevronRight size={20} color="#2563EB" strokeWidth={2.4} />
          </PressableScale>

          {/* Good To Know Section */}
          <GoodToKnow
            rules={stay.houseRules}
            petsAllowed={stay.petsAllowed}
            onShowAll={() => {
              posthog?.capture("stay_policies_opened", {
                stay_id: stay.id,
                from: "good_to_know",
              });
              setShowAllRulesModal(true);
            }}
          />

          {/* Meet your host Section */}
          {stay.host ? (
            <>
              <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 4 }} />
              <HostSection host={stay.host} />
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar Matching Design */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.surfaceWhite,
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: insets.bottom + 12,
          borderTopWidth: 1,
          borderColor: "#F3F4F6",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        }}
      >
        <View style={{ gap: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 3 }}>
            <ThemedText
              style={{
                fontSize: 23,
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontWeight: "800",
                color: colors.textPrimary,
              }}
            >
              {formatPrice(stay.pricePerNight)}
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 14,
                fontFamily: "PlusJakartaSans_500Medium",
                color: colors.textSecondary,
              }}
            >
              / night
            </ThemedText>
          </View>
          <ThemedText
            style={{
              fontSize: 13,
              fontFamily: "PlusJakartaSans_600SemiBold",
              fontWeight: "600",
              color: "#9CA3AF",
            }}
          >
            {`$${totalEstimate} total`}
          </ThemedText>
        </View>

        <PressableScale
          onPress={handleBookPress}
          scale={0.96}
          style={{
            paddingHorizontal: 36,
            paddingVertical: 14,
            borderRadius: radius.full,
            backgroundColor: "#FFA800",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ThemedText
            style={{
              fontSize: 15.5,
              fontFamily: "PlusJakartaSans_700Bold",
              fontWeight: "700",
              color: "#0B0B1A",
            }}
          >
            Book this stay
          </ThemedText>
        </PressableScale>
      </View>

      {/* Comprehensive Cancellation Policy Modal (~1.5 Scroll View) */}
      <Modal
        visible={showCancellationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCancellationModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.surfaceWhite }}>
          {/* Modal Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <View>
              <ThemedText
                style={{
                  fontSize: 19,
                  fontFamily: "PlusJakartaSans_800ExtraBold",
                  fontWeight: "800",
                  color: colors.textPrimary,
                }}
              >
                Cancellation Policy
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 13,
                  fontFamily: "PlusJakartaSans_500Medium",
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                Clear terms and refund timeline
              </ThemedText>
            </View>

            <PressableScale
              onPress={() => setShowCancellationModal(false)}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: "#F3F4F6",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} color={colors.textPrimary} />
            </PressableScale>
          </View>

          {/* Long Scrollable Content (~1.5 Screen Heights) */}
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: insets.bottom + 40,
              gap: 22,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Highlights Card */}
            <View
              style={{
                backgroundColor: "#EFF6FF",
                borderWidth: 1,
                borderColor: "#BFDBFE",
                borderRadius: 20,
                padding: 18,
                gap: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={20} color="#2563EB" strokeWidth={2.4} />
                <ThemedText
                  style={{
                    fontSize: 16,
                    fontFamily: "PlusJakartaSans_700Bold",
                    fontWeight: "700",
                    color: "#1E40AF",
                  }}
                >
                  {stay.cancellationPolicy?.title || "Flexible Standard Policy"}
                </ThemedText>
              </View>
              <ThemedText
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  fontFamily: "PlusJakartaSans_500Medium",
                  color: "#1E3A8A",
                }}
              >
                {stay.cancellationPolicy?.summary ||
                  "Full refund up to 7 days before check-in. Partial refund protection applies between 7 days and 48 hours."}
              </ThemedText>
            </View>

            {/* Timeline Breakdown Section */}
            <View style={{ gap: 12 }}>
              <ThemedText
                style={{
                  fontSize: 17,
                  fontFamily: "PlusJakartaSans_800ExtraBold",
                  fontWeight: "800",
                  color: colors.textPrimary,
                }}
              >
                Refund Timeline Breakdown
              </ThemedText>

              {/* Step 1: Up to 7 days */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 14,
                  padding: 16,
                  backgroundColor: "#F9FAFB",
                  borderRadius: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: "#10B981",
                }}
              >
                <Clock size={20} color="#10B981" style={{ marginTop: 2 }} />
                <View style={{ flex: 1, gap: 4 }}>
                  <ThemedText
                    style={{
                      fontSize: 15,
                      fontFamily: "PlusJakartaSans_700Bold",
                      fontWeight: "700",
                      color: colors.textPrimary,
                    }}
                  >
                    Up to 7 days before check-in
                  </ThemedText>
                  <ThemedText
                    style={{
                      fontSize: 13.5,
                      lineHeight: 19,
                      fontFamily: "PlusJakartaSans_400Regular",
                      color: "#4B5563",
                    }}
                  >
                    Receive a 100% full refund of all nightly rates, cleaning fees, and service fees directly to your original payment method. No questions asked.
                  </ThemedText>
                </View>
              </View>

              {/* Step 2: 7 days to 48 hours */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 14,
                  padding: 16,
                  backgroundColor: "#F9FAFB",
                  borderRadius: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: "#F59E0B",
                }}
              >
                <Clock size={20} color="#F59E0B" style={{ marginTop: 2 }} />
                <View style={{ flex: 1, gap: 4 }}>
                  <ThemedText
                    style={{
                      fontSize: 15,
                      fontFamily: "PlusJakartaSans_700Bold",
                      fontWeight: "700",
                      color: colors.textPrimary,
                    }}
                  >
                    7 days to 48 hours before check-in
                  </ThemedText>
                  <ThemedText
                    style={{
                      fontSize: 13.5,
                      lineHeight: 19,
                      fontFamily: "PlusJakartaSans_400Regular",
                      color: "#4B5563",
                    }}
                  >
                    Receive a 50% refund of all accommodation charges, plus a 100% full refund of the cleaning fee.
                  </ThemedText>
                </View>
              </View>

              {/* Step 3: Less than 48 hours */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 14,
                  padding: 16,
                  backgroundColor: "#F9FAFB",
                  borderRadius: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: "#EF4444",
                }}
              >
                <Clock size={20} color="#EF4444" style={{ marginTop: 2 }} />
                <View style={{ flex: 1, gap: 4 }}>
                  <ThemedText
                    style={{
                      fontSize: 15,
                      fontFamily: "PlusJakartaSans_700Bold",
                      fontWeight: "700",
                      color: colors.textPrimary,
                    }}
                  >
                    Less than 48 hours before check-in
                  </ThemedText>
                  <ThemedText
                    style={{
                      fontSize: 13.5,
                      lineHeight: 19,
                      fontFamily: "PlusJakartaSans_400Regular",
                      color: "#4B5563",
                    }}
                  >
                    Accommodation charges are non-refundable. The cleaning fee is always refunded 100% as long as the guest has not checked into the stay.
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Cleaning & Service Fees Policy */}
            <View style={{ gap: 8 }}>
              <ThemedText
                style={{
                  fontSize: 17,
                  fontFamily: "PlusJakartaSans_800ExtraBold",
                  fontWeight: "800",
                  color: colors.textPrimary,
                }}
              >
                Cleaning & Processing Fees
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 14,
                  lineHeight: 21,
                  fontFamily: "PlusJakartaSans_400Regular",
                  color: "#374151",
                }}
              >
                Cleaning fees are dedicated exclusively to preparing the stay between guests. If you cancel prior to checking in, you will always receive 100% of the cleaning fee back, regardless of which cancellation tier is triggered.
              </ThemedText>
            </View>

            {/* Extenuating Circumstances */}
            <View style={{ gap: 8 }}>
              <ThemedText
                style={{
                  fontSize: 17,
                  fontFamily: "PlusJakartaSans_800ExtraBold",
                  fontWeight: "800",
                  color: colors.textPrimary,
                }}
              >
                Extenuating Circumstances & Travel Advisories
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 14,
                  lineHeight: 21,
                  fontFamily: "PlusJakartaSans_400Regular",
                  color: "#374151",
                }}
              >
                In case of unforeseen events beyond your control—including declared natural disasters, state-mandated road closures, severe weather emergencies making travel impossible, or government travel restrictions—Roamify overrides host cancellation policies to issue full refunds or travel credits with proof documentation.
              </ThemedText>
            </View>

            {/* Rescheduling & Dates Transfer */}
            <View style={{ gap: 8 }}>
              <ThemedText
                style={{
                  fontSize: 17,
                  fontFamily: "PlusJakartaSans_800ExtraBold",
                  fontWeight: "800",
                  color: colors.textPrimary,
                }}
              >
                Date Changes & Rescheduling
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 14,
                  lineHeight: 21,
                  fontFamily: "PlusJakartaSans_400Regular",
                  color: "#374151",
                }}
              >
                Need to change your stay dates instead of canceling? Contact the host or Roamify Concierge at least 5 days prior to arrival. If the property is available on your requested dates, hosts can approve rescheduling with zero cancellation fees.
              </ThemedText>
            </View>

            {/* How to Initiate Cancellation */}
            <View style={{ gap: 8 }}>
              <ThemedText
                style={{
                  fontSize: 17,
                  fontFamily: "PlusJakartaSans_800ExtraBold",
                  fontWeight: "800",
                  color: colors.textPrimary,
                }}
              >
                How Refunds Are Disbursed
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 14,
                  lineHeight: 21,
                  fontFamily: "PlusJakartaSans_400Regular",
                  color: "#374151",
                }}
              >
                Refunds are initiated instantly upon cancellation. Depending on your financial institution or card issuer, funds will reflect in your account within 3 to 7 business days. An automated invoice and confirmation receipt will be emailed immediately.
              </ThemedText>
            </View>

            {/* Support Notice */}
            <View
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                gap: 6,
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
                Have questions about your booking?
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 13,
                  lineHeight: 18,
                  fontFamily: "PlusJakartaSans_400Regular",
                  color: "#6B7280",
                }}
              >
                {"Reach out anytime to Roamify 24/7 Guest Support or use the 'Ask about this stay' feature on the listing screen."}
              </ThemedText>
            </View>
          </ScrollView>
        </View>
      </Modal>



      {/* Show All Rules Modal Sheet */}
      <Modal
        visible={showAllRulesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAllRulesModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.surfaceWhite, padding: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderColor: "#E5E7EB",
            }}
          >
            <ThemedText
              style={{
                fontSize: 18,
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontWeight: "800",
                color: colors.textPrimary,
              }}
            >
              House Rules & Policies
            </ThemedText>
            <PressableScale
              onPress={() => setShowAllRulesModal(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#F3F4F6",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} color={colors.textPrimary} />
            </PressableScale>
          </View>

          <ScrollView style={{ marginTop: 16 }} showsVerticalScrollIndicator={false}>
            <GoodToKnow rules={stay.houseRules} petsAllowed={stay.petsAllowed} />
            {Array.isArray(stay.houseRules?.additionalRules) && (
              <View style={{ marginTop: 24, gap: 10 }}>
                <ThemedText
                  style={{
                    fontSize: 16,
                    fontFamily: "PlusJakartaSans_700Bold",
                    fontWeight: "700",
                    color: colors.textPrimary,
                  }}
                >
                  Additional Host Rules
                </ThemedText>
                {stay.houseRules.additionalRules.map((rule: string, idx: number) => (
                  <View key={idx} style={{ flexDirection: "row", gap: 8 }}>
                    <ThemedText style={{ color: "#6B7280" }}>•</ThemedText>
                    <ThemedText
                      style={{
                        fontSize: 14,
                        lineHeight: 20,
                        fontFamily: "PlusJakartaSans_400Regular",
                        color: colors.textPrimary,
                        flex: 1,
                      }}
                    >
                      {rule}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
