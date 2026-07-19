import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Text } from '@repo/ui';
import { uiStyles } from '@/theme';
import { X, Clock, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Amenity } from '../api';

const FOREST_GREEN = '#1E4D2B';

interface CreateBookingModalProps {
  visible: boolean;
  onClose: () => void;
  selectedAmenity: Amenity | null;
  bookingDate: 'tomorrow' | 'next-weekend';
  setBookingDate: (val: 'tomorrow' | 'next-weekend') => void;
  timeSlot: string;
  setTimeSlot: (val: string) => void;
  handleConfirmBooking: () => void;
  bottomInset?: number;
}

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

export function CreateBookingModal({
  visible,
  onClose,
  selectedAmenity,
  bookingDate,
  setBookingDate,
  timeSlot,
  setTimeSlot,
  handleConfirmBooking,
  bottomInset,
}: CreateBookingModalProps) {
  const insets = useSafeAreaInsets();

  if (!visible || !selectedAmenity) return null;

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={uiStyles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[
            uiStyles.modalContent,
            {
              maxHeight: '90%',
              flexDirection: 'column',
              paddingBottom: 0, // Handled dynamically in footer via insets
            },
          ]}
        >
          {/* Header */}
          <View style={uiStyles.modalHeader}>
            <Text style={uiStyles.modalTitle}>Reserve {selectedAmenity.name}</Text>
            <Pressable style={uiStyles.closeBtn} onPress={onClose}>
              <X size={18} color="#4A5568" />
            </Pressable>
          </View>

          {/* Scrollable Form Fields */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flexShrink: 1 }}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
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
                      style={[
                        styles.pillBtn,
                        isActive && { backgroundColor: FOREST_GREEN, borderColor: FOREST_GREEN },
                      ]}
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
                      style={[
                        styles.pillBtn,
                        isActive && { backgroundColor: FOREST_GREEN, borderColor: FOREST_GREEN },
                      ]}
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
          </ScrollView>

          {/* Sticky Bottom Confirm Button using Safe Area Insets */}
          <View style={[styles.footer, { paddingBottom: Math.max(bottomInset ?? insets.bottom, 16) }]}>
            <Pressable
              onPress={handleConfirmBooking}
              style={({ pressed }) => [
                { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
              ]}
            >
              <View style={styles.confirmBtn}>
                <Text style={styles.confirmBtnText}>Confirm Reservation</Text>
              </View>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 16,
  },
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
  pillText: {
    fontSize: 12,
    fontFamily: 'InterMedium',
    color: '#4A5568',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontFamily: 'InterBold',
  },
  footer: {
    paddingTop: 12,
    backgroundColor: '#FAF8F5',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  confirmBtn: {
    backgroundColor: FOREST_GREEN,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: FOREST_GREEN,
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
