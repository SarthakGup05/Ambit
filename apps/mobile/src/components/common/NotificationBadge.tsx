import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Text } from '@repo/ui';
import Animated, { ZoomIn, ZoomOut } from 'react-native-reanimated';

export type NotificationBadgeTheme = 'blood_red' | 'forest_green' | 'crimson' | 'amber';
export type NotificationBadgeVariant = 'dot' | 'count';

export interface NotificationBadgeProps {
  count?: number;
  variant?: NotificationBadgeVariant;
  theme?: NotificationBadgeTheme;
  showZero?: boolean;
  maxCount?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function NotificationBadge({
  count = 0,
  variant = 'count',
  theme = 'blood_red',
  showZero = false,
  maxCount = 99,
  style,
  textStyle,
}: NotificationBadgeProps) {
  if (count <= 0 && !showZero) {
    return null;
  }

  const getThemeColors = () => {
    switch (theme) {
      case 'forest_green':
        return { bg: '#1E4D2B', border: '#81C784' };
      case 'crimson':
        return { bg: '#C62828', border: '#FF8A80' };
      case 'amber':
        return { bg: '#E65100', border: '#FFB74D' };
      case 'blood_red':
      default:
        return { bg: '#8B0000', border: 'rgba(255, 255, 255, 0.3)' };
    }
  };

  const colors = getThemeColors();
  const displayCount = count > maxCount ? `${maxCount}+` : String(count);

  if (variant === 'dot') {
    return (
      <Animated.View
        entering={ZoomIn.duration(200)}
        exiting={ZoomOut.duration(150)}
        style={[
          styles.dot,
          { backgroundColor: colors.bg, borderColor: colors.border },
          style,
        ]}
      />
    );
  }

  return (
    <Animated.View
      entering={ZoomIn.duration(200)}
      exiting={ZoomOut.duration(150)}
      style={[
        styles.countBadge,
        { backgroundColor: colors.bg, borderColor: colors.border },
        style,
      ]}
    >
      <Text variant="caption" weight="bold" style={[styles.countText, textStyle]}>
        {displayCount}
      </Text>
    </Animated.View>
  );
}

export interface BadgeIconWrapperProps {
  children: React.ReactNode;
  count?: number;
  variant?: NotificationBadgeVariant;
  theme?: NotificationBadgeTheme;
  showZero?: boolean;
  maxCount?: number;
  badgeStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export function BadgeIconWrapper({
  children,
  count = 0,
  variant = 'count',
  theme = 'blood_red',
  showZero = false,
  maxCount = 99,
  badgeStyle,
  containerStyle,
}: BadgeIconWrapperProps) {
  return (
    <View style={[styles.wrapperContainer, containerStyle]}>
      {children}
      <View style={styles.badgePosition}>
        <NotificationBadge
          count={count}
          variant={variant}
          theme={theme}
          showZero={showZero}
          maxCount={maxCount}
          style={badgeStyle}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePosition: {
    position: 'absolute',
    top: -4,
    right: -6,
    zIndex: 10,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.2,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
