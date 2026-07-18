import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { Screen, Text, ListSkeleton } from '@repo/ui';
import { ScreenBackground, AppSectionCard, AppListItem } from '@/components/common';
import { type, uiStyles } from '@/theme';
import { useRouter } from 'expo-router';
import {
  Bell,
  UserCheck,
  UserPlus,
  Calendar,
  MessageSquare,
  Megaphone,
  CheckCircle,
  Droplets,
  Sun,
} from 'lucide-react-native';
import RAnimated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '@/lib/axios';
import { Booking } from '@/features/bookings/api';
import { NotificationDrawer } from './NotificationDrawer';

interface Notice {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

const QUICK_ACTIONS = [
  {
    id: 'approvals',
    title: 'Visitor Approvals',
    subtitle: 'Review & approve guests',
    Icon: UserCheck,
    badge: 2,
    route: '/(resident)/visitor-approvals' as const,
  },
  {
    id: 'preapprove',
    title: 'Pre-Approve Guest',
    subtitle: 'Send instant gate pass',
    Icon: UserPlus,
    route: '/(resident)/preapprove-guest' as const,
  },
  {
    id: 'amenity',
    title: 'Amenity Booking',
    subtitle: 'Reserve clubhouse & sports',
    Icon: Calendar,
    route: '/(resident)/(tabs)/bookings' as const,
  },
  {
    id: 'complaint',
    title: 'Raise Complaint',
    subtitle: 'Log maintenance tickets',
    Icon: MessageSquare,
    route: '/(resident)/(tabs)/complaints' as const,
  },
  {
    id: 'notices',
    title: 'Society Notices',
    subtitle: 'Announcements & updates',
    Icon: Megaphone,
    route: '/(resident)/(tabs)/notices' as const,
  },
  {
    id: 'polls',
    title: 'Community Polls',
    subtitle: 'Vote on society decisions',
    Icon: CheckCircle,
    route: '/(resident)/polls' as const,
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function firstName(name?: string | null) {
  if (!name) return 'Resident';
  return name.split(' ')[0];
}

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

export function Overview() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifDrawerVisible, setNotifDrawerVisible] = useState(false);
  const greeting = getGreeting();

  const loadDashboard = useCallback(async () => {
    try {
      const [noticesRes, bookingsRes, notifsRes] = await Promise.all([
        api.get('/api/notices'),
        api.get('/api/bookings').catch(() => ({ data: { bookings: [] } })),
        api.get('/api/notifications').catch(() => ({ data: { notifications: [] } })),
      ]);

      setNotices(noticesRes.data?.notices || []);
      setBookings(bookingsRes.data?.bookings || []);
      setNotificationsList(notifsRes.data?.notifications || []);
    } catch (err) {
      console.warn('Failed to load overview metrics:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const openDrawer = () => {
    triggerHaptic();
    setNotifDrawerVisible(true);
  };

  const closeDrawer = () => {
    triggerHaptic();
    setNotifDrawerVisible(false);
  };

  const handleMarkAllRead = async () => {
    triggerHaptic();
    try {
      await api.post('/api/notifications/read-all');
      setNotificationsList(notificationsList.map((n) => ({ ...n, isRead: true })));
    } catch {
      Alert.alert('Error', 'Could not clear notifications');
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    triggerHaptic();
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotificationsList(notificationsList.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // Local fallback
    }
  };

  const unreadCount = notificationsList.filter((n) => !n.isRead).length;

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <ScrollView
          contentContainerStyle={[
            uiStyles.scroll,
            { paddingTop: insets.top + 12, paddingBottom: 120 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
          }
        >
          {/* Header */}
          <RAnimated.View entering={FadeIn.duration(300)} style={uiStyles.header}>
            <View style={{ flex: 1, paddingRight: 12, gap: 2 }}>
              <Text variant="h2" weight="bold" style={type.greeting}>
                Hi, {firstName(user?.name)} 👋
              </Text>
              <Text variant="body" style={type.greetingSub}>
                Welcome back!
              </Text>
            </View>
            <Pressable onPress={openDrawer} style={uiStyles.iconBtn} hitSlop={12}>
              <Bell size={24} color="#11111E" strokeWidth={2.2} />
              {unreadCount > 0 && <View style={uiStyles.notifDot} />}
            </Pressable>
          </RAnimated.View>

          {/* Hero Card */}
          <RAnimated.View entering={FadeInUp.duration(400).delay(60)} style={uiStyles.heroCard}>
            <LinearGradient
              colors={['#E8F5E9', '#C8E6C9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={uiStyles.heroIconBadge}>
              <Sun size={24} color="#1B4332" strokeWidth={2} />
            </View>
            <View style={uiStyles.heroContent}>
              <Text variant="h3" weight="bold" style={type.heroTitle}>
                {greeting} ☀️
              </Text>
              <Text variant="caption" style={type.heroBody}>
                Have a great day! Your society day at a glance.
              </Text>
            </View>
          </RAnimated.View>

          {/* Quick Actions */}
          <RAnimated.View entering={FadeInUp.duration(400).delay(120)}>
            <AppSectionCard label="Quick Actions">
              {QUICK_ACTIONS.map((action, idx) => (
                <AppListItem
                  key={action.id}
                  Icon={action.Icon}
                  title={action.title}
                  subtitle={action.subtitle}
                  badge={action.badge}
                  onPress={() => {
                    if (action.route) router.push(action.route);
                  }}
                  isLast={idx === QUICK_ACTIONS.length - 1}
                />
              ))}
            </AppSectionCard>
          </RAnimated.View>

          {/* Dynamic Society Notices */}
          <RAnimated.View entering={FadeInUp.duration(400).delay(180)}>
            <AppSectionCard
              label="Society Notices"
              rightAction={
                <Pressable onPress={() => router.push('/(resident)/(tabs)/notices')}>
                  <Text variant="label" weight="semibold" style={type.link}>
                    View All
                  </Text>
                </Pressable>
              }
            >
              {isLoading ? (
                <ListSkeleton count={1} />
              ) : notices.length === 0 ? (
                <AppListItem
                  Icon={Megaphone}
                  title="No active notices"
                  subtitle="Everything is quiet in the society today."
                  isLast
                />
              ) : (
                notices.slice(0, 2).map((notice, idx) => (
                  <AppListItem
                    key={notice.id}
                    Icon={notice.category === 'Maintenance' ? Droplets : Megaphone}
                    iconColor={notice.category === 'Maintenance' ? '#2563EB' : '#D97706'}
                    iconBg={notice.category === 'Maintenance' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(217, 119, 6, 0.1)'}
                    title={notice.title}
                    subtitle={notice.description}
                    valueText={new Date(notice.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    onPress={() => router.push('/(resident)/(tabs)/notices')}
                    isLast={idx === Math.min(notices.length, 2) - 1}
                  />
                ))
              )}
            </AppSectionCard>
          </RAnimated.View>

          {/* Dynamic Upcoming Bookings */}
          <RAnimated.View entering={FadeInUp.duration(400).delay(240)}>
            <AppSectionCard label="Upcoming Bookings">
              {isLoading ? (
                <ListSkeleton count={1} />
              ) : bookings.length === 0 ? (
                <AppListItem
                  Icon={Calendar}
                  title="No upcoming reservations"
                  subtitle="Reserve amenities using the Bookings tab."
                  onPress={() => router.push('/(resident)/(tabs)/bookings')}
                  isLast
                />
              ) : (
                bookings.slice(0, 2).map((bk, idx) => {
                  const dateStr = new Date(bk.startTime).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  });
                  return (
                    <AppListItem
                      key={bk.id}
                      Icon={Calendar}
                      title={bk.amenityName}
                      subtitle={`${dateStr} · ${new Date(bk.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      onPress={() => router.push('/(resident)/(tabs)/bookings')}
                      isLast={idx === Math.min(bookings.length, 2) - 1}
                    />
                  );
                })
              )}
            </AppSectionCard>
          </RAnimated.View>
        </ScrollView>
      </Screen>

      {/* Notification Right-Side Drawer */}
      <NotificationDrawer
        visible={notifDrawerVisible}
        onClose={closeDrawer}
        notificationsList={notificationsList}
        unreadCount={unreadCount}
        handleMarkAllRead={handleMarkAllRead}
        handleMarkSingleRead={handleMarkSingleRead}
        insetsTop={insets.top}
        insetsBottom={insets.bottom}
      />
    </View>
  );
}
