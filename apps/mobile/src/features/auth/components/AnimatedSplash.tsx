import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Platform } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSequence, 
  runOnJS 
} from "react-native-reanimated";
import { Text } from "@repo/ui";

const { width, height } = Dimensions.get("window");

interface AnimatedSplashProps {
  onFinish: () => void;
}

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  // Active text stage: 0 = Brand logo only, 1 = Secure Gates, 2 = Peace of Mind
  const [textStage, setTextStage] = useState(0);

  // Animatable Shared Values
  const logoScale = useSharedValue(0);
  const logoTranslateY = useSharedValue(0);
  const logoOpacity = useSharedValue(1);

  const brandTextScale = useSharedValue(0.7);
  const brandTextOpacity = useSharedValue(0);

  const waveHeight = useSharedValue(0);
  const faceScale = useSharedValue(0);

  const stageTextScale = useSharedValue(0.7);
  const stageTextOpacity = useSharedValue(0);

  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. Initial State: Zoom in Logo dot + brand text
    logoScale.value = withTiming(1, { duration: 600 });
    brandTextScale.value = withDelay(150, withTiming(1, { duration: 500 }));
    brandTextOpacity.value = withDelay(150, withTiming(1, { duration: 500 }));

    // 2. Stage 1 Prep: Zoom out brand text at 1500ms
    const tBrandOut = setTimeout(() => {
      brandTextScale.value = withTiming(0.7, { duration: 300 });
      brandTextOpacity.value = withTiming(0, { duration: 300 });
    }, 1500);

    // 3. Stage 1 Transition (Secure Gates) at 1800ms
    const tStage1 = setTimeout(() => {
      setTextStage(1);
      // Move logo up and fade it slightly for a premium background watermark effect
      logoTranslateY.value = withTiming(-140, { duration: 700 });
      logoOpacity.value = withTiming(0.4, { duration: 700 });

      // Raise the green wave (no bounce, smooth timing)
      waveHeight.value = withTiming(height * 0.46, { duration: 800 });
      // Zoom in peaceful face inside wave
      faceScale.value = withDelay(200, withTiming(1, { duration: 500 }));

      // Zoom in Stage 1 texts
      stageTextScale.value = withDelay(250, withTiming(1, { duration: 500 }));
      stageTextOpacity.value = withDelay(250, withTiming(1, { duration: 500 }));
    }, 1800);

    // 4. Stage 2 Prep: Zoom out Stage 1 texts at 3500ms
    const tStage1Out = setTimeout(() => {
      stageTextScale.value = withTiming(0.7, { duration: 300 });
      stageTextOpacity.value = withTiming(0, { duration: 300 });
    }, 3500);

    // 5. Stage 2 Transition (Peace of Mind) at 3800ms
    const tStage2 = setTimeout(() => {
      setTextStage(2);
      // Grow the green wave higher
      waveHeight.value = withTiming(height * 0.56, { duration: 800 });

      // Zoom in Stage 2 texts
      stageTextScale.value = withTiming(1, { duration: 500 });
      stageTextOpacity.value = withTiming(1, { duration: 500 });
    }, 3800);

    // 6. Stage 3 Prep: Zoom out everything at 5500ms
    const tStage2Out = setTimeout(() => {
      stageTextScale.value = withTiming(0.7, { duration: 300 });
      stageTextOpacity.value = withTiming(0, { duration: 300 });
      faceScale.value = withTiming(0, { duration: 400 });
      logoScale.value = withTiming(0, { duration: 400 });
      waveHeight.value = withTiming(0, { duration: 600 });
    }, 5500);

    // 7. Final Fade-out of entire container and complete
    const tFinish = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      });
    }, 6100);

    return () => {
      clearTimeout(tBrandOut);
      clearTimeout(tStage1);
      clearTimeout(tStage1Out);
      clearTimeout(tStage2);
      clearTimeout(tStage2Out);
      clearTimeout(tFinish);
    };
  }, [onFinish]);

  // Animated stylesheets
  const animatedLogoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { translateY: logoTranslateY.value }
    ],
  }));

  const animatedBrandTextStyle = useAnimatedStyle(() => ({
    opacity: brandTextOpacity.value,
    transform: [{ scale: brandTextScale.value }],
  }));

  const animatedWaveStyle = useAnimatedStyle(() => ({
    height: waveHeight.value,
  }));

  const animatedFaceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: faceScale.value }],
    opacity: faceScale.value,
  }));

  const animatedStageTextStyle = useAnimatedStyle(() => ({
    opacity: stageTextOpacity.value,
    transform: [{ scale: stageTextScale.value }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      
      {/* Top Text Content Area (Shows stage-specific descriptions) */}
      <View style={styles.topTextSection}>
        <Animated.View style={[styles.textBox, animatedStageTextStyle]}>
          {textStage === 1 && (
            <>
              <Text style={styles.heading}>Secure Gates</Text>
              <Text style={styles.subheading}>Approve or deny visitor entries to your society in real-time.</Text>
            </>
          )}
          {textStage === 2 && (
            <>
              <Text style={styles.heading}>Peace of Mind</Text>
              <Text style={styles.subheading}>Enjoy a connected community built around safety and security.</Text>
            </>
          )}
        </Animated.View>
      </View>

      {/* Rhythmic Rising Wave (Breathing green background) */}
      <Animated.View style={[styles.waveContainer, animatedWaveStyle]}>
        <View style={styles.waveContent}>
          {/* Animated Peaceful Sleeping/Breathing Face */}
          <Animated.View style={[styles.faceWrapper, animatedFaceStyle]}>
            <Svg width={120} height={80} viewBox="0 0 120 80" fill="none">
              {/* Left closed eye (arc) */}
              <Path d="M25 35q12 12 24 0" stroke="#11111E" strokeWidth={3.5} strokeLinecap="round" fill="none" />
              {/* Right closed eye (arc) */}
              <Path d="M71 35q12 12 24 0" stroke="#11111E" strokeWidth={3.5} strokeLinecap="round" fill="none" />
              {/* Curved smiling mouth */}
              <Path d="M43 55q17 18 34 0" stroke="#11111E" strokeWidth={3.5} strokeLinecap="round" fill="none" />
            </Svg>
          </Animated.View>
        </View>
      </Animated.View>

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
  waveContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#A8D1A9",
    borderTopLeftRadius: width * 0.45,
    borderTopRightRadius: width * 0.45,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  waveContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  faceWrapper: {
    marginTop: 40,
  },
  topTextSection: {
    position: "absolute",
    top: height * 0.18,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 40,
  },
  textBox: {
    alignItems: "center",
    width: "100%",
  },
  heading: {
    fontSize: 30,
    fontWeight: "900",
    color: "#11111E",
    fontFamily: "ManropeBold",
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E2E3A",
    fontFamily: "InterSemiBold",
    textAlign: "center",
    lineHeight: 24,
  },
});
