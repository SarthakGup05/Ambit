import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  isReady?: boolean;
  onAnimationComplete?: () => void;
}

export function SplashScreen({ isReady = false, onAnimationComplete }: SplashScreenProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const [hiddenNative, setHiddenNative] = useState(false);

  useEffect(() => {
    let active = true;
    async function hideNativeSplash() {
      try {
        await ExpoSplashScreen.hideAsync();
      } catch (error) {
        // Ignore errors if the native splash screen is already hidden
      } finally {
        if (active) {
          setHiddenNative(true);
        }
      }
    }
    hideNativeSplash();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isReady && hiddenNative) {
      scale.value = withTiming(3, { duration: 600, easing: Easing.inOut(Easing.ease) });
      opacity.value = withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) }, (finished) => {
        if (finished && onAnimationComplete) {
          runOnJS(onAnimationComplete)();
        }
      });
    }
  }, [isReady, hiddenNative, scale, opacity, onAnimationComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View 
      style={[styles.container, animatedStyle]} 
      pointerEvents={isReady ? 'none' : 'auto'}
    >
      <View style={styles.content}>
        <Image 
          source={require('../../../assets/ambit_logo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.text}>Your Community.</Text>
        <Text style={styles.text}>Your App.</Text>
      </View>
      <View style={styles.skyline}>
        {/* Placeholder for skyline silhouette since asset is not available */}
        <View style={styles.buildingsContainer}>
          <View style={[styles.building, { width: 30, height: 80, opacity: 0.1 }]} />
          <View style={[styles.building, { width: 40, height: 120, opacity: 0.15 }]} />
          <View style={[styles.building, { width: 25, height: 60, opacity: 0.1 }]} />
          <View style={[styles.building, { width: 50, height: 160, opacity: 0.2 }]} />
          <View style={[styles.building, { width: 35, height: 90, opacity: 0.1 }]} />
          <View style={[styles.building, { width: 45, height: 140, opacity: 0.15 }]} />
          <View style={[styles.building, { width: 30, height: 100, opacity: 0.1 }]} />
          <View style={[styles.building, { width: 40, height: 70, opacity: 0.1 }]} />
          <View style={[styles.building, { width: 35, height: 110, opacity: 0.15 }]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0d3a2a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
    marginTop: -50,
  },
  logo: {
    width: 280,
    height: 280,
    marginBottom: 5,
  },
  text: {
    color: '#ffffff',
    fontSize: 22,
    fontFamily: 'Inter',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 32,
  },
  skyline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  buildingsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  building: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  }
});
