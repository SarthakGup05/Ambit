import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Modal,
  KeyboardAvoidingView,
  RefreshControl,
  InteractionManager,
} from 'react-native';
import { Screen, Text, ListSkeleton } from '@repo/ui';
import { ScreenBackground, AppSectionCard, AppListItem, useToast, AppEmptyState } from '@/components/common';
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
  RaiseTicketSheet,
  ComplaintDetailModal,
  fetchComplaints,
  createComplaintApi,
  addComplaintCommentApi,
} from '@/features/complaints';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<ComplaintCategory, any> = {
  plumbing: Wrench,
  electrical: Zap,
  elevator: ArrowUpDown,
  maintenance: Hammer,
  security: Shield,
  other: HelpCircle,
};

const STATUS_META: Record<ComplaintStatus, { label: string; color: string }> = {
  open:        { label: 'Open',        color: '#D97706' },
  in_progress: { label: 'In Progress', color: '#2563EB' },
  resolved:    { label: 'Resolved',    color: '#2E7D32' },
  closed:      { label: 'Closed',      color: '#6B7280' },
};

const FALLBACK_COMPLAINTS: ComplaintItem[] = [
  {
    id: 'c1',
    title: 'Elevator B making loud screeching noise',
    description: 'The lift in Tower B vibrates heavily and makes a loud noise when stopping on the 4th floor.',
    category: 'elevator',
    priority: 'high',
    status: 'in_progress',
    residentName: 'Sarthak Mehta',
    flatNumber: 'B-402',
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 43_200_000).toISOString(),
    comments: [
      {
        id: 'cm1',
        author: 'Admin Office',
        role: 'admin',
        text: 'Otis service engineer notified. Technician visiting today at 4 PM.',
        createdAt: new Date(Date.now() - 43_200_000).toISOString(),
      },
    ],
  },
  {
    id: 'c2',
    title: 'Water leakage near main lobby entrance',
    description: 'Drip from overhead AC line near lobby gate creating slippery floor.',
    category: 'plumbing',
    priority: 'urgent',
    status: 'open',
    residentName: 'Sarthak Mehta',
    flatNumber: 'A-1203',
    createdAt: new Date(Date.now() - 172_800_000).toISOString(),
    updatedAt: new Date(Date.now() - 172_800_000).toISOString(),
    comments: [],
  },
  {
    id: 'c3',
    title: 'Clubhouse gym treadmill #2 belt loose',
    description: 'The second treadmill belt slips when running above 8 km/h.',
    category: 'maintenance',
    priority: 'low',
    status: 'resolved',
    residentName: 'Sarthak Mehta',
    flatNumber: 'A-1203',
    createdAt: new Date(Date.now() - 604_800_000).toISOString(),
    updatedAt: new Date(Date.now() - 259_200_000).toISOString(),
    comments: [
      {
        id: 'cm2',
        author: 'Society Maintenance',
        role: 'admin',
        text: 'Gym technician calibrated and tightened the belt.',
        createdAt: new Date(Date.now() - 259_200_000).toISOString(),
      },
    ],
  },
];

const FILTERS = [
  { key: 'all'         , label: 'All'         },
  { key: 'open'        , label: 'Open'        },
  { key: 'in_progress' , label: 'In Progress' },
  { key: 'resolved'    , label: 'Resolved'    },
] as const;

function haptic() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ComplaintsTab() {
  const insets = useSafeAreaInsets();
  const toast   = useToast();

  const [complaints,     setComplaints]     = useState<ComplaintItem[]>([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [activeFilter,   setActiveFilter]   = useState<'all' | ComplaintStatus>('all');
  const [sheetVisible,   setSheetVisible]   = useState(false);
  const [selectedItem,   setSelectedItem]   = useState<ComplaintItem | null>(null);

  // ── Data ──────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const data = await fetchComplaints(activeFilter);
      setComplaints(data?.length ? data : FALLBACK_COMPLAINTS);
    } catch {
      setComplaints(FALLBACK_COMPLAINTS);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(loadData);
    return () => task.cancel();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreateComplaint = useCallback(async (input: CreateComplaintInput) => {
    haptic();
    try {
      const created = await createComplaintApi(input);
      const newItem: ComplaintItem = created ?? {
        id: `c_${Date.now()}`,
        status: 'open',
        residentName: 'Sarthak Mehta',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
        ...input,
      };
      setComplaints((prev) => [newItem, ...prev]);
      toast.success('TICKET RAISED', 'Your complaint has been submitted to society management.');
    } catch {
      const localItem: ComplaintItem = {
        id: `c_${Date.now()}`,
        status: 'open',
        residentName: 'Sarthak Mehta',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        comments: [],
        ...input,
      };
      setComplaints((prev) => [localItem, ...prev]);
      toast.success('TICKET RAISED', 'Your complaint has been saved locally.');
    } finally {
      setSheetVisible(false);
    }
  }, [toast]);

  const handleAddComment = useCallback(async (complaintId: string, commentText: string) => {
    try {
      const updated = await addComplaintCommentApi(complaintId, commentText);
      if (updated) {
        setComplaints((prev) => prev.map((c) => (c.id === complaintId ? updated : c)));
        if (selectedItem?.id === complaintId) setSelectedItem(updated);
        return;
      }
    } catch {}

    // local fallback
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        const newComment = {
          id: `cm_${Date.now()}`,
          author: 'Sarthak Mehta',
          role: 'resident' as const,
          text: commentText,
          createdAt: new Date().toISOString(),
        };
        const updated = { ...c, comments: [...(c.comments ?? []), newComment] };
        if (selectedItem?.id === complaintId) setSelectedItem(updated);
        return updated;
      })
    );
  }, [selectedItem]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const filteredList = complaints.filter(
    (c) => activeFilter === 'all' || c.status === activeFilter
  );
  const activeCount = complaints.filter(
    (c) => c.status !== 'resolved' && c.status !== 'closed'
  ).length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <ScrollView
          contentContainerStyle={[uiStyles.scroll, { paddingTop: insets.top + 16, paddingBottom: 130 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E4D2B" />
          }
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={uiStyles.header}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="h2" weight="bold" style={type.greeting}>Help &amp; Complaints</Text>
              <Text variant="body" style={type.greetingSub}>Raise tickets &amp; track society resolution</Text>
            </View>
          </Animated.View>

          {/* Summary bar */}
          <View style={uiStyles.summaryBar}>
            <View>
              <Text style={uiStyles.sectionLabel}>Active Tickets</Text>
              <Text style={uiStyles.summaryCount}>{activeCount} Pending Resolution</Text>
            </View>
            <Pressable
              style={[uiStyles.addBtn, { backgroundColor: '#1E4D2B', shadowColor: '#1E4D2B' }]}
              onPress={() => { haptic(); setSheetVisible(true); }}
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 4 }} />
              <Text style={uiStyles.addBtnText}>Raise Ticket</Text>
            </Pressable>
          </View>

          {/* Filter bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.filterRow}
          >
            {FILTERS.map(({ key, label }) => {
              const active = activeFilter === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => { haptic(); setActiveFilter(key); }}
                  style={[s.filterChip, active && s.filterChipActive]}
                >
                  <Text style={[s.filterText, active && s.filterTextActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* List */}
          {isLoading ? (
            <View style={{ paddingTop: 8 }}>
              <ListSkeleton count={3} />
            </View>
          ) : (
            <Animated.View entering={FadeInUp.duration(400).delay(100)}>
              <AppSectionCard label="Grievance Register">
                {filteredList.length === 0 ? (
                  <AppEmptyState
                    icon={MessageSquare}
                    title="No Complaints Found"
                    description={activeFilter === 'all'
                      ? "Raise a ticket if you have any issues with maintenance, plumbing, electrical, or other society services."
                      : `No complaints found with status "${activeFilter}".`
                    }
                    actionLabel={activeFilter === 'all' ? "Raise Complaint" : undefined}
                    onAction={activeFilter === 'all' ? () => { haptic(); setSheetVisible(true); } : undefined}
                  />
                ) : (
                  filteredList.map((item, idx) => {
                    const CategoryIcon = CATEGORY_ICONS[item.category] || HelpCircle;
                    const { label: statusLabel, color: statusColor } = STATUS_META[item.status] ?? STATUS_META.open;
                    return (
                      <AppListItem
                        key={item.id}
                        Icon={CategoryIcon}
                        title={item.title}
                        subtitle={`Flat ${item.flatNumber} · ${new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        rightElement={
                          <View style={uiStyles.statusBadge}>
                            <Text style={[uiStyles.statusBadgeText, { color: statusColor }]}>
                              {statusLabel}
                            </Text>
                          </View>
                        }
                        onPress={() => { haptic(); setSelectedItem(item); }}
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

      {/* ── Raise Ticket Modal ── */}
      <Modal
        animationType="slide"
        transparent
        visible={sheetVisible}
        onRequestClose={() => setSheetVisible(false)}
        statusBarTranslucent
      >
        <View style={s.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSheetVisible(false)} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={s.sheetWrapper}
          >
            <RaiseTicketSheet
              onSubmit={handleCreateComplaint}
              onClose={() => setSheetVisible(false)}
              bottomInset={insets.bottom}
            />
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ── Ticket Detail Modal ── */}
      <Modal
        animationType="slide"
        transparent
        visible={selectedItem !== null}
        onRequestClose={() => setSelectedItem(null)}
        statusBarTranslucent
      >
        <View style={uiStyles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={uiStyles.modalContent}
          >
            <View style={uiStyles.modalHeader}>
              <Text style={uiStyles.modalTitle}>Ticket Details</Text>
              <Pressable style={uiStyles.closeBtn} onPress={() => setSelectedItem(null)}>
                <X size={18} color="#4A5568" />
              </Pressable>
            </View>
            {selectedItem && (
              <ComplaintDetailModal
                complaint={selectedItem}
                onAddComment={handleAddComment}
                onClose={() => setSelectedItem(null)}
              />
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheetWrapper: {
    width: '100%',
  },

  // Filter
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  filterChipActive: {
    backgroundColor: '#1E4D2B',
    borderColor: '#1E4D2B',
  },
  filterText: {
    fontSize: 13,
    fontFamily: 'InterMedium',
    color: '#4A5568',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontFamily: 'InterBold',
  },
});
