import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, Platform, Image } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  runOnJS 
} from "react-native-reanimated";
import { Text } from "@repo/ui";

const { width, height } = Dimensions.get("window");

interface AnimatedSplashProps {
  onFinish: () => void;
}

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  // Animatable Shared Values
  const logoScale = useSharedValue(0.2);
  const brandTextScale = useSharedValue(0.7);
  const brandTextOpacity = useSharedValue(0);
  const exitScale = useSharedValue(1);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. Entrance: Zoom & fade in logo + brand text
    logoScale.value = withTiming(1, { duration: 600 });
    brandTextScale.value = withDelay(150, withTiming(1, { duration: 500 }));
    brandTextOpacity.value = withDelay(150, withTiming(1, { duration: 500 }));

    // 2. Exit transition: Cinematic Zoom-In & Fade Out
    const tFinish = setTimeout(() => {
      exitScale.value = withTiming(2.8, { duration: 500 });
      containerOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      });
    }, 1400);

    return () => {
      clearTimeout(tFinish);
    };
  }, [onFinish]);

  // Animated stylesheets
  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value * exitScale.value }],
  }));

  const animatedBrandTextStyle = useAnimatedStyle(() => ({
    opacity: brandTextOpacity.value,
    transform: [{ scale: brandTextScale.value }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      
      {/* Center Brand Logo centerpiece */}
      <Animated.View style={[styles.logoCenterpiece, animatedLogoStyle]}>
        <View style={styles.brandRow}>
          <Image 
            source={require("../../../../assets/ambit_logo.png")} 
            style={styles.logoImage} 
            resizeMode="contain" 
          />
          <Animated.View style={animatedBrandTextStyle}>
            <Text style={styles.brandText}>mbit</Text>
          </Animated.View>
        </View>
      </Animated.View>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  logoCenterpiece: {
    position: "absolute",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  logoImage: {
    width: 48,
    height: 48,
  },
  brandText: {
    fontSize: 42,
    fontWeight: "900",
    color: "#1C1B1F",
    fontFamily: "ManropeBold",
    letterSpacing: -1,
  },
});
