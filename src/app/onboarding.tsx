import React, { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  useWindowDimensions,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { ThemedText, Button } from "@/components";
import { Wordmark } from "@/components/brand/wordmark";
import { SLIDES } from "@/components/onboarding/slides";
import { SheetCurve } from "@/components/onboarding/sheet-curve";
import { LocationPill } from "@/components/onboarding/location-pill";
import { PageDots } from "@/components/onboarding/page-dots";
import { GoogleMark } from "@/components/onboarding/google-mark";

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const currentSlide = SLIDES[activeIndex];

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offsetX / width);
    if (nextIndex >= 0 && nextIndex < SLIDES.length && nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    }
  };

  const handleGetStarted = () => {
    router.push("/sign-up");
  };

  const handleGoogleAuth = () => {
    router.push("/sign-in");
  };

  const handleSkip = () => {
    router.push("/sign-in");
  };

  // Estimated sheet height for location pill anchor
  const sheetContentHeight = 290 + Math.max(insets.bottom, 24);
  const totalSheetHeight = sheetContentHeight + 64;

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <StatusBar style="dark" />

      {/* Horizontal Paging ScrollView: Photo + Location Pill per slide */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        onMomentumScrollEnd={handleScrollEnd}
        style={{ width, height }}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={{ width, height, position: "relative" }}>
            <Image
              source={slide.image}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              priority="high"
            />
            {/* Location Pill pinned 20pt above sheet top-left edge */}
            <View
              style={{
                position: "absolute",
                bottom: totalSheetHeight + 20,
                left: 24,
                zIndex: 10,
              }}
            >
              <LocationPill location={slide.location} />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Fixed Top Header Row */}
      <View
        style={{
          position: "absolute",
          top: insets.top + 16,
          left: 0,
          right: 0,
          zIndex: 30,
          paddingHorizontal: 24,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* roamify Wordmark placeholder */}
        <Wordmark />

        {/* Skip Pill */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          onPress={handleSkip}
          hitSlop={8}
        >
          {isLiquidGlassAvailable() ? (
            <GlassView
              style={{
                height: 44,
                paddingHorizontal: 20,
                borderRadius: 9999,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ThemedText
                variant="button"
                style={{ fontSize: 15 }}
                className="text-text-primary"
              >
                Skip
              </ThemedText>
            </GlassView>
          ) : (
            <View className="h-11 px-5 rounded-full bg-glass items-center justify-center">
              <ThemedText
                variant="button"
                style={{ fontSize: 15 }}
                className="text-text-primary"
              >
                Skip
              </ThemedText>
            </View>
          )}
        </Pressable>
      </View>

      {/* Fixed Bottom Sheet */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 20,
        }}
      >
        {/* SVG Curve at the top */}
        <SheetCurve />

        {/* Sheet Content Container */}
        <View
          className="bg-surface px-6 pb-6"
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}
        >
          {/* Dots row */}
          <View style={{ paddingTop: 8 }}>
            <PageDots total={SLIDES.length} activeIndex={activeIndex} />
          </View>

          {/* Cross-fading Headline & Body */}
          <Animated.View
            key={`slide-copy-${activeIndex}`}
            entering={FadeIn.duration(250)}
            exiting={FadeOut.duration(200)}
            style={{ marginTop: 24 }}
          >
            <ThemedText
              variant="hero"
              style={{
                fontSize: 36,
                lineHeight: 42,
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontWeight: "800",
                letterSpacing: -1.2,
                color: "#0B0B1A",
              }}
              numberOfLines={2}
            >
              {currentSlide.title}
            </ThemedText>

            <ThemedText
              variant="lead"
              style={{
                marginTop: 14,
                fontSize: 16,
                lineHeight: 23,
                fontFamily: "PlusJakartaSans_400Regular",
                color: "#6B7280",
              }}
              numberOfLines={3}
            >
              {currentSlide.body}
            </ThemedText>
          </Animated.View>

          {/* Buttons Stack */}
          <View style={{ marginTop: 24, gap: 12 }}>
            <Button
              variant="primary"
              size="lg"
              title="Start exploring"
              trailingIcon="arrowRight"
              spreadIcons
              onPress={handleGetStarted}
            />

            <Button
              variant="secondary"
              size="lg"
              title="Continue with Google"
              icon={<GoogleMark />}
              onPress={handleGoogleAuth}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
