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
  Image,
  Dimensions,
} from 'react-native';
import { Screen, Text, ListSkeleton } from '@repo/ui';
import { ScreenBackground, AppEmptyState } from '@/components/common';
import { uiStyles, type } from '@/theme';
import {
  Calendar as CalendarIcon,
  Sparkles,
  Waves,
  Dumbbell,
  Trophy,
  Coffee,
  Clock,
  ChevronRight,
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
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
import { BookingsHeroCard } from '@/features/bookings/components/BookingsHeroCard';

const { width } = Dimensions.get('window');

// High quality reliable Unsplash imagery with fallback parameters
const getAmenityImage = (name: string) => {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('pool') || lowercaseName.includes('swim')) {
    return 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800';
  }
  if (lowercaseName.includes('gym') || lowercaseName.includes('fitness')) {
    return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800';
  }
  if (lowercaseName.includes('tennis') || lowercaseName.includes('court')) {
    return 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800';
  }
  if (lowercaseName.includes('lounge') || lowercaseName.includes('club') || lowercaseName.includes('house')) {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800';
  }
  return 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800';
};

const FALLBACK_AMENITIES: Amenity[] = [
  { id: 'a1', name: 'Clubhouse Lounge', description: 'Premium space for community gatherings.', capacity: 50 },
  { id: 'a2', name: 'Swimming Pool', description: 'Olympic size swimming pool with temp controls.', capacity: 20 },
  { id: 'a3', name: 'Tennis Court', description: 'Double-court setup with floodlights.', capacity: 4 },
  { id: 'a4', name: 'Fitness Center', description: 'Modern equipment and free weights.', capacity: 15 },
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

export function getAmenityIconConfig(name: string) {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('pool') || lowercaseName.includes('swim')) return { Icon: Waves, color: '#0284C7', bgColor: 'rgba(2, 132, 199, 0.12)' };
  if (lowercaseName.includes('gym') || lowercaseName.includes('fitness')) return { Icon: Dumbbell, color: '#7C3AED', bgColor: 'rgba(124, 58, 237, 0.12)' };
  if (lowercaseName.includes('tennis') || lowercaseName.includes('court')) return { Icon: Trophy, color: '#DD6B20', bgColor: 'rgba(221, 107, 32, 0.12)' };
  if (lowercaseName.includes('club') || lowercaseName.includes('lounge')) return { Icon: Coffee, color: '#DB2777', bgColor: 'rgba(219, 39, 119, 0.12)' };
  return { Icon: Sparkles, color: '#0D9488', bgColor: 'rgba(13, 148, 136, 0.12)' };
}

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
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
      setAmenities(FALLBACK_AMENITIES);
      setBookings(FALLBACK_BOOKINGS);
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

    const startHour = timeSlot.startsWith('08') ? 8 : timeSlot.startsWith('04') ? 16 : 18;
    const dateOffset = bookingDate === 'tomorrow' ? 1 : 7;
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
      Alert.alert('Booking Collision', err.response?.data?.error || 'Could not complete booking reservation.');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text variant="h2" weight="bold" style={styles.headerTitle}>
              Reserve Space
            </Text>
            <Text variant="body" style={styles.headerSubtitle}>
              Curated amenities for your lifestyle
            </Text>
          </View>

          {isLoading ? (
            <ListSkeleton count={3} />
          ) : (
            <>
              {/* Active Reservations (Ticket Style) */}
              <Animated.View entering={FadeInUp.duration(600).delay(100)}>
                <View style={styles.sectionHeader}>
                  <Text variant="h3" weight="bold" style={styles.sectionTitle}>
                    Upcoming Reservations
                  </Text>
                  <Pressable 
                    style={({ pressed }) => [styles.viewAllButton, pressed && { opacity: 0.7 }]}
                    onPress={() => {
                      triggerHaptic();
                      Alert.alert(
                        'Upcoming Reservations',
                        bookings.length > 0
                          ? `You have ${bookings.length} active reservation(s).`
                          : 'You currently have no active reservations.'
                      );
                    }}
                  >
                    <Text style={styles.viewAllText}>View All</Text>
                    <ChevronRight size={14} color="#2E7D32" strokeWidth={2.5} />
                  </Pressable>
                </View>
                
                {bookings.length === 0 ? (
                  <AppEmptyState
                    icon={CalendarIcon}
                    title="No Upcoming Bookings"
                    description="Your schedule is clear. Book a facility below."
                  />
                ) : (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScrollPad}
                    decelerationRate="fast"
                    snapToInterval={width * 0.85 + 20}
                    snapToAlignment="start"
                  >
                    {bookings.map((bk, idx) => {
                      const startDate = new Date(bk.startTime);
                      const month = startDate.toLocaleDateString('en-US', { month: 'short' });
                      const day = startDate.toLocaleDateString('en-US', { day: '2-digit' });
                      const timeStr = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                      const { Icon, color, bgColor } = getAmenityIconConfig(bk.amenityName);

                      return (
                        <Animated.View key={bk.id} entering={FadeInRight.duration(500).delay(idx * 100)}>
                          <Pressable 
                            style={({ pressed }) => [
                              styles.ticketCard, 
                              pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 }
                            ]}
                            onPress={() => {
                              triggerHaptic();
                              Alert.alert(
                                bk.amenityName,
                                `Reservation on ${month} ${day} at ${timeStr}.\nStatus: ${bk.status.toUpperCase()}`
                              );
                            }}
                          >
                            {/* Left Side: Date Block */}
                            <View style={[styles.ticketDateBlock, { backgroundColor: bgColor }]}>
                              <Text style={[styles.ticketMonth, { color }]}>{month.toUpperCase()}</Text>
                              <Text style={[styles.ticketDay, { color }]}>{day}</Text>
                            </View>
                            
                            {/* Right Side: Details */}
                            <View style={styles.ticketDetails}>
                              <View style={styles.ticketHeader}>
                                <Text style={styles.ticketTitle} numberOfLines={1}>{bk.amenityName}</Text>
                                <View style={[styles.statusDot, { backgroundColor: bk.status === 'confirmed' ? '#10B981' : '#F59E0B' }]} />
                              </View>
                              
                              <View style={styles.ticketTimeRow}>
                                <Clock size={14} color="#6B7280" />
                                <Text style={styles.ticketTimeText}>{timeStr}</Text>
                              </View>
                            </View>
                          </Pressable>
                        </Animated.View>
                      );
                    })}
                  </ScrollView>
                )}
              </Animated.View>

              {/* Featured Experience Hero Card */}
              <BookingsHeroCard
                featuredAmenity={amenities.length > 0 ? amenities[0] : null}
                onPressFeatured={(amenity) => {
                  if (amenity) {
                    handleOpenBooking(amenity);
                  } else if (amenities.length > 0) {
                    handleOpenBooking(amenities[0]);
                  }
                }}
              />

              {/* Book Amenities (Premium Image Cards) */}
              <View style={styles.catalogSection}>
                <View style={styles.sectionHeader}>
                  <Text variant="h3" weight="bold" style={styles.sectionTitle}>
                    Explore Facilities
                  </Text>
                </View>

                {amenities.map((item, idx) => {
                  const { Icon } = getAmenityIconConfig(item.name);
                  const imageUrl = getAmenityImage(item.name);

                  return (
                    <Animated.View 
                      key={item.id} 
                      entering={FadeInUp.duration(600).delay(200 + (idx * 100))}
                      style={styles.cardWrapper}
                    >
                      <Pressable 
                        style={({ pressed }) => [styles.amenityCard, pressed && styles.cardPressed]}
                        onPress={() => handleOpenBooking(item)}
                      >
                        <View style={styles.cardInnerContainer}>
                          <Image 
                            source={{ uri: imageUrl }} 
                            style={styles.cardImage}
                            resizeMode="cover"
                          />
                          {/* Dark Gradient Overlay */}
                          <View style={styles.cardOverlay}>
                            {/* Top row: Capacity pill */}
                            <View style={styles.cardTopRow}>
                              <View style={styles.capacityPill}>
                                <Text style={styles.capacityText}>Up to {item.capacity} guests</Text>
                              </View>
                              <View style={styles.iconContainer}>
                                <Icon size={20} color="#FFF" />
                              </View>
                            </View>

                            {/* Bottom row: Info */}
                            <View style={styles.cardBottomInfo}>
                              <View style={{ flex: 1, marginRight: 16 }}>
                                <Text style={styles.cardTitle}>{item.name}</Text>
                                <Text style={styles.cardSubtitle} numberOfLines={1}>{item.description}</Text>
                              </View>
                              <View style={styles.bookButton}>
                                <ChevronRight size={20} color="#FFF" />
                              </View>
                            </View>
                          </View>
                        </View>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      </Screen>

      <CreateBookingModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedAmenity={selectedAmenity}
        bookingDate={bookingDate}
        setBookingDate={setBookingDate}
        timeSlot={timeSlot}
        setTimeSlot={setTimeSlot}
        handleConfirmBooking={handleConfirmBooking}
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
  headerContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
    marginTop: 16,
  },
  headerTitle: {
    fontSize: 34,
    letterSpacing: -0.8,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginTop: 4,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 20,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#111827',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
  },
  horizontalScrollPad: {
    paddingHorizontal: 24,
    paddingRight: 40,
    gap: 20,
    paddingBottom: 8,
  },
  
  // Premium Ticket Style Booking
  ticketCard: {
    flexDirection: 'row',
    width: width * 0.85,
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
  },
  ticketDateBlock: {
    width: 84,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  ticketMonth: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  ticketDay: {
    fontSize: 28,
    fontWeight: '900',
  },
  ticketDetails: {
    flex: 1,
    padding: 18,
    justifyContent: 'center',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  ticketTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketTimeText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },

  // Premium Image Cards for Amenities
  catalogSection: {
    marginTop: 12,
  },
  cardWrapper: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  amenityCard: {
    height: 220,
    borderRadius: 24,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  cardInnerContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E293B', // Dark slate background placeholder while image loads
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.38)',
    padding: 20,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityPill: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  capacityText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    padding: 8,
    borderRadius: 14,
  },
  cardBottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#2E7D32',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
});