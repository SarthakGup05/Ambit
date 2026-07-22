import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { Text } from '@repo/ui';
import {
  User,
  Mail,
  Lock,
  Building,
  AlertTriangle,
  Info,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/axios';
import { CustomSpinner } from '@/components/common';

interface MemberData {
  id: string;
  name: string;
  email: string;
  flatNumber: string | null;
}

interface FormProps {
  member?: MemberData | null; // If provided, we are in EDIT mode
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

export function CreateEditMemberForm({ member, onSuccess, onClose }: FormProps) {
  const isEditMode = !!member;
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-populate fields in edit mode
  useEffect(() => {
    if (member) {
      setName(member.name);
      setEmail(member.email);
      setFlatNumber(member.flatNumber || '');
    } else {
      setName('');
      setEmail('');
      setFlatNumber('');
      setPassword('');
    }
  }, [member]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter the resident\'s full name');
      triggerHaptic();
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Please enter an email address');
      triggerHaptic();
      return;
    }
    if (!flatNumber.trim()) {
      setErrorMsg('Please enter the flat / house number');
      triggerHaptic();
      return;
    }
    if (!isEditMode && (!password.trim() || password.length < 6)) {
      setErrorMsg('Please enter a password with at least 6 characters');
      triggerHaptic();
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    triggerHaptic();

    try {
      if (isEditMode && member) {
        // UPDATE
        const response = await api.put(`/api/admin/members/${member.id}`, {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          flatNumber: flatNumber.trim(),
        });
        if (response.status === 200) {
          onSuccess();
        }
      } else {
        // CREATE
        const response = await api.post('/api/admin/members', {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          flatNumber: flatNumber.trim(),
        });
        if (response.status === 201) {
          onSuccess();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Operation failed');
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

      {/* Helper callout banner */}
      <View style={styles.infoCard}>
        <Info size={18} color="#2B6CB0" style={styles.infoIcon} />
        <View style={styles.infoTextWrapper}>
          <Text style={styles.infoTitle}>Resident Portal Account</Text>
          <Text style={styles.infoDesc}>
            Residents use these credentials to log in, approve guests, view notice boards, and cast votes on active society polls.
          </Text>
        </View>
      </View>

      {/* 1. Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.fieldLabel}>Resident Name</Text>
        <View style={styles.inputWrapper}>
          <User size={18} color="#A3A1A8" style={styles.fieldIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Rohit Verma"
            placeholderTextColor="#A3A1A8"
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              setErrorMsg(null);
            }}
          />
        </View>
      </View>

      {/* 2. Flat Number */}
      <View style={styles.inputGroup}>
        <Text style={styles.fieldLabel}>Flat / Block Number</Text>
        <View style={styles.inputWrapper}>
          <Building size={18} color="#A3A1A8" style={styles.fieldIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="e.g. A-302, Phase 1"
            placeholderTextColor="#A3A1A8"
            value={flatNumber}
            onChangeText={(txt) => {
              setFlatNumber(txt);
              setErrorMsg(null);
            }}
          />
        </View>
      </View>

      {/* 3. Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.fieldLabel}>Email Address</Text>
        <View style={styles.inputWrapper}>
          <Mail size={18} color="#A3A1A8" style={styles.fieldIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="e.g. rohit@verma.com"
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

      {/* 4. Password (Only when creating) */}
      {!isEditMode && (
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Resident Password</Text>
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
      )}

      {/* Action Buttons */}
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
            <CustomSpinner color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditMode ? 'Save Changes' : 'Register Resident'}
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
    gap: 18,
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
    backgroundColor: '#2E7D32', // Green to match resident panel theme
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D32',
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
