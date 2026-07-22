import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Text as RNText,
} from 'react-native';
import { Text } from '@repo/ui';
import { Lock, Mail, User, Eye, EyeOff, Key } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { CustomSpinner } from '@/components/common';

interface RegisterFormProps {
  signupMode: 'admin' | 'invite';
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  inviteCode: string;
  setInviteCode: (v: string) => void;
  targetRole: 'resident' | 'guard';
  setTargetRole: (v: 'resident' | 'guard') => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  isLoading: boolean;
  activeError: string | null;
  onSubmit: () => void;
  onClearError: () => void;
}

export function RegisterForm({
  signupMode,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  inviteCode,
  setInviteCode,
  targetRole,
  setTargetRole,
  showPassword,
  setShowPassword,
  isLoading,
  activeError,
  onSubmit,
  onClearError,
}: RegisterFormProps) {
  return (
    <>
      {/* Error Banner */}
      {activeError && (
        <Animated.View entering={FadeInUp.duration(400)} style={styles.errorBox}>
          <Text style={styles.errorText}>{activeError}</Text>
        </Animated.View>
      )}

      <View style={styles.formContainer}>
        {/* Invite Code (invite mode only) */}
        {signupMode === 'invite' && (
          <Animated.View entering={FadeInUp.duration(300)}>
            <View style={[styles.inputWrapper, styles.inviteCodeWrapper]}>
              <Key size={20} color="#2E7D32" style={styles.inputIcon} />
              <TextInput
                placeholder="INVITE CODE (e.g. AMBIT123)"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="characters"
                value={inviteCode}
                onChangeText={(text) => {
                  setInviteCode(text.toUpperCase());
                  onClearError();
                }}
                style={[styles.input, styles.inviteCodeInput]}
              />
            </View>
          </Animated.View>
        )}

        {/* Full Name */}
        <View style={styles.inputWrapper}>
          <User size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={(text) => { setName(text); onClearError(); }}
            style={styles.input}
          />
        </View>

        {/* Email */}
        <View style={styles.inputWrapper}>
          <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            placeholder="Email Address"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => { setEmail(text); onClearError(); }}
            style={styles.input}
          />
        </View>

        {/* Password */}
        <View style={styles.inputWrapper}>
          <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            placeholder="Password (min. 6 characters)"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(text) => { setPassword(text); onClearError(); }}
            style={styles.input}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            {showPassword ? (
              <EyeOff size={20} color="#9CA3AF" />
            ) : (
              <Eye size={20} color="#9CA3AF" />
            )}
          </Pressable>
        </View>

        {/* Role Selector (invite mode only) */}
        {signupMode === 'invite' && (
          <Animated.View entering={FadeInUp.duration(300)} style={styles.roleSelectorContainer}>
            <RNText style={styles.roleLabel}>I am joining as a:</RNText>
            <View style={styles.roleButtonsRow}>
              {(['resident', 'guard'] as const).map((role) => (
                <Pressable
                  key={role}
                  style={[styles.roleButton, targetRole === role && styles.roleButtonActive]}
                  onPress={() => setTargetRole(role)}
                >
                  <RNText style={[styles.roleButtonText, targetRole === role && styles.roleButtonTextActive]}>
                    {role === 'resident' ? 'Resident' : 'Security Guard'}
                  </RNText>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Submit */}
        <Pressable onPress={onSubmit} disabled={isLoading} style={styles.submitBtn}>
          {isLoading ? (
            <CustomSpinner color="#FFFFFF" size="small" />
          ) : (
            <RNText style={styles.submitBtnText}>
              {signupMode === 'admin' ? 'Create Admin Account' : 'Join Society'}
            </RNText>
          )}
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontFamily: 'InterMedium',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    gap: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  inviteCodeWrapper: {
    borderColor: '#2E7D32',
    backgroundColor: 'rgba(46, 125, 50, 0.04)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#11111E',
    fontFamily: 'Inter',
  },
  inviteCodeInput: {
    fontFamily: 'InterBold',
    fontWeight: 'bold',
    letterSpacing: 1.5,
    color: '#2E7D32',
  },
  eyeBtn: {
    padding: 4,
  },
  roleSelectorContainer: {
    marginVertical: 4,
    gap: 8,
  },
  roleLabel: {
    fontSize: 13,
    color: '#5E5D6A',
    fontFamily: 'InterSemiBold',
  },
  roleButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E4E4E7',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  roleButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  roleButtonText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#5E5D6A',
    fontFamily: 'InterSemiBold',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#11111E',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
