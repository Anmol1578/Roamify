import React from "react";
import { View, Text, ViewStyle, StyleProp } from "react-native";
import { MapPin } from "lucide-react-native";

export interface LocationPillProps {
  location: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function LocationPill({ location, style, className }: LocationPillProps) {
  return (
    <View
      style={style}
      className={`h-10 px-4 flex-row items-center gap-2 rounded-full bg-scrim border border-scrim-border ${
        className ?? ""
      }`}
    >
      <MapPin size={18} color="#FFFFFF" strokeWidth={2.4} />
      <Text className="text-white text-[14px] font-jakarta-medium">
        {location}
      </Text>
    </View>
  );
}
