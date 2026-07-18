import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Modal,
  Alert,
  KeyboardAvoidingView,
  RefreshControl,
} from 'react-native';
import { Screen, Text, ListSkeleton } from '@repo/ui';
import { ScreenBackground, AppSectionCard, AppListItem } from '@/components/common';
import { uiStyles, type } from '@/theme';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Wrench,
  Zap,
  ArrowUpDown,
  Hammer,
  Shield,
  HelpCircle,
  X,
  MessageSquare,
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  ComplaintItem,
  ComplaintStatus,
  ComplaintCategory,
  ComplaintDetailModal,
  fetchComplaints,
  updateComplaintStatusApi,
  addComplaintCommentApi,
} from '@/features/complaints';

const CATEGORY_ICONS: Record<ComplaintCategory, any> = {
  plumbing: Wrench,
  electrical: Zap,
  elevator: ArrowUpDown,
  maintenance: Hammer,
  security: Shield,
  other: HelpCircle,
};

const INITIAL_FALLBACK_ADMIN_COMPLAINTS: ComplaintItem[] = [
  {
    id: 'c1',
    title: 'Elevator B making loud screeching noise',
    description: 'The passenger lift in Tower B vibrates heavily and makes a loud noise when stopping on the 4th floor.',
    category: 'elevator',
    priority: 'high',
    status: 'in_progress',
    residentName: 'Sarthak Mehta',
    flatNumber: 'B-402',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    comments: [
      {
        id: 'cm1',
        author: 'Admin Office',
        role: 'admin',
        text: 'Otis Elevator service engineer notified. Technician visiting today at 4 PM.',
        createdAt: new Date(Date.now() - 43200000).toISOString(),
      },
    ],
  },
  {
    id: 'c2',
    title: 'Water leakage near main lobby entrance',
    description: 'Drip from overhead AC line near lobby entrance gate creating slippery floor.',
    category: 'plumbing',
    priority: 'urgent',
    status: 'open',
    residentName: 'Rohit Verma',
    flatNumber: 'A-101',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    comments: [],
  },
  {
    id: 'c3',
    title: 'Clubhouse gym treadmill #2 belt loose',
    description: 'The second treadmill belt slips when running above 8km/h.',
    category: 'maintenance',
    priority: 'low',
    status: 'resolved',
    residentName: 'Priyanka Sen',
    flatNumber: 'C-702',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
    comments: [
      {
        id: 'cm2',
        author: 'Society Maintenance',
        role: 'admin',
        text: 'Gym technician calibrated and tightened the belt.',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ],
  },
  {
    id: 'c4',
    title: 'Basement B2 light flickering near pillar 14',
    description: 'Tube light flickers continuously causing visibility hazard for parking.',
    category: 'electrical',
    priority: 'medium',
    status: 'open',
    residentName: 'Amit Patel',
    flatNumber: 'B-305',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    comments: [],
  },
];

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

export default function AdminComplaintsScreen() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | ComplaintStatus>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchComplaints(activeFilter);
      if (data && data.length > 0) {
        setComplaints(data);
      } else {
        setComplaints(INITIAL_FALLBACK_ADMIN_COMPLAINTS);
      }
    } catch (err: any) {
      console.warn("Failed to fetch admin complaints from API:", err.message || err);
      setComplaints(INITIAL_FALLBACK_ADMIN_COMPLAINTS);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleUpdateStatus = async (id: string, newStatus: ComplaintStatus) => {
    triggerHaptic();
    try {
      const updatedItem = await updateComplaintStatusApi(id, newStatus);
      if (updatedItem) {
        setComplaints(complaints.map((c) => (c.id === id ? updatedItem : c)));
        if (selectedComplaint?.id === id) {
          setSelectedComplaint(updatedItem);
        }
        Alert.alert('Status Updated', `Ticket status set to ${newStatus.replace('_', ' ').toUpperCase()}`);
        return;
      }
    } catch {
      // Local fallback
    }

    const updated = complaints.map((c) => {
      if (c.id === id) {
        return { ...c, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    setComplaints(updated);
    if (selectedComplaint?.id === id) {
      setSelectedComplaint(updated.find((c) => c.id === id) || null);
    }
    Alert.alert('Status Updated', `Ticket status set to ${newStatus.replace('_', ' ').toUpperCase()}`);
  };

  const handleAddComment = async (id: string, text: string) => {
    try {
      const updatedItem = await addComplaintCommentApi(id, text);
      if (updatedItem) {
        setComplaints(complaints.map((c) => (c.id === id ? updatedItem : c)));
        if (selectedComplaint?.id === id) {
          setSelectedComplaint(updatedItem);
        }
        return;
      }
    } catch {
      // Local fallback
    }

    const updated = complaints.map((c) => {
      if (c.id === id) {
        const newCm = {
          id: `cm_${Date.now()}`,
          author: 'Admin Office',
          role: 'admin' as const,
          text,
          createdAt: new Date().toISOString(),
        };
        return {
          ...c,
          comments: [...(c.comments || []), newCm],
        };
      }
      return c;
    });
    setComplaints(updated);
    if (selectedComplaint?.id === id) {
      setSelectedComplaint(updated.find((c) => c.id === id) || null);
    }
  };

  const filteredList = complaints.filter((c) => {
    if (activeFilter === 'all') return true;
    return c.status === activeFilter;
  });

  const openCount = complaints.filter((c) => c.status === 'open').length;
  const progressCount = complaints.filter((c) => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;

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
              Complaints & Helpdesk
            </Text>
            <View style={{ width: 46 }} />
          </View>

          {/* Summary Stats Grid */}
          <Animated.View entering={FadeInUp.duration(400).delay(80)}>
            <AppSectionCard label="Helpdesk Overview">
              <View style={uiStyles.overviewGrid}>
                <View style={uiStyles.overviewStatTile}>
                  <View style={[uiStyles.statIconBadge, { backgroundColor: 'rgba(217, 119, 6, 0.12)' }]}>
                    <MessageSquare size={18} color="#D97706" strokeWidth={2.2} />
                  </View>
                  <View style={uiStyles.statTextGroup}>
                    <Text variant="h2" weight="bold" style={type.statSm}>{openCount}</Text>
                    <Text variant="caption" weight="medium" style={type.statLabelDark}>Open</Text>
                  </View>
                </View>

                <View style={uiStyles.overviewStatTile}>
                  <View style={[uiStyles.statIconBadge, { backgroundColor: 'rgba(37, 99, 235, 0.12)' }]}>
                    <MessageSquare size={18} color="#2563EB" strokeWidth={2.2} />
                  </View>
                  <View style={uiStyles.statTextGroup}>
                    <Text variant="h2" weight="bold" style={type.statSm}>{progressCount}</Text>
                    <Text variant="caption" weight="medium" style={type.statLabelDark}>In Progress</Text>
                  </View>
                </View>

                <View style={uiStyles.overviewStatTile}>
                  <View style={[uiStyles.statIconBadge, { backgroundColor: 'rgba(46, 125, 50, 0.12)' }]}>
                    <MessageSquare size={18} color="#2E7D32" strokeWidth={2.2} />
                  </View>
                  <View style={uiStyles.statTextGroup}>
                    <Text variant="h2" weight="bold" style={type.statSm}>{resolvedCount}</Text>
                    <Text variant="caption" weight="medium" style={type.statLabelDark}>Resolved</Text>
                  </View>
                </View>
              </View>
            </AppSectionCard>
          </Animated.View>

          {/* Filter Chips */}
          <View style={styles.filterRow}>
            {(
              [
                ['all', 'All Tickets'],
                ['open', 'Open'],
                ['in_progress', 'In Progress'],
                ['resolved', 'Resolved'],
              ] as const
            ).map(([key, label]) => {
              const isSelected = activeFilter === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => {
                    triggerHaptic();
                    setActiveFilter(key);
                  }}
                  style={[
                    styles.filterChip,
                    isSelected && styles.filterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      isSelected && styles.filterTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Complaints List */}
          {isLoading ? (
            <View style={{ paddingTop: 8 }}>
              <ListSkeleton count={3} />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
              }
            >
              <AppSectionCard label="Grievance Triage Roster">
                {filteredList.length === 0 ? (
                  <View style={uiStyles.emptyState}>
                    <MessageSquare size={40} color="#A3A1A8" strokeWidth={1.5} />
                    <Text style={uiStyles.emptyText}>No tickets found in this status</Text>
                  </View>
                ) : (
                  filteredList.map((item, idx) => {
                    const CategoryIcon = CATEGORY_ICONS[item.category] || HelpCircle;
                    const statusLabel =
                      item.status === 'in_progress'
                        ? 'In Progress'
                        : item.status === 'open'
                        ? 'Open'
                        : 'Resolved';
                    const statusColor =
                      item.status === 'in_progress'
                        ? '#2563EB'
                        : item.status === 'open'
                        ? '#D97706'
                        : '#2E7D32';

                    return (
                      <AppListItem
                        key={item.id}
                        Icon={CategoryIcon}
                        title={item.title}
                        subtitle={`${item.residentName} (${item.flatNumber}) · ${item.priority.toUpperCase()}`}
                        rightElement={
                          <View style={uiStyles.statusBadge}>
                            <Text style={[uiStyles.statusBadgeText, { color: statusColor }]}>
                              {statusLabel}
                            </Text>
                          </View>
                        }
                        onPress={() => {
                          triggerHaptic();
                          setSelectedComplaint(item);
                        }}
                        isLast={idx === filteredList.length - 1}
                      />
                    );
                  })
                )}
              </AppSectionCard>
            </ScrollView>
          )}

        </View>

        {/* Admin Ticket Detail & Triage Modal */}
        <Modal
          animationType="slide"
          transparent
          visible={selectedComplaint !== null}
          onRequestClose={() => setSelectedComplaint(null)}
        >
          <View style={uiStyles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={uiStyles.modalContent}
            >
              <View style={uiStyles.modalHeader}>
                <Text style={uiStyles.modalTitle}>Triage Ticket</Text>
                <Pressable
                  style={uiStyles.closeBtn}
                  onPress={() => setSelectedComplaint(null)}
                >
                  <X size={18} color="#4A5568" />
                </Pressable>
              </View>
              {selectedComplaint && (
                <ComplaintDetailModal
                  complaint={selectedComplaint}
                  isAdmin={true}
                  onUpdateStatus={handleUpdateStatus}
                  onAddComment={handleAddComment}
                  onClose={() => setSelectedComplaint(null)}
                />
              )}
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    marginTop: -8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  filterChipActive: {
    backgroundColor: '#4A5568',
    borderColor: '#4A5568',
  },
  filterText: {
    fontSize: 12,
    fontFamily: 'InterMedium',
    color: '#4A5568',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontFamily: 'InterBold',
  },
});
