import React from "react";
import { View } from "react-native";
import {
  PawPrint,
  Clock,
  Home,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  FileText,
} from "lucide-react-native";
import { AnswerCard as AnswerCardData } from "@/lib/ask";
import { ThemedText } from "@/components/themed-text";
import { PressableScale } from "@/components/ui/pressable-scale";
import { colors, radius } from "@/theme";

export interface AnswerCardProps {
  card: AnswerCardData;
  onLinkPress?: (section?: string) => void;
}

export function AnswerCardComponent({ card, onLinkPress }: AnswerCardProps) {
  const isNoAnswer = card.key === "no-answer";

  const renderIcon = () => {
    const iconColor = "#7C3AED";
    const iconSize = 20;
    const stroke = 2.2;

    switch (card.iconType) {
      case "paw":
        return <PawPrint size={iconSize} color={iconColor} strokeWidth={stroke} />;
      case "clock":
        return <Clock size={iconSize} color={iconColor} strokeWidth={stroke} />;
      case "home":
        return <Home size={iconSize} color={iconColor} strokeWidth={stroke} />;
      case "card":
        return <CreditCard size={iconSize} color={iconColor} strokeWidth={stroke} />;
      case "shield":
        return <ShieldCheck size={iconSize} color={iconColor} strokeWidth={stroke} />;
      case "refund":
        return <RotateCcw size={iconSize} color={iconColor} strokeWidth={stroke} />;
      default:
        return <FileText size={iconSize} color={iconColor} strokeWidth={stroke} />;
    }
  };

  const sourceDisplay =
    card.sourceText ||
    (card.source
      ? `${card.source.label} · ${card.source.icon === "home" ? "this stay" : "Roam policy"}`
      : "");

  return (
    <View
      style={{
        borderRadius: radius["2xl"],
        backgroundColor: isNoAnswer ? "#F3F4F6" : "#F1EFFE",
        padding: 16,
        gap: 10,
        borderWidth: 1,
        borderColor: isNoAnswer ? "#E5E7EB" : "rgba(224, 215, 254, 0.7)",
      }}
    >
      {/* Title & Icon Header Row */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        {!isNoAnswer && renderIcon()}
        <ThemedText
          style={{
            fontSize: 16.5,
            fontFamily: "PlusJakartaSans_700Bold",
            fontWeight: "700",
            color: colors.textPrimary,
            flex: 1,
          }}
        >
          {card.title}
        </ThemedText>
      </View>

      {/* Body content */}
      <View style={{ gap: 4 }}>
        {card.lines.map((line, idx) => (
          <ThemedText
            key={idx}
            style={{
              fontSize: 14.5,
              lineHeight: 22,
              fontFamily: "PlusJakartaSans_400Regular",
              color: "#374151",
            }}
          >
            {line}
          </ThemedText>
        ))}
      </View>

      {/* Footer: Document source line exactly matching design */}
      {sourceDisplay ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 4,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: isNoAnswer ? "#E5E7EB" : "rgba(224, 215, 254, 0.4)",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
            <FileText size={13.5} color="#6B7280" strokeWidth={1.9} />
            <ThemedText
              numberOfLines={1}
              style={{
                fontSize: 12.5,
                fontFamily: "PlusJakartaSans_500Medium",
                color: "#6B7280",
              }}
            >
              {sourceDisplay}
            </ThemedText>
          </View>

          {card.link && onLinkPress && (
            <PressableScale
              onPress={() => onLinkPress(card.link?.section)}
              scale={0.96}
              hitSlop={8}
            >
              <ThemedText
                style={{
                  fontSize: 12.5,
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontWeight: "700",
                  color: "#7C3AED",
                  textDecorationLine: "underline",
                }}
              >
                {card.link.label}
              </ThemedText>
            </PressableScale>
          )}
        </View>
      ) : null}
    </View>
  );
}
