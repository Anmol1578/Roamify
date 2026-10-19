import React, { useState } from "react";
import { View, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser, useClerk } from "@clerk/expo";
import { colors, spacing } from "@/theme";
import { ThemedText } from "@/components";

export default function HomeScreen() {
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

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      router.replace("/onboarding");
    } catch {
      router.replace("/onboarding");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfaceGray }}>
      <View style={{ flex: 1, paddingHorizontal: spacing["2xl"], paddingTop: spacing.md }}>
        {/* Brand Wordmark (roamify) */}
        <ThemedText
          style={{
            fontSize: 34,
            lineHeight: 38,
            fontFamily: "PlusJakartaSans_800ExtraBold",
            fontWeight: "800",
            letterSpacing: -1.4,
            color: colors.textPrimary,
            marginBottom: spacing.xl,
          }}
        >
          roamify
        </ThemedText>

        {/* Signed in as {name} */}
        <ThemedText
          style={{
            fontSize: 24,
            lineHeight: 30,
            fontFamily: "PlusJakartaSans_700Bold",
            fontWeight: "700",
            color: colors.textPrimary,
            marginBottom: 6,
          }}
        >
          {`Signed in as ${displayName}`}
        </ThemedText>

        {/* Email Address */}
        {displayEmail ? (
          <ThemedText
            variant="body"
            style={{
              fontSize: 15,
              lineHeight: 20,
              color: colors.textSecondary,
              fontFamily: "PlusJakartaSans_400Regular",
              marginBottom: spacing["2xl"],
            }}
          >
            {displayEmail}
          </ThemedText>
        ) : null}

        {/* Sign Out Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          disabled={signingOut}
          onPress={handleSignOut}
          hitSlop={8}
          style={({ pressed }) => ({
            height: 52,
            borderRadius: 9999,
            backgroundColor: pressed ? colors.borderLight : colors.surfaceWhite,
            borderWidth: 1,
            borderColor: colors.borderGray,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            opacity: pressed || signingOut ? 0.75 : 1,
          })}
        >
          {signingOut ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <ThemedText
              style={{
                fontSize: 16,
                fontFamily: "PlusJakartaSans_600SemiBold",
                fontWeight: "600",
                color: colors.textPrimary,
              }}
            >
              Sign out
            </ThemedText>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
