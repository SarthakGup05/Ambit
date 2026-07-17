import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, Platform } from "react-native";
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
  const logoScale = useSharedValue(0);
  const brandTextScale = useSharedValue(0.7);
  const brandTextOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. Zoom/fade in logo dot + brand text
    logoScale.value = withTiming(1, { duration: 600 });
    brandTextScale.value = withDelay(150, withTiming(1, { duration: 500 }));
    brandTextOpacity.value = withDelay(150, withTiming(1, { duration: 500 }));

    // 2. Stay on screen and then fade out entire container to finish
    const tFinish = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      });
    }, 1600);

    return () => {
      clearTimeout(tFinish);
    };
  }, [onFinish]);

  // Animated stylesheets
  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
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
          <View style={styles.logoDot} />
          <Animated.View style={animatedBrandTextStyle}>
            <Text style={styles.brandText}>Ambit</Text>
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
    gap: 12,
  },
  logoDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#C3E2C4",
  },
  brandText: {
    fontSize: 34,
    fontWeight: "900",
    color: "#11111E",
    fontFamily: "ManropeBold",
    letterSpacing: -0.8,
  },
});
