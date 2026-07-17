import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable, Platform, Alert } from 'react-native';
import { Screen, Text, Card, GridSkeleton, ListSkeleton } from '@repo/ui';
import { ScreenBackground } from '@/components/common';
import { useRouter } from 'expo-router';
import {
  Building2,
  Users,
  Shield,
  ClipboardList,
  CreditCard,
  Plus,
  ChevronRight,
  TrendingUp,
  UserCheck,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { api } from '@/lib/axios';

interface AnalyticsData {
  totalResidents: number;
  activeVisitors: number;
  todayEntries: number;
  planStatus: string;
}

interface VisitorRecord {
  id: string;
  name: string;
  flatNumber: string;
  purpose: string;
  status: 'pending' | 'approved' | 'denied' | 'checked_in' | 'checked_out';
  createdAt: string;
}

export default function AdminHomeTab() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalResidents: 0,
    activeVisitors: 0,
    todayEntries: 0,
    planStatus: 'Starter Free',
  });
  const [recentVisitors, setRecentVisitors] = useState<VisitorRecord[]>([]);

  // Haptic feedback helper
  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // ignore
    }
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      // 1. Fetch Analytics
      const analyticsRes = await api.get('/api/admin/analytics');
      if (analyticsRes.data && analyticsRes.data.analytics) {
        setAnalytics(analyticsRes.data.analytics);
      }

      // 2. Fetch Visitor Logs (limit to first 3)
      const visitorsRes = await api.get('/api/admin/visitors');
      if (visitorsRes.data && visitorsRes.data.visitors) {
        setRecentVisitors(visitorsRes.data.visitors.slice(0, 3));
      }
    } catch (err: any) {
      console.warn("Failed to fetch admin dashboard data:", err.message || err);
      // Fallback/mock data for preview in case DB/Server isn't fully configured
      setAnalytics({
        totalResidents: 18,
        activeVisitors: 2,
        todayEntries: 6,
        planStatus: 'Starter Free',
      });
      setRecentVisitors([
        {
          id: '1',
          name: 'Rahul Sharma',
          flatNumber: 'A-702',
          purpose: 'Friend',
          status: 'checked_in',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Zomato Delivery',
          flatNumber: 'B-104',
          purpose: 'Delivery',
          status: 'approved',
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: '3',
          name: 'Urban Company',
          flatNumber: 'C-309',
          purpose: 'Service',
          status: 'denied',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        }
      ]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handlePostNoticePress = () => {
    triggerHaptic();
    router.push('/(admin)/notices-polls');
  };

  const handleViewAllLogs = () => {
    triggerHaptic();
    router.push('/(admin)/visitor-logs');
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <ScreenBackground />

      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Animated.View entering={ZoomIn.duration(400).delay(50)}>
                <Text style={styles.brandText}>Ambit</Text>
              </Animated.View>
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
            </View>

            <View style={styles.greetingSection}>
              <Animated.View entering={FadeIn.duration(350).delay(150)}>
                <Text variant="h2" className="font-bold text-[#11111E]">
                  Society cockpit
                </Text>
              </Animated.View>
              <Text style={styles.descriptionText}>
                Overview of gate activities and resident directory statistics.
              </Text>
            </View>
          </View>

          {/* Quick Stats Grid */}
          {isLoading ? (
            <GridSkeleton />
          ) : (
            <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.grid}>
              <View style={styles.gridRow}>
                {/* Stat 1: Total Residents */}
                <View style={styles.statCard}>
                  <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(74, 85, 104, 0.07)' }]}>
                    <Users size={16} color="#4A5568" strokeWidth={2.2} />
                  </View>
                  <Text style={styles.statNumber}>{analytics.totalResidents}</Text>
                  <Text style={styles.statLabel}>Total Residents</Text>
                </View>

                {/* Stat 2: Active Visitors */}
                <View style={styles.statCard}>
                  <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(74, 85, 104, 0.07)' }]}>
                    <Shield size={16} color="#4A5568" strokeWidth={2.2} />
                  </View>
                  <View style={styles.activeRow}>
                    <Text style={styles.statNumber}>{analytics.activeVisitors}</Text>
                    {analytics.activeVisitors > 0 && <View style={styles.pulseDot} />}
                  </View>
                  <Text style={styles.statLabel}>Active Inside</Text>
                </View>
              </View>

              <View style={styles.gridRow}>
                {/* Stat 3: Today's Entries */}
                <View style={styles.statCard}>
                  <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(74, 85, 104, 0.07)' }]}>
                    <ClipboardList size={16} color="#4A5568" strokeWidth={2.2} />
                  </View>
                  <Text style={styles.statNumber}>{analytics.todayEntries}</Text>
                  <Text style={styles.statLabel}>Today's Logs</Text>
                </View>

                {/* Stat 4: Billing Tier */}
                <View style={styles.statCard}>
                  <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(74, 85, 104, 0.07)' }]}>
                    <CreditCard size={16} color="#4A5568" strokeWidth={2.2} />
                  </View>
                  <Text style={[styles.statNumber, { fontSize: 16, marginTop: 10, marginBottom: 8 }]}>
                    {analytics.planStatus}
                  </Text>
                  <Text style={styles.statLabel}>SaaS Billing Plan</Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Action Row */}
          <Animated.View entering={FadeInUp.duration(400).delay(250)} style={styles.actionRow}>
            <Pressable 
              onPress={handlePostNoticePress}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
              <Text style={styles.actionButtonText}>Post Notice</Text>
            </Pressable>
          </Animated.View>

          {/* Recent Visitor Activity Approvals */}
          <Animated.View entering={FadeInUp.duration(400).delay(300)}>
            <View style={styles.sectionHeader}>
              <Text variant="h3" className="font-bold text-[#11111E]">Recent Entry Actions</Text>
              <Pressable onPress={handleViewAllLogs}>
                <Text style={styles.seeAllText}>See All Logs</Text>
              </Pressable>
            </View>

            <View style={styles.logCard}>
              {isLoading ? (
                <ListSkeleton count={3} />
              ) : recentVisitors.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No recent gate entry actions</Text>
                </View>
              ) : (
                recentVisitors.map((visitor, idx) => (
                  <View key={visitor.id}>
                    <View style={styles.visitorRow}>
                      <View style={styles.visitorAvatar}>
                        <Text style={styles.avatarLetter}>{visitor.name.charAt(0).toUpperCase()}</Text>
                      </View>
                      
                      <View style={styles.visitorDetails}>
                        <Text style={styles.visitorName}>{visitor.name}</Text>
                        <Text style={styles.visitorMeta}>
                          {visitor.purpose} • Flat {visitor.flatNumber}
                        </Text>
                      </View>

                      <View style={[
                        styles.statusBadge,
                        visitor.status === 'checked_in' && styles.statusCheckedIn,
                        visitor.status === 'approved' && styles.statusApproved,
                        visitor.status === 'denied' && styles.statusDenied,
                      ]}>
                        <Text style={[
                          styles.statusBadgeText,
                          visitor.status === 'checked_in' && styles.statusCheckedInText,
                          visitor.status === 'approved' && styles.statusApprovedText,
                          visitor.status === 'denied' && styles.statusDeniedText,
                        ]}>
                          {visitor.status === 'checked_in' ? 'Checked In' : 
                           visitor.status === 'approved' ? 'Approved' : 
                           visitor.status === 'denied' ? 'Denied' : visitor.status}
                        </Text>
                      </View>
                    </View>
                    {idx < recentVisitors.length - 1 && <View style={styles.divider} />}
                  </View>
                ))
              )}
            </View>
          </Animated.View>

        </ScrollView>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 140,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandText: {
    fontFamily: Platform.select({
      ios: 'Snell Roundhand',
      android: 'cursive',
      default: 'serif',
    }),
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
  },
  adminBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(95, 103, 236, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(95, 103, 236, 0.25)',
  },
  adminBadgeText: {
    fontSize: 10,
    fontFamily: 'InterBold',
    color: '#5F67EC',
    letterSpacing: 1.2,
  },
  greetingSection: {
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 14,
    color: '#5E5D6A',
    fontFamily: 'Inter',
    lineHeight: 18,
    marginTop: 4,
  },
  grid: {
    gap: 12,
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  statIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#1C1B1F',
    lineHeight: 30,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'InterMedium',
    color: '#8E8D94',
    marginTop: 2,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7A9B76',
    marginTop: 2,
  },
  actionRow: {
    marginBottom: 28,
  },
  actionButton: {
    backgroundColor: '#2E7D32',
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'InterBold',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  seeAllText: {
    fontSize: 12,
    fontFamily: 'InterBold',
    color: '#2E7D32',
  },
  logCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  visitorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  visitorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(74, 85, 104, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    fontSize: 16,
    fontFamily: 'ManropeBold',
    color: '#4A5568',
    fontWeight: 'bold',
  },
  visitorDetails: {
    flex: 1,
    paddingRight: 6,
  },
  visitorName: {
    fontSize: 14.5,
    fontFamily: 'InterBold',
    color: '#1C1B1F',
  },
  visitorMeta: {
    fontSize: 11.5,
    fontFamily: 'Inter',
    color: '#8E8D94',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontFamily: 'InterBold',
    color: '#8E8D94',
  },
  statusCheckedIn: {
    backgroundColor: 'rgba(122, 155, 118, 0.12)',
  },
  statusCheckedInText: {
    color: '#7A9B76',
  },
  statusApproved: {
    backgroundColor: 'rgba(122, 155, 118, 0.12)',
  },
  statusApprovedText: {
    color: '#7A9B76',
  },
  statusDenied: {
    backgroundColor: 'rgba(193, 88, 75, 0.12)',
  },
  statusDeniedText: {
    color: '#C1584B',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(28, 27, 31, 0.08)',
    marginVertical: 4,
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#8E8D94',
  },
});
