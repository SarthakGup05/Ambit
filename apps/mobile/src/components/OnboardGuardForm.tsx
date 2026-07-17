import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@repo/ui';
import {
  User,
  Mail,
  Lock,
  AlertTriangle,
  Info,
  ShieldAlert,
  Hash,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/axios';

interface FormProps {
  onSuccess: () => void;
  onClose: () => void;
}

const triggerHaptic = () => {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (e) {
    // ignore
  }
};

export function OnboardGuardForm({ onSuccess, onClose }: FormProps) {
  const [name, setName] = useState('');
  const [gateNumber, setGateNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter the guard\'s full name');
      triggerHaptic();
      return;
    }
    if (!gateNumber.trim()) {
      setErrorMsg('Please enter the assigned gate number');
      triggerHaptic();
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter an email address');
      triggerHaptic();
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMsg('Please enter a password with at least 6 characters');
      triggerHaptic();
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    triggerHaptic();

    try {
      const response = await api.post('/api/onboarding/guard', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        gateNumber: gateNumber.trim(),
      });

      if (response.status === 201) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to onboard guard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {errorMsg && (
        <View style={styles.errorBox}>
          <AlertTriangle size={16} color="#E53E3E" style={styles.errorIcon} />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {/* Info Callout Card */}
      <View style={styles.infoCard}>
        <ShieldAlert size={20} color="#3182CE" style={styles.infoIcon} />
        <View style={styles.infoTextWrapper}>
          <Text style={styles.infoTitle}>Guard Terminal Access</Text>
          <Text style={styles.infoDesc}>
            Guards will use these credentials to log into the Ambit Gate Portal app to manage visitor approvals.
          </Text>
        </View>
      </View>

      {/* 1. Guard Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.fieldLabel}>Full Name</Text>
        <View style={styles.inputWrapper}>
          <User size={18} color="#A3A1A8" style={styles.fieldIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Bahadur Singh"
            placeholderTextColor="#A3A1A8"
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              setErrorMsg(null);
            }}
          />
        </View>
      </View>

      {/* 1b. Gate Number */}
      <View style={styles.inputGroup}>
        <Text style={styles.fieldLabel}>Assigned Gate Number</Text>
        <View style={styles.inputWrapper}>
          <Hash size={18} color="#A3A1A8" style={styles.fieldIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Gate 1, Main Entrance"
            placeholderTextColor="#A3A1A8"
            value={gateNumber}
            onChangeText={(txt) => {
              setGateNumber(txt);
              setErrorMsg(null);
            }}
          />
        </View>
      </View>

      {/* 2. Guard Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.fieldLabel}>Email Address</Text>
        <View style={styles.inputWrapper}>
          <Mail size={18} color="#A3A1A8" style={styles.fieldIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="e.g. guard1@ambit.com"
            placeholderTextColor="#A3A1A8"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              setErrorMsg(null);
            }}
          />
        </View>
      </View>

      {/* 3. Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.fieldLabel}>Portal Password</Text>
        <View style={styles.inputWrapper}>
          <Lock size={18} color="#A3A1A8" style={styles.fieldIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Minimum 6 characters"
            placeholderTextColor="#A3A1A8"
            secureTextEntry={true}
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              setErrorMsg(null);
            }}
          />
        </View>
      </View>

      {/* Action Footer */}
      <View style={styles.formFooter}>
        <Pressable style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Confirm Onboarding</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
    gap: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorIcon: {
    marginRight: 10,
  },
  errorText: {
    flex: 1,
    color: '#C53030',
    fontSize: 13,
    fontFamily: 'InterSemiBold',
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(49, 130, 206, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(49, 130, 206, 0.15)',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#2B6CB0',
  },
  infoDesc: {
    fontSize: 11.5,
    fontFamily: 'Inter',
    color: '#4A5568',
    lineHeight: 16,
    marginTop: 2,
  },
  inputGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13.5,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#2D3748',
    letterSpacing: 0.1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#1A202C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  fieldIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: '#1A202C',
    fontSize: 14.5,
    fontFamily: 'InterMedium',
  },
  formFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    backgroundColor: 'transparent',
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'InterSemiBold',
    color: '#4A5568',
  },
  submitButton: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#4A5568', // Slate grey to match the dashboard's slate theme
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A5568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 14,
    fontFamily: 'InterBold',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
