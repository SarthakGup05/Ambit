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
import {
  Bell,
  ArrowLeft,
  CheckCheck,
  UserCheck,
  FileText,
  Calendar,
  Megaphone,
  Clock,
  Car,
  ShieldAlert,
  Inbox,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNotificationStore } from '@/store';
import { NotificationService } from '@/services/NotificationService';
import Animated, { FadeInUp } from 'react-native-reanimated';

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

interface UINotification {
  id: string;
  title: string;
  body: string;
  category: string;
  time: string;
  isRead: boolean;
  Icon: any;
  iconColor: string;
  bgColor: string;
  route: string | null;
}

function getRoleNotificationMeta(title: string, role: string) {
  const t = title.toLowerCase();

  if (role === 'admin') {
    if (t.includes('approval') || t.includes('request') || t.includes('member') || t.includes('resident')) {
      return {
        category: 'Approvals',
        Icon: UserCheck,
        iconColor: '#059669',
        bgColor: '#ECFDF5',
        route: '/(admin)/manage-members' as const,
      };
    }
    if (t.includes('complaint') || t.includes('helpdesk')) {
      return {
        category: 'Complaints',
        Icon: FileText,
        iconColor: '#D97706',
        bgColor: '#FEF3C7',
        route: '/(admin)/complaints' as const,
      };
    }
    if (t.includes('amenity') || t.includes('booking') || t.includes('clubhouse')) {
      return {
        category: 'Approvals',
        Icon: Calendar,
        iconColor: '#2563EB',
        bgColor: '#DBEAFE',
        route: '/(admin)/amenities' as const,
      };
    }
    return {
      category: 'Others',
      Icon: Megaphone,
      iconColor: '#6366F1',
      bgColor: '#EEF2FF',
      route: '/(admin)/notices-polls' as const,
    };
  }

  if (role === 'guard') {
    if (t.includes('overstay') || t.includes('limit')) {
      return {
        category: 'Overstays',
        Icon: Clock,
        iconColor: '#EF4444',
        bgColor: '#FEE2E2',
        route: '/(guard)/(tabs)/logs' as const,
      };
    }
    if (t.includes('pre-approved') || t.includes('guest') || t.includes('visitor')) {
      return {
        category: 'Pre-Approvals',
        Icon: UserCheck,
        iconColor: '#059669',
        bgColor: '#ECFDF5',
        route: '/(guard)/(tabs)/visitors' as const,
      };
    }
    if (t.includes('intercom') || t.includes('gate') || t.includes('security') || t.includes('outage')) {
      return {
        category: 'Gate Alerts',
        Icon: ShieldAlert,
        iconColor: '#EF4444',
        bgColor: '#FEE2E2',
        route: null,
      };
    }
    return {
      category: 'Gate Alerts',
      Icon: Bell,
      iconColor: '#64748B',
      bgColor: '#F1F5F9',
      route: null,
    };
  }

  // Resident defaults
  if (t.includes('visitor') || t.includes('approval') || t.includes('request')) {
    return {
      category: 'Requests',
      Icon: UserCheck,
      iconColor: '#2E7D32',
      bgColor: '#EAF0E8',
      route: '/(resident)/(tabs)/visitors' as const,
    };
  }
  return {
    category: 'Others',
    Icon: Bell,
    iconColor: '#2E7D32',
    bgColor: '#EAF0E8',
    route: null,
  };
}

function formatNotificationTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const role = user?.role || 'admin';
  const setUnreadCount = useNotificationStore(state => state.setUnreadCount);

  const [notifications, setNotifications] = useState<UINotification[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const filters = role === 'guard'
    ? ['All', 'Pre-Approvals', 'Overstays', 'Gate Alerts']
    : ['All', 'Approvals', 'Complaints', 'Others'];

  const loadData = useCallback(async () => {
    try {
      const list = await NotificationService.getNotifications();
      const mapped = list.map((item: any) => {
        const meta = getRoleNotificationMeta(item.title, role);
        return {
          id: item.id,
          title: item.title,
          body: item.body,
          isRead: item.isRead,
          createdAt: item.createdAt,
          time: formatNotificationTime(item.createdAt),
          category: meta.category,
          Icon: meta.Icon,
          iconColor: meta.iconColor,
          bgColor: meta.bgColor,
          route: meta.route,
        };
      });
      setNotifications(mapped);
      setUnreadCount(mapped.filter(n => !n.isRead).length);
    } catch (err: any) {
      console.warn('Failed to load notifications:', err.message || err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [role, setUnreadCount]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      loadData();
    });
    return () => task.cancel();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    triggerHaptic();
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleMarkAllRead = async () => {
    triggerHaptic();
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      Alert.alert('Success', 'All notifications marked as read.');
    } catch (err: any) {
      const message = err.message || 'Failed to mark all as read';
      Alert.alert('Error', message);
    }
  };

  const handleNotificationPress = async (item: UINotification) => {
    triggerHaptic();
    try {
      if (!item.isRead) {
        await NotificationService.markAsRead(item.id);
        setNotifications(prev =>
          prev.map(n => (n.id === item.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(Math.max(0, notifications.filter(n => !n.isRead).length - 1));
      }
      if (item.route) {
        router.push(item.route as any);
      }
    } catch (err: any) {
      console.warn('Failed to mark notification as read:', err.message);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    return n.category === activeFilter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        {/* Custom Navigation Header */}
        <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            onPress={() => {
              triggerHaptic();
              router.back();
            }}
          >
            <ArrowLeft size={20} color="#1E293B" strokeWidth={2.5} />
          </Pressable>

          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up'}
            </Text>
          </View>

          {unreadCount > 0 && (
            <Pressable
              style={({ pressed }) => [styles.markReadBtn, pressed && { opacity: 0.7 }]}
              onPress={handleMarkAllRead}
            >
              <CheckCheck size={20} color="#059669" strokeWidth={2.2} />
            </Pressable>
          )}
        </View>

        {/* Filter Chips Scrollbar */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {filters.map(filter => {
              const isActive = activeFilter === filter;
              return (
                <Pressable
                  key={filter}
                  onPress={() => {
                    triggerHaptic();
                    setActiveFilter(filter);
                  }}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Notifications list */}
        {isLoading ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listScroll}>
            {Array.from({ length: 3 }).map((_, idx) => (
              <View key={idx} style={styles.skeletonCard}>
                <View style={styles.cardContentRow}>
                  <Skeleton style={styles.skeletonIcon} borderRadius={10} />
                  <View style={styles.cardTextContainer}>
                    <View style={styles.cardHeaderRow}>
                      <Skeleton style={{ height: 16, width: '55%', borderRadius: 4 }} />
                      <Skeleton style={{ height: 12, width: '15%', borderRadius: 4 }} />
                    </View>
                    <Skeleton style={{ height: 14, width: '85%', marginTop: 8, borderRadius: 4 }} />
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listScroll}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#0C831F"
              />
            }
          >
            {filteredNotifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Inbox size={48} color="#94A3B8" strokeWidth={1.5} />
                <Text style={styles.emptyTitle}>No Notifications</Text>
                <Text style={styles.emptyDesc}>
                  There are no {activeFilter !== 'All' ? activeFilter.toLowerCase() : ''} notifications at this moment.
                </Text>
              </View>
            ) : (
              filteredNotifications.map((item, index) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInUp.duration(400).delay(index * 60)}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.cardContainer,
                      !item.isRead && styles.cardContainerUnread,
                      pressed && { opacity: 0.95 },
                    ]}
                    onPress={() => handleNotificationPress(item)}
                  >
                    {/* Left Icon */}
                    <View style={[styles.iconWrapper, { backgroundColor: item.bgColor }]}>
                      <item.Icon size={18} color={item.iconColor} strokeWidth={2.2} />
                    </View>

                    {/* Text Contents */}
                    <View style={styles.cardDetails}>
                      <View style={styles.cardHeader}>
                        <Text
                          style={[
                            styles.cardTitleText,
                            !item.isRead && styles.cardTitleTextUnread,
                          ]}
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text style={styles.cardTimeText}>{item.time}</Text>
                      </View>

                      <Text style={styles.cardBodyText} numberOfLines={2}>
                        {item.body}
                      </Text>
                    </View>

                    {/* Indicator Dot */}
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </Pressable>
                </Animated.View>
              ))
            )}
          </ScrollView>
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFF',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitles: {
    flex: 1,
    marginLeft: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  markReadBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  filtersWrapper: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filtersScroll: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#0C831F',
    borderColor: '#0C831F',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  listScroll: {
    padding: 20,
    gap: 12,
    paddingBottom: 60,
  },
  cardContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContainerUnread: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FAFC',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  cardTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    flex: 1,
  },
  cardTitleTextUnread: {
    color: '#0F172A',
    fontWeight: '800',
  },
  cardTimeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  cardBodyText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  unreadDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 18,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  skeletonIcon: {
    width: 38,
    height: 38,
  },
  cardTextContainer: {
    flex: 1,
    gap: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
