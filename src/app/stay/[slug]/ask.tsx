import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  X,
  ShieldCheck,
  Clock,
  Home,
  PawPrint,
  CreditCard,
  RotateCcw,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, radius } from "@/theme";
import { useStay } from "@/hooks/use-stay";
import {
  TopicDefinition,
  matchTopics,
  answerFor,
  AnswerCard as AnswerCardData,
  ROAM_POLICIES,
} from "@/lib/ask";
import { houseRuleLines } from "@/lib/stay-details";
import { ThemedText } from "@/components/themed-text";
import { PressableScale } from "@/components/ui/pressable-scale";
import { MessageBubble } from "@/components/ask/message-bubble";
import { TopicChips } from "@/components/ask/topic-chips";
import { AskInput } from "@/components/ask/ask-input";
import { AnswerCardComponent } from "@/components/ask/answer-card";
import { posthog } from "@/lib/posthog";
import { useAsk } from "@/hooks/use-ask";

interface RoamOrGuestMessage {
  id: string;
  from: "roam" | "guest";
  text: string;
}

interface AnswerMessage {
  id: string;
  from: "answer";
  cards: AnswerCardData[];
}

interface PendingMessage {
  id: string;
  from: "pending";
}

type ChatMessage = RoamOrGuestMessage | AnswerMessage | PendingMessage;

export default function AskScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { stay, isLoading, isError, refetch } = useStay(slug);
  const { ask } = useAsk();

  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro-greeting",
      from: "roam",
      text: "Ask about check-in, pets, cancellation and more. Answers quote this stay's details and Roamify's guest policies as written.",
    },
  ]);

  // Track stay_ask_opened once when stay loads
  useEffect(() => {
    if (stay) {
      posthog?.capture("stay_ask_opened", {
        slug: stay.slug ?? slug ?? "",
      });
    }
  }, [stay, slug]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.back();
  };

  const handleSelectTopic = async (topic: TopicDefinition) => {
    if (!stay || !slug) return;
    Haptics.selectionAsync().catch(() => {});

    const pendingId = `pending-${Date.now()}`;
    const guestMsg: ChatMessage = {
      id: `guest-${Date.now()}`,
      from: "guest",
      text: topic.question,
    };
    const pendingMsg: ChatMessage = {
      id: pendingId,
      from: "pending",
    };

    setMessages((prev) => [...prev, guestMsg, pendingMsg]);
    scrollToBottom();

    try {
      const response = await ask(slug, topic.question);
      const answerMsg: ChatMessage = {
        id: `answer-${Date.now()}`,
        from: "answer",
        cards: response.cards,
      };

      setMessages((prev) => prev.map((m) => (m.id === pendingId ? answerMsg : m)));
      scrollToBottom();

      posthog?.capture("stay_ask_sent", {
        slug: stay.slug ?? slug,
        from: "chip",
        topics: response.topics,
        answered: response.cards.length > 0 && response.cards[0].key !== "no-answer",
        answeredBy: response.answeredBy,
      });
    } catch (err) {
      console.warn("Ask request failed, falling back to local answers:", err);
      const fallbackCards = answerFor(stay, [topic.key]);
      const answerMsg: ChatMessage = {
        id: `answer-${Date.now()}`,
        from: "answer",
        cards: fallbackCards,
      };

      setMessages((prev) => prev.map((m) => (m.id === pendingId ? answerMsg : m)));
      scrollToBottom();

      posthog?.capture("stay_ask_sent", {
        slug: stay.slug ?? slug,
        from: "chip",
        topics: [topic.key],
        answered: fallbackCards.length > 0 && fallbackCards[0].key !== "no-answer",
        answeredBy: "fallback",
      });
    }
  };

  const handleSendTyped = async (text: string) => {
    if (!stay || !slug) return;
    Haptics.selectionAsync().catch(() => {});

    const pendingId = `pending-${Date.now()}`;
    const guestMsg: ChatMessage = {
      id: `guest-${Date.now()}`,
      from: "guest",
      text,
    };
    const pendingMsg: ChatMessage = {
      id: pendingId,
      from: "pending",
    };

    setMessages((prev) => [...prev, guestMsg, pendingMsg]);
    scrollToBottom();

    try {
      const response = await ask(slug, text);
      const answerMsg: ChatMessage = {
        id: `answer-${Date.now()}`,
        from: "answer",
        cards: response.cards,
      };

      setMessages((prev) => prev.map((m) => (m.id === pendingId ? answerMsg : m)));
      scrollToBottom();

      posthog?.capture("stay_ask_sent", {
        slug: stay.slug ?? slug,
        from: "typed",
        topics: response.topics,
        answered: response.cards.length > 0 && response.cards[0].key !== "no-answer",
        answeredBy: response.answeredBy,
      });
    } catch (err) {
      console.warn("Ask request failed, falling back to local matching:", err);
      const matchedTopics = matchTopics(text);
      const fallbackCards = answerFor(stay, matchedTopics);
      const answerMsg: ChatMessage = {
        id: `answer-${Date.now()}`,
        from: "answer",
        cards: fallbackCards,
      };

      setMessages((prev) => prev.map((m) => (m.id === pendingId ? answerMsg : m)));
      scrollToBottom();

      posthog?.capture("stay_ask_sent", {
        slug: stay.slug ?? slug,
        from: "typed",
        topics: matchedTopics,
        answered: fallbackCards.length > 0 && fallbackCards[0].key !== "no-answer",
        answeredBy: "fallback",
      });
    }
  };


  const handleCardLinkPress = (section?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedSection(section ?? "all");
    setShowPoliciesModal(true);

    posthog?.capture("stay_policies_opened", {
      slug: stay?.slug ?? slug ?? "",
      from: "ask_answer",
      section: section ?? "all",
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF", paddingTop: insets.top }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Header with Back button, Stay title & Roamify Brand Logo */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: "#FFFFFF",
            borderBottomWidth: 1,
            borderColor: "#F3F4F6",
          }}
        >
          <PressableScale
            onPress={handleBack}
            scale={0.92}
            accessibilityRole="button"
            accessibilityLabel="Back to stay"
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: "#F3F4F6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={20} color="#111827" strokeWidth={2.4} />
          </PressableScale>

          <View style={{ flex: 1 }}>
            <ThemedText
              style={{
                fontSize: 18,
                fontFamily: "PlusJakartaSans_700Bold",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              Ask about this stay
            </ThemedText>
            <ThemedText
              numberOfLines={1}
              style={{
                fontSize: 13,
                fontFamily: "PlusJakartaSans_500Medium",
                color: "#6B7280",
                marginTop: 1,
              }}
            >
              {stay?.title || "Word-for-word verified facts & policies"}
            </ThemedText>
          </View>

          {/* Roamify Logo Badge */}
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              overflow: "hidden",
              borderWidth: 1.5,
              borderColor: "#E5E7EB",
              backgroundColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Image
              source={require("../../../../assets/images/icon.png")}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>
        </View>

        {/* Loading State */}
        {isLoading && (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: 24,
            }}
          >
            <ActivityIndicator size="large" color="#7C3AED" />
            <ThemedText
              style={{
                fontSize: 15,
                fontFamily: "PlusJakartaSans_500Medium",
                color: colors.textSecondary,
              }}
            >
              Loading this stay…
            </ThemedText>
          </View>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              padding: 24,
            }}
          >
            <ThemedText
              style={{
                fontSize: 16,
                fontFamily: "PlusJakartaSans_600SemiBold",
                color: colors.textPrimary,
                textAlign: "center",
              }}
            >
              {"We couldn't load this stay."}
            </ThemedText>
            <PressableScale
              onPress={() => refetch()}
              scale={0.95}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: colors.textPrimary,
                borderRadius: radius.full,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 14,
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontWeight: "700",
                  color: colors.surfaceWhite,
                }}
              >
                Try again
              </ThemedText>
            </PressableScale>
          </View>
        )}

        {/* Not Found State */}
        {!isLoading && !isError && !stay && (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              padding: 24,
            }}
          >
            <ThemedText
              style={{
                fontSize: 16,
                fontFamily: "PlusJakartaSans_600SemiBold",
                color: colors.textPrimary,
                textAlign: "center",
              }}
            >
              {"This stay isn't available anymore."}
            </ThemedText>
            <PressableScale
              onPress={handleBack}
              scale={0.95}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: colors.textPrimary,
                borderRadius: radius.full,
              }}
            >
              <ThemedText
                style={{
                  fontSize: 14,
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontWeight: "700",
                  color: colors.surfaceWhite,
                }}
              >
                Back
              </ThemedText>
            </PressableScale>
          </View>
        )}

        {/* Loaded Chat Content */}
        {!isLoading && !isError && stay && (
          <>
            <ScrollView
              ref={scrollViewRef}
              onContentSizeChange={scrollToBottom}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 24,
                gap: 14,
              }}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((item) => {
                if (item.from === "roam" || item.from === "guest") {
                  return (
                    <MessageBubble
                      key={item.id}
                      from={item.from}
                      text={item.text}
                    />
                  );
                }

                if (item.from === "pending") {
                  return (
                    <Animated.View
                      key={item.id}
                      entering={FadeInDown.duration(150)}
                      style={{ alignSelf: "flex-start", opacity: 0.85 }}
                    >
                      <MessageBubble
                        from="roam"
                        text="Checking Roamify's policies…"
                      />
                    </Animated.View>
                  );
                }

                if (item.from === "answer") {
                  return (
                    <Animated.View
                      key={item.id}
                      entering={FadeInDown.duration(200)}
                      style={{ alignSelf: "stretch", gap: 10 }}
                    >
                      {item.cards.map((card) => (
                        <AnswerCardComponent
                          key={card.key}
                          card={card}
                          onLinkPress={handleCardLinkPress}
                        />
                      ))}
                    </Animated.View>
                  );
                }

                return null;
              })}

            </ScrollView>

            {/* Composer */}
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderTopWidth: 1,
                borderColor: "#F3F4F6",
                paddingTop: 10,
                paddingBottom: insets.bottom + 8,
                gap: 10,
              }}
            >
              <TopicChips onSelectTopic={handleSelectTopic} />
              <AskInput onSend={handleSendTyped} />
            </View>
          </>
        )}
      </KeyboardAvoidingView>

      {/* Full Policies Modal Sheet */}
      <Modal
        visible={showPoliciesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPoliciesModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#FAF9F6" }}>
          <View
            style={{
              paddingTop: insets.top > 0 ? insets.top : 16,
              paddingHorizontal: 20,
              paddingBottom: 16,
              backgroundColor: colors.surfaceWhite,
              borderBottomWidth: 1,
              borderColor: "#E5E7EB",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <ThemedText
              style={{
                fontSize: 18,
                fontFamily: "PlusJakartaSans_700Bold",
                fontWeight: "700",
                color: colors.textPrimary,
              }}
            >
              Stay Policies & Rules
            </ThemedText>
            <PressableScale
              onPress={() => setShowPoliciesModal(false)}
              scale={0.92}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#F3F4F6",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} color={colors.textPrimary} strokeWidth={2.4} />
            </PressableScale>
          </View>

          <ScrollView
            contentContainerStyle={{
              padding: 20,
              paddingBottom: insets.bottom + 40,
              gap: 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Cancellation */}
            {(selectedSection === "all" ||
              selectedSection === "cancellation") && (
              <View
                style={{
                  backgroundColor: colors.surfaceWhite,
                  borderRadius: radius.xl,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  gap: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Clock size={18} color="#7C3AED" strokeWidth={2.2} />
                  <ThemedText
                    style={{
                      fontSize: 16,
                      fontFamily: "PlusJakartaSans_700Bold",
                      fontWeight: "700",
                      color: colors.textPrimary,
                    }}
                  >
                    {stay?.cancellationPolicy?.title || "Cancellation Policy"}
                  </ThemedText>
                </View>
                <ThemedText
                  style={{
                    fontSize: 14,
                    lineHeight: 21,
                    fontFamily: "PlusJakartaSans_400Regular",
                    color: "#4B5563",
                  }}
                >
                  {stay?.cancellationPolicy?.content ||
                    stay?.cancellationPolicy?.summary ||
                    "Full refund up to 7 days before check-in. Non-refundable within 48 hours."}
                </ThemedText>
              </View>
            )}

            {/* Check-in / House rules */}
            {(selectedSection === "all" ||
              selectedSection === "checkIn" ||
              selectedSection === "houseRules") && (
              <View
                style={{
                  backgroundColor: colors.surfaceWhite,
                  borderRadius: radius.xl,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  gap: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Home size={18} color="#7C3AED" strokeWidth={2.2} />
                  <ThemedText
                    style={{
                      fontSize: 16,
                      fontFamily: "PlusJakartaSans_700Bold",
                      fontWeight: "700",
                      color: colors.textPrimary,
                    }}
                  >
                    House Rules & Access
                  </ThemedText>
                </View>
                {stay &&
                  houseRuleLines(stay.houseRules).map((rule, idx) => (
                    <ThemedText
                      key={idx}
                      style={{
                        fontSize: 14,
                        lineHeight: 20,
                        fontFamily: "PlusJakartaSans_400Regular",
                        color: "#4B5563",
                      }}
                    >
                      • {rule}
                    </ThemedText>
                  ))}
              </View>
            )}

            {/* General Roamify Policies */}
            {Object.entries(ROAM_POLICIES).map(([k, p]) => {
              if (selectedSection !== "all" && selectedSection !== k) {
                return null;
              }
              return (
                <View
                  key={k}
                  style={{
                    backgroundColor: colors.surfaceWhite,
                    borderRadius: radius.xl,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {k === "pets" ? (
                      <PawPrint size={18} color="#7C3AED" strokeWidth={2.2} />
                    ) : k === "payment" ? (
                      <CreditCard size={18} color="#7C3AED" strokeWidth={2.2} />
                    ) : k === "guestRefund" ? (
                      <RotateCcw size={18} color="#7C3AED" strokeWidth={2.2} />
                    ) : (
                      <ShieldCheck size={18} color="#7C3AED" strokeWidth={2.2} />
                    )}
                    <ThemedText
                      style={{
                        fontSize: 16,
                        fontFamily: "PlusJakartaSans_700Bold",
                        fontWeight: "700",
                        color: colors.textPrimary,
                      }}
                    >
                      {p.title}
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={{
                      fontSize: 14,
                      lineHeight: 21,
                      fontFamily: "PlusJakartaSans_400Regular",
                      color: "#4B5563",
                    }}
                  >
                    {p.summary}
                  </ThemedText>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
