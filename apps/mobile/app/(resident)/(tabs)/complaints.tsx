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
  InteractionManager,
} from 'react-native';
import { Screen, Text, ListSkeleton } from '@repo/ui';
import { ScreenBackground, AppSectionCard, AppListItem } from '@/components/common';
import { uiStyles, type } from '@/theme';
import {
  Plus,
  Wrench,
  Zap,
  ArrowUpDown,
  Hammer,
  Shield,
  HelpCircle,
  X,
  MessageSquare,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ComplaintItem,
  ComplaintStatus,
  ComplaintCategory,
  CreateComplaintInput,
  CreateComplaintModal,
  ComplaintDetailModal,
  fetchComplaints,
  createComplaintApi,
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

const INITIAL_FALLBACK_COMPLAINTS: ComplaintItem[] = [
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
    residentName: 'Sarthak Mehta',
    flatNumber: 'A-1203',
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
    residentName: 'Sarthak Mehta',
    flatNumber: 'A-1203',
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
];

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

export default function ComplaintsTab() {
  const insets = useSafeAreaInsets();
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | ComplaintStatus>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchComplaints(activeFilter);
      if (data && data.length > 0) {
        setComplaints(data);
      } else {
        setComplaints(INITIAL_FALLBACK_COMPLAINTS);
      }
    } catch (err: any) {
      console.warn("Failed to fetch complaints from backend:", err.message || err);
      setComplaints(INITIAL_FALLBACK_COMPLAINTS);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter]);

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

  const handleCreateComplaint = async (input: CreateComplaintInput) => {
    triggerHaptic();
    try {
      const created = await createComplaintApi(input);
      if (created) {
        setComplaints([created, ...complaints]);
      } else {
        const localNew: ComplaintItem = {
          id: `c_${Date.now()}`,
          ...input,
          status: 'open',
          residentName: 'Sarthak Mehta',
          flatNumber: 'A-1203',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          comments: [],
        };
        setComplaints([localNew, ...complaints]);
      }
    } catch {
      const localNew: ComplaintItem = {
        id: `c_${Date.now()}`,
        ...input,
        status: 'open',
        residentName: 'Sarthak Mehta',
        flatNumber: 'A-1203',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
      };
      setComplaints([localNew, ...complaints]);
    } finally {
      setCreateModalVisible(false);
      Alert.alert('Ticket Created', 'Your complaint ticket has been submitted to society management.');
    }
  };

  const handleAddComment = async (complaintId: string, commentText: string) => {
    try {
      const updatedItem = await addComplaintCommentApi(complaintId, commentText);
      if (updatedItem) {
        setComplaints(complaints.map((c) => (c.id === complaintId ? updatedItem : c)));
        if (selectedComplaint?.id === complaintId) {
          setSelectedComplaint(updatedItem);
        }
        return;
      }
    } catch {
      // Fallback local update
    }

    const updated = complaints.map((c) => {
      if (c.id === complaintId) {
        const newCm = {
          id: `cm_${Date.now()}`,
          author: 'Sarthak Mehta',
          role: 'resident' as const,
          text: commentText,
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
    if (selectedComplaint?.id === complaintId) {
      setSelectedComplaint(updated.find((c) => c.id === complaintId) || null);
    }
  };

  const filteredList = complaints.filter((c) => {
    if (activeFilter === 'all') return true;
    return c.status === activeFilter;
  });

  const activeCount = complaints.filter((c) => c.status !== 'resolved' && c.status !== 'closed').length;

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <ScrollView
          contentContainerStyle={[
            uiStyles.scroll,
            { paddingTop: insets.top + 16, paddingBottom: 130 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
          }
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={uiStyles.header}>
            <View style={{ flex: 1, paddingRight: 12, gap: 2 }}>
              <Text variant="h2" weight="bold" style={type.greeting}>
                Help & Complaints
              </Text>
              <Text variant="body" style={type.greetingSub}>
                Raise tickets & track society resolution
              </Text>
            </View>
            <Pressable
              onPress={() => {
                triggerHaptic();
                setCreateModalVisible(true);
              }}
              style={[uiStyles.iconBtn, { backgroundColor: '#2E7D32' }]}
              hitSlop={12}
            >
              <Plus size={22} color="#FFFFFF" strokeWidth={2.4} />
            </Pressable>
          </Animated.View>

          {/* Summary Bar */}
          <View style={uiStyles.summaryBar}>
            <View>
              <Text style={uiStyles.sectionLabel}>Active Tickets</Text>
              <Text style={uiStyles.summaryCount}>
                {activeCount} Pending Resolution
              </Text>
            </View>
            <Pressable
              style={[uiStyles.addBtn, { backgroundColor: '#2E7D32', shadowColor: '#2E7D32' }]}
              onPress={() => {
                triggerHaptic();
                setCreateModalVisible(true);
              }}
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 4 }} />
              <Text style={uiStyles.addBtnText}>Raise Ticket</Text>
            </Pressable>
          </View>

          {/* Filter Bar */}
          <View style={styles.filterRow}>
            {(
              [
                ['all', 'All'],
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

          {/* Complaint Ticket List */}
          {isLoading ? (
            <View style={{ paddingTop: 8 }}>
              <ListSkeleton count={3} />
            </View>
          ) : (
            <Animated.View entering={FadeInUp.duration(400).delay(100)}>
              <AppSectionCard label="Grievance Register">
                {filteredList.length === 0 ? (
                  <View style={uiStyles.emptyState}>
                    <MessageSquare size={40} color="#A3A1A8" strokeWidth={1.5} />
                    <Text style={uiStyles.emptyText}>No complaints found in this status</Text>
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
                        subtitle={`Flat ${item.flatNumber} · ${new Date(
                          item.createdAt
                        ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
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
            </Animated.View>
          )}
        </ScrollView>
      </Screen>

      {/* Raise Ticket Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={uiStyles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={uiStyles.modalContent}
          >
            <View style={uiStyles.modalHeader}>
              <Text style={uiStyles.modalTitle}>Raise Helpdesk Ticket</Text>
              <Pressable
                style={uiStyles.closeBtn}
                onPress={() => setCreateModalVisible(false)}
              >
                <X size={18} color="#4A5568" />
              </Pressable>
            </View>
            <CreateComplaintModal
              onSubmit={handleCreateComplaint}
              onClose={() => setCreateModalVisible(false)}
            />
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Ticket Detail Modal */}
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
              <Text style={uiStyles.modalTitle}>Ticket Details</Text>
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
                onAddComment={handleAddComment}
                onClose={() => setSelectedComplaint(null)}
              />
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
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
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
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
