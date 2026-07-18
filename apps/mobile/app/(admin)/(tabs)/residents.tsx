import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Screen, Text } from '@repo/ui';
import { ScreenBackground, AppSectionCard, AppListItem } from '@/components/common';
import { type, uiStyles } from '@/theme';
import { useRouter } from 'expo-router';
import { Users, UserPlus, ChevronRight } from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOCK_RESIDENTS = [
  { id: '1', name: 'Sarthak Mehta', flat: 'A-1203', status: 'Active' },
  { id: '2', name: 'Priya Sharma', flat: 'B-502', status: 'Active' },
  { id: '3', name: 'Amit Patel', flat: 'C-110', status: 'Pending' },
  { id: '4', name: 'Neha Gupta', flat: 'A-804', status: 'Active' },
];

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

export default function AdminResidentsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <ScrollView
          contentContainerStyle={[
            uiStyles.scroll,
            { paddingTop: insets.top + 16, paddingBottom: 120 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={uiStyles.header}>
            <View style={{ flex: 1, paddingRight: 12, gap: 2 }}>
              <Text variant="h2" weight="bold" style={type.greeting}>
                Residents
              </Text>
              <Text variant="body" style={type.greetingSub}>
                Manage residents & flats
              </Text>
            </View>
            <Pressable
              onPress={() => {
                triggerHaptic();
                router.push('/(admin)/manage-members');
              }}
              style={uiStyles.iconBtn}
              hitSlop={12}
            >
              <UserPlus size={22} color="#11111E" strokeWidth={2.2} />
            </Pressable>
          </Animated.View>

          {/* Residents Section Card */}
          <Animated.View entering={FadeInUp.duration(400).delay(80)}>
            <AppSectionCard label="Society Residents">
              {MOCK_RESIDENTS.map((r, idx) => (
                <AppListItem
                  key={r.id}
                  Icon={Users}
                  iconColor="#2E7D32"
                  iconBg="rgba(46, 125, 50, 0.1)"
                  title={r.name}
                  subtitle={`Flat ${r.flat}`}
                  rightElement={
                    <View style={styles.statusBadge}>
                      <Text
                        style={[
                          styles.statusText,
                          { color: r.status === 'Pending' ? '#D97706' : '#2E7D32' },
                        ]}
                      >
                        {r.status}
                      </Text>
                    </View>
                  }
                  onPress={() => {
                    triggerHaptic();
                    router.push('/(admin)/manage-members');
                  }}
                  isLast={idx === MOCK_RESIDENTS.length - 1}
                />
              ))}
            </AppSectionCard>
          </Animated.View>

          {/* Bottom Link */}
          <Pressable
            onPress={() => {
              triggerHaptic();
              router.push('/(admin)/manage-members');
            }}
            style={styles.manageLink}
          >
            <Text variant="label" weight="semibold" style={type.link}>
              Open full directory
            </Text>
            <ChevronRight size={16} color="#2E7D32" strokeWidth={2.4} />
          </Pressable>
        </ScrollView>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.035)',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'InterSemiBold',
  },
  manageLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    paddingVertical: 12,
  },
});
