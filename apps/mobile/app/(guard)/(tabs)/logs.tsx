import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { Screen, Text, ListSkeleton } from '@repo/ui';
import { ScreenBackground, AppSectionCard, useToast, AppEmptyState, CustomSpinner } from '@/components/common';
import { type, uiStyles } from '@/theme';
import { VisitorService, Visitor } from '@/services/VisitorService';
import { useVisitorStore } from '@/store';
import {
  ClipboardList,
  LogOut,
  Clock,
  Package,
  User,
  Car,
  Wrench,
  CheckCircle2,
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function triggerHaptic(style = Haptics.ImpactFeedbackStyle.Light) {
  try {
    Haptics.impactAsync(style).catch(() => {});
  } catch {
    // ignore
  }
}

type FilterType = 'all' | 'checked_in' | 'checked_out' | 'pending';

function getPurposeIcon(purpose: string) {
  const p = purpose.toLowerCase();
  if (p.includes('delivery') || p.includes('amazon') || p.includes('swiggy')) return Package;
  if (p.includes('cab') || p.includes('uber') || p.includes('ola')) return Car;
  if (p.includes('service') || p.includes('worker')) return Wrench;
  return User;
}

export default function GuardLogsTab() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [filter, setFilter] = useState<FilterType>('all');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    try {
      const data = await VisitorService.getSocietyVisitors(filter);
      setVisitors(data.visitors);
    } catch (err) {
      console.warn('Failed to load visitor logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    loadLogs();
  }, [loadLogs]);

  const onRefresh = () => {
    triggerHaptic();
    setRefreshing(true);
    loadLogs();
  };

  const handleCheckOut = async (visitor: Visitor) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setCheckingOutId(visitor.id);
    try {
      const updated = await VisitorService.checkoutVisitor(visitor.id);
      useVisitorStore.getState().checkoutVisitorLocal(visitor.id, updated?.checkOutTime);
      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
      const outTime = new Date(updated?.checkOutTime || Date.now()).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const msg = `Checked out ${visitor.name} (Flat ${visitor.flatNumber}) at ${outTime}`;
      toast.success('Visitor Checked Out', msg);
      setVisitors((prev) =>
        prev.map((v) =>
          v.id === visitor.id
            ? { ...v, status: 'checked_out', checkOutTime: updated?.checkOutTime || new Date().toISOString() }
            : v
        )
      );
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Could not check out visitor';
      toast.error('Check-out Failed', String(errorMsg));
    } finally {
      setCheckingOutId(null);
    }
  };

  const FILTERS: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All Logs' },
    { id: 'checked_in', label: 'Inside Gate' },
    { id: 'checked_out', label: 'Exited' },
    { id: 'pending', label: 'Pending' },
  ];

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <View style={[styles.headerContainer, { paddingTop: insets.top + 16 }]}>
          <Text variant="h2" weight="bold" style={type.navTitle}>
            Gate Entry & Exit Log
          </Text>
          <Text variant="caption" weight="medium" style={{ color: 'rgba(17,17,30,0.6)', marginTop: 2 }}>
            Real-time activity ledger for society visitors
          </Text>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filterRow}>
              {FILTERS.map((item) => {
                const isActive = filter === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      triggerHaptic();
                      setFilter(item.id);
                    }}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                  >
                    <Text
                      variant="caption"
                      weight="bold"
                      style={[styles.filterText, isActive && styles.filterTextActive]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <ScrollView
          contentContainerStyle={[uiStyles.scroll, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4E6D3B" />
          }
        >
          <Animated.View entering={FadeInUp.duration(300)}>
            <AppSectionCard label="Activity Timeline">
              {loading ? (
                <ListSkeleton count={4} />
              ) : visitors.length === 0 ? (
                <AppEmptyState
                  icon={ClipboardList}
                  title="No Entry Logs"
                  description="No visitor check-ins or entries recorded matching this filter."
                />
              ) : (
                visitors.map((item) => {
                  const IconComp = getPurposeIcon(item.purpose);
                  const isCheckedIn = item.status === 'checked_in' || item.status === 'approved';
                  const isCheckedOut = item.status === 'checked_out';
                  const entryTimeStr = new Date(item.checkInTime || item.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  let durationText = '';
                  if (item.checkOutTime) {
                    const startMs = new Date(item.checkInTime || item.createdAt).getTime();
                    const endMs = new Date(item.checkOutTime).getTime();
                    const diffMins = Math.max(1, Math.round((endMs - startMs) / 60000));
                    durationText = diffMins < 60 ? `${diffMins}m stay` : `${Math.floor(diffMins / 60)}h ${diffMins % 60}m stay`;
                  }

                  return (
                    <View key={item.id} style={styles.logCard}>
                      <View style={styles.logIconBadge}>
                        <IconComp size={20} color="#4E6D3B" />
                      </View>

                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text variant="body" weight="bold" numberOfLines={1} style={{ color: '#11111E', flex: 1, marginRight: 8 }}>
                            {item.name}
                          </Text>
                          <View
                            style={[
                              styles.statusBadge,
                              isCheckedIn && styles.badgeGreen,
                              isCheckedOut && styles.badgeGrey,
                              item.status === 'pending' && styles.badgeYellow,
                            ]}
                          >
                            <Text
                              variant="caption"
                              weight="bold"
                              style={[
                                styles.badgeText,
                                isCheckedIn && styles.textGreen,
                                isCheckedOut && styles.textGrey,
                                item.status === 'pending' && styles.textYellow,
                              ]}
                            >
                              {isCheckedIn ? 'Inside' : isCheckedOut ? 'Exited' : 'Pending'}
                            </Text>
                          </View>
                        </View>

                        <Text variant="caption" weight="medium" style={{ color: 'rgba(17,17,30,0.6)', marginTop: 4 }}>
                          Flat: {item.flatNumber} • {item.purpose}
                        </Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 10, flexWrap: 'wrap' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Clock size={12} color="rgba(17,17,30,0.5)" />
                            <Text variant="caption" weight="medium" style={{ color: 'rgba(17,17,30,0.5)', fontSize: 11 }}>
                              In: {entryTimeStr}
                            </Text>
                          </View>

                          {item.checkOutTime && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <LogOut size={12} color="rgba(17,17,30,0.5)" />
                              <Text variant="caption" weight="medium" style={{ color: 'rgba(17,17,30,0.5)', fontSize: 11 }}>
                                Out: {new Date(item.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Text>
                              {durationText !== '' && (
                                <Text variant="caption" weight="bold" style={{ color: '#4E6D3B', fontSize: 11, marginLeft: 2 }}>
                                  ({durationText})
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      </View>

                      {/* 1-Tap Check-Out Action Button */}
                      {isCheckedIn && (
                        <Pressable
                          onPress={() => handleCheckOut(item)}
                          disabled={checkingOutId === item.id}
                          style={styles.checkoutBtn}
                        >
                          {checkingOutId === item.id ? (
                            <CustomSpinner size="small" color="#FFFFFF" />
                          ) : (
                            <>
                              <LogOut size={14} color="#FFFFFF" />
                              <Text variant="caption" weight="bold" style={{ color: '#FFFFFF', fontSize: 11 }}>
                                Out
                              </Text>
                            </>
                          )}
                        </Pressable>
                      )}
                    </View>
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
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filterScroll: {
    marginTop: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(17,17,30,0.06)',
  },
  filterChipActive: {
    backgroundColor: '#4E6D3B',
  },
  filterText: {
    color: '#11111E',
    fontSize: 12,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17,17,30,0.06)',
  },
  logIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E4EFE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeGreen: {
    backgroundColor: '#E8F5E9',
  },
  badgeGrey: {
    backgroundColor: '#ECEFF1',
  },
  badgeYellow: {
    backgroundColor: '#FFF8E1',
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  textGreen: {
    color: '#2E7D32',
  },
  textGrey: {
    color: '#546E7A',
  },
  textYellow: {
    color: '#F57F17',
  },
  checkoutBtn: {
    backgroundColor: '#C62828',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    gap: 10,
  },
  successText: {
    color: '#2E7D32',
    flex: 1,
    fontSize: 14,
  },
});
