import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  StyleSheet,
  Platform,
  Alert,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
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
  X,
  Inbox,
  Check,
} from 'lucide-react-native';
import RAnimated, { FadeIn, FadeInUp } from 'react-native-reanimated';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.82;
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '@/lib/axios';
import { Booking } from '@/features/bookings/api';

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

function getNotificationMetadata(title: string) {
  const t = title.toLowerCase();
  if (t.includes('visitor') || t.includes('guest') || t.includes('gate') || t.includes('check-in') || t.includes('checked')) {
    return {
      Icon: UserCheck,
      color: '#2E7D32',
      bg: 'rgba(46, 125, 50, 0.08)',
    };
  }
  if (t.includes('notice') || t.includes('maintenance') || t.includes('power') || t.includes('office') || t.includes('announcement')) {
    return {
      Icon: Megaphone,
      color: '#2563EB',
      bg: 'rgba(37, 99, 235, 0.08)',
    };
  }
  if (t.includes('complaint') || t.includes('ticket') || t.includes('resolved') || t.includes('elevator') || t.includes('issue')) {
    return {
      Icon: MessageSquare,
      color: '#DC2626',
      bg: 'rgba(220, 38, 38, 0.08)',
    };
  }
  return {
    Icon: Bell,
    color: '#64748B',
    bg: 'rgba(100, 116, 139, 0.08)',
  };
}


export function Overview() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const drawerAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
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
    Animated.parallel([
      Animated.spring(drawerAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 180,
        mass: 0.8,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    triggerHaptic();
    Animated.parallel([
      Animated.timing(drawerAnim, {
        toValue: DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setNotifDrawerVisible(false));
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
      {notifDrawerVisible && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
          {/* Blurred backdrop */}
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                styles.backdrop,
                { opacity: backdropAnim },
              ]}
            />
          </TouchableWithoutFeedback>

          {/* Sliding panel from right */}
          <Animated.View
            style={[
              styles.sideDrawer,
              {
                transform: [{ translateX: drawerAnim }],
                paddingTop: insets.top + 12,
                paddingBottom: insets.bottom + 16,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.notifTitleRow}>
                <Pressable onPress={closeDrawer} style={styles.closeDrawerBtn} hitSlop={10}>
                  <X size={20} color="#4A5568" strokeWidth={2.2} />
                </Pressable>
                <Text style={styles.drawerTitle}>Notifications</Text>
              </View>
              {unreadCount > 0 && (
                <View style={styles.drawerHeaderRight}>
                  <View style={styles.badgeCount}>
                    <Text style={styles.badgeCountText}>{unreadCount} New</Text>
                  </View>
                  <Pressable onPress={handleMarkAllRead} style={styles.clearAllBtn}>
                    <Check size={13} color="#2E7D32" style={{ marginRight: 4 }} />
                    <Text style={styles.clearAllText}>All read</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Divider */}
            <View style={styles.drawerDivider} />

            {/* Notification list */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
            >
              {notificationsList.length === 0 ? (
                <View style={styles.emptyInbox}>
                  <Inbox size={42} color="#A3A1A8" strokeWidth={1.5} />
                  <Text style={uiStyles.emptyText}>You are all caught up!</Text>
                </View>
              ) : (
                notificationsList.map((item) => {
                  const meta = getNotificationMetadata(item.title);
                  const Icon = meta.Icon;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => handleMarkSingleRead(item.id)}
                      style={({ pressed }) => [
                        styles.notifCard,
                        { borderLeftColor: meta.color },
                        !item.isRead && styles.notifCardUnread,
                        pressed && { opacity: 0.75 },
                      ]}
                    >
                      <View style={styles.notifCardTop}>
                        <View style={[styles.iconWrapper, { backgroundColor: meta.bg }]}>
                          <Icon size={14} color={meta.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.notifTitle,
                              !item.isRead && styles.notifTitleBold,
                            ]}
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>
                          <Text style={styles.notifTime}>
                            {new Date(item.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                        {!item.isRead && <View style={styles.bulletUnread} />}
                      </View>
                      <Text style={styles.notifBody}>{item.body}</Text>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Backdrop (dimmed translucent overlay behind drawer)
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },

  // Side drawer panel (right edge)
  sideDrawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#F8FAF8',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 20,
  },

  // Drawer header row
  drawerHeader: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  closeDrawerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.045)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerTitle: {
    fontSize: 18,
    fontFamily: 'ManropeBold',
    color: '#1C1B1F',
    fontWeight: 'bold',
  },
  drawerHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeCount: {
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeCountText: {
    fontSize: 10,
    fontFamily: 'InterBold',
    color: '#2E7D32',
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(46, 125, 50, 0.06)',
  },
  clearAllText: {
    fontSize: 11,
    fontFamily: 'InterBold',
    color: '#2E7D32',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginHorizontal: 20,
    marginBottom: 4,
  },

  // Empty inbox state
  emptyInbox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },

  // Notification card
  notifCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    gap: 4,
  },
  notifCardUnread: {
    backgroundColor: 'rgba(46, 125, 50, 0.03)',
    borderColor: 'rgba(46, 125, 50, 0.08)',
  },
  notifCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletPoint: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#CBD5E1',
    flexShrink: 0,
  },
  bulletUnread: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
    marginRight: 4,
  },
  notifTitle: {
    fontSize: 13.5,
    fontFamily: 'InterMedium',
    color: '#475569',
    flex: 1,
  },
  notifTitleBold: {
    fontFamily: 'InterBold',
    color: '#1E293B',
  },
  notifBody: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#64748B',
    lineHeight: 17,
    paddingLeft: 38,
  },
  notifTime: {
    fontSize: 10,
    fontFamily: 'Inter',
    color: '#94A3B8',
    marginTop: 2,
  },
});
