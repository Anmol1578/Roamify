import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@clerk/expo";
import { Redirect, Tabs, useRouter } from "expo-router";
import { GlassTabBar, TabId } from "@/components/glass-tab-bar";

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      tabBar={(props) => {
        const routeName = props.state.routes[props.state.index].name;
        const activeTab: TabId =
          routeName === "home" || routeName === "index"
            ? "home"
            : (routeName as TabId);

        return (
          <View
            pointerEvents="box-none"
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: Math.max(insets.bottom, 16),
              alignItems: "center",
              zIndex: 100,
            }}
          >
            <GlassTabBar
              activeTab={activeTab}
              onTabPress={(tabId) => {
                const targetRoute = props.state.routes.find((r) => r.name === tabId);
                if (targetRoute) {
                  const isFocused =
                    props.state.routes[props.state.index].key === targetRoute.key;
                  const event = props.emitter.emit({
                    type: "tabPress",
                    target: targetRoute.key,
                    canPreventDefault: true,
                  });
                  if (!isFocused && !event.defaultPrevented) {
                    props.navigateToTab(targetRoute.key);
                  }
                } else {
                  router.navigate(tabId === "home" ? "/home" : `/${tabId}`);
                }
              }}
              style={{
                width: "100%",
                maxWidth: 380,
              }}
            />
          </View>
        );
      }}
      screenOptions={{
        headerShown: false,
        animation: "none",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: 0,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="trips" options={{ title: "Trips" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
