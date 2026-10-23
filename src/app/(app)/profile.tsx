import { ThemedText } from "@/components/themed-text";
import { PressableScale } from "@/components/ui/pressable-scale";
import { posthog } from "@/lib/posthog";
import { colors, radius, spacing } from "@/theme";
import { useClerk, useUser } from "@clerk/expo";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LogOut, Mail, ShieldCheck } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "Explorer";

  const displayEmail =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "";

  const avatarUrl =
    user?.imageUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

  const handleSignOut = async () => {
    try {
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceWhite }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText
          style={{
            fontSize: 34,
            lineHeight: 40,
            fontFamily: "PlusJakartaSans_800ExtraBold",
            fontWeight: "800",
            letterSpacing: -1.2,
            color: colors.textPrimary,
            marginBottom: spacing.xl,
          }}
        >
          Profile
        </ThemedText>

        {/* User Card */}
        <View
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: radius["2xl"],
            padding: 24,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.borderGray,
            gap: 12,
          }}
        >
          {/* Avatar */}
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              overflow: "hidden",
              backgroundColor: "#FCE790",
              borderWidth: 3,
              borderColor: colors.surfaceWhite,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={200}
            />
          </View>

          {/* Name */}
          <ThemedText
            style={{
              fontSize: 24,
              lineHeight: 30,
              fontFamily: "PlusJakartaSans_700Bold",
              fontWeight: "700",
              color: colors.textPrimary,
            }}
          >
            {displayName}
          </ThemedText>

          {/* Email badge */}
          {displayEmail ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: colors.surfaceWhite,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: radius.full,
                borderWidth: 1,
                borderColor: colors.borderGray,
              }}
            >
              <Mail size={14} color={colors.textSecondary} />
              <ThemedText
                style={{
                  fontSize: 14,
                  fontFamily: "PlusJakartaSans_500Medium",
                  color: colors.textSecondary,
                }}
              >
                {displayEmail}
              </ThemedText>
            </View>
          ) : null}
        </View>

        {/* Account Details Section */}
        <View style={{ marginTop: 28, gap: 12 }}>
          <ThemedText
            style={{
              fontSize: 16,
              fontFamily: "PlusJakartaSans_700Bold",
              color: colors.textPrimary,
              marginBottom: 4,
            }}
          >
            Account Details
          </ThemedText>

          <View
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: radius.xl,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.borderGray,
              gap: 16,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <ShieldCheck size={20} color="#16A34A" />
              <View style={{ flex: 1 }}>
                <ThemedText
                  style={{
                    fontSize: 15,
                    fontFamily: "PlusJakartaSans_600SemiBold",
                    color: colors.textPrimary,
                  }}
                >
                  Verified Member
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: 13,
                    fontFamily: "PlusJakartaSans_400Regular",
                    color: colors.textSecondary,
                  }}
                >
                  Authenticated via Clerk secure session
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={{ marginTop: 36 }}>
          <PressableScale
            disabled={signingOut}
            onPress={handleSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out of Roamify"
          >
            <View
              style={{
                height: 54,
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
                      fontSize: 16,
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
