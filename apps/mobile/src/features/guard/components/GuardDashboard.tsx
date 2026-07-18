import React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Screen, Text } from '@repo/ui';
import { ScreenBackground, AppSectionCard, AppListItem } from '@/components/common';
import { type, uiStyles } from '@/theme';
import { useRouter } from 'expo-router';
import {
  Menu,
  Bell,
  UserPlus,
  Search,
  ClipboardList,
  FileText,
  Package,
  User,
  Users,
  UserCheck,
  LogOut,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TODAY = {
  visitors: 12,
  entered: 8,
  exited: 7,
};

const QUICK_ACTIONS = [
  {
    id: 'register',
    title: 'Register Visitor',
    subtitle: 'Add new visitor at gate',
    Icon: UserPlus,
    route: '/(guard)/(tabs)/visitors' as const,
  },
  {
    id: 'search',
    title: 'Search Resident',
    subtitle: 'Find flat or resident',
    Icon: Search,
    route: '/(guard)/(tabs)/visitors' as const,
  },
  {
    id: 'approvals',
    title: 'Approval Requests',
    subtitle: '5 pending approvals',
    Icon: ClipboardList,
    badge: 3,
    route: '/(guard)/(tabs)/visitors' as const,
  },
  {
    id: 'logs',
    title: 'Entry / Exit Log',
    subtitle: "View today's log",
    Icon: FileText,
    route: '/(guard)/(tabs)/logs' as const,
  },
];

const RECENT = [
  {
    id: '1',
    name: 'Amazon Delivery',
    flat: 'Flat A-1203',
    status: 'Approved' as const,
    time: '10:30 AM',
    Icon: Package,
  },
  {
    id: '2',
    name: 'Rahul Sharma (Guest)',
    flat: 'Flat B-502',
    status: 'Entered' as const,
    time: '09:45 AM',
    Icon: User,
  },
];

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

export function GuardDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4E6D3B" />
          }
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={uiStyles.header}>
            <Pressable onPress={() => triggerHaptic()} style={uiStyles.iconBtn} hitSlop={12}>
              <Menu size={24} color="#11111E" strokeWidth={2.2} />
            </Pressable>
            <Text variant="h3" weight="bold" style={type.navTitle}>
              Guard Dashboard
            </Text>
            <Pressable onPress={() => triggerHaptic()} style={uiStyles.iconBtn} hitSlop={12}>
              <Bell size={24} color="#11111E" strokeWidth={2.2} />
              <View style={uiStyles.notifDot} />
            </Pressable>
          </Animated.View>

          {/* Today's Overview Banner */}
          <Animated.View entering={FadeInUp.duration(400).delay(80)} style={styles.overviewCard}>
            <Text variant="caption" weight="medium" style={styles.overviewLabel}>
              Today's Overview
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statTile}>
                <View style={styles.statIconBadge}>
                  <Users size={16} color="#FFFFFF" strokeWidth={2.2} />
                </View>
                <View style={styles.statTextGroup}>
                  <Text variant="h2" weight="bold" style={type.stat}>
                    {String(TODAY.visitors).padStart(2, '0')}
                  </Text>
                  <Text variant="caption" weight="medium" style={type.statLabel}>
                    Visitors
                  </Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statTile}>
                <View style={styles.statIconBadge}>
                  <UserCheck size={16} color="#FFFFFF" strokeWidth={2.2} />
                </View>
                <View style={styles.statTextGroup}>
                  <Text variant="h2" weight="bold" style={type.stat}>
                    {String(TODAY.entered).padStart(2, '0')}
                  </Text>
                  <Text variant="caption" weight="medium" style={type.statLabel}>
                    Entered
                  </Text>
                </View>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statTile}>
                <View style={styles.statIconBadge}>
                  <LogOut size={16} color="#FFFFFF" strokeWidth={2.2} />
                </View>
                <View style={styles.statTextGroup}>
                  <Text variant="h2" weight="bold" style={type.stat}>
                    {String(TODAY.exited).padStart(2, '0')}
                  </Text>
                  <Text variant="caption" weight="medium" style={type.statLabel}>
                    Exited
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInUp.duration(400).delay(140)}>
            <AppSectionCard label="Quick Actions">
              {QUICK_ACTIONS.map((action, idx) => (
                <AppListItem
                  key={action.id}
                  Icon={action.Icon}
                  title={action.title}
                  subtitle={action.subtitle}
                  badge={action.badge}
                  onPress={() => router.push(action.route)}
                  isLast={idx === QUICK_ACTIONS.length - 1}
                />
              ))}
            </AppSectionCard>
          </Animated.View>

          {/* Recent Visitors */}
          <Animated.View entering={FadeInUp.duration(400).delay(200)}>
            <AppSectionCard label="Recent Visitors">
              {RECENT.map((item, idx) => (
                <AppListItem
                  key={item.id}
                  Icon={item.Icon}
                  title={item.name}
                  subtitle={`${item.flat} · ${item.time}`}
                  valueText={item.status}
                  hideChevron={true}
                  isLast={idx === RECENT.length - 1}
                />
              ))}
            </AppSectionCard>
          </Animated.View>
        </ScrollView>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  overviewCard: {
    backgroundColor: '#4E6D3B',
    borderRadius: 28,
    paddingVertical: 22,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  overviewLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
    fontFamily: 'InterBold',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statTextGroup: {
    alignItems: 'flex-start',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});
