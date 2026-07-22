import React, { useState } from 'react';
import { View, Platform, ScrollView, Pressable, Switch, Alert, StyleSheet } from 'react-native';
import { Screen, Text } from '@repo/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground, AppSectionCard, AppListItem } from '@/components/common';
import { uiStyles } from '@/theme';
import {
  Bell,
  Mail,
  Moon,
  HelpCircle,
  FileText,
  Building,
  CreditCard,
  Sliders,
} from 'lucide-react-native';
import Animated, { ZoomIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../../src/features/auth/hooks/useAuth';

function triggerHaptic() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* ignore */ }
}

function getInitials(name?: string) {
  if (!name) return 'A';
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function AdminProfileTab() {
  const { logout, user } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogoutPress = () => {
    triggerHaptic();
    Alert.alert('Log Out', 'Are you sure you want to log out of your session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const switchProps = (value: boolean, onValueChange: (v: boolean) => void) => ({
    value,
    onValueChange,
    trackColor: { false: '#E4E4E7', true: '#7A9B76' },
    thumbColor: Platform.OS === 'ios' ? '#FFFFFF' : value ? '#FAF8F5' : '#FFFFFF',
    ios_backgroundColor: '#E4E4E7',
  });

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <ScrollView
          contentContainerStyle={[uiStyles.scroll, { paddingTop: 24, paddingBottom: 140 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={{ marginBottom: 20 }}>
            <View style={uiStyles.brandHeaderRow}>
              <Animated.View entering={ZoomIn.duration(400).delay(50)}>
                <Text style={uiStyles.brandText}>Ambit</Text>
              </Animated.View>
              <View style={uiStyles.adminBadge}>
                <Text style={uiStyles.adminBadgeText}>ADMIN</Text>
              </View>
            </View>
          </View>

          {/* Profile Card */}
          <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#5F67EC', '#474EE0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.avatarGloss} />
              <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'Admin User'}</Text>
              <Text style={styles.userEmail}>{user?.email || ''}</Text>
              <View style={styles.societyPill}>
                <Building size={12} color="#5F67EC" style={{ marginRight: 4 }} />
                <Text style={styles.societyText}>Society Manager</Text>
              </View>
            </View>
          </Animated.View>

          {/* Settings Sections */}
          <View style={{ gap: 4 }}>
            <AppSectionCard label="Plan & Billing">
              <AppListItem
                Icon={CreditCard}
                title="SaaS Subscription"
                subtitle="Manage your Starter Free / Pro Plan status"
                valueText="Free Plan"
                onPress={() => Alert.alert('Subscription', 'Subscription management coming soon.')}
              />
              <AppListItem
                Icon={Sliders}
                title="Society Configurations"
                subtitle="Configure towers, flats & structures"
                valueText="Configured"
                onPress={() => Alert.alert('Configurations', 'Tower and flat layout builder coming soon.')}
                isLast
              />
            </AppSectionCard>

            <AppSectionCard label="Preferences">
              <AppListItem
                Icon={Bell}
                title="Push Notifications"
                subtitle="Admin approvals and society alerts"
                rightElement={
                  <Switch {...switchProps(pushEnabled, (v) => { triggerHaptic(); setPushEnabled(v); })} />
                }
              />
              <AppListItem
                Icon={Mail}
                title="Email Reports"
                subtitle="Weekly visitor entry logs & summaries"
                rightElement={
                  <Switch {...switchProps(emailEnabled, (v) => { triggerHaptic(); setEmailEnabled(v); })} />
                }
              />
              <AppListItem
                Icon={Moon}
                title="Dark Mode"
                subtitle="Sleek dark themed interface"
                isLast
                rightElement={
                  <Switch {...switchProps(darkMode, (v) => {
                    triggerHaptic();
                    setDarkMode(v);
                    Alert.alert('Preferences', 'Dark Mode will be available in the next release.');
                  })} />
                }
              />
            </AppSectionCard>

            <AppSectionCard label="Support & Info">
              <AppListItem
                Icon={HelpCircle}
                title="Help Center"
                subtitle="FAQ, guides, and support chat"
                valueText="FAQs"
                onPress={() => Alert.alert('Support', 'Support center is under construction.')}
              />
              <AppListItem
                Icon={FileText}
                title="Terms & Privacy"
                subtitle="User agreement and data practices"
                valueText="Read"
                onPress={() => Alert.alert('Legal Docs', 'Terms and Privacy docs are hosted on ambit.com.')}
                isLast
              />
            </AppSectionCard>

            <Pressable
              onPress={handleLogoutPress}
              style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            >
              <View style={uiStyles.logoutButton}>
                <Text style={uiStyles.logoutButtonText}>Log Out</Text>
              </View>
            </Pressable>

            <Text style={uiStyles.versionText}>Ambit v1.0.0 (Expo Build)</Text>
          </View>
        </ScrollView>
      </Screen>
    </View>
  );
}

// Only truly screen-specific styles remain (avatar card, not shared anywhere)
const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: Platform.OS === 'android' ? 0 : 3,
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#5F67EC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarGloss: {
    position: 'absolute',
    top: 3,
    left: 6,
    width: 26,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  avatarText: {
    fontSize: 22,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  profileInfo: {
    marginLeft: 18,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#1C1B1F',
  },
  userEmail: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#6B6873',
    marginTop: 2,
  },
  societyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(95, 103, 236, 0.06)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 8,
  },
  societyText: {
    fontSize: 11,
    fontFamily: 'InterMedium',
    color: '#5F67EC',
  },
});
