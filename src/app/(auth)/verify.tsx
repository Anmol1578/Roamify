import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Redirect } from "expo-router";
import { useSignUp, useSignIn } from "@clerk/expo";
import { ChevronLeft, MailCheck } from "lucide-react-native";
import { colors, spacing } from "@/theme";
import { ThemedText, Button, OtpInput, AlertBanner } from "@/components";
import { authErrorMessage } from "@/lib/auth/errors";

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; flow?: string }>();
  const isSignInFlow = params.flow === "sign-in";

  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp();
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn();

  const emailToVerify = params.email || "you@example.com";

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);

  // Validate that an active attempt exists; redirect if accessed invalidly
  const isAttemptValid = isSignInFlow
    ? signIn.status === "needs_client_trust" || signIn.status === "needs_first_factor"
    : signUp.status === "missing_requirements" &&
      signUp.unverifiedFields?.includes("email_address");

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  if (!isAttemptValid && !submitting) {
    return <Redirect href={isSignInFlow ? "/(auth)/sign-in" : "/(auth)/sign-up"} />;
  }

  const handleResend = async () => {
    if (!canResend) return;
    setError(null);
    try {
      if (isSignInFlow) {
        if (signIn.status === "needs_client_trust") {
          await signIn.mfa.sendEmailCode();
        } else {
          await signIn.emailCode.sendCode();
        }
      } else {
        await signUp.verifications.sendEmailCode();
      }
      setTimer(59);
      setCanResend(false);
      setSuccess("A fresh verification code was sent to your email.");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: unknown) {
      setError(authErrorMessage(err));
    }
  };

  const handleVerify = async () => {
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      if (isSignInFlow) {
        let verifyRes;
        if (signIn.status === "needs_client_trust") {
          verifyRes = await signIn.mfa.verifyEmailCode({ code });
        } else {
          verifyRes = await signIn.emailCode.verifyCode({ code });
        }

        if (verifyRes?.error) {
          setError(authErrorMessage(verifyRes.error));
          return;
        }

        if (signIn.status === "complete") {
          setSuccess("Signed in successfully!");
          await signIn.finalize();
          return;
        }
      } else {
        const { error: verifyError } = await signUp.verifications.verifyEmailCode({
          code,
        });

        if (verifyError) {
          setError(authErrorMessage(verifyError));
          return;
        }

        if (signUp.status === "complete") {
          setSuccess("Account verified successfully! Welcome to Roamify.");
          await signUp.finalize();
          return;
        }
      }

      setError("Verification was not completed. Please try again.");
    } catch (err: unknown) {
      setError(authErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(isSignInFlow ? "/sign-in" : "/sign-up");
    }
  };

  const formattedTimer = `00:${timer < 10 ? `0${timer}` : timer}`;
  const isBusy =
    submitting ||
    signUpFetchStatus === "fetching" ||
    signInFetchStatus === "fetching";

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
          {/* Top Bar: Back circular button + roamify wordmark */}
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
              <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.4} />
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
            {"Verify your\nemail"}
          </ThemedText>

          {/* Subtitle with dynamic email recipient */}
          <ThemedText
            variant="body"
            style={{
              fontSize: 15.5,
              lineHeight: 22.5,
              color: colors.textSecondary,
              marginBottom: spacing["2xl"],
            }}
          >
            {isSignInFlow
              ? `We sent a 6-digit code to\n${emailToVerify}. Enter it below to confirm it's you.`
              : `We've sent a 6-digit verification code to\n${emailToVerify}. Enter it below to complete your registration.`}
          </ThemedText>

          {/* Alert Banners (Success & Error feedback) */}
          {success ? (
            <View style={{ marginBottom: spacing.lg }}>
              <AlertBanner type="success" message={success} />
            </View>
          ) : null}

          {error ? (
            <View style={{ marginBottom: spacing.lg }}>
              <AlertBanner type="error" message={error} />
            </View>
          ) : null}

          {/* 6-Digit OTP Cells Container */}
          <View style={{ marginBottom: spacing.xl, alignItems: "center" }}>
            <OtpInput
              length={6}
              value={code}
              onChangeText={(newCode: string) => {
                setCode(newCode);
                if (error) setError(null);
                if (newCode.length === 6) {
                  // Auto-verify trigger
                  setTimeout(() => {
                    handleVerify();
                  }, 150);
                }
              }}
            />
          </View>

          {/* Resend Countdown & Action Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 6,
              marginBottom: spacing["3xl"],
            }}
          >
            <ThemedText
              variant="body"
              style={{ fontSize: 14.5, color: colors.textSecondary }}
            >
              {"Didn't receive code?"}
            </ThemedText>
            {canResend ? (
              <Pressable onPress={handleResend} hitSlop={8}>
                <ThemedText
                  variant="body"
                  style={{
                    fontSize: 14.5,
                    fontFamily: "PlusJakartaSans_700Bold",
                    fontWeight: "700",
                    color: colors.textPrimary,
                    textDecorationLine: "underline",
                  }}
                >
                  Resend code
                </ThemedText>
              </Pressable>
            ) : (
              <ThemedText
                variant="body"
                style={{
                  fontSize: 14.5,
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontWeight: "600",
                  color: colors.textPrimary,
                }}
              >
                {`Resend (${formattedTimer})`}
              </ThemedText>
            )}
          </View>

          {/* Primary Action Button */}
          <Button
            variant="primary"
            size="lg"
            title="Verify & continue"
            trailingIcon="arrowRight"
            spreadIcons
            loading={isBusy}
            disabled={isBusy || code.length < 6}
            onPress={handleVerify}
          />

          {/* Security note */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: spacing.xl,
            }}
          >
            <MailCheck size={16} color={colors.textSecondary} />
            <ThemedText
              variant="small"
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                fontFamily: "PlusJakartaSans_500Medium",
              }}
            >
              Verification codes expire in 10 minutes
            </ThemedText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
