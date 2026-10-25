import {
  AlertBanner,
  AppleIcon,
  Button,
  GoogleIcon,
  Input,
  ThemedText,
} from "@/components";
import { authErrorMessage } from "@/lib/auth/errors";
import { colors, spacing } from "@/theme";
import { useSignUp, useSSO } from "@clerk/expo";
import * as Linking from "expo-linking";
import { Link, useRouter } from "expo-router";
import { ChevronLeft, Lock, Mail, User } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, fetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Per-field error messages
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validate = () => {
    let isValid = true;

    if (!name.trim()) {
      setNameError("Enter your name.");
      isValid = false;
    } else {
      setNameError(null);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(null);
    }

    if (!password || password.length < 8) {
      setPasswordError("Use at least 8 characters.");
      isValid = false;
    } else {
      setPasswordError(null);
    }

    setGeneralError(null);
    return isValid;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setGeneralError(null);

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || undefined;
    const cleanEmail = email.trim().toLowerCase();

    try {
      let { error: signUpError } = await signUp.password({
        emailAddress: cleanEmail,
        password,
        firstName,
        lastName,
        unsafeMetadata: { firstName, lastName, fullName: name.trim() },
      });

      // If first_name is disabled in Clerk instance settings, retry without firstName/lastName
      if (signUpError && JSON.stringify(signUpError).includes("first_name")) {
        await signUp.reset();
        const retryRes = await signUp.password({
          emailAddress: cleanEmail,
          password,
          unsafeMetadata: { firstName, lastName, fullName: name.trim() },
        });
        signUpError = retryRes.error;
      }

      if (signUpError) {
        const errorMsg = authErrorMessage(signUpError);
        const errObj = signUpError as unknown as {
          errors?: { meta?: { param_name?: string }; code?: string }[];
        };
        const paramName = errObj.errors?.[0]?.meta?.param_name;

        if (paramName === "password") {
          setPasswordError(errorMsg);
        } else if (paramName === "email_address") {
          setEmailError(errorMsg);
        } else {
          setGeneralError(errorMsg);
        }
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setGeneralError(authErrorMessage(sendError));
        return;
      }

      router.push({
        pathname: "/verify",
        params: { email: cleanEmail, flow: "sign-up" },
      });
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

            <ThemedText
              style={{
                fontSize: 27,
                lineHeight: 30,
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontWeight: "800",
                letterSpacing: -1.2,
                color: colors.textPrimary,
              }}
            >
              roamify
            </ThemedText>
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
            {"Create\nyour account"}
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
            Join roamify to save your stays, get personalized recommendations
            and access them across all your devices.
          </ThemedText>

          {/* General Error Banner */}
          {generalError ? (
            <View style={{ marginBottom: spacing.lg }}>
              <AlertBanner type="error" message={generalError} />
            </View>
          ) : null}

          {/* Form Fields Stack */}
          <View style={{ gap: spacing.md, marginBottom: spacing["2xl"] }}>
            <Input
              label="Full name"
              placeholder="e.g. Ethan Hunt"
              leftIcon={<User size={20} color={colors.textSecondary} />}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError(null);
              }}
              autoCapitalize="words"
              errorMessage={nameError || undefined}
            />

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
              placeholder="At least 8 characters"
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

          {/* Primary Action Button */}
          <Button
            variant="primary"
            size="lg"
            title="Create account"
            trailingIcon="arrowRight"
            spreadIcons
            loading={isBusy}
            disabled={isBusy}
            onPress={handleSignUp}
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
              Already have an account?
            </ThemedText>
            <Link href="/sign-in" asChild>
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
                  Sign in
                </ThemedText>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
