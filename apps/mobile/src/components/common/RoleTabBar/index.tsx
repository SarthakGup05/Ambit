import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@repo/ui';
import { type } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const ACTIVE = '#2E7D32';
const INACTIVE = '#9CA3AF';

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

export function RoleTabBar({ state, navigation, tabs }: Props) {
  const insets = useSafeAreaInsets();

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
  };

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar}>
        {tabs.map((tab) => {
          const routeIndex = state.routes.findIndex((r: any) => r.name === tab.name);
          if (routeIndex === -1) return null;

          const route = state.routes[routeIndex];
          const isFocused = state.index === routeIndex;
          const color = isFocused ? ACTIVE : INACTIVE;
          const { Icon } = tab;

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
            <Pressable key={tab.name} onPress={onPress} style={styles.item}>
              <Icon
                size={22}
                color={color}
                strokeWidth={isFocused ? 2.4 : 2}
                fill={isFocused ? color : 'transparent'}
              />
              <Text
                variant="caption"
                weight="semibold"
                style={[type.tab, { color }]}
              >
                {tab.label}
              </Text>
              {isFocused && <View style={styles.dot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    minHeight: 56,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACTIVE,
    marginTop: 2,
  },
});
