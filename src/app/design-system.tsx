import React, { useState } from "react";
import {
  ScrollView,
  View,
  SafeAreaView,
} from "react-native";
import {
  Heart,
  Share2,
  Search,
  Bookmark,
  User,
  CreditCard,
  Luggage,
  List as ListIcon,
  Map as MapIcon,
  Home,
  Calendar,
  Settings,
  MapPin,
  SlidersHorizontal,
  Trees,
  Waves,
  Building2,
  Palmtree,
  Lock,
} from "lucide-react-native";
import { colors, spacing, radius, shadows } from "@/theme";
import {
  ThemedText,
  Button,
  IconButton,
  Input,
  SearchInput,
  FilterChip,
  Badge,
  ListingCard,
  PolicyCard,
  ProfileRow,
  SegmentedControl,
  Toggle,
  Stepper,
  AlertBanner,
  GlassTabBar,
  TabId,
  BrandWordmark,
} from "@/components";

export default function DesignSystemScreen() {
  // State for interactive showcase elements
  const [activeChip, setActiveChip] = useState("Cabins");
  const [activeCategory, setActiveCategory] = useState("All Stays");
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState("list");
  const [toggleState, setToggleState] = useState(true);
  const [stepperValue, setStepperValue] = useState(1);
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [formName, setFormName] = useState("Joanna Smith");
  const [showSuccessAlert, setShowSuccessAlert] = useState(true);
  const [showErrorAlert, setShowErrorAlert] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfaceGray }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.xl,
          paddingBottom: 120,
          gap: spacing["2xl"],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Brand (01. Brand) */}
        <View
          style={{
            backgroundColor: colors.surfaceWhite,
            padding: spacing["2xl"],
            borderRadius: radius["2xl"],
            borderWidth: 1,
            borderColor: colors.borderGray,
            boxShadow: shadows.card,
            gap: spacing.md,
          }}
        >
          <ThemedText variant="small" color={colors.textSecondary}>
            01. Brand
          </ThemedText>

          <View className="py-2 items-start">
            <BrandWordmark size="2xl" />
          </View>

          <ThemedText
            variant="title"
            color={colors.textSecondary}
            style={{ fontSize: 20, lineHeight: 26, fontFamily: "PlusJakartaSans_500Medium" }}
          >
            Find unforgettable stays for every kind of trip.
          </ThemedText>
        </View>

        {/* 02. Color Palette */}
        <View
          style={{
            backgroundColor: colors.surfaceWhite,
            padding: spacing.xl,
            borderRadius: radius["2xl"],
            borderWidth: 1,
            borderColor: colors.borderGray,
            boxShadow: shadows.card,
            gap: spacing.md,
          }}
        >
          <ThemedText variant="small" color={colors.textSecondary}>
            02. Color palette
          </ThemedText>

          <View className="flex-row flex-wrap gap-3">
            {[
              { name: "Primary Yellow", hex: "#FFC629", desc: "Primary actions, active states", bg: colors.primaryYellow, text: colors.textPrimary },
              { name: "Lavender", hex: "#C9B4FF", desc: "Secondary actions, highlights", bg: colors.lavender, text: colors.textPrimary },
              { name: "Text Primary", hex: "#0B0B1A", desc: "Headings, primary text", bg: colors.textPrimary, text: colors.textWhite },
              { name: "Text Secondary", hex: "#6B7280", desc: "Body text, secondary text", bg: colors.textSecondary, text: colors.textWhite },
              { name: "Surface White", hex: "#FFFFFF", desc: "Cards, sheets, modals", bg: colors.surfaceWhite, text: colors.textPrimary, border: true },
              { name: "Surface Gray", hex: "#F4F5F7", desc: "App background, input fields", bg: colors.surfaceGray, text: colors.textPrimary },
              { name: "Border Gray", hex: "#E5E7EB", desc: "Dividers, borders", bg: colors.borderGray, text: colors.textPrimary },
              { name: "Glass Blur", hex: "rgba(255,255,255,0.7)", desc: "Tab bar, glass surfaces", bg: "rgba(230, 235, 245, 0.9)", text: colors.textPrimary },
            ].map((swatch, idx) => (
              <View
                key={idx}
                style={{
                  width: "47%",
                  backgroundColor: colors.surfaceGray,
                  borderRadius: radius.xl,
                  padding: spacing.md,
                  gap: spacing.xs,
                  borderWidth: 1,
                  borderColor: colors.borderGray,
                }}
              >
                <View
                  style={{
                    height: 52,
                    borderRadius: radius.lg,
                    backgroundColor: swatch.bg,
                    borderWidth: swatch.border ? 1 : 0,
                    borderColor: colors.borderGray,
                    marginBottom: 4,
                  }}
                />
                <ThemedText variant="caption" style={{ fontFamily: "PlusJakartaSans_700Bold" }}>
                  {swatch.name}
                </ThemedText>
                <ThemedText variant="small" color={colors.textSecondary} style={{ fontSize: 11 }}>
                  {swatch.hex}
                </ThemedText>
                <ThemedText variant="small" color={colors.textSecondary} style={{ fontSize: 11 }} numberOfLines={1}>
                  {swatch.desc}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* 03. Typography */}
        <View
          style={{
            backgroundColor: colors.surfaceWhite,
            padding: spacing.xl,
            borderRadius: radius["2xl"],
            borderWidth: 1,
            borderColor: colors.borderGray,
            boxShadow: shadows.card,
            gap: spacing.lg,
          }}
        >
          <ThemedText variant="small" color={colors.textSecondary}>
            03. Typography
          </ThemedText>

          <View style={{ gap: spacing.md }}>
            <View>
              <ThemedText variant="small" color={colors.textSecondary}>
                Display (56-64px / Bold)
              </ThemedText>
              <ThemedText variant="display" style={{ fontSize: 44, lineHeight: 46 }}>
                Find your next stay
              </ThemedText>
            </View>

            <View>
              <ThemedText variant="small" color={colors.textSecondary}>
                Heading (28-32px / Bold)
              </ThemedText>
              <ThemedText variant="heading">
                Modern Cabin with Hot Tub
              </ThemedText>
            </View>

            <View>
              <ThemedText variant="small" color={colors.textSecondary}>
                Body (16px / Regular)
              </ThemedText>
              <ThemedText variant="body">
                From mountain cabins to oceanfront villas, roam helps you find unforgettable stays for every kind of trip.
              </ThemedText>
            </View>

            <View className="flex-row items-center gap-4">
              <View>
                <ThemedText variant="small" color={colors.textSecondary}>
                  Caption (14px / Medium)
                </ThemedText>
                <ThemedText variant="caption" color={colors.textPrimary}>
                  Lake Arrowhead, CA
                </ThemedText>
              </View>

              <View>
                <ThemedText variant="small" color={colors.textSecondary}>
                  Button (17-18px / Semibold)
                </ThemedText>
                <Button size="sm" title="Book this stay" />
              </View>
            </View>
          </View>
        </View>

        {/* 04. Buttons */}
        <View
          style={{
            backgroundColor: colors.surfaceWhite,
            padding: spacing.xl,
            borderRadius: radius["2xl"],
            borderWidth: 1,
            borderColor: colors.borderGray,
            boxShadow: shadows.card,
            gap: spacing.lg,
          }}
        >
          <ThemedText variant="small" color={colors.textSecondary}>
            04. Buttons
          </ThemedText>

          <View style={{ gap: spacing.md }}>
            <View style={{ gap: spacing.xs }}>
              <ThemedText variant="small" color={colors.textSecondary}>
                Primary
              </ThemedText>
              <Button
                variant="primary"
                title="Book this stay"
                showArrow
                onPress={() => {}}
              />
            </View>

            <View style={{ gap: spacing.xs }}>
              <ThemedText variant="small" color={colors.textSecondary}>
                Secondary
              </ThemedText>
              <Button
                variant="secondary"
                title="Continue with Google"
                leftIcon={
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: radius.full,
                      backgroundColor: "#EA4335",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ThemedText variant="small" color="#FFFFFF" style={{ fontSize: 13, fontWeight: "bold" }}>
                      G
                    </ThemedText>
                  </View>
                }
                onPress={() => {}}
              />
            </View>

            <View style={{ gap: spacing.xs }}>
              <ThemedText variant="small" color={colors.textSecondary}>
                Icon buttons
              </ThemedText>
              <View className="flex-row gap-3">
                <IconButton
                  icon={<Heart size={20} color={colors.textPrimary} />}
                  onPress={() => {}}
                />
                <IconButton
                  icon={<Share2 size={20} color={colors.textPrimary} />}
                  onPress={() => {}}
                />
                <IconButton
                  icon={<Search size={20} color={colors.textPrimary} />}
                  onPress={() => {}}
                />
                <IconButton
                  icon={<Bookmark size={20} color={colors.textPrimary} />}
                  onPress={() => {}}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 05. Input Fields */}
        <View
          style={{
            backgroundColor: colors.surfaceWhite,
            padding: spacing.xl,
            borderRadius: radius["2xl"],
            borderWidth: 1,
            borderColor: colors.borderGray,
            boxShadow: shadows.card,
            gap: spacing.lg,
          }}
        >
          <ThemedText variant="small" color={colors.textSecondary}>
            05. Input Fields
          </ThemedText>

          <View style={{ gap: spacing.md }}>
            <View style={{ gap: spacing.xs }}>
              <ThemedText variant="small" color={colors.textSecondary}>
                Search field
              </ThemedText>
              <SearchInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Cabins in California"
              />
            </View>

            <View style={{ gap: spacing.xs }}>
              <ThemedText variant="small" color={colors.textSecondary}>
                Form field (default)
              </ThemedText>
              <Input
                leftIcon={<User size={20} color={colors.textSecondary} />}
                placeholder="Enter your name"
              />
            </View>

            <View style={{ gap: spacing.xs }}>
              <ThemedText variant="small" color={colors.textSecondary}>
                Form field (focused / active lavender ring)
              </ThemedText>
              <Input
                leftIcon={<User size={20} color={colors.textPrimary} />}
                value={formName}
                onChangeText={setFormName}
                placeholder="Enter your name"
              />
            </View>

            <View style={{ gap: spacing.xs }}>
              <ThemedText variant="small" color={colors.textSecondary}>
                Password field
              </ThemedText>
              <Input
                leftIcon={<Lock size={20} color={colors.textSecondary} />}
                isPassword
                defaultValue="supersecret"
                placeholder="Password"
              />
            </View>
          </View>
        </View>

        {/* 06. Filter chips */}
        <View
          style={{
            backgroundColor: colors.surfaceWhite,
            padding: spacing.xl,
            borderRadius: radius["2xl"],
            borderWidth: 1,
            borderColor: colors.borderGray,
            boxShadow: shadows.card,
            gap: spacing.lg,
          }}
        >
          <ThemedText variant="small" color={colors.textSecondary}>
            06. Filter chips
          </ThemedText>

          <View style={{ gap: spacing.md }}>
            <View className="flex-row flex-wrap gap-2.5">
              {["Cabins", "Under $300", "Pet Friendly", "Quiet"].map((chip) => (
                <FilterChip
                  key={chip}
                  label={chip}
                  selected={activeChip === chip}
                  variant="lavender"
                  onPress={() => setActiveChip(chip)}
                />
              ))}
            </View>

            <View className="flex-row flex-wrap gap-2.5">
              {[
                { label: "All Stays", icon: <Home size={16} color={colors.textPrimary} /> },
                { label: "Cabins", icon: <Trees size={16} color={colors.textPrimary} /> },
                { label: "Beach", icon: <Waves size={16} color={colors.textPrimary} /> },
                { label: "City", icon: <Building2 size={16} color={colors.textPrimary} /> },
                { label: "Villas", icon: <Palmtree size={16} color={colors.textPrimary} /> },
              ].map((category) => (
                <FilterChip
                  key={category.label}
                  label={category.label}
                  icon={category.icon}
                  selected={activeCategory === category.label}
                  variant="yellow"
                  onPress={() => setActiveCategory(category.label)}
                />
              ))}
            </View>
          </View>
        </View>

        {/* 07. Listing Card */}
        <View
          style={{
            backgroundColor: colors.surfaceWhite,
            padding: spacing.xl,
            borderRadius: radius["2xl"],
            borderWidth: 1,
            borderColor: colors.borderGray,
            boxShadow: shadows.card,
            gap: spacing.md,
          }}
        >
          <ThemedText variant="small" color={colors.textSecondary}>
            07. Listing card
          </ThemedText>
          <ListingCard
            isFavorite={isFavorite}
            onFavoritePress={() => setIsFavorite(!isFavorite)}
          />
        </View>

        {/* 08. Policy Card */}
        <View
          style={{
            backgroundColor: colors.surfaceWhite,
            padding: spacing.xl,
            borderRadius: radius["2xl"],
            borderWidth: 1,
            borderColor: colors.borderGray,
            boxShadow: shadows.card,
            gap: spacing.md,
          }}
        >
          <ThemedText variant="small" color={colors.textSecondary}>
            08. Policy card
          </ThemedText>
          <View style={{ gap: spacing.md }}>
            <PolicyCard
              title="Ask about policies"
              description="Cancellation, house rules, pets, check-in and more."
            />
            <PolicyCard
              title="Free cancellation"
              description="Full refund up to 7 days before check-in."
            />
          </View>
        </View>

        {/* 09. Profile Row */}
        <View
          style={{
            backgroundColor: colors.surfaceWhite,
            padding: spacing.xl,
            borderRadius: radius["2xl"],
            borderWidth: 1,
            borderColor: colors.borderGray,
            boxShadow: shadows.card,
            gap: spacing.md,
          }}
        >
          <ThemedText variant="small" color={colors.textSecondary}>
            09. Profile row
          </ThemedText>
          <View>
            <ProfileRow
              icon={<User size={20} color={colors.textPrimary} />}
              label="Personal info"
            />
            <ProfileRow
              icon={<CreditCard size={20} color={colors.textPrimary} />}
              label="Payment methods"
            />
            <ProfileRow
              icon={<Luggage size={20} color={colors.textPrimary} />}
              label="Trips"
              showDivider={false}
            />
          </View>
        </View>

        {/* 10. Bottom Navigation (Liquid Glass Tab Bar) */}
        <View
          style={{
            backgroundColor: colors.surfaceWhite,
            padding: spacing.xl,
            borderRadius: radius["2xl"],
            borderWidth: 1,
            borderColor: colors.borderGray,
            boxShadow: shadows.card,
            gap: spacing.md,
          }}
        >
          <ThemedText variant="small" color={colors.textSecondary}>
            10. Bottom navigation (Liquid glass tab bar)
          </ThemedText>
          <GlassTabBar
            activeTab={activeTab}
            onTabPress={(tab) => setActiveTab(tab)}
          />
        </View>

        {/* 11. Iconography */}
        <View
          style={{
            backgroundColor: colors.surfaceWhite,
            padding: spacing.xl,
            borderRadius: radius["2xl"],
            borderWidth: 1,
            borderColor: colors.borderGray,
            boxShadow: shadows.card,
            gap: spacing.md,
          }}
        >
          <ThemedText variant="small" color={colors.textSecondary}>
            11. Iconography
          </ThemedText>
          <View className="flex-row flex-wrap gap-4 items-center justify-around py-2">
            {[
              <Home key="1" size={22} color={colors.textPrimary} />,
              <Search key="2" size={22} color={colors.textPrimary} />,
              <Heart key="3" size={22} color={colors.textPrimary} />,
              <Calendar key="4" size={22} color={colors.textPrimary} />,
              <User key="5" size={22} color={colors.textPrimary} />,
              <Settings key="6" size={22} color={colors.textPrimary} />,
              <MapPin key="7" size={22} color={colors.textPrimary} />,
              <SlidersHorizontal key="8" size={22} color={colors.textPrimary} />,
            ].map((icon, idx) => (
              <View
                key={idx}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: radius.full,
                  backgroundColor: colors.surfaceGray,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {icon}
              </View>
            ))}
          </View>
        </View>

        {/* 12. Segmented Control */}
        <View
          style={{
            backgroundColor: colors.surfaceWhite,
            padding: spacing.xl,
            borderRadius: radius["2xl"],
            borderWidth: 1,
            borderColor: colors.borderGray,
            boxShadow: shadows.card,
            gap: spacing.md,
          }}
        >
          <ThemedText variant="small" color={colors.textSecondary}>
            12. Segmented control
          </ThemedText>
          <SegmentedControl
            items={[
              {
                id: "list",
                label: "List",
                icon: (selected) => (
                  <ListIcon
                    size={16}
                    color={selected ? colors.textWhite : colors.textPrimary}
                  />
                ),
              },
              {
                id: "map",
                label: "Map",
                icon: (selected) => (
                  <MapIcon
                    size={16}
                    color={selected ? colors.textWhite : colors.textPrimary}
                  />
                ),
              },
            ]}
            selectedId={selectedSegment}
            onSelect={setSelectedSegment}
          />
        </View>

        {/* 13. Toggles / Steppers */}
        <View
          style={{
            backgroundColor: colors.surfaceWhite,
            padding: spacing.xl,
            borderRadius: radius["2xl"],
            borderWidth: 1,
            borderColor: colors.borderGray,
            boxShadow: shadows.card,
            gap: spacing.md,
          }}
        >
          <ThemedText variant="small" color={colors.textSecondary}>
            13. Toggles / Steppers
          </ThemedText>
          <View className="flex-row items-center gap-6">
            <Toggle
              value={toggleState}
              onValueChange={setToggleState}
            />
            <Stepper
              value={stepperValue}
              onValueChange={setStepperValue}
              min={1}
              max={10}
            />
          </View>
        </View>

        {/* 14. Status / Alerts */}
        <View
          style={{
            backgroundColor: colors.surfaceWhite,
            padding: spacing.xl,
            borderRadius: radius["2xl"],
            borderWidth: 1,
            borderColor: colors.borderGray,
            boxShadow: shadows.card,
            gap: spacing.md,
          }}
        >
          <ThemedText variant="small" color={colors.textSecondary}>
            14. Status / Alerts
          </ThemedText>
          <View style={{ gap: spacing.sm }}>
            {showSuccessAlert ? (
              <AlertBanner
                type="success"
                message="Account created successfully"
                onDismiss={() => setShowSuccessAlert(false)}
              />
            ) : null}
            {showErrorAlert ? (
              <AlertBanner
                type="error"
                message="Something went wrong. Please try again."
                onDismiss={() => setShowErrorAlert(false)}
              />
            ) : null}
          </View>
        </View>

        {/* 15. Tags / Badges */}
        <View
          style={{
            backgroundColor: colors.surfaceWhite,
            padding: spacing.xl,
            borderRadius: radius["2xl"],
            borderWidth: 1,
            borderColor: colors.borderGray,
            boxShadow: shadows.card,
            gap: spacing.md,
          }}
        >
          <ThemedText variant="small" color={colors.textSecondary}>
            15. Tags / Badges
          </ThemedText>
          <View className="flex-row flex-wrap gap-2.5 items-center">
            <Badge variant="favorite" label="Guest favorite" />
            <Badge variant="new" label="New" />
            <Badge variant="discount" label="20% off" />
            <Badge variant="superhost" label="Superhost" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
