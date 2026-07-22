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
  Text as RNText,
} from 'react-native';
import { Screen, Text, ListSkeleton } from '@repo/ui';
import { ScreenBackground, AppEmptyState, StatusModal } from '@/components/common';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Building2,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/axios';
import { uiStyles, type } from '@/theme';

import {
  AdminAmenitiesStatsHeader,
  AdminAmenityCard,
  AdminAmenityItem,
  AdminBookingLogsList,
  AdminBookingLog,
} from '@/features/amenities/components';

const MOCK_AMENITIES: AdminAmenityItem[] = [
  {
    id: 'a1',
    name: 'Clubhouse Lounge',
    description: 'Premium air-conditioned space for community gatherings & parties.',
    capacity: 50,
    operatingHours: '08:00 AM - 11:00 PM',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  },
  {
    id: 'a2',
    name: 'Swimming Pool',
    description: 'Temperature-controlled lap pool with separate kids splash zone.',
    capacity: 25,
    operatingHours: '06:00 AM - 09:00 PM',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800',
  },
  {
    id: 'a3',
    name: 'Tennis Court',
    description: 'Synth-court with LED floodlights and automated booking slots.',
    capacity: 4,
    operatingHours: '06:00 AM - 10:00 PM',
    status: 'maintenance',
    imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800',
  },
  {
    id: 'a4',
    name: 'Fitness Center / Gym',
    description: 'Full cardio suite, free weights, and resident personal trainer desk.',
    capacity: 15,
    operatingHours: '05:00 AM - 11:00 PM',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
  },
];

const MOCK_BOOKING_LOGS: AdminBookingLog[] = [
  {
    id: 'log-1',
    amenityName: 'Clubhouse Lounge',
    residentName: 'Aarav Sharma',
    flatNumber: 'B-402',
    timeSlot: '04:00 PM - 06:00 PM',
    dateStr: 'Tomorrow',
    status: 'confirmed',
  },
  {
    id: 'log-2',
    amenityName: 'Swimming Pool',
    residentName: 'Meera Patel',
    flatNumber: 'A-108',
    timeSlot: '07:00 AM - 08:30 AM',
    dateStr: 'Tomorrow',
    status: 'confirmed',
  },
  {
    id: 'log-3',
    amenityName: 'Tennis Court',
    residentName: 'Vikramaditya Roy',
    flatNumber: 'C-701',
    timeSlot: '06:00 PM - 07:30 PM',
    dateStr: '24 Jul',
    status: 'cancelled',
  },
];

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

export default function AdminAmenitiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [amenities, setAmenities] = useState<AdminAmenityItem[]>([]);
  const [bookingLogs, setBookingLogs] = useState<AdminBookingLog[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'maintenance'>('all');

  const [statusModal, setStatusModal] = useState<{
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

  const loadData = useCallback(async () => {
    try {
      const [amenitiesRes, bookingsRes] = await Promise.all([
        api.get('/api/admin/amenities'),
        api.get('/api/bookings'),
      ]);

      if (amenitiesRes.data?.amenities) {
        setAmenities(amenitiesRes.data.amenities);
      } else {
        setAmenities(MOCK_AMENITIES);
      }

      if (bookingsRes.data?.bookings) {
        const mappedLogs = bookingsRes.data.bookings.map((b: any) => {
          const start = new Date(b.startTime);
          const end = new Date(b.endTime);

          const formatTime = (date: Date) => {
            let hours = date.getHours();
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
          };

          const timeSlot = `${formatTime(start)} - ${formatTime(end)}`;

          const today = new Date();
          const tomorrow = new Date();
          tomorrow.setDate(today.getDate() + 1);

          let dateStr = '';
          if (start.toDateString() === today.toDateString()) {
            dateStr = 'Today';
          } else if (start.toDateString() === tomorrow.toDateString()) {
            dateStr = 'Tomorrow';
          } else {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            dateStr = `${start.getDate()} ${months[start.getMonth()]}`;
          }

          return {
            id: b.id,
            amenityName: b.amenityName,
            residentName: b.residentName || 'Unknown Resident',
            flatNumber: b.flatNumber || 'N/A',
            timeSlot,
            dateStr,
            status: b.status || 'confirmed',
          };
        });
        setBookingLogs(mappedLogs);
      } else {
        setBookingLogs(MOCK_BOOKING_LOGS);
      }
    } catch {
      setAmenities(MOCK_AMENITIES);
      setBookingLogs(MOCK_BOOKING_LOGS);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => loadData());
    return () => task.cancel();
  }, [loadData]);

  // Reload list whenever we return from the form screen
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // Navigate to form screen for creating / editing
  const openForm = (item?: AdminAmenityItem) => {
    triggerHaptic();
    if (item) {
      router.push({
        pathname: '/(admin)/amenity-form',
        params: { id: item.id, amenityData: JSON.stringify(item) },
      });
    } else {
      router.push('/(admin)/amenity-form');
    }
  };

  // Toggle Maintenance Status
  const handleToggleStatus = async (item: AdminAmenityItem) => {
    triggerHaptic();
    const nextStatus = item.status === 'maintenance' ? 'active' : 'maintenance';

    try {
      const response = await api.put(`/api/admin/amenities/${item.id}`, {
        status: nextStatus,
      });

      if (response.data?.amenity) {
        setAmenities((prev) =>
          prev.map((a) => (a.id === item.id ? response.data.amenity : a))
        );
        setStatusModal({
          visible: true,
          type: 'success',
          title: 'Status Changed',
          description: `${item.name} is now ${nextStatus === 'maintenance' ? 'under maintenance' : 'operational'}.`,
        });
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to update status';
      setStatusModal({
        visible: true,
        type: 'error',
        title: 'Status Update Failed',
        description: message,
      });
    }
  };

  // Delete Facility
  const handleDeleteAmenity = (id: string) => {
    const target = amenities.find((a) => a.id === id);
    Alert.alert(
      'Delete Facility',
      `Are you sure you want to delete ${target?.name || 'this amenity'}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            triggerHaptic();
            try {
              await api.delete(`/api/admin/amenities/${id}`);
              setAmenities((prev) => prev.filter((a) => a.id !== id));
              setStatusModal({
                visible: true,
                type: 'success',
                title: 'Facility Deleted',
                description: `${target?.name || 'Amenity'} has been deleted.`,
              });
            } catch (err: any) {
              const message = err.response?.data?.error || 'Failed to delete facility';
              setStatusModal({
                visible: true,
                type: 'error',
                title: 'Deletion Failed',
                description: message,
              });
            }
          },
        },
      ]
    );
  };

  // Toggle Booking Log Status (For confirmed/cancelled status toggle)
  const handleToggleLogStatus = async (logId: string) => {
    triggerHaptic();
    const log = bookingLogs.find((l) => l.id === logId);
    if (!log) return;

    const nextStatus = log.status === 'confirmed' ? 'cancelled' : 'confirmed';

    try {
      await api.patch(`/api/bookings/${logId}`, { status: nextStatus });
      setBookingLogs((prev) =>
        prev.map((l) => (l.id === logId ? { ...l, status: nextStatus } : l))
      );
      setStatusModal({
        visible: true,
        type: 'success',
        title: 'Booking Updated',
        description: `Booking status set to ${nextStatus === 'confirmed' ? 'Confirmed' : 'Cancelled'}.`,
      });
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to update booking status';
      setStatusModal({
        visible: true,
        type: 'error',
        title: 'Update Failed',
        description: message,
      });
    }
  };

  // Set explicit booking status (Accept / Decline)
  const handleSetBookingStatus = async (logId: string, status: 'confirmed' | 'cancelled') => {
    triggerHaptic();
    try {
      await api.patch(`/api/bookings/${logId}`, { status });
      setBookingLogs((prev) =>
        prev.map((l) => (l.id === logId ? { ...l, status } : l))
      );
      setStatusModal({
        visible: true,
        type: 'success',
        title: 'Booking Handled',
        description: `Booking reservation has been ${status === 'confirmed' ? 'approved' : 'declined'}.`,
      });
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to update booking status';
      setStatusModal({
        visible: true,
        type: 'error',
        title: 'Action Failed',
        description: message,
      });
    }
  };

  const filteredAmenities = amenities.filter((item) => {
    if (filterStatus === 'active') return item.status === 'active';
    if (filterStatus === 'maintenance') return item.status === 'maintenance';
    return true;
  });

  const maintenanceCount = amenities.filter((a) => a.status === 'maintenance').length;

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={[uiStyles.header, { paddingHorizontal: 20 }]}>
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
              Amenities Admin
            </Text>
            <View style={{ width: 46 }} />
          </Animated.View>

          {/* Stats Banner */}
          <AdminAmenitiesStatsHeader
            totalCount={amenities.length}
            activeBookingsCount={bookingLogs.length}
            maintenanceCount={maintenanceCount}
          />

          {/* Filter Bar */}
          <View style={styles.filterSection}>
            <View style={[styles.filterHeader, { minHeight: 40 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.filterTitle}>Society Facilities</Text>
                <View style={styles.filterCountBadge}>
                  <Text style={styles.filterCountText}>{filteredAmenities.length} Items</Text>
                </View>
              </View>
              <Pressable
                style={({ pressed }) => [
                  uiStyles.addBtn,
                  { backgroundColor: '#2E7D32', shadowColor: '#2E7D32' },
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => openForm()}
              >
                <Plus size={15} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 4 }} />
                <Text style={uiStyles.addBtnText}>Add Amenity</Text>
              </Pressable>
            </View>

            <View style={styles.filterPillsRow}>
              <Pressable
                style={[
                  styles.filterPill,
                  filterStatus === 'all' && styles.filterPillActive,
                ]}
                onPress={() => {
                  triggerHaptic();
                  setFilterStatus('all');
                }}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    filterStatus === 'all' && styles.filterPillTextActive,
                  ]}
                >
                  All ({amenities.length})
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.filterPill,
                  filterStatus === 'active' && styles.filterPillActive,
                ]}
                onPress={() => {
                  triggerHaptic();
                  setFilterStatus('active');
                }}
              >
                <CheckCircle2
                  size={12}
                  color={filterStatus === 'active' ? '#FFF' : '#10B981'}
                />
                <Text
                  style={[
                    styles.filterPillText,
                    filterStatus === 'active' && styles.filterPillTextActive,
                  ]}
                >
                  Operational
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.filterPill,
                  filterStatus === 'maintenance' && styles.filterPillActive,
                ]}
                onPress={() => {
                  triggerHaptic();
                  setFilterStatus('maintenance');
                }}
              >
                <AlertTriangle
                  size={12}
                  color={filterStatus === 'maintenance' ? '#FFF' : '#F59E0B'}
                />
                <Text
                  style={[
                    styles.filterPillText,
                    filterStatus === 'maintenance' && styles.filterPillTextActive,
                  ]}
                >
                  Maintenance
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Amenities List */}
          {isLoading ? (
            <View style={{ paddingHorizontal: 24 }}>
              <ListSkeleton count={3} />
            </View>
          ) : filteredAmenities.length === 0 ? (
            <AppEmptyState
              icon={Building2}
              title="No Facilities Found"
              description="No society amenities match your selected status filter."
              actionLabel="Add New Amenity"
              onAction={() => openForm()}
            />
          ) : (
            filteredAmenities.map((item, idx) => (
              <AdminAmenityCard
                key={item.id}
                item={item}
                index={idx}
                onEdit={(target) => openForm(target)}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteAmenity}
              />
            ))
          )}

          {/* Resident Booking Logs */}
          <AdminBookingLogsList
            logs={bookingLogs}
            onToggleLogStatus={handleToggleLogStatus}
            onAccept={(logId) => handleSetBookingStatus(logId, 'confirmed')}
            onDecline={(logId) => handleSetBookingStatus(logId, 'cancelled')}
          />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  filterCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,1)',
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,1)',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  filterPillActive: {
    backgroundColor: '#1B5E20',
    borderColor: '#1B5E20',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.1,
  },
  filterPillTextActive: {
    color: '#FFF',
  },
});
