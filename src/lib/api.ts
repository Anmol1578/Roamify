import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Resolves the base URL for API routes (/api/*).
 *
 * Priority:
 * 1. EXPO_PUBLIC_API_URL if explicitly configured in .env / .env.local
 * 2. Empty string on Web (so browser uses native relative fetch against origin)
 * 3. Dynamic Metro server host from Constants.expoConfig?.hostUri on mobile (Android/iOS)
 * 4. Emulator/Simulator fallbacks (10.0.2.2 for Android emulator, localhost for iOS simulator)
 */
export function getApiBaseUrl(): string {
  const envBase = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
  if (envBase) {
    return envBase;
  }

  if (Platform.OS === "web") {
    return "";
  }

  // On native devices during development, derive host and port from Expo Constants
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    if (hostUri.includes("exp.direct")) {
      return `https://${hostUri}`;
    }
    const [host, port] = hostUri.split(":");
    return `http://${host}:${port || "8081"}`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8081";
  }

  return "http://localhost:8081";
}

/**
 * Resolves API paths for client fetch calls.
 * Works uniformly across Web, iOS, and Android physical devices & emulators.
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${cleanPath}` : cleanPath;
}

