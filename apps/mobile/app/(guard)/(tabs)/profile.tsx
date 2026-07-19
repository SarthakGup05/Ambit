import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { Screen, Text } from '@repo/ui';
import { ScreenBackground, AppSectionCard, AppListItem } from '@/components/common';
import { uiStyles, type } from '@/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldCheck, Mail, Building2, LogOut } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

export default function GuardProfileTab() {
  const { logout, user } = useAuth();
  const insets = useSafeAreaInsets();

  const getInitials = (name: string) => {
    if (!name) return 'SG';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    triggerHaptic();
    logout();
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <ScrollView
          contentContainerStyle={[
            uiStyles.scroll,
            { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Block */}
          <View style={styles.headerBlock}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {getInitials(user?.name || '')}
              </Text>
              <View style={styles.avatarBadge}>
                <ShieldCheck size={14} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </View>
            <Text variant="h3" weight="bold" style={styles.profileName}>
              {user?.name || 'Security Guard'}
            </Text>
            <View style={styles.rolePill}>
              <Text variant="caption" weight="bold" style={styles.roleText}>
                GATE SECURITY
              </Text>
            </View>
          </View>

          {/* Guard Identity Information */}
          <AppSectionCard label="Duty Credentials">
            <AppListItem
              Icon={Mail}
              iconColor="#1E4D2B"
              iconBg="rgba(30, 77, 43, 0.06)"
              title="Email Address"
              subtitle={user?.email || 'security@ambit.com'}
            />
            <AppListItem
              Icon={ShieldCheck}
              iconColor="#1E4D2B"
              iconBg="rgba(30, 77, 43, 0.06)"
              title="Authorization Level"
              subtitle="Active Guard Console"
            />
            <AppListItem
              Icon={Building2}
              iconColor="#1E4D2B"
              iconBg="rgba(30, 77, 43, 0.06)"
              title="Assigned Complex"
              subtitle="Ambit Residency Complex"
              isLast
            />
          </AppSectionCard>

          {/* Account Settings */}
          <AppSectionCard label="Session Settings">
            <AppListItem
              Icon={LogOut}
              iconColor="#EF4444"
              iconBg="rgba(239, 68, 68, 0.08)"
              title="Log Out"
              subtitle="End active duty session"
              onPress={handleLogout}
              isLast
            />
          </AppSectionCard>
        </ScrollView>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1E4D2B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
  },
  avatarText: {
    fontSize: 28,
    fontFamily: 'ManropeBold',
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2E7D32',
    borderWidth: 2,
    borderColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    color: '#11111E',
    fontSize: 22,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rolePill: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 77, 43, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(30, 77, 43, 0.15)',
  },
  roleText: {
    color: '#1E4D2B',
    fontSize: 10,
    fontFamily: 'InterBold',
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
});
