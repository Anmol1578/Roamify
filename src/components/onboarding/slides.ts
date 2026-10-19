import type { ImageProps } from "expo-image";

export interface OnboardingSlide {
  id: string;
  title: string;
  body: string;
  image: ImageProps["source"];
  location: string;
}

export const SLIDES: OnboardingSlide[] = [
  {
    id: "1",
    title: "Adventure awaits\nbeyond the map",
    body: "Uncover hidden stays, immerse yourself in local culture, and let roamify guide you to places you’ll never want to leave.",
    // Positano coastal sunset villa terrace with loungers overlooking Mediterranean sea
    image: require("../../../assets/images/onboarding/slide-1-positano.jpg"),
    location: "Positano, Italy",
  },
  {
    id: "2",
    title: "Cozy retreats\ntailored to you",
    body: "Find quiet cabins, scenic chalets, and secluded hideaways matched effortlessly to your exact travel mood.",
    // Secluded pine forest A-frame cabin retreat in Banff with hot tub
    image: require("../../../assets/images/onboarding/slide-2-banff.jpg"),
    location: "Banff, Canada",
  },
  {
    id: "3",
    title: "Every detail\nalways verified",
    body: "Accurate policies, authentic stays, and verified host experiences ensuring your journey is completely seamless.",
    // Santorini Aegean sea cliffside luxury villa with infinity pool at dusk
    image: require("../../../assets/images/onboarding/slide-3-santorini.jpg"),
    location: "Santorini, Greece",
  },
];

