import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { Text } from '@repo/ui';
import { type } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNotificationStore } from '@/store/notification.store';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

// ─── Color Tokens ─────────────────────────────────────────────────────────────
const BAR_BG     = '#F8F7F4';              // off-white pill
const ACTIVE_CLR = '#2E7D32';             // app's primary green
const INACTIVE   = '#9CA3AF';             // muted grey
const GLOW_BG    = 'rgba(46,125,50,0.10)'; // soft green spotlight behind active icon

// ─── Types ────────────────────────────────────────────────────────────────────
type TabIcon = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
  fill?: string;
}>;

export type RoleTabConfig = {
  name: string;
  label: string;
  Icon: TabIcon;
};

type Props = {
  state: any;
  navigation: any;
  tabs: RoleTabConfig[];
};

// ─── Individual Animated Tab Item ─────────────────────────────────────────────
function TabItem({
  tab,
  isFocused,
  onPress,
  showBadge,
  badgeCount,
}: {
  tab: RoleTabConfig;
  isFocused: boolean;
  onPress: () => void;
  showBadge: boolean;
  badgeCount: number;
}) {
  const glowOpacity = useSharedValue(isFocused ? 1 : 0);

  const { Icon } = tab;
  const color = isFocused ? ACTIVE_CLR : INACTIVE;

  // Sync glow when focus changes
  useEffect(() => {
    glowOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 220 });
  }, [isFocused]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [
      { scale: interpolate(glowOpacity.value, [0, 1], [0.7, 1]) },
    ],
  }));

  return (
    <Pressable onPress={onPress} style={styles.item}>
      {/* Icon wrapper — fixed 46×46 so glow and icon share the same center */}
      <View style={styles.iconWrapper}>
        {/* Glow: absolute fill within iconWrapper, perfectly centered */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.glow, animatedGlowStyle]} />

        {/* Icon */}
        <Icon
          size={22}
          color={color}
          strokeWidth={isFocused ? 2.4 : 1.8}
          fill={isFocused ? GLOW_BG : 'transparent'}
        />

        {/* Notification badge */}
        {showBadge && badgeCount > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
      </View>

      {/* Label */}
      <Text
        variant="caption"
        weight={isFocused ? 'bold' : 'normal'}
        style={[
          type.tab,
          { color, fontWeight: isFocused ? '700' : '500', letterSpacing: isFocused ? 0.1 : 0 },
        ]}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
export function RoleTabBar({ state, navigation, tabs }: Props) {
  const insets = useSafeAreaInsets();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
  };

  const bottomOffset = Platform.OS === 'android'
    ? Math.max(insets.bottom + 4, 10)
    : Math.max(insets.bottom, 8);

  return (
    <View style={[styles.wrap, { bottom: bottomOffset }]}>
      <View style={styles.pill}>
        {tabs.map((tab) => {
          const routeIndex = state.routes.findIndex((r: any) => r.name === tab.name);
          if (routeIndex === -1) return null;

          const route = state.routes[routeIndex];
          const isFocused = state.index === routeIndex;

          const onPress = () => {
            triggerHaptic();
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TabItem
              key={tab.name}
              tab={tab}
              isFocused={isFocused}
              onPress={onPress}
              showBadge={tab.name === 'notifications'}
              badgeCount={unreadCount}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: BAR_BG,
    borderRadius: 32,
    paddingVertical: 6,
    paddingHorizontal: 4,
    width: '100%',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 12,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 1,
    gap: 1,
  },
  // Fixed 38×38 container shared by both the glow and the icon
  iconWrapper: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    borderRadius: 19,
    backgroundColor: GLOW_BG,
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: BAR_BG,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'InterBold',
    fontWeight: '700',
    textAlign: 'center',
  },
});
