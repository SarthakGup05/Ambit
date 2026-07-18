import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { Screen, Text, ListSkeleton } from '@repo/ui';
import { ScreenBackground, AppSectionCard, AppListItem } from '@/components/common';
import { uiStyles, type } from '@/theme';
import { Calendar as CalendarIcon, Sparkles } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Amenity,
  Booking,
  fetchAmenitiesApi,
  fetchBookingsApi,
  createBookingApi,
} from '@/features/bookings/api';
import { CreateBookingModal } from '@/features/bookings/components/CreateBookingModal';

const FALLBACK_AMENITIES: Amenity[] = [
  { id: 'a1', name: 'Clubhouse Lounge', description: 'Premium space for community gatherings.', capacity: 50 },
  { id: 'a2', name: 'Swimming Pool', description: 'Olympic size swimming pool with temp controls.', capacity: 20 },
  { id: 'a3', name: 'Tennis Court', description: 'Double-court setup with floodlights.', capacity: 4 },
  { id: 'a4', name: 'Fitness Center / Gym', description: 'Modern equipment and free weights.', capacity: 15 },
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
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Booking Form States
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
  const [bookingDate, setBookingDate] = useState<'tomorrow' | 'next-weekend'>('tomorrow');
  const [timeSlot, setTimeSlot] = useState('04:00 PM - 06:00 PM');

  const loadData = useCallback(async () => {
    try {
      const [amenitiesList, bookingsList] = await Promise.all([
        fetchAmenitiesApi(),
        fetchBookingsApi(),
      ]);
      setAmenities(amenitiesList.length > 0 ? amenitiesList : FALLBACK_AMENITIES);
      setBookings(bookingsList.length > 0 ? bookingsList : FALLBACK_BOOKINGS);
    } catch (err: any) {
      console.warn('Failed to load bookings database info:', err.message || err);
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
    setBookingDate('tomorrow');
    setTimeSlot('04:00 PM - 06:00 PM');
    setModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedAmenity) return;
    triggerHaptic();

    // Parse standard slot times
    const startHour = timeSlot.startsWith('08') ? 8 : timeSlot.startsWith('04') ? 16 : 18;
    const dateOffset = bookingDate === 'tomorrow' ? 1 : 7; // Next weekend simplified offset

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dateOffset);
    targetDate.setHours(startHour, 0, 0, 0);

    const endTime = new Date(targetDate);
    endTime.setHours(startHour + 2, 0, 0, 0);

    try {
      const newBk = await createBookingApi({
        amenityId: selectedAmenity.id,
        startTime: targetDate.toISOString(),
        endTime: endTime.toISOString(),
      });

      setBookings([newBk, ...bookings]);
      setModalVisible(false);
      Alert.alert('Reservation Confirmed', `${selectedAmenity.name} has been booked!`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Could not complete booking reservation.';
      Alert.alert('Booking Collision', errorMsg);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <ScrollView
          contentContainerStyle={[
            uiStyles.scroll,
            { paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 100 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
          }
        >
          {/* Header */}
          <View style={uiStyles.header}>
            <View style={{ width: 46 }} />
            <Text variant="h3" weight="bold" style={type.navTitle}>
              Amenity Bookings
            </Text>
            <View style={{ width: 46 }} />
          </View>

          {isLoading ? (
            <ListSkeleton count={3} />
          ) : (
            <>
              {/* Active reservations */}
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

      {/* Booking Form Sheet Modal (Modularized) */}
      <CreateBookingModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedAmenity={selectedAmenity}
        bookingDate={bookingDate}
        setBookingDate={setBookingDate}
        timeSlot={timeSlot}
        setTimeSlot={setTimeSlot}
        handleConfirmBooking={handleConfirmBooking}
      />
    </View>
  );
}
