import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Platform, Dimensions } from "react-native";
import { Screen, Text } from "@repo/ui";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { AuthIllustration } from "../../src/features/auth/components/AuthIllustration";
import { Apple, User } from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import Animated, { FadeInLeft, FadeInRight, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

const { width } = Dimensions.get("window");

// Custom Google Icon
function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" style={styles.socialIcon}>
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </Svg>
  );
}

const SLIDES = [
  {
    title: "Visitor Approvals",
    description: "Approve or deny visitor entries to your flat in real-time with instant notifications."
  },
  {
    title: "Amenity Bookings",
    description: "Reserve the society clubhouse, pool, or tennis court in seconds with live availability."
  },
  {
    title: "Smart Notices",
    description: "Stay updated with important announcements and participate in community voting polls."
  }
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-slide effect every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* Clean minimalist white/grey background */}
      <View style={styles.background} />

      <Screen className="flex-1 bg-transparent px-6 justify-between py-10" scrollable={false}>
        {/* Header branding */}
        <View style={styles.header}>
          <Text style={styles.brandText}>Ambit</Text>
        </View>

        {/* Vector Line Art Illustration */}
        <View style={styles.illustrationWrapper}>
          <AuthIllustration />
        </View>

        {/* Slider Text Section */}
        <View style={styles.sliderTextSection}>
          <Text style={styles.slideTitle}>
            {SLIDES[activeSlide].title}
          </Text>
          <Text style={styles.slideDescription}>
            {SLIDES[activeSlide].description}
          </Text>
        </View>

        {/* Custom Progress Indicator Pills */}
        <View style={styles.pillsContainer}>
          {SLIDES.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.pill, 
                index === activeSlide ? styles.pillActive : styles.pillInactive
              ]} 
            />
          ))}
        </View>

        {/* Interactive Social Access Buttons */}
        <View style={styles.buttonGroup}>
          <Pressable style={styles.googleBtn} onPress={() => {}}>
            <GoogleIcon />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </Pressable>

          <Pressable style={styles.appleBtn} onPress={() => {}}>
            <Apple size={18} color="#FFFFFF" style={styles.socialIcon} />
            <Text style={styles.appleBtnText}>Continue with Apple</Text>
          </Pressable>

          <Pressable style={styles.guestBtn} onPress={() => router.push("/(auth)/login")}>
            <User size={18} color="#11111E" style={styles.socialIcon} />
            <Text style={styles.guestBtnText}>Continue As Guest</Text>
          </Pressable>
        </View>

        {/* Sign In Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.loginLink}>Log in</Text>
          </Pressable>
        </View>

      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
  },
  header: {
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 10 : 20,
  },
  brandText: {
    fontFamily: Platform.select({
      ios: "Snell Roundhand",
      android: "cursive",
      default: "serif",
    }),
    fontSize: 38,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  illustrationWrapper: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
  },
  sliderTextSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    minHeight: 85,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#11111E",
    fontFamily: "ManropeBold",
    textAlign: "center",
  },
  slideDescription: {
    fontSize: 13,
    color: "#5E5D6A",
    fontFamily: "Inter",
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
  },
  pillsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
  },
  pill: {
    height: 5,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  pillActive: {
    width: 24,
    backgroundColor: "#C3E2C4",
  },
  pillInactive: {
    width: 12,
    backgroundColor: "#E4E4E7",
  },
  buttonGroup: {
    width: "100%",
    gap: 12,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F4F4F5",
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#11111E",
    fontFamily: "InterSemiBold",
  },
  appleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 24,
    backgroundColor: "#A8D1A9", // subtle apple active-green style matching Ambit
  },
  appleBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "InterSemiBold",
  },
  guestBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F4F4F5",
    borderWidth: 1,
    borderColor: "#E4E4E7",
  },
  guestBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#11111E",
    fontFamily: "InterSemiBold",
  },
  socialIcon: {
    marginRight: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#5E5D6A",
    fontFamily: "Inter",
  },
  loginLink: {
    fontSize: 14,
    color: "#2E7D32",
    fontFamily: "InterBold",
    fontWeight: "bold",
  },
});
