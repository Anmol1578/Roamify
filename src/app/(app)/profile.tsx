import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useClerk, useUser } from "@clerk/expo";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import {
  Bell,
  ChevronRight,
  CreditCard,
  FileText,
  HelpCircle,
  LogOut,
  Luggage,
  MapPin,
  Settings,
  Star,
  User as UserIcon,
} from "lucide-react-native";
import { ThemedText } from "@/components/themed-text";
import { Wordmark } from "@/components/brand-wordmark";
import { PressableScale } from "@/components/ui/pressable-scale";
import { posthog } from "@/lib/posthog";
import { colors, radius, spacing } from "@/theme";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  showDivider?: boolean;
}

function MenuItem({ icon, label, onPress, showDivider = false }: MenuItemProps) {
  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <>
      <PressableScale
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 14,
            paddingHorizontal: 16,
          }}
        >
          {/* Circular icon container */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: radius.full,
              backgroundColor: "#F4F5F8",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </View>

          {/* Label */}
          <ThemedText
            style={{
              flex: 1,
              marginLeft: 14,
              fontSize: 16,
              fontFamily: "PlusJakartaSans_600SemiBold",
              fontWeight: "600",
              color: colors.textPrimary,
            }}
          >
            {label}
          </ThemedText>

          {/* Chevron */}
          <ChevronRight size={18} color={colors.textMuted} strokeWidth={2.2} />
        </View>
      </PressableScale>
      {showDivider ? (
        <View
          style={{
            height: 1,
            backgroundColor: "#F0F2F6",
            marginLeft: 70,
            marginRight: 16,
          }}
        />
      ) : null}
    </>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);

  const metadata = user?.unsafeMetadata as Record<string, string> | undefined;
  const displayName =
    user?.fullName ||
    user?.firstName ||
    metadata?.fullName ||
    metadata?.firstName ||
    "Joanna Smith";

  const displayLocation =
    metadata?.location ||
    "San Francisco, CA";

  const avatarUrl =
    user?.imageUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

  const handleSignOut = async () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSigningOut(true);
      posthog?.capture("user_signed_out");
      await signOut();
      router.replace("/onboarding");
    } catch {
      router.replace("/onboarding");
    } finally {
      setSigningOut(false);
    }
  };

  const handleSettingsPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Settings", "Account and application settings coming soon.", [
      { text: "OK" },
    ]);
  };

  const handleAction = (title: string, message: string) => {
    Alert.alert(title, message, [{ text: "OK" }]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F9FB" }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 110,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Row: roamify Wordmark & Settings Button */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Wordmark size="md" />

          {/* Settings Button */}
          <PressableScale
            onPress={handleSettingsPress}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.full,
                backgroundColor: colors.surfaceWhite,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#EDEFF2",
                boxShadow: "0 2px 6px rgba(11, 11, 26, 0.04)",
              }}
            >
              <Settings size={20} color={colors.textPrimary} strokeWidth={2} />
            </View>
          </PressableScale>
        </View>

        {/* User Info Header: Avatar + Details */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 4,
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 92,
              height: 92,
              borderRadius: 46,
              overflow: "hidden",
              backgroundColor: "#FCE790",
              borderWidth: 3,
              borderColor: colors.surfaceWhite,
              boxShadow: "0 4px 14px rgba(11, 11, 26, 0.08)",
            }}
          >
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={200}
            />
          </View>

          {/* User Text Details */}
          <View style={{ flex: 1, marginLeft: 16, justifyContent: "center" }}>
            <ThemedText
              numberOfLines={1}
              style={{
                fontSize: 24,
                lineHeight: 28,
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontWeight: "800",
                letterSpacing: -0.5,
                color: colors.textPrimary,
              }}
            >
              {displayName}
            </ThemedText>

            {/* Location */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginTop: 4,
              }}
            >
              <MapPin size={15} color="#8E95A5" />
              <ThemedText
                style={{
                  fontSize: 14,
                  lineHeight: 18,
                  fontFamily: "PlusJakartaSans_500Medium",
                  color: colors.textSecondary,
                }}
              >
                {displayLocation}
              </ThemedText>
            </View>

            {/* Badge */}
            <View
              style={{
                marginTop: 8,
                alignSelf: "flex-start",
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: "#EFEAFD",
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: radius.full,
              }}
            >
              <Star size={13} fill="#F59E0B" color="#F59E0B" />
              <ThemedText
                style={{
                  fontSize: 13,
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontWeight: "600",
                  color: "#2E266F",
                }}
              >
                Roamify Explorer
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Stats Summary Card */}
        <View
          style={{
            backgroundColor: colors.surfaceWhite,
            borderRadius: radius["2xl"],
            paddingVertical: 18,
            paddingHorizontal: 12,
            marginTop: 22,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#EDEFF2",
            boxShadow: "0 2px 10px rgba(11, 11, 26, 0.04)",
          }}
        >
          {/* Trips */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <ThemedText
              style={{
                fontSize: 22,
                lineHeight: 26,
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontWeight: "800",
                color: colors.textPrimary,
              }}
            >
              12
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 13,
                fontFamily: "PlusJakartaSans_500Medium",
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
              Trips
            </ThemedText>
          </View>

          {/* Divider */}
          <View
            style={{
              width: 1,
              height: 34,
              backgroundColor: "#EDEFF2",
            }}
          />

          {/* Saved */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <ThemedText
              style={{
                fontSize: 22,
                lineHeight: 26,
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontWeight: "800",
                color: colors.textPrimary,
              }}
            >
              8
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 13,
                fontFamily: "PlusJakartaSans_500Medium",
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
              Saved
            </ThemedText>
          </View>

          {/* Divider */}
          <View
            style={{
              width: 1,
              height: 34,
              backgroundColor: "#EDEFF2",
            }}
          />

          {/* Rating */}
          <View style={{ flex: 1, alignItems: "center" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              <ThemedText
                style={{
                  fontSize: 22,
                  lineHeight: 26,
                  fontFamily: "PlusJakartaSans_800ExtraBold",
                  fontWeight: "800",
                  color: colors.textPrimary,
                }}
              >
                4.9
              </ThemedText>
            </View>
            <ThemedText
              style={{
                fontSize: 13,
                fontFamily: "PlusJakartaSans_500Medium",
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
              Rating
            </ThemedText>
          </View>
        </View>

        {/* Section: Account */}
        <View style={{ marginTop: 24 }}>
          <ThemedText
            style={{
              fontSize: 18,
              lineHeight: 22,
              fontFamily: "PlusJakartaSans_700Bold",
              fontWeight: "700",
              color: colors.textPrimary,
              marginBottom: 10,
            }}
          >
            Account
          </ThemedText>

          <View
            style={{
              backgroundColor: colors.surfaceWhite,
              borderRadius: radius["2xl"],
              borderWidth: 1,
              borderColor: "#EDEFF2",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(11, 11, 26, 0.03)",
            }}
          >
            <MenuItem
              icon={<UserIcon size={19} color={colors.textPrimary} strokeWidth={2} />}
              label="Personal info"
              onPress={() =>
                handleAction(
                  "Personal info",
                  `Signed in as ${displayName}.\nAuthenticated via Clerk.`
                )
              }
              showDivider
            />
            <MenuItem
              icon={<CreditCard size={19} color={colors.textPrimary} strokeWidth={2} />}
              label="Payment methods"
              onPress={() =>
                handleAction(
                  "Payment methods",
                  "Secure payment methods with Apple Pay, Google Pay, and credit cards."
                )
              }
              showDivider
            />
            <MenuItem
              icon={<Luggage size={19} color={colors.textPrimary} strokeWidth={2} />}
              label="Trips"
              onPress={() => router.navigate("/trips")}
            />
          </View>
        </View>

        {/* Section: Preferences */}
        <View style={{ marginTop: 20 }}>
          <ThemedText
            style={{
              fontSize: 18,
              lineHeight: 22,
              fontFamily: "PlusJakartaSans_700Bold",
              fontWeight: "700",
              color: colors.textPrimary,
              marginBottom: 10,
            }}
          >
            Preferences
          </ThemedText>

          <View
            style={{
              backgroundColor: colors.surfaceWhite,
              borderRadius: radius["2xl"],
              borderWidth: 1,
              borderColor: "#EDEFF2",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(11, 11, 26, 0.03)",
            }}
          >
            <MenuItem
              icon={<Bell size={19} color={colors.textPrimary} strokeWidth={2} />}
              label="Notifications"
              onPress={() =>
                handleAction(
                  "Notifications",
                  "Push notification preferences for bookings, trip updates, and offers."
                )
              }
              showDivider
            />
            <MenuItem
              icon={<HelpCircle size={19} color={colors.textPrimary} strokeWidth={2} />}
              label="Help & support"
              onPress={() =>
                handleAction(
                  "Help & support",
                  "Roamify 24/7 guest support is available via chat and policy assistant."
                )
              }
            />
          </View>
        </View>

        {/* Policy Callout Banner: Free cancellation */}
        <PressableScale
          onPress={() =>
            handleAction(
              "Cancellation Policy",
              "Cancel free of charge up to 7 days before check-in for a 100% full refund on eligible stays."
            )
          }
          accessibilityRole="button"
          accessibilityLabel="Free cancellation policy"
        >
          <View
            style={{
              backgroundColor: "#EEEDFC",
              borderRadius: 22,
              padding: 16,
              borderWidth: 1,
              borderColor: "#E2DBFC",
              flexDirection: "row",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: "#DDD6FE",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileText size={22} color="#7C3AED" strokeWidth={2} />
            </View>

            {/* Banner Text */}
            <View style={{ flex: 1, marginLeft: 14 }}>
              <ThemedText
                style={{
                  fontSize: 15,
                  lineHeight: 20,
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontWeight: "700",
                  color: "#1E1B4B",
                }}
              >
                Free cancellation
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 13,
                  lineHeight: 18,
                  fontFamily: "PlusJakartaSans_400Regular",
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                Full refund up to 7 days before check-in.
              </ThemedText>
            </View>

            {/* Chevron */}
            <ChevronRight size={18} color="#7C3AED" strokeWidth={2.2} />
          </View>
        </PressableScale>

        {/* Sign Out Button */}
        <View style={{ marginTop: spacing.xl }}>
          <PressableScale
            disabled={signingOut}
            onPress={handleSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out of Roamify"
          >
            <View
              style={{
                height: 52,
                borderRadius: radius.full,
                backgroundColor: "#FEECEE",
                borderWidth: 1,
                borderColor: "#FCA5A5",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {signingOut ? (
                <ActivityIndicator color="#DC2626" />
              ) : (
                <>
                  <LogOut size={18} color="#DC2626" strokeWidth={2.2} />
                  <ThemedText
                    style={{
                      fontSize: 15,
                      fontFamily: "PlusJakartaSans_700Bold",
                      fontWeight: "700",
                      color: "#DC2626",
                    }}
                  >
                    Sign out
                  </ThemedText>
                </>
              )}
            </View>
          </PressableScale>
        </View>
      </ScrollView>
    </View>
  );
}
