import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import "../../global.css";
import { useEffect, useRef } from "react";
import { Stack, usePathname } from "expo-router";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { posthog } from "../lib/posthog";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add your key to .env — then restart the dev server."
  );
}

SplashScreen.preventAutoHideAsync();

function IdentifiedRootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const posthog = usePostHog();
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    posthog.screen(pathname);
  }, [pathname, posthog]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !user?.id) {
      if (identifiedUserId.current) {
        posthog.reset();
        identifiedUserId.current = null;
      }
      return;
    }

    if (identifiedUserId.current === user.id) {
      return;
    }

    if (identifiedUserId.current) {
      posthog.reset();
    }

    const personProperties: Record<string, string> = {};
    if (user.primaryEmailAddress?.emailAddress) {
      personProperties.email = user.primaryEmailAddress.emailAddress;
    }
    if (user.firstName) {
      personProperties.first_name = user.firstName;
    }
    if (user.lastName) {
      personProperties.last_name = user.lastName;
    }

    posthog.identify(user.id, { $set: personProperties });
    identifiedUserId.current = user.id;
  }, [isLoaded, isSignedIn, posthog, user]);

  return <RootNavigator fontsReady={fontsReady} />;
}

function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { isLoaded } = useAuth();

  useEffect(() => {
    if (fontsReady && isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsReady, isLoaded]);

  if (!fontsReady || !isLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F4F5F7" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen
        name="stay/[slug]/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="stay/[slug]/ask"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="design-system"
        options={{
          headerShown: true,
          title: "Design System",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        {posthog ? (
          <IdentifiedRootNavigator fontsReady={!!loaded || !!error} />
        ) : (
          <RootNavigator fontsReady={!!loaded || !!error} />
        )}
      </ClerkProvider>
    </GestureHandlerRootView>
  );

  return posthog ? <PostHogProvider client={posthog}>{content}</PostHogProvider> : content;
}