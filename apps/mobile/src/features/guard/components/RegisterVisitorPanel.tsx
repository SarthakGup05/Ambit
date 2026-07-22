import React from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Text } from '@repo/ui';
import { AppSectionCard } from '@/components/common';
import {
  Building2,
  User,
  ArrowRight,
  Clock,
  Package,
  Car,
  Wrench,
  CheckCircle2,
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

function triggerHaptic(style = Haptics.ImpactFeedbackStyle.Light) {
  try {
    Haptics.impactAsync(style).catch(() => {});
  } catch {
    // ignore
  }
}

const PURPOSES = [
  { id: 'Delivery', label: 'Delivery', Icon: Package },
  { id: 'Cab', label: 'Cab / Taxi', Icon: Car },
  { id: 'Guest', label: 'Personal Guest', Icon: User },
  { id: 'Service', label: 'Service / Worker', Icon: Wrench },
];

interface RegisterVisitorPanelProps {
  flatNumber: string;
  setFlatNumber: (v: string) => void;
  visitorName: string;
  setVisitorName: (v: string) => void;
  visitorPhone: string;
  setVisitorPhone: (v: string) => void;
  selectedPurpose: string;
  setSelectedPurpose: (v: string) => void;
  registering: boolean;
  registerSuccess: string | null;
  onRegister: () => void;
}

export function RegisterVisitorPanel({
  flatNumber,
  setFlatNumber,
  visitorName,
  setVisitorName,
  visitorPhone,
  setVisitorPhone,
  selectedPurpose,
  setSelectedPurpose,
  registering,
  registerSuccess,
  onRegister,
}: RegisterVisitorPanelProps) {
  return (
    <Animated.View entering={FadeInUp.duration(300)}>
      {registerSuccess && (
        <View style={styles.successBanner}>
          <CheckCircle2 size={20} color="#2E7D32" />
          <Text variant="body" weight="bold" style={styles.successText}>
            {registerSuccess}
          </Text>
        </View>
      )}

      <AppSectionCard label="Entry Details" cardStyle={{ padding: 24 }}>
        {/* Flat Number Input */}
        <Text variant="caption" weight="bold" style={[styles.inputLabel, { marginTop: 0 }]}>
          TARGET FLAT NUMBER *
        </Text>
        <View style={styles.inputWrapper}>
          <Building2 size={18} color="#4E6D3B" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.input}
            placeholder="e.g. A-102, B-501"
            placeholderTextColor="rgba(17,17,30,0.4)"
            value={flatNumber}
            onChangeText={setFlatNumber}
            autoCapitalize="characters"
          />
        </View>

        {/* Visitor Purpose Selector */}
        <Text variant="caption" weight="bold" style={styles.inputLabel}>
          ENTRY PURPOSE
        </Text>
        <View style={styles.purposeGrid}>
          {PURPOSES.map((item) => {
            const isSelected = selectedPurpose === item.id;
            const IconComp = item.Icon;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  triggerHaptic();
                  setSelectedPurpose(item.id);
                }}
                style={[styles.purposeCard, isSelected && styles.purposeCardSelected]}
              >
                <IconComp size={20} color={isSelected ? '#FFFFFF' : '#4E6D3B'} />
                <Text
                  variant="caption"
                  weight="bold"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                  style={[styles.purposeText, isSelected && styles.purposeTextSelected]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Visitor Name */}
        <Text variant="caption" weight="bold" style={styles.inputLabel}>
          VISITOR NAME *
        </Text>
        <View style={styles.inputWrapper}>
          <User size={18} color="#4E6D3B" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.input}
            placeholder="Full Name (or Delivery Agency)"
            placeholderTextColor="rgba(17,17,30,0.4)"
            value={visitorName}
            onChangeText={setVisitorName}
          />
        </View>

        {/* Visitor Phone */}
        <Text variant="caption" weight="bold" style={styles.inputLabel}>
          PHONE NUMBER (OPTIONAL)
        </Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="+91 98765 43210"
            placeholderTextColor="rgba(17,17,30,0.4)"
            keyboardType="phone-pad"
            value={visitorPhone}
            onChangeText={setVisitorPhone}
          />
        </View>

        {/* Automatic Entry Timestamp Preview */}
        <View style={styles.timeInfoBox}>
          <Clock size={16} color="#4E6D3B" />
          <Text variant="caption" weight="medium" style={{ color: '#4E6D3B', flex: 1 }}>
            Auto Entry Timestamp:{' '}
            <Text variant="caption" weight="bold" style={{ color: '#4E6D3B' }}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Text>
        </View>

        {/* Submit Action Button */}
        <Pressable onPress={onRegister} disabled={registering} style={styles.submitBtn}>
          {registering ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text variant="body" weight="bold" style={styles.submitBtnText}>
                CHECK IN AT GATE
              </Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </>
          )}
        </Pressable>
      </AppSectionCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    color: 'rgba(17,17,30,0.6)',
    marginBottom: 8,
    marginTop: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(17,17,30,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#11111E',
    padding: 0,
  },
  purposeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  purposeCard: {
    flex: 1,
    minWidth: '45%',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(17,17,30,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(17,17,30,0.08)',
    gap: 8,
  },
  purposeCardSelected: {
    backgroundColor: '#4E6D3B',
    borderColor: '#4E6D3B',
  },
  purposeText: {
    color: '#4E6D3B',
    fontSize: 13,
  },
  purposeTextSelected: {
    color: '#FFFFFF',
  },
  submitBtn: {
    marginTop: 28,
    backgroundColor: '#4E6D3B',
    borderRadius: 18,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    gap: 10,
  },
  successText: {
    color: '#2E7D32',
    flex: 1,
    fontSize: 14,
  },
  timeInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4EFE0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
    gap: 8,
  },
});
