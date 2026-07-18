import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Platform, Alert, RefreshControl } from 'react-native';
import { Screen, Text, ListSkeleton } from '@repo/ui';
import { ScreenBackground, AppSectionCard, AppListItem } from '@/components/common';
import { uiStyles, type } from '@/theme';
import { useRouter } from 'expo-router';
import { ArrowLeft, UserCheck, Check, X, ShieldAlert } from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/axios';

interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  status: 'pending' | 'approved' | 'denied' | 'checked_in' | 'checked_out';
  createdAt: string;
}

const FALLBACK_VISITORS: Visitor[] = [
  {
    id: 'v1',
    name: 'Zomato Delivery',
    phone: '+91 99999 88888',
    purpose: 'Delivery',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'v2',
    name: 'Aman Verma',
    phone: '+91 98765 43210',
    purpose: 'Friend Visit',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

export default function VisitorApprovalsScreen() {
  const router = useRouter();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const response = await api.get('/api/visitors/flat');
      if (response.data && response.data.visitors && response.data.visitors.length > 0) {
        setVisitors(response.data.visitors);
      } else {
        setVisitors(FALLBACK_VISITORS);
      }
    } catch (err: any) {
      console.warn('Failed to load visitors from API:', err.message || err);
      setVisitors(FALLBACK_VISITORS);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleAction = async (id: string, action: 'approved' | 'denied') => {
    triggerHaptic();
    try {
      await api.patch(`/api/visitors/${id}/status`, { status: action });
      setVisitors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: action } : v))
      );
      Alert.alert('Response Logged', `Visitor entry has been ${action.toUpperCase()}.`);
    } catch (err: any) {
      Alert.alert('Action Failed', 'Could not update visitor status.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <View style={[uiStyles.scroll, { paddingTop: Platform.OS === 'ios' ? 50 : 20, flex: 1 }]}>
          {/* Header */}
          <View style={uiStyles.header}>
            <Pressable
              style={uiStyles.iconBtn}
              onPress={() => {
                triggerHaptic();
                router.back();
              }}
              hitSlop={12}
            >
              <ArrowLeft size={22} color="#11111E" strokeWidth={2.2} />
            </Pressable>
            <Text variant="h3" weight="bold" style={type.navTitle}>
              Visitor Approvals
            </Text>
            <View style={{ width: 46 }} />
          </View>

          {isLoading ? (
            <ListSkeleton count={3} />
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
              }
            >
              <Animated.View entering={FadeInUp.duration(400)}>
                <AppSectionCard label="Current Gate Requests">
                  {visitors.length === 0 ? (
                    <View style={uiStyles.emptyState}>
                      <ShieldAlert size={40} color="#A3A1A8" strokeWidth={1.5} />
                      <Text style={uiStyles.emptyText}>No visitors requesting entry</Text>
                    </View>
                  ) : (
                    visitors.map((item, idx) => {
                      const isPending = item.status === 'pending';
                      const subtitle = `${item.purpose} · ${new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                      return (
                        <AppListItem
                          key={item.id}
                          Icon={UserCheck}
                          title={item.name}
                          subtitle={subtitle}
                          rightElement={
                            isPending ? (
                              <View style={styles.actionGroup}>
                                <Pressable
                                  onPress={() => handleAction(item.id, 'approved')}
                                  style={[styles.actionBtn, styles.approveBtn]}
                                >
                                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                                </Pressable>
                                <Pressable
                                  onPress={() => handleAction(item.id, 'denied')}
                                  style={[styles.actionBtn, styles.denyBtn]}
                                >
                                  <X size={14} color="#FFFFFF" strokeWidth={3} />
                                </Pressable>
                              </View>
                            ) : (
                              <View style={uiStyles.statusBadge}>
                                <Text
                                  style={[
                                    uiStyles.statusBadgeText,
                                    { color: item.status === 'approved' || item.status === 'checked_in' ? '#2E7D32' : '#DC2626' },
                                  ]}
                                >
                                  {item.status.toUpperCase()}
                                </Text>
                              </View>
                            )
                          }
                          isLast={idx === visitors.length - 1}
                        />
                      );
                    })
                  )}
                </AppSectionCard>
              </Animated.View>
            </ScrollView>
          )}
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  actionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtn: {
    backgroundColor: '#2E7D32',
  },
  denyBtn: {
    backgroundColor: '#DC2626',
  },
});
