import React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { Screen, Text, GridSkeleton } from '@repo/ui';
import { ScreenBackground, AppSectionCard, AppListItem, BadgeIconWrapper, StatusModal } from '@/components/common';
import { type, uiStyles } from '@/theme';
import { useRouter } from 'expo-router';
import { useNotificationStore } from '@/store';
import {
  Bell,
  Users,
  Building2,
  LayoutGrid,
  Megaphone,
  CheckCircle,
  MessageSquare,
  Briefcase,
  Plus,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/axios';
import { NotificationService } from '@/services/NotificationService';
import { notifications } from '@/services/notifications';


type SocietyStats = {
  residents: number;
  towers: number;
  flats: number;
  staff: number;
};

const MANAGEMENT = [
  {
    id: 'residents',
    title: 'Residents',
    subtitle: 'Manage residents & flats',
    Icon: Users,
    route: '/(admin)/manage-members' as const,
  },
  {
    id: 'towers',
    title: 'Towers & Flats',
    subtitle: 'Manage towers and flats',
    Icon: Building2,
    route: '/(admin)/society-settings' as const,
  },
  {
    id: 'amenities',
    title: 'Amenities',
    subtitle: 'Manage amenities & bookings',
    Icon: LayoutGrid,
    route: '/(admin)/amenities' as const,
  },
  {
    id: 'notices',
    title: 'Notices',
    subtitle: 'Create and manage notices',
    Icon: Megaphone,
    route: '/(admin)/notices-polls' as const,
  },
  {
    id: 'polls',
    title: 'Polls',
    subtitle: 'Create polls and view results',
    Icon: CheckCircle,
    route: '/(admin)/notices-polls' as const,
  },
  {
    id: 'complaints',
    title: 'Complaints',
    subtitle: 'Manage all helpdesk tickets',
    Icon: MessageSquare,
    route: '/(admin)/complaints' as const,
  },
  {
    id: 'staff',
    title: 'Staff & Service Providers',
    subtitle: 'Manage staff and service providers',
    Icon: Briefcase,
    route: '/(admin)/staff-directory' as const,
  },
];

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

export default function AdminHomeTab() {
  const router = useRouter();
  const isAddingRef = React.useRef(false);
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotificationStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [statusModal, setStatusModal] = React.useState<{
    visible: boolean;
    type: 'success' | 'error';
    title: string;
    description: string;
  }>({
    visible: false,
    type: 'success',
    title: '',
    description: '',
  });
  const [stats, setStats] = React.useState<SocietyStats>({
    residents: 256,
    towers: 4,
    flats: 512,
    staff: 18,
  });

  const fetchDashboard = React.useCallback(async () => {
    try {
      const [analyticsRes, notifs] = await Promise.all([
        api.get('/api/admin/analytics').catch(() => null),
        NotificationService.getNotifications().catch(() => []),
      ]);

      if (analyticsRes?.data?.analytics) {
        const a = analyticsRes.data.analytics;
        setStats((prev) => ({
          residents: a.totalResidents ?? prev.residents,
          towers: a.towers ?? prev.towers,
          flats: a.flats ?? prev.flats,
          staff: a.staff ?? prev.staff,
        }));
      }

      if (Array.isArray(notifs)) {
        const unread = notifs.filter((n) => !n.isRead).length;
        useNotificationStore.getState().setUnreadCount(unread);
      }
    } catch {
      // keep mock / previous values for preview
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  React.useEffect(() => {
    // Register device for push notifications
    notifications.registerForPushNotificationsAsync();

    // Set up listeners for foreground push notification reception
    const cleanup = notifications.setupListeners();
    return () => {
      cleanup();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const handleManagePress = (item: (typeof MANAGEMENT)[number]) => {
    if (isAddingRef.current) {
      isAddingRef.current = false;
      return;
    }
    triggerHaptic();
    router.push(item.route);
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
          }
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={uiStyles.header}>
            <View style={{ width: 46 }} />
            <Text variant="h3" weight="bold" style={type.navTitle}>
              Admin Dashboard
            </Text>
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

          {/* Society Overview */}
          <Animated.View entering={FadeInUp.duration(400).delay(80)}>
            <AppSectionCard label="Society Overview">
              {isLoading ? (
                <GridSkeleton />
              ) : (
                <View style={uiStyles.overviewGrid}>
                  {(
                    [
                      ['Residents', stats.residents, Users],
                      ['Towers', stats.towers, Building2],
                      ['Flats', stats.flats, LayoutGrid],
                      ['Staff', stats.staff, Briefcase],
                    ] as const
                  ).map(([label, value, StatIcon]) => (
                    <View key={label} style={uiStyles.overviewStatTile}>
                      <View style={uiStyles.statIconBadge}>
                        <StatIcon size={18} color="#4A5568" strokeWidth={2.2} />
                      </View>
                      <View style={uiStyles.statTextGroup}>
                        <Text variant="h2" weight="bold" style={type.statSm}>
                          {value}
                        </Text>
                        <Text variant="caption" weight="medium" style={type.statLabelDark}>
                          {label}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </AppSectionCard>
          </Animated.View>

          {/* Management Section */}
          <Animated.View entering={FadeInUp.duration(400).delay(140)}>
            <AppSectionCard label="Management">
              {MANAGEMENT.map((item, idx) => {
                const isAmenities = item.id === 'amenities';
                return (
                  <AppListItem
                    key={item.id}
                    Icon={item.Icon}
                    title={item.title}
                    subtitle={item.subtitle}
                    onPress={() => handleManagePress(item)}
                    isLast={idx === MANAGEMENT.length - 1}
                    rightElement={
                      isAmenities ? (
                        <Pressable
                          style={({ pressed }) => [
                            uiStyles.addBtn,
                            {
                              backgroundColor: '#E8F5E9',
                              paddingHorizontal: 10,
                              paddingVertical: 5,
                              borderRadius: 8,
                            },
                            pressed && { opacity: 0.7 },
                          ]}
                          onPress={() => {
                            isAddingRef.current = true;
                            triggerHaptic();
                            router.push('/(admin)/amenity-form');
                          }}
                        >
                          <Plus size={12} color="#2E7D32" strokeWidth={3} style={{ marginRight: 3 }} />
                          <Text variant="caption" weight="bold" style={{ color: '#2E7D32' }}>
                            Add
                          </Text>
                        </Pressable>
                      ) : undefined
                    }
                  />
                );
              })}
            </AppSectionCard>
          </Animated.View>
        </ScrollView>
      </Screen>

      {/* Status Feedback Modal */}
      <StatusModal
        visible={statusModal.visible}
        type={statusModal.type}
        title={statusModal.title}
        description={statusModal.description}
        onClose={() => setStatusModal((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}