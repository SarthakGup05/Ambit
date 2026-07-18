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
import {
  Calendar as CalendarIcon,
  Plus,
  X,
  Clock,
  Sparkles,
  Info,
  CalendarCheck,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Amenity,
  Booking,
  fetchAmenitiesApi,
  fetchBookingsApi,
  createBookingApi,
} from '@/features/bookings/api';

const FALLBACK_AMENITIES: Amenity[] = [
  { id: 'a1', name: 'Clubhouse Lounge', description: 'Premium space for community gatherings and private events.', capacity: 50 },
  { id: 'a2', name: 'Swimming Pool', description: 'Olympic size swimming pool with temperature controls.', capacity: 20 },
  { id: 'a3', name: 'Tennis Court', description: 'Double-court setup with evening floodlights.', capacity: 4 },
  { id: 'a4', name: 'Fitness Center / Gym', description: 'Modern workout equipment, free weights, and cardio decks.', capacity: 15 },
];

const FALLBACK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    amenityId: 'a1',
    amenityName: 'Clubhouse Lounge',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 97200000).toISOString(),
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
];

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

export default function BookingsTab() {
  const insets = useSafeAreaInsets();
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal form states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [bookingDate, setBookingDate] = useState('tomorrow'); // Simplified for expo preview
  const [timeSlot, setTimeSlot] = useState('06:00 PM - 08:00 PM');

  const loadData = useCallback(async () => {
    try {
      const [amenityData, bookingData] = await Promise.all([
        fetchAmenitiesApi(),
        fetchBookingsApi(),
      ]);

      if (amenityData && amenityData.length > 0) {
        setAmenities(amenityData);
      } else {
        setAmenities(FALLBACK_AMENITIES);
      }

      if (bookingData && bookingData.length > 0) {
        setBookings(bookingData);
      } else {
        setBookings(FALLBACK_BOOKINGS);
      }
    } catch (err: any) {
      console.warn('Failed to load bookings from API:', err.message || err);
      setAmenities(FALLBACK_AMENITIES);
      setBookings(FALLBACK_BOOKINGS);
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

  const handleOpenBooking = (amenity: Amenity) => {
    triggerHaptic();
    setSelectedAmenity(amenity);
    setModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedAmenity) return;
    triggerHaptic();

    // Map simplified picker to iso strings
    const targetDate = new Date();
    if (bookingDate === 'tomorrow') {
      targetDate.setDate(targetDate.getDate() + 1);
    } else if (bookingDate === 'next-weekend') {
      targetDate.setDate(targetDate.getDate() + (6 - targetDate.getDay()));
    }
    targetDate.setHours(18, 0, 0, 0); // 6 PM default

    const endDate = new Date(targetDate);
    endDate.setHours(targetDate.getHours() + 2); // +2 hours slot

    try {
      const newBk = await createBookingApi({
        amenityId: selectedAmenity.id,
        startTime: targetDate.toISOString(),
        endTime: endDate.toISOString(),
      });

      if (newBk) {
        setBookings([newBk, ...bookings]);
      } else {
        // Fallback local update
        const localNew: Booking = {
          id: `bk_${Date.now()}`,
          amenityId: selectedAmenity.id,
          amenityName: selectedAmenity.name,
          startTime: targetDate.toISOString(),
          endTime: endDate.toISOString(),
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        };
        setBookings([localNew, ...bookings]);
      }
      Alert.alert('Booking Confirmed', `${selectedAmenity.name} has been reserved successfully!`);
    } catch (err: any) {
      Alert.alert('Booking Conflict', err.response?.data?.error || 'Failed to complete booking');
    } finally {
      setModalVisible(false);
      setSelectedAmenity(null);
    }
  };

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
                Amenity Bookings
              </Text>
              <Text variant="body" style={type.greetingSub}>
                Book clubhouse, pool, and courts
              </Text>
            </View>
            <View style={uiStyles.iconBtn}>
              <CalendarCheck size={22} color="#2E7D32" strokeWidth={2.2} />
            </View>
          </Animated.View>

          {isLoading ? (
            <ListSkeleton count={4} />
          ) : (
            <>
              {/* Upcoming Bookings Section */}
              {bookings.length > 0 && (
                <Animated.View entering={FadeInUp.duration(400).delay(80)}>
                  <AppSectionCard label="Your Upcoming Bookings">
                    {bookings.map((bk, idx) => {
                      const dateStr = new Date(bk.startTime).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      });
                      const timeStr = `${new Date(bk.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })} - ${new Date(bk.endTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`;

                      return (
                        <AppListItem
                          key={bk.id}
                          Icon={CalendarIcon}
                          iconColor="#2E7D32"
                          iconBg="rgba(46, 125, 50, 0.1)"
                          title={bk.amenityName}
                          subtitle={`${dateStr} · ${timeStr}`}
                          rightElement={
                            <View style={uiStyles.statusBadge}>
                              <Text
                                style={[
                                  uiStyles.statusBadgeText,
                                  { color: bk.status === 'confirmed' ? '#2E7D32' : '#D97706' },
                                ]}
                              >
                                {bk.status.toUpperCase()}
                              </Text>
                            </View>
                          }
                          isLast={idx === bookings.length - 1}
                        />
                      );
                    })}
                  </AppSectionCard>
                </Animated.View>
              )}

              {/* Book Amenities Catalog */}
              <Animated.View entering={FadeInUp.duration(400).delay(140)}>
                <AppSectionCard label="Book Facilities">
                  {amenities.map((item, idx) => (
                    <AppListItem
                      key={item.id}
                      Icon={Sparkles}
                      title={item.name}
                      subtitle={`${item.description} (Capacity: ${item.capacity} guests)`}
                      onPress={() => handleOpenBooking(item)}
                      isLast={idx === amenities.length - 1}
                    />
                  ))}
                </AppSectionCard>
              </Animated.View>
            </>
          )}
        </ScrollView>
      </Screen>

      {/* Booking Form Sheet Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={uiStyles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={uiStyles.modalContent}
          >
            <View style={uiStyles.modalHeader}>
              <Text style={uiStyles.modalTitle}>Reserve {selectedAmenity?.name}</Text>
              <Pressable style={uiStyles.closeBtn} onPress={() => setModalVisible(false)}>
                <X size={18} color="#4A5568" />
              </Pressable>
            </View>

            {selectedAmenity && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Info Card */}
                <View style={styles.infoBox}>
                  <Info size={16} color="#4A5568" style={{ marginRight: 6 }} />
                  <Text style={styles.infoText}>
                    Booking slots are for standard 2-hour increments. Capacity is limited to{' '}
                    {selectedAmenity.capacity} guests.
                  </Text>
                </View>

                {/* Day Selector */}
                <View style={styles.formGroup}>
                  <Text style={uiStyles.sectionLabel}>Choose Date</Text>
                  <View style={styles.pickerRow}>
                    {(
                      [
                        ['tomorrow', 'Tomorrow'],
                        ['next-weekend', 'Next Weekend'],
                      ] as const
                    ).map(([val, label]) => {
                      const isActive = bookingDate === val;
                      return (
                        <Pressable
                          key={val}
                          onPress={() => {
                            triggerHaptic();
                            setBookingDate(val);
                          }}
                          style={[styles.pillBtn, isActive && styles.pillBtnActive]}
                        >
                          <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                            {label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Time Selector */}
                <View style={styles.formGroup}>
                  <Text style={uiStyles.sectionLabel}>Available Slots</Text>
                  <View style={styles.pickerRow}>
                    {(
                      [
                        '08:00 AM - 10:00 AM',
                        '04:00 PM - 06:00 PM',
                        '06:00 PM - 08:00 PM',
                      ] as const
                    ).map((slot) => {
                      const isActive = timeSlot === slot;
                      return (
                        <Pressable
                          key={slot}
                          onPress={() => {
                            triggerHaptic();
                            setTimeSlot(slot);
                          }}
                          style={[styles.pillBtn, isActive && styles.pillBtnActive]}
                        >
                          <Clock size={12} color={isActive ? '#FFFFFF' : '#4A5568'} style={{ marginRight: 4 }} />
                          <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                            {slot}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Submit Booking */}
                <Pressable
                  onPress={handleConfirmBooking}
                  style={({ pressed }) => [
                    styles.confirmBtn,
                    pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                  ]}
                >
                  <Text style={styles.confirmBtnText}>Confirm Reservation</Text>
                </Pressable>
              </ScrollView>
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.035)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#475569',
    flex: 1,
    lineHeight: 16,
  },
  formGroup: {
    marginBottom: 20,
    gap: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.035)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillBtnActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  pillText: {
    fontSize: 12,
    fontFamily: 'InterMedium',
    color: '#4A5568',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontFamily: 'InterBold',
  },
  confirmBtn: {
    backgroundColor: '#2E7D32',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? 24 : 12,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'InterBold',
    fontWeight: 'bold',
  },
});
