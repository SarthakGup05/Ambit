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
import { ScreenBackground, AppEmptyState } from '@/components/common';
import { useRouter } from 'expo-router';
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

import {
  AdminAmenitiesStatsHeader,
  AdminAmenityCard,
  AdminAmenityItem,
  AdminCreateAmenityModal,
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

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<AdminAmenityItem | null>(null);

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
            status: b.status === 'cancelled' ? 'cancelled' : 'confirmed',
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // Handle Create / Save
  const handleSaveAmenity = async (data: Partial<AdminAmenityItem>) => {
    triggerHaptic();

    try {
      if (data.id) {
        // Edit existing
        const response = await api.put(`/api/admin/amenities/${data.id}`, {
          name: data.name,
          description: data.description,
          capacity: data.capacity,
          status: data.status,
          operatingHours: data.operatingHours,
          imageUrl: data.imageUrl,
        });

        if (response.data?.amenity) {
          setAmenities((prev) =>
            prev.map((item) => (item.id === data.id ? response.data.amenity : item))
          );
          Alert.alert('Facility Updated', `${data.name} has been updated.`);
        }
      } else {
        // Create new
        const response = await api.post('/api/admin/amenities', {
          name: data.name,
          description: data.description,
          capacity: data.capacity,
          status: data.status || 'active',
          operatingHours: data.operatingHours || '06:00 AM - 10:00 PM',
          imageUrl: data.imageUrl,
        });

        if (response.data?.amenity) {
          setAmenities((prev) => [response.data.amenity, ...prev]);
          Alert.alert('Facility Created', `${response.data.amenity.name} is now available.`);
        }
      }

      setModalVisible(false);
      setEditingAmenity(null);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to save facility';
      Alert.alert('Error', message);
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
        Alert.alert(
          'Status Changed',
          `${item.name} status changed to ${nextStatus === 'maintenance' ? 'Under Maintenance' : 'Operational'}.`
        );
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to update status';
      Alert.alert('Error', message);
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
              Alert.alert('Facility Deleted', `${target?.name || 'Amenity'} has been deleted.`);
            } catch (err: any) {
              const message = err.response?.data?.error || 'Failed to delete facility';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  // Toggle Booking Log Status
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
      Alert.alert(
        'Booking Status Updated',
        `Booking status has been set to ${nextStatus === 'confirmed' ? 'Confirmed' : 'Cancelled'}.`
      );
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to update booking status';
      Alert.alert('Error', message);
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
          <Animated.View entering={FadeIn.duration(300)} style={styles.headerRow}>
            <Pressable
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
              onPress={() => {
                triggerHaptic();
                router.back();
              }}
            >
              <ArrowLeft size={20} color="#111827" />
            </Pressable>

            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text variant="h2" weight="bold" style={styles.headerTitle}>
                Amenities Admin
              </Text>
              <Text variant="body" style={styles.headerSubtitle}>
                Configure facilities, status & resident logs
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.addFacilityBtn, pressed && { opacity: 0.85 }]}
              onPress={() => {
                triggerHaptic();
                setEditingAmenity(null);
                setModalVisible(true);
              }}
            >
              <Plus size={18} color="#FFF" />
              <RNText style={styles.addBtnText}>Add Amenity</RNText>
            </Pressable>
          </Animated.View>

          {/* Stats Banner */}
          <AdminAmenitiesStatsHeader
            totalCount={amenities.length}
            activeBookingsCount={bookingLogs.length}
            maintenanceCount={maintenanceCount}
          />

          {/* Filter Bar */}
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Society Facilities</Text>
              <View style={styles.filterCountBadge}>
                <Text style={styles.filterCountText}>{filteredAmenities.length} Items</Text>
              </View>
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
              onAction={() => {
                triggerHaptic();
                setEditingAmenity(null);
                setModalVisible(true);
              }}
            />
          ) : (
            filteredAmenities.map((item, idx) => (
              <AdminAmenityCard
                key={item.id}
                item={item}
                index={idx}
                onEdit={(target) => {
                  setEditingAmenity(target);
                  setModalVisible(true);
                }}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteAmenity}
              />
            ))
          )}

          {/* Resident Booking Logs */}
          <AdminBookingLogsList
            logs={bookingLogs}
            onToggleLogStatus={handleToggleLogStatus}
          />
        </ScrollView>
      </Screen>

      {/* Add / Edit Modal */}
      <AdminCreateAmenityModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveAmenity}
        editingAmenity={editingAmenity}
        bottomInset={insets.bottom}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 6,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,1)',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.7,
    lineHeight: 30,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.1,
  },
  addFacilityBtn: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
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
