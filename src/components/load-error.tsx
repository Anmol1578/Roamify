import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { EmptyState } from "@/components/ui/empty-state";

export interface LoadErrorProps {
  error?: unknown;
  subject: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function isNetworkError(error: unknown): boolean {
  if (!error) return false;
  if (error instanceof TypeError) return true;
  const err = error as Record<string, unknown>;
  if (err.name === "TypeError") return true;
  if (err.status === 0 || err.statusCode === 0) return true;
  const msg = typeof err.message === "string" ? err.message.toLowerCase() : "";
  if (
    msg.includes("network error") ||
    msg.includes("failed to fetch") ||
    msg.includes("network request failed") ||
    msg.includes("the internet connection appears to be offline") ||
    msg.includes("could not connect") ||
    msg.includes("can't connect")
  ) {
    return true;
  }
  return false;
}

export function LoadError({
  error,
  subject,
  onRetry,
  style,
  className,
}: LoadErrorProps) {
  const isNetwork = isNetworkError(error);

  const icon = isNetwork ? "wifiOff" : "warning";
  const title = isNetwork ? "Can't connect" : "Something went wrong";
  const message = isNetwork
    ? "Check your connection and try again."
    : `We couldn't load ${subject} right now. Try again in a moment.`;

  return (
    <EmptyState
      icon={icon}
      title={title}
      message={message}
      action={onRetry ? { title: "Try again", onPress: onRetry } : undefined}
      style={style}
      className={className}
    />
  );
}
