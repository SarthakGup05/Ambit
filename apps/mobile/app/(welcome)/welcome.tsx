import React, { useRef, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Platform,
} from "react-native";
import { Text } from "@repo/ui";
import { useRouter } from "expo-router";
import { storage } from "../../src/lib/storage";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SLIDES = [
  {
    id: "welcome",
    image: require("../../assets/onboarding/welcome.png"),
    title: "Welcome to Ambit",
    subtitle:
      "Your smart society companion.\nManage visitors, security, and community\n— all in one place.",
  },
  {
    id: "access",
    image: require("../../assets/onboarding/access.png"),
    title: "Seamless Access",
    subtitle:
      "Pre-approve guests with QR passes,\nget real-time alerts, and keep your\nhome secure effortlessly.",
  },
  {
    id: "community",
    image: require("../../assets/onboarding/community.png"),
    title: "Your Community,\nConnected",
    subtitle:
      "Notices, polls, complaints, maintenance\n— everything your society needs,\nbeautifully organized.",
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      scrollX.value = offsetX;
      const index = Math.round(offsetX / SCREEN_WIDTH);
      setActiveIndex(index);
    },
    [scrollX]
  );

  const goToNext = useCallback(() => {
    if (activeIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: (activeIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
    }
  }, [activeIndex]);

  const handleGetStarted = useCallback(async () => {
    await storage.set("has_seen_welcome", "true");
    router.replace("/");
  }, [router]);

  const handleSkip = useCallback(async () => {
    await storage.set("has_seen_welcome", "true");
    router.replace("/");
  }, [router]);

  const isLastSlide = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={["#FAF8F5", "#F0EDE8", "#FAF8F5"]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      {/* Top Brand Header */}
      <Animated.View entering={FadeInDown.duration(500)} style={styles.brandHeader}>
        <Image
          source={require("../../assets/ambit_logo.png")}
          style={styles.headerLogoImage}
          resizeMode="contain"
        />
        <Text style={styles.headerBrandText}>mbit</Text>
      </Animated.View>

      {/* Skip button */}
      {!isLastSlide && (
        <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.skipContainer}>
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Scrollable slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        style={styles.scrollView}
      >
        {SLIDES.map((slide, index) => (
          <View key={slide.id} style={styles.slide}>
            {/* Image container */}
            <View style={styles.imageContainer}>
              <View style={styles.imageGlow} />
              <Image source={slide.image} style={styles.image} resizeMode="contain" />
            </View>

            {/* Text content */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom section: dots + button */}
      <View style={styles.bottomContainer}>
        {/* Dot indicators */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <DotIndicator
              key={index}
              index={index}
              scrollX={scrollX}
              screenWidth={SCREEN_WIDTH}
            />
          ))}
        </View>

        {/* Action button */}
        <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.buttonContainer}>
          {isLastSlide ? (
            <Pressable
              onPress={handleGetStarted}
              style={({ pressed }) => [
                styles.getStartedButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <LinearGradient
                colors={["#2B2E4A", "#3D4166"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.getStartedGradient}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable
              onPress={goToNext}
              style={({ pressed }) => [
                styles.nextButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </Pressable>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Animated Dot Component ─────────────────────────────────────────────────
function DotIndicator({
  index,
  scrollX,
  screenWidth,
}: {
  index: number;
  scrollX: SharedValue<number>;
  screenWidth: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * screenWidth,
      index * screenWidth,
      (index + 1) * screenWidth,
    ];

    const dotWidth = interpolate(
      scrollX.value,
      inputRange,
      [8, 28, 8],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );

    return {
      width: withSpring(dotWidth, { damping: 18, stiffness: 150 }),
      opacity,
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  brandHeader: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 36,
    left: 24,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
    gap: 2,
  },
  headerLogoImage: {
    width: 32,
    height: 32,
  },
  headerBrandText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1C1B1F",
    fontFamily: "ManropeBold",
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  imageContainer: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_HEIGHT * 0.38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  imageGlow: {
    position: "absolute",
    width: SCREEN_WIDTH * 0.55,
    height: SCREEN_WIDTH * 0.55,
    borderRadius: SCREEN_WIDTH * 0.275,
    backgroundColor: "rgba(122, 155, 118, 0.08)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 30,
    fontFamily: "ManropeBold",
    fontWeight: "bold",
    color: "#1C1B1F",
    textAlign: "center",
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter",
    color: "#6B6873",
    textAlign: "center",
    lineHeight: 24,
    marginTop: 14,
    letterSpacing: 0.1,
  },
  bottomContainer: {
    paddingBottom: 56,
    paddingTop: 20,
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2B2E4A",
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 32,
  },
  getStartedButton: {
    borderRadius: 26,
    overflow: "hidden",
    shadowColor: "#2B2E4A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  getStartedGradient: {
    height: 56,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  getStartedText: {
    fontSize: 16,
    fontFamily: "InterBold",
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  nextButton: {
    height: 56,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2B2E4A",
    shadowColor: "#2B2E4A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: "InterBold",
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  skipContainer: {
    position: "absolute",
    top: 56,
    right: 28,
    zIndex: 10,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: "rgba(43, 46, 74, 0.06)",
  },
  skipText: {
    fontSize: 14,
    fontFamily: "InterSemiBold",
    fontWeight: "600",
    color: "#6B6873",
  },
  blob1: {
    position: "absolute",
    top: -40,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(122, 155, 118, 0.08)",
  },
  blob2: {
    position: "absolute",
    bottom: 120,
    left: -70,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(43, 46, 74, 0.04)",
  },
  blob3: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.35,
    left: SCREEN_WIDTH * 0.6,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(122, 155, 118, 0.05)",
  },
});
