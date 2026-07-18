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
import { Amenity } from '../api';

interface CreateBookingModalProps {
  visible: boolean;
  onClose: () => void;
  selectedAmenity: Amenity | null;
  bookingDate: 'tomorrow' | 'next-weekend';
  setBookingDate: (val: 'tomorrow' | 'next-weekend') => void;
  timeSlot: string;
  setTimeSlot: (val: string) => void;
  handleConfirmBooking: () => void;
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
}: CreateBookingModalProps) {
  if (!visible || !selectedAmenity) return null;

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={uiStyles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={uiStyles.modalContent}
        >
          <View style={uiStyles.modalHeader}>
            <Text style={uiStyles.modalTitle}>Reserve {selectedAmenity.name}</Text>
            <Pressable style={uiStyles.closeBtn} onPress={onClose}>
              <X size={18} color="#4A5568" />
            </Pressable>
          </View>

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
        </KeyboardAvoidingView>
      </View>
    </Modal>
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
