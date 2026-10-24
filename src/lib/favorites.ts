import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { posthog } from "./posthog";

const favoriteIds = new Set<string>();
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function isFavorite(id: string): boolean {
  return favoriteIds.has(id);
}

export function toggleFavorite(id: string): boolean {
  const nextState = !favoriteIds.has(id);
  if (nextState) {
    favoriteIds.add(id);
  } else {
    favoriteIds.delete(id);
  }
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  posthog?.capture("stay_favorite_toggled", {
    stay_id: id,
    is_favorite: nextState,
  });
  notify();
  return nextState;
}

export function getFavorites(): string[] {
  return Array.from(favoriteIds);
}

export function useFavorites() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    favoriteIds,
    isFavorite,
    toggleFavorite,
    favoritesList: Array.from(favoriteIds),
  };
}
