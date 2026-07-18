import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  RefreshControl,
  Dimensions,
  InteractionManager,
} from 'react-native';
import { Screen, Text, Skeleton } from '@repo/ui';
import { ScreenBackground } from '@/components/common';
import { uiStyles } from '@/theme';
import { useRouter } from 'expo-router';
import {
  Bell,
  UserCheck,
  Package,
  FileText,
  Megaphone,
  Calendar,
  BarChart2,
  Shield,
  SlidersHorizontal,
  MoreHorizontal,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NotificationService, NotificationItem } from '@/services/NotificationService';
import { useNotificationStore } from '@/store/notification.store';

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

function getNotificationMeta(title: string) {
  const t = title.toLowerCase();
  if (t.includes('visitor') || t.includes('approval') || t.includes('request')) {
    return {
      Icon: UserCheck,
      iconColor: '#2E7D32',
      bgColor: '#EAF0E8', // Light green
      category: 'Requests',
      route: '/(resident)/(tabs)/visitors' as const,
    };
  }
  if (t.includes('pre-approved') || t.includes('guest')) {
    return {
      Icon: Package,
      iconColor: '#B57A2B',
      bgColor: '#FCF3E8', // Light orange/yellow
      category: 'Updates',
      route: '/(resident)/preapprove-guest' as const,
    };
  }
  if (t.includes('complaint')) {
    return {
      Icon: FileText,
      iconColor: '#2E7D32',
      bgColor: '#EAF0E8',
      category: 'Updates',
      route: '/(resident)/(tabs)/complaints' as const,
    };
  }
  if (t.includes('notice') || t.includes('society') || t.includes('water supply')) {
    return {
      Icon: Megaphone,
      iconColor: '#2E7D32',
      bgColor: '#EAF0E8',
      category: 'Updates',
      route: '/(resident)/(tabs)/notices' as const,
    };
  }
  if (t.includes('booking') || t.includes('amenity') || t.includes('confirmed')) {
    return {
      Icon: Calendar,
      iconColor: '#2E7D32',
      bgColor: '#EAF0E8',
      category: 'Updates',
      route: '/(resident)/(tabs)/bookings' as const,
    };
  }
  if (t.includes('poll')) {
    return {
      Icon: BarChart2,
      iconColor: '#2E7D32',
      bgColor: '#EAF0E8',
      category: 'Updates',
      route: '/(resident)/polls' as const,
    };
  }
  if (t.includes('entry') || t.includes('log') || t.includes('exited')) {
    return {
      Icon: Shield,
      iconColor: '#B57A2B',
      bgColor: '#FCF3E8',
      category: 'Others',
      route: null,
    };
  }
  // Default fallback
  return {
    Icon: Bell,
    iconColor: '#2E7D32',
    bgColor: '#EAF0E8',
    category: 'Others',
    route: null,
  };
}

function formatNotificationTime(dateStr: string) {
  const date = new Date(dateStr);
  const todayStr = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  if (date.toDateString() === todayStr) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (date.toDateString() === yesterdayStr) {
    return 'Yesterday';
  }
  return 'Yesterday';
}

export default function NotificationsTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Requests' | 'Updates' | 'Others'>('All');

  const loadData = useCallback(async () => {
    try {
      const list = await NotificationService.getNotifications();
      setNotifications(list || []);
      const count = (list || []).filter((n) => !n.isRead).length;
      setUnreadCount(count);
    } catch (err: any) {
      console.warn('Failed to load notifications:', err.message || err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [setUnreadCount]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      loadData();
    });
    return () => task.cancel();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleMarkSingleRead = async (id: string, route: string | null) => {
    triggerHaptic();
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      // Recalculate unread count
      setNotifications((latest) => {
        const count = latest.filter((n) => !n.isRead).length;
        setUnreadCount(count);
        return latest;
      });

      // Contextual navigation if a route is linked to this notification type
      if (route) {
        router.push(route as any);
      }
    } catch (err) {
      // Local fallback in case of API issue
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setNotifications((latest) => {
        const count = latest.filter((n) => !n.isRead).length;
        setUnreadCount(count);
        return latest;
      });
      if (route) {
        router.push(route as any);
      }
    }
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
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
          } catch (err) {
            console.warn('Failed to mark all as read:', err);
          }
        },
      },
      {
        text: 'Refresh Alerts',
        onPress: () => {
          setIsLoading(true);
          loadData();
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'All') return true;
    const meta = getNotificationMeta(n.title);
    return meta.category === activeFilter;
  });

  // Group notifications into Today vs Yesterday
  const todayList: NotificationItem[] = [];
  const yesterdayList: NotificationItem[] = [];

  const todayStr = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  filteredNotifications.forEach((item) => {
    const date = new Date(item.createdAt);
    if (date.toDateString() === todayStr) {
      todayList.push(item);
    } else {
      yesterdayList.push(item);
    }
  });

  const renderNotificationCard = (item: NotificationItem) => {
    const meta = getNotificationMeta(item.title);
    const relativeTime = formatNotificationTime(item.createdAt);
    const CardIcon = meta.Icon;

    return (
      <Pressable
        key={item.id}
        onPress={() => handleMarkSingleRead(item.id, meta.route)}
        style={({ pressed }) => [
          styles.notifCard,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
        ]}
      >
        <View style={styles.cardContentRow}>
          {/* Custom Squircle Icon Wrapper */}
          <View style={[styles.iconWrapper, { backgroundColor: meta.bgColor }]}>
            <CardIcon size={20} color={meta.iconColor} strokeWidth={2} />
          </View>

          {/* Texts (Title, Body, Time) */}
          <View style={styles.cardTextContainer}>
            <View style={styles.cardHeaderRow}>
              <Text variant="label" weight="bold" style={styles.cardTitle}>{item.title}</Text>
              <Text variant="caption" style={styles.cardTime}>{relativeTime}</Text>
            </View>
            <Text style={styles.cardBody} numberOfLines={2}>
              {item.body}
            </Text>
          </View>
        </View>

        {/* Unread Status Green Dot */}
        {!item.isRead && <View style={styles.unreadDot} />}
      </Pressable>
    );
  };

  const FILTERS: { key: 'All' | 'Requests' | 'Updates' | 'Others'; label: string; Icon: any }[] = [
    { key: 'All', label: 'All', Icon: Bell },
    { key: 'Requests', label: 'Requests', Icon: UserCheck },
    { key: 'Updates', label: 'Updates', Icon: Megaphone },
    { key: 'Others', label: 'Others', Icon: MoreHorizontal },
  ];

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <View style={[styles.innerContainer, { paddingTop: insets.top + 16 }]}>
          {/* Header Row */}
          <View style={styles.header}>
            <View>
              <Text variant="h2" weight="bold" style={styles.headerTitle}>Notifications</Text>
              <Text variant="body" style={styles.headerSubtitle}>Stay updated with your community</Text>
            </View>
            <Pressable
              onPress={handleFilterPress}
              style={({ pressed }) => [
                styles.filterBtn,
                pressed && { opacity: 0.8 },
              ]}
              hitSlop={12}
            >
              <SlidersHorizontal size={18} color="#2E7D32" strokeWidth={2.4} />
            </Pressable>
          </View>

          {/* Capsule Filters Scrollable Row */}
          <View style={styles.filterScrollViewContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              {FILTERS.map((item) => {
                const isActive = activeFilter === item.key;
                const FilterIcon = item.Icon;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => {
                      triggerHaptic();
                      setActiveFilter(item.key);
                    }}
                    style={[
                      styles.filterPill,
                      isActive ? styles.filterPillActive : styles.filterPillInactive,
                    ]}
                  >
                    <FilterIcon
                      size={16}
                      color={isActive ? '#FFFFFF' : '#6B6873'}
                      strokeWidth={2.2}
                      fill={isActive && item.key === 'All' ? '#FFFFFF' : 'transparent'}
                    />
                    <Text
                      style={[
                        styles.filterPillText,
                        isActive ? styles.filterPillTextActive : styles.filterPillTextInactive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Notification List */}
          {isLoading ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            >
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
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
              }
            >
              {filteredNotifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Bell size={48} color="#A3A1A8" strokeWidth={1.2} style={{ marginBottom: 16 }} />
                  <Text style={styles.emptyText}>All caught up! No notifications.</Text>
                </View>
              ) : (
                <>
                  {/* Today Section */}
                  {todayList.length > 0 && (
                    <View style={styles.sectionContainer}>
                      <Text variant="label" weight="bold" style={styles.sectionHeader}>Today</Text>
                      {todayList.map(renderNotificationCard)}
                    </View>
                  )}

                  {/* Yesterday Section */}
                  {yesterdayList.length > 0 && (
                    <View style={[styles.sectionContainer, { marginTop: todayList.length > 0 ? 12 : 0 }]}>
                      <Text variant="label" weight="bold" style={styles.sectionHeader}>Yesterday</Text>
                      {yesterdayList.map(renderNotificationCard)}
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
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'ManropeBold',
    fontWeight: '700',
    color: '#1C1B1F',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#8E8D94',
    marginTop: 4,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAF0E8', // Light green tint
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScrollViewContainer: {
    marginBottom: 16,
  },
  filterScrollContent: {
    paddingHorizontal: 24,
    gap: 10,
    alignItems: 'center',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 8,
    borderWidth: 1,
  },
  filterPillActive: {
    backgroundColor: '#3E5C38', // Muted forest green
    borderColor: '#3E5C38',
  },
  filterPillInactive: {
    backgroundColor: '#F3F4F1', // Light cream/grey background
    borderColor: '#EFEFEA',
  },
  filterPillText: {
    fontSize: 14,
    fontFamily: 'InterBold',
    fontWeight: '700',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  filterPillTextInactive: {
    color: '#3A3F37',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 130, // Extra space to not overlap with absolute tab bar
  },
  sectionContainer: {
    gap: 12,
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: 'InterBold',
    fontWeight: '700',
    color: '#4E6542',
    marginTop: 8,
    marginBottom: 4,
  },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#ECEFEA',
    ...Platform.select({
      ios: {
        shadowColor: '#3A3A3A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardTextContainer: {
    flex: 1,
    gap: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'InterBold',
    fontWeight: '700',
    color: '#1C1B1F',
    flex: 1,
  },
  cardTime: {
    fontSize: 11,
    fontFamily: 'Inter',
    color: '#8E8D94',
    marginTop: 2,
  },
  cardBody: {
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#6B6873',
    lineHeight: 18,
    paddingRight: 12,
  },
  unreadDot: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#8E8D94',
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFEA',
  },
  skeletonIcon: {
    width: 44,
    height: 44,
  },
});
