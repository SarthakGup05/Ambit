import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  RefreshControl,
  InteractionManager,
} from 'react-native';
import { Screen, Text, Skeleton } from '@repo/ui';
import { ScreenBackground } from '@/components/common';
import { Bell, UserCheck, Megaphone, MoreHorizontal, SlidersHorizontal } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotificationService, NotificationItem } from '@/services/NotificationService';
import { useNotificationStore } from '@/store/notification.store';
import { NotificationCard } from '@/features/notifications/components/NotificationCard';
import { getNotificationMeta } from '@/features/notifications/notificationHelpers';

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

const FILTERS: { key: 'All' | 'Requests' | 'Updates' | 'Others'; label: string; Icon: any }[] = [
  { key: 'All', label: 'All', Icon: Bell },
  { key: 'Requests', label: 'Requests', Icon: UserCheck },
  { key: 'Updates', label: 'Updates', Icon: Megaphone },
  { key: 'Others', label: 'Others', Icon: MoreHorizontal },
];

function groupByDate(items: NotificationItem[]) {
  const todayStr = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const today: NotificationItem[] = [];
  const yesterdayItems: NotificationItem[] = [];

  items.forEach((item) => {
    const d = new Date(item.createdAt).toDateString();
    if (d === todayStr) today.push(item);
    else yesterdayItems.push(item);
  });

  return { today, yesterday: yesterdayItems };
}

export default function NotificationsTabScreen() {
  const insets = useSafeAreaInsets();
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Requests' | 'Updates' | 'Others'>('All');

  const updateUnread = useCallback(
    (list: NotificationItem[]) => {
      setUnreadCount(list.filter((n) => !n.isRead).length);
    },
    [setUnreadCount]
  );

  const loadData = useCallback(async () => {
    try {
      const list = await NotificationService.getNotifications();
      setNotifications(list || []);
      updateUnread(list || []);
    } catch (err: any) {
      console.warn('Failed to load notifications:', err.message || err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [updateUnread]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => { loadData(); });
    return () => task.cancel();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleMarkSingleRead = async (id: string, route: string | null) => {
    triggerHaptic();
    const applyRead = (prev: NotificationItem[]) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    try {
      await NotificationService.markAsRead(id);
    } catch {
      // fall through to local update
    }
    setNotifications((prev) => {
      const next = applyRead(prev);
      updateUnread(next);
      return next;
    });
    if (route) (require('expo-router').router as any).push(route);
  };

  const handleFilterPress = () => {
    triggerHaptic();
    Alert.alert('Notification Options', 'Manage your alerts', [
      {
        text: 'Mark All as Read',
        onPress: async () => {
          triggerHaptic();
          try {
            await NotificationService.markAllAsRead();
          } catch {
            // ignore
          }
          setNotifications((prev) => {
            const next = prev.map((n) => ({ ...n, isRead: true }));
            updateUnread(next);
            return next;
          });
        },
      },
      { text: 'Refresh Alerts', onPress: () => { setIsLoading(true); loadData(); } },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'All') return true;
    const meta = getNotificationMeta(n.title);
    return meta.category === activeFilter;
  });

  const { today: todayList, yesterday: yesterdayList } = groupByDate(filteredNotifications);

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <View style={[styles.innerContainer, { paddingTop: 12 }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text variant="h2" weight="bold" style={styles.headerTitle}>Notifications</Text>
              <Text variant="body" style={styles.headerSubtitle}>Stay updated with your community</Text>
            </View>
            <Pressable
              onPress={handleFilterPress}
              style={({ pressed }) => [styles.filterBtn, pressed && { opacity: 0.8 }]}
              hitSlop={12}
            >
              <SlidersHorizontal size={18} color="#2E7D32" strokeWidth={2.4} />
            </Pressable>
          </View>

          {/* Filter Chips */}
          <View style={styles.filterScrollViewContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
              {FILTERS.map((item) => {
                const isActive = activeFilter === item.key;
                const FilterIcon = item.Icon;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => { triggerHaptic(); setActiveFilter(item.key); }}
                    style={[styles.filterPill, isActive ? styles.filterPillActive : styles.filterPillInactive]}
                  >
                    <FilterIcon size={16} color={isActive ? '#FFFFFF' : '#6B6873'} strokeWidth={2.2} />
                    <Text style={[styles.filterPillText, isActive ? styles.filterPillTextActive : styles.filterPillTextInactive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Notification List */}
          {isLoading ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
              <View style={styles.sectionContainer}>
                <Skeleton style={{ height: 16, width: 80, marginTop: 8, marginBottom: 8 }} />
                {Array.from({ length: 3 }).map((_, idx) => (
                  <View key={idx} style={styles.skeletonCard}>
                    <View style={styles.cardContentRow}>
                      <Skeleton style={styles.skeletonIcon} borderRadius={14} />
                      <View style={styles.cardTextContainer}>
                        <View style={styles.cardHeaderRow}>
                          <Skeleton style={{ height: 16, width: '55%', borderRadius: 4 }} />
                          <Skeleton style={{ height: 12, width: '15%', borderRadius: 4 }} />
                        </View>
                        <Skeleton style={{ height: 14, width: '85%', marginTop: 8, borderRadius: 4 }} />
                        <Skeleton style={{ height: 14, width: '50%', marginTop: 6, borderRadius: 4 }} />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />}
            >
              {filteredNotifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Bell size={48} color="#A3A1A8" strokeWidth={1.2} style={{ marginBottom: 16 }} />
                  <Text style={styles.emptyText}>All caught up! No notifications.</Text>
                </View>
              ) : (
                <>
                  {todayList.length > 0 && (
                    <View style={styles.sectionContainer}>
                      <Text variant="label" weight="bold" style={styles.sectionHeader}>Today</Text>
                      {todayList.map((item) => (
                        <NotificationCard key={item.id} item={item} onPress={handleMarkSingleRead} />
                      ))}
                    </View>
                  )}
                  {yesterdayList.length > 0 && (
                    <View style={[styles.sectionContainer, { marginTop: todayList.length > 0 ? 12 : 0 }]}>
                      <Text variant="label" weight="bold" style={styles.sectionHeader}>Yesterday</Text>
                      {yesterdayList.map((item) => (
                        <NotificationCard key={item.id} item={item} onPress={handleMarkSingleRead} />
                      ))}
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          )}
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 26, fontFamily: 'ManropeBold', fontWeight: '700', color: '#1C1B1F' },
  headerSubtitle: { fontSize: 14, fontFamily: 'Inter', color: '#8E8D94', marginTop: 4 },
  filterBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#EAF0E8',
    alignItems: 'center', justifyContent: 'center',
  },
  filterScrollViewContainer: { marginBottom: 16 },
  filterScrollContent: { paddingHorizontal: 24, gap: 10, alignItems: 'center' },
  filterPill: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    paddingHorizontal: 16, borderRadius: 24, gap: 8, borderWidth: 1,
  },
  filterPillActive: { backgroundColor: '#3E5C38', borderColor: '#3E5C38' },
  filterPillInactive: { backgroundColor: '#F3F4F1', borderColor: '#EFEFEA' },
  filterPillText: { fontSize: 14, fontFamily: 'InterBold', fontWeight: '700' },
  filterPillTextActive: { color: '#FFFFFF' },
  filterPillTextInactive: { color: '#3A3F37' },
  listContainer: { paddingHorizontal: 24, paddingBottom: 130 },
  sectionContainer: { gap: 12 },
  sectionHeader: {
    fontSize: 14, fontFamily: 'InterBold', fontWeight: '700',
    color: '#4E6542', marginTop: 8, marginBottom: 4,
  },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 120 },
  emptyText: { fontSize: 14, fontFamily: 'Inter', color: '#8E8D94' },
  skeletonCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#ECEFEA',
  },
  cardContentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  cardTextContainer: { flex: 1, gap: 4 },
  cardHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: 8,
  },
  skeletonIcon: { width: 44, height: 44 },
});
