import React from "react";
import { View } from "react-native";

export interface PageDotsProps {
  total: number;
  activeIndex: number;
  className?: string;
}

export function PageDots({ total, activeIndex, className }: PageDotsProps) {
  return (
    <View className={`flex-row items-center gap-2 ${className ?? ""}`}>
      {Array.from({ length: total }).map((_, idx) => {
        const isActive = idx === activeIndex;
        return (
          <View
            key={idx}
            style={{
              height: 6,
              width: isActive ? 40 : 36,
              borderRadius: 9999,
              backgroundColor: isActive ? "#8A7CFE" : "#E5E7EB",
            }}
          />
        );
      })}
    </View>
  );
}
