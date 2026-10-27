import {
  AlertBanner,
  AppleIcon,
  Button,
  GoogleIcon,
  Input,
  ThemedText,
  Wordmark,
} from "@/components";
import { authErrorMessage } from "@/lib/auth/errors";
import { posthog } from "@/lib/posthog";
import { colors, spacing } from "@/theme";
import { useSignIn, useSSO } from "@clerk/expo";
import * as Linking from "expo-linking";
import { Link, useRouter } from "expo-router";
import { ChevronLeft, Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Per-field error messages
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const validate = () => {
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError("Enter your password.");
      isValid = false;
    } else {
      setPasswordError(null);
    }

    setGeneralError(null);
    return isValid;
  };

  const handleSignIn = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setGeneralError(null);
    setInfo(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const { error: signInError } = await signIn.password({
        emailAddress: cleanEmail,
        password,
      });

      if (signInError) {
        setGeneralError(authErrorMessage(signInError));
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize();
        posthog?.capture("user_signed_in", { auth_method: "password" });
        return;
      }

      if (signIn.status === "needs_client_trust") {
        await signIn.mfa.sendEmailCode();
        router.push({
          pathname: "/verify",
          params: { email: cleanEmail, flow: "sign-in" },
        });
        return;
      }

      if (signIn.status === "needs_first_factor") {
        await signIn.emailCode.sendCode();
        router.push({
          pathname: "/verify",
          params: { email: cleanEmail, flow: "sign-in" },
        });
        return;
      }

      setGeneralError(
        "Additional verification required. Please check your account.",
      );
    } catch (err: unknown) {
      setGeneralError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    setSubmitting(true);
    setGeneralError(null);

    try {
      const redirectUrl = Linking.createURL("/sso-callback", {
        scheme: "roamify",
      });
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl,
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (err: unknown) {
      const msg = authErrorMessage(err);
      if (!msg.toLowerCase().includes("cancel")) {
        setGeneralError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setEmailError("Enter your email address first.");
      return;
    }
    setEmailError(null);
    setSubmitting(true);
    try {
      await signIn.create({ identifier: email.trim().toLowerCase() });
      const { error: resetError } =
        await signIn.resetPasswordEmailCode.sendCode();
      if (resetError) {
        setGeneralError(authErrorMessage(resetError));
      } else {
        setInfo("Password reset code sent to your email.");
      }
    } catch (err: unknown) {
      setGeneralError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/onboarding");
    }
  };

  const isBusy = submitting || fetchStatus === "fetching";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfaceWhite }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing["2xl"],
            paddingTop: spacing.sm,
            paddingBottom: spacing["3xl"],
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar: Back circular pill button + Roamify wordmark */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing["2xl"],
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={handleBack}
              hitSlop={8}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surfaceWhite,
                borderWidth: 1,
                borderColor: colors.borderGray,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft
                size={22}
                color={colors.textPrimary}
                strokeWidth={2.4}
              />
            </Pressable>

            <Wordmark size="sm" />
          </View>

          {/* Heading */}
          <ThemedText
            variant="hero"
            style={{
              fontSize: 34,
              lineHeight: 40,
              fontFamily: "PlusJakartaSans_800ExtraBold",
              fontWeight: "800",
              letterSpacing: -1,
              color: colors.textPrimary,
              marginBottom: 10,
            }}
          >
            {"Welcome\nback"}
          </ThemedText>

          {/* Subtitle */}
          <ThemedText
            variant="body"
            style={{
              fontSize: 15.5,
              lineHeight: 22.5,
              color: colors.textSecondary,
              marginBottom: spacing["2xl"],
            }}
          >
            Sign in to roamify to access your saved stays, bookings, and travel
            preferences.
          </ThemedText>

          {/* Success or Info Banner */}
          {info ? (
            <View style={{ marginBottom: spacing.lg }}>
              <AlertBanner type="success" message={info} />
            </View>
          ) : null}

          {/* General Error Banner */}
          {generalError ? (
            <View style={{ marginBottom: spacing.lg }}>
              <AlertBanner type="error" message={generalError} />
            </View>
          ) : null}

          {/* Form Fields Stack */}
          <View style={{ gap: spacing.md, marginBottom: spacing.md }}>
            <Input
              label="Email address"
              placeholder="ethanwinters@gmail.com"
              leftIcon={<Mail size={20} color={colors.textSecondary} />}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              errorMessage={emailError || undefined}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              leftIcon={<Lock size={20} color={colors.textSecondary} />}
              isPassword
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(null);
              }}
              autoCapitalize="none"
              errorMessage={passwordError || undefined}
            />
          </View>

          {/* Forgot Password Action Link */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginBottom: spacing["2xl"],
            }}
          >
            <Pressable onPress={handleForgotPassword} hitSlop={8}>
              <ThemedText
                variant="body"
                style={{
                  fontSize: 14,
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontWeight: "600",
                  color: colors.textPrimary,
                }}
              >
                Forgot password?
              </ThemedText>
            </Pressable>
          </View>

          {/* Primary Action Button */}
          <Button
            variant="primary"
            size="lg"
            title="Sign in"
            trailingIcon="arrowRight"
            spreadIcons
            loading={isBusy}
            disabled={isBusy}
            onPress={handleSignIn}
          />

          {/* Or Divider */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: spacing.xl,
            }}
          >
            <View
              style={{ flex: 1, height: 1, backgroundColor: colors.borderGray }}
            />
            <ThemedText
              style={{
                marginHorizontal: spacing.md,
                fontSize: 14,
                color: colors.textSecondary,
                fontFamily: "PlusJakartaSans_500Medium",
              }}
            >
              or
            </ThemedText>
            <View
              style={{ flex: 1, height: 1, backgroundColor: colors.borderGray }}
            />
          </View>

          {/* Social Auth Buttons */}
          <View style={{ gap: spacing.md, marginBottom: spacing["2xl"] }}>
            <Button
              variant="secondary"
              size="lg"
              title="Continue with Google"
              icon={<GoogleIcon size={20} />}
              disabled={isBusy}
              onPress={() => handleSocialAuth("oauth_google")}
            />

            <Button
              variant="secondary"
              size="lg"
              title="Continue with Apple"
              icon={<AppleIcon size={20} />}
              disabled={isBusy}
              onPress={() => handleSocialAuth("oauth_apple")}
            />
          </View>

          {/* Clerk Bot Protection Captcha Mount Point */}
          <View nativeID="clerk-captcha" />

          {/* Footer Link */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 6,
            }}
          >
            <ThemedText
              variant="body"
              style={{ fontSize: 15, color: colors.textSecondary }}
            >
              {"Don't have an account?"}
            </ThemedText>
            <Link href="/sign-up" asChild>
              <Pressable hitSlop={8}>
                <ThemedText
                  variant="body"
                  style={{
                    fontSize: 15,
                    fontFamily: "PlusJakartaSans_700Bold",
                    fontWeight: "700",
                    color: colors.textPrimary,
                    textDecorationLine: "underline",
                  }}
                >
                  Sign up
                </ThemedText>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
