import React, { useState } from "react";
import {
  View,
  ScrollView,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Star,
  MapPin,
  ShieldCheck,
  X,
  FileText,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { colors, radius } from "@/theme";
import { useStay } from "@/hooks/use-stay";
import { formatLocation } from "@/lib/stays";
import { priceLines } from "@/lib/stay-details";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { PolicyCard } from "@/components/policy-card";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadError } from "@/components/load-error";

export default function BookScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { stay, isLoading, isError, error, refresh } = useStay(slug);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate("/home");
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surfaceWhite, paddingTop: insets.top }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderColor: "#F3F4F6",
          }}
        >
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
          <ThemedText
            variant="title"
            style={{
              fontSize: 18,
              fontFamily: "PlusJakartaSans_700Bold",
              fontWeight: "700",
              color: "#111827",
            }}
          >
            Confirm your stay
          </ThemedText>
        </View>

        <View style={{ padding: 20, gap: 16 }}>
          <View style={{ flexDirection: "row", gap: 14 }}>
            <Skeleton style={{ width: 112, height: 96, borderRadius: radius.md }} />
            <View style={{ flex: 1, gap: 8, justifyContent: "center" }}>
              <Skeleton style={{ width: "90%", height: 18 }} />
              <Skeleton style={{ width: "60%", height: 14 }} />
              <Skeleton style={{ width: "40%", height: 14 }} />
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 }} />
          <Skeleton style={{ width: "40%", height: 22 }} />
          <Skeleton style={{ width: "100%", height: 48, borderRadius: radius.md }} />
          <Skeleton style={{ width: "100%", height: 48, borderRadius: radius.md }} />
          <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 }} />
          <Skeleton style={{ width: "50%", height: 22 }} />
          <Skeleton style={{ width: "100%", height: 80, borderRadius: radius.md }} />
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
          <LoadError error={error} subject="this stay" onRetry={refresh} />
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

  const firstPhoto =
    stay.photos && stay.photos.length > 0
      ? stay.photos[0].url
      : stay.imageUrl || stay.image || "";

  const priceInfo = priceLines(stay, 2);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceWhite, paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.surfaceWhite,
          borderBottomWidth: 1,
          borderColor: "#F3F4F6",
        }}
      >
        <PressableScale
          onPress={handleBack}
          scale={0.92}
          accessibilityRole="button"
          accessibilityLabel="Back to stay"
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

        <ThemedText
          variant="title"
          style={{
            fontSize: 18,
            fontFamily: "PlusJakartaSans_700Bold",
            fontWeight: "700",
            color: "#111827",
          }}
        >
          Confirm your stay
        </ThemedText>
      </View>

      {/* Body */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Stay Row */}
        <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
          {firstPhoto ? (
            <Image
              source={{ uri: firstPhoto }}
              style={{
                width: 112,
                height: 96,
                borderRadius: radius.md,
                backgroundColor: colors.surfaceGray,
              }}
              contentFit="cover"
            />
          ) : null}

          <View style={{ flex: 1, gap: 4 }}>
            <ThemedText
              variant="subhead"
              numberOfLines={2}
              style={{
                fontSize: 16,
                lineHeight: 21,
                fontFamily: "PlusJakartaSans_700Bold",
                fontWeight: "700",
                color: colors.textPrimary,
              }}
            >
              {stay.title}
            </ThemedText>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <MapPin size={13} color={colors.textSecondary} strokeWidth={2.2} />
              <ThemedText
                variant="caption"
                numberOfLines={1}
                color={colors.textSecondary}
                style={{ fontSize: 13 }}
              >
                {formatLocation(stay)}
              </ThemedText>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
              <Star size={13} color="#F59E0B" fill="#F59E0B" />
              <ThemedText
                variant="caption"
                style={{
                  fontSize: 13,
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontWeight: "600",
                  color: colors.textPrimary,
                }}
              >
                {`${stay.rating.toFixed(1)} (${stay.reviewCount})`}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 20 }} />

        {/* 2. Your Trip */}
        <View style={{ gap: 14 }}>
          <ThemedText
            variant="title"
            style={{
              fontSize: 18,
              fontFamily: "PlusJakartaSans_700Bold",
              fontWeight: "700",
              color: colors.textPrimary,
            }}
          >
            Your trip
          </ThemedText>

          {/* Dates Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ gap: 2 }}>
              <ThemedText
                variant="subhead"
                style={{
                  fontSize: 15,
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontWeight: "600",
                  color: colors.textPrimary,
                }}
              >
                Dates
              </ThemedText>
              <ThemedText
                variant="caption"
                color={colors.textSecondary}
                style={{ fontSize: 13.5 }}
              >
                Add dates
              </ThemedText>
            </View>
            <Badge label="Coming soon" />
          </View>

          {/* Guests Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ gap: 2 }}>
              <ThemedText
                variant="subhead"
                style={{
                  fontSize: 15,
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontWeight: "600",
                  color: colors.textPrimary,
                }}
              >
                Guests
              </ThemedText>
              <ThemedText
                variant="caption"
                color={colors.textSecondary}
                style={{ fontSize: 13.5 }}
              >
                {stay.maxGuests ? `Up to ${stay.maxGuests} guests` : "Add guests"}
              </ThemedText>
            </View>
            <Badge label="Coming soon" />
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 20 }} />

        {/* 3. Price Details */}
        <View style={{ gap: 12 }}>
          <ThemedText
            variant="title"
            style={{
              fontSize: 18,
              fontFamily: "PlusJakartaSans_700Bold",
              fontWeight: "700",
              color: colors.textPrimary,
            }}
          >
            Price details
          </ThemedText>

          {priceInfo.lines.map((line, idx) => (
            <View
              key={idx}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <ThemedText
                variant="body"
                style={{
                  fontSize: 14.5,
                  fontFamily: "PlusJakartaSans_400Regular",
                  color: "#374151",
                }}
              >
                {line.label}
              </ThemedText>
              <ThemedText
                variant="body"
                style={{
                  fontSize: 14.5,
                  fontFamily: "PlusJakartaSans_500Medium",
                  color: colors.textPrimary,
                }}
              >
                {line.amount}
              </ThemedText>
            </View>
          ))}

          {/* Inner Divider */}
          <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 4 }} />

          {/* Total Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ThemedText
              variant="subhead"
              style={{
                fontSize: 16.5,
                fontFamily: "PlusJakartaSans_700Bold",
                fontWeight: "700",
                color: colors.textPrimary,
              }}
            >
              Total
            </ThemedText>
            <ThemedText
              variant="subhead"
              style={{
                fontSize: 16.5,
                fontFamily: "PlusJakartaSans_700Bold",
                fontWeight: "700",
                color: colors.textPrimary,
              }}
            >
              {priceInfo.total}
            </ThemedText>
          </View>
        </View>

        {/* 4. Cancellation */}
        {stay.cancellationPolicy ? (
          <>
            <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 20 }} />
            <View style={{ gap: 12 }}>
              <ThemedText
                variant="title"
                style={{
                  fontSize: 18,
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontWeight: "700",
                  color: colors.textPrimary,
                }}
              >
                Cancellation
              </ThemedText>

              <PolicyCard
                title={stay.cancellationPolicy.title || "Cancellation Policy"}
                description={
                  stay.cancellationPolicy.summary ||
                  "Full refund up to 7 days before check-in."
                }
                icon={<FileText size={22} color="#2563EB" />}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setShowPoliciesModal(true);
                }}
              />
            </View>
          </>
        ) : null}
      </ScrollView>

      {/* Pinned Bottom Bar */}
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
          gap: 8,
          alignItems: "center",
          boxShadow: "0 -3px 6px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Button
          size="lg"
          title="Confirm and pay"
          disabled={true}
          style={{ width: "100%" }}
        />
        <ThemedText
          variant="caption"
          color={colors.textSecondary}
          style={{ fontSize: 13, textAlign: "center" }}
        >
          Booking opens soon in Roam.
        </ThemedText>
      </View>

      {/* Cancellation Modal Sheet */}
      {stay.cancellationPolicy && (
        <Modal
          visible={showPoliciesModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPoliciesModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: colors.surfaceWhite }}>
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
              <ThemedText
                style={{
                  fontSize: 18,
                  fontFamily: "PlusJakartaSans_800ExtraBold",
                  fontWeight: "800",
                  color: colors.textPrimary,
                }}
              >
                Cancellation Policy
              </ThemedText>
              <PressableScale
                onPress={() => setShowPoliciesModal(false)}
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

            <ScrollView
              contentContainerStyle={{
                padding: 20,
                paddingBottom: insets.bottom + 40,
                gap: 16,
              }}
            >
              <View
                style={{
                  backgroundColor: "#EFF6FF",
                  borderWidth: 1,
                  borderColor: "#BFDBFE",
                  borderRadius: 16,
                  padding: 16,
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
                    {stay.cancellationPolicy.title || "Flexible Standard Policy"}
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
                  {stay.cancellationPolicy.summary}
                </ThemedText>
              </View>

              {stay.cancellationPolicy.content ? (
                <ThemedText
                  style={{
                    fontSize: 14,
                    lineHeight: 21,
                    fontFamily: "PlusJakartaSans_400Regular",
                    color: "#374151",
                  }}
                >
                  {stay.cancellationPolicy.content}
                </ThemedText>
              ) : null}
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}
