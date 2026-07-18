import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@repo/ui';
import { ScreenBackground } from '@/components/common/ScreenBackground';
import { type } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
};

export function PlaceholderScreen({ title, subtitle, Icon }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <ScreenBackground />
      <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Icon size={28} color="#2E7D32" strokeWidth={2.2} />
          </View>
          <Text variant="h3" weight="bold" style={type.emptyTitle}>
            {title}
          </Text>
          <Text variant="body" style={type.emptyBody}>
            {subtitle}
          </Text>
          <View style={styles.badge}>
            <Text variant="caption" weight="bold" style={[type.micro, { color: '#2E7D32' }]}>
              COMING SOON
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    gap: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badge: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.2)',
  },
});
