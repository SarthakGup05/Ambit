import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

export interface CustomSpinnerProps {
  size?: number | 'small' | 'large';
  color?: string;
  style?: StyleProp<ViewStyle>;
  trackColor?: string;
  strokeWidth?: number;
}

export const CustomSpinner: React.FC<CustomSpinnerProps> = ({
  size = 'small',
  color = '#10B981',
  trackColor = 'rgba(16, 185, 129, 0.15)',
  strokeWidth = 3,
  style,
}) => {
  const numericSize = size === 'small' ? 20 : size === 'large' ? 32 : (typeof size === 'number' ? size : 24);
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 800,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    return () => {
      cancelAnimation(rotation);
    };
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={[styles.container, { width: numericSize, height: numericSize }, style]}>
      {/* Track Background */}
      <View
        style={[
          styles.circle,
          {
            width: numericSize,
            height: numericSize,
            borderRadius: numericSize / 2,
            borderWidth: strokeWidth,
            borderColor: trackColor,
          },
        ]}
      />
      
      {/* Animated Spinner Front */}
      <Animated.View
        style={[
          styles.circle,
          styles.animatedCircle,
          {
            width: numericSize,
            height: numericSize,
            borderRadius: numericSize / 2,
            borderWidth: strokeWidth,
            borderTopColor: color,
            borderRightColor: 'transparent',
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
  },
  animatedCircle: {
    position: 'absolute',
  },
});
