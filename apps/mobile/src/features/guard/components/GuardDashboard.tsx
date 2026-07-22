import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Screen, Text } from '@repo/ui';
import { ScreenBackground, AppSectionCard, AppListItem, BadgeIconWrapper, CustomSpinner } from '@/components/common';
import { type, uiStyles } from '@/theme';
import { useRouter } from 'expo-router';
import { VisitorService, Visitor, VisitorStats } from '@/services/VisitorService';
import { NotificationService } from '@/services/NotificationService';
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
  Car,
  ShieldCheck,
  QrCode,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useVisitorStore, useNotificationStore } from '@/store';

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  } catch {
    // ignore
  }
}

function getPurposeIcon(purpose: string) {
  const p = purpose.toLowerCase();
  if (p.includes('delivery') || p.includes('amazon') || p.includes('swiggy') || p.includes('zomato')) {
    return Package;
  }
  if (p.includes('cab') || p.includes('uber') || p.includes('ola') || p.includes('taxi')) {
    return Car;
  }
  return User;
}

function formatStatusLabel(status: string): string {
  switch (status) {
    case 'checked_in':
      return 'Inside Gate';
    case 'checked_out':
      return 'Exited';
    case 'approved':
      return 'Approved';
    case 'denied':
      return 'Denied';
    default:
      return 'Pending';
  }
}

export function GuardDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const { stats, visitors, loading, fetchVisitors } = useVisitorStore();
  const { unreadCount } = useNotificationStore();

  const recentVisitors = visitors.slice(0, 5);

  const syncNotifications = useCallback(async () => {
    try {
      const list = await NotificationService.getNotifications();
      const unread = list.filter((n) => !n.isRead).length;
      useNotificationStore.getState().setUnreadCount(unread);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchVisitors('all');
    syncNotifications();
  }, [fetchVisitors, syncNotifications]);

  const onRefresh = async () => {
    triggerHaptic();
    setRefreshing(true);
    await Promise.all([fetchVisitors('all'), syncNotifications()]);
    setRefreshing(false);
  };

  const QUICK_ACTIONS = [
    {
      id: 'register',
      title: 'Register Visitor',
      subtitle: 'Add walk-in, cab, or delivery',
      Icon: UserPlus,
      route: '/(guard)/(tabs)/visitors?tab=register' as const,
    },
    {
      id: 'verify',
      title: 'Verify QR / Passcode',
      subtitle: 'Instant guest pass check-in',
      Icon: QrCode,
      route: '/(guard)/(tabs)/visitors?tab=verify' as const,
    },
    {
      id: 'approvals',
      title: 'Pending Approvals',
      subtitle: `${stats.pending} pending requests`,
      Icon: ClipboardList,
      badge: stats.pending > 0 ? stats.pending : undefined,
      route: '/(guard)/(tabs)/visitors?tab=register' as const,
    },
    {
      id: 'logs',
      title: 'Gate Activity Log',
      subtitle: "View today's check-ins & exits",
      Icon: FileText,
      route: '/(guard)/(tabs)/logs' as const,
    },
  ];

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <ScrollView
          contentContainerStyle={[
            uiStyles.scroll,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4E6D3B" />
          }
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={uiStyles.header}>
            <View style={styles.guardBadge}>
              <ShieldCheck size={20} color="#4E6D3B" strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text variant="h3" weight="bold" style={type.navTitle}>
                Main Gate Guard
              </Text>
              <Text variant="caption" weight="medium" style={{ color: 'rgba(17,17,30,0.6)' }}>
                Active Shift • Gate 1
              </Text>
            </View>
            <Pressable
              onPress={() => {
                triggerHaptic();
                router.push('/notifications');
              }}
              style={uiStyles.transparentIconBtn}
              hitSlop={12}
            >
              <BadgeIconWrapper count={unreadCount} theme="blood_red">
                <Bell size={22} color="#11111E" strokeWidth={2.2} />
              </BadgeIconWrapper>
            </Pressable>
          </Animated.View>

          {/* Today's Overview Banner */}
          <Animated.View entering={FadeInUp.duration(400).delay(80)} style={styles.overviewCard}>
            <Text variant="caption" weight="medium" style={styles.overviewLabel}>
              Today's Gate Overview
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statTile}>
                <View style={styles.statIconBadge}>
                  <Users size={16} color="#FFFFFF" strokeWidth={2.2} />
                </View>
                <View style={styles.statTextGroup}>
                  <Text variant="h2" weight="bold" style={type.stat}>
                    {String(stats.total).padStart(2, '0')}
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
                    {String(stats.entered).padStart(2, '0')}
                  </Text>
                  <Text variant="caption" weight="medium" style={type.statLabel}>
                    Inside
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
                    {String(stats.exited).padStart(2, '0')}
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
                  onPress={() => {
                    triggerHaptic();
                    router.push(action.route);
                  }}
                  isLast={idx === QUICK_ACTIONS.length - 1}
                />
              ))}
            </AppSectionCard>
          </Animated.View>

          {/* Recent Gate Activity */}
          <Animated.View entering={FadeInUp.duration(400).delay(200)}>
            <AppSectionCard label="Recent Gate Activity">
              {loading ? (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <CustomSpinner size="small" color="#4E6D3B" />
                </View>
              ) : recentVisitors.length === 0 ? (
                <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                  <Text variant="body" weight="medium" style={{ color: 'rgba(17,17,30,0.5)' }}>
                    No visitor activity logged today yet.
                  </Text>
                </View>
              ) : (
                recentVisitors.map((item, idx) => {
                  const IconComp = getPurposeIcon(item.purpose);
                  const timeStr = new Date(item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <AppListItem
                      key={item.id}
                      Icon={IconComp}
                      title={item.name}
                      subtitle={`${item.flatNumber} • ${item.purpose} • ${timeStr}`}
                      valueText={formatStatusLabel(item.status)}
                      hideChevron={true}
                      isLast={idx === recentVisitors.length - 1}
                    />
                  );
                })
              )}
            </AppSectionCard>
          </Animated.View>
        </ScrollView>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  guardBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E4EFE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    paddingHorizontal: 2,
  },
  statIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  statTextGroup: {
    alignItems: 'flex-start',
    flexShrink: 1,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});
