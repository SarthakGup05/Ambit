import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { Screen, Text } from '@repo/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '@/components/common';
import {
  Shield,
  Bell,
  Mail,
  Moon,
  ChevronRight,
  HelpCircle,
  FileText,
  LogOut,
  Building,
  CreditCard,
  Sliders,
} from 'lucide-react-native';
import Animated, { ZoomIn, FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../../src/features/auth/hooks/useAuth';

export default function AdminProfileTab() {
  const { logout, user } = useAuth();

  // Local settings state
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Micro-interaction trigger
  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // ignore
    }
  };

  const handleTogglePush = (val: boolean) => {
    triggerHaptic();
    setPushEnabled(val);
  };

  const handleToggleEmail = (val: boolean) => {
    triggerHaptic();
    setEmailEnabled(val);
  };

  const handleToggleDark = (val: boolean) => {
    triggerHaptic();
    setDarkMode(val);
    Alert.alert("Preferences", "Dark Mode will be available in the next release.");
  };

  const handleLogoutPress = () => {
    triggerHaptic();
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your session?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: logout }
      ]
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <ScreenBackground />

      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Animated.View entering={ZoomIn.duration(400).delay(50)}>
                <Text style={styles.brandText}>Ambit</Text>
              </Animated.View>
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
            </View>
          </View>

          {/* Profile Card Section */}
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
              <Text style={styles.userName}>{user?.name || "Admin User"}</Text>
              <Text style={styles.userEmail}>{user?.email || ""}</Text>

              <View style={styles.societyPill}>
                <Building size={12} color="#5F67EC" style={{ marginRight: 4 }} />
                <Text style={styles.societyText}>
                  Society Manager
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Settings Sections */}
          <View style={styles.settingsContainer}>
            
            {/* Section 1: Plan & Billing */}
            <Text style={styles.sectionLabel}>Plan & Billing</Text>
            <View style={styles.sectionCard}>
              <SettingItem
                Icon={CreditCard}
                title="SaaS Subscription"
                description="Manage your Starter Free / Pro Plan status"
                valueText="Free Plan"
                onPress={() => {
                  Alert.alert("Subscription", "Subscription management coming soon.");
                }}
              />
              <View style={styles.divider} />
              <SettingItem
                Icon={Sliders}
                title="Society Configurations"
                description="Configure towers, flats & structures"
                valueText="Configured"
                onPress={() => {
                  Alert.alert("Configurations", "Tower and flat layout builder coming soon.");
                }}
              />
            </View>

            {/* Section 2: Preferences */}
            <Text style={styles.sectionLabel}>Preferences</Text>
            <View style={styles.sectionCard}>
              <SettingToggleItem
                Icon={Bell}
                title="Push Notifications"
                description="Admin approvals and society alerts"
                value={pushEnabled}
                onValueChange={setPushEnabled}
              />
              <View style={styles.divider} />
              <SettingToggleItem
                Icon={Mail}
                title="Email Reports"
                description="Weekly visitor entry logs & summaries"
                value={emailEnabled}
                onValueChange={setEmailEnabled}
              />
              <View style={styles.divider} />
              <SettingToggleItem
                Icon={Moon}
                title="Dark Mode"
                description="Sleek dark themed interface"
                value={darkMode}
                onValueChange={(val) => {
                  setDarkMode(val);
                  Alert.alert("Preferences", "Dark Mode will be available in the next release.");
                }}
              />
            </View>

            {/* Section 3: Support & Info */}
            <Text style={styles.sectionLabel}>Support & Info</Text>
            <View style={styles.sectionCard}>
              <SettingItem
                Icon={HelpCircle}
                title="Help Center"
                description="FAQ, guides, and support chat"
                valueText="FAQs"
                onPress={() => {
                  Alert.alert("Support", "Support center is under construction.");
                }}
              />
              <View style={styles.divider} />
              <SettingItem
                Icon={FileText}
                title="Terms & Privacy"
                description="User agreement and data practices"
                valueText="Read"
                onPress={() => {
                  Alert.alert("Legal Docs", "Terms and Privacy docs are hosted on ambit.com.");
                }}
              />
            </View>

            {/* Logout button */}
            <Pressable
              onPress={handleLogoutPress}
              style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.98 : 1 }] }
              ]}
            >
              <View style={styles.logoutButton}>
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </View>
            </Pressable>

            {/* Version Footer */}
            <Text style={styles.versionText}>Ambit v1.0.0 (Expo Build)</Text>
          </View>
        </ScrollView>
      </Screen>
    </View>
  );
}

// ─── Shared Setting List Item Component ──────────────────────────────────────
interface SettingItemProps {
  Icon: any;
  title: string;
  description: string;
  valueText?: string;
  onPress: () => void;
}

function SettingItem({ Icon, title, description, valueText, onPress }: SettingItemProps) {
  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // ignore
    }
  };

  const handlePress = () => {
    triggerHaptic();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        pressed && styles.settingRowPressed,
      ]}
    >
      <View style={styles.settingRow}>
        <View style={styles.settingIconWrapper}>
          <Icon size={15} color="#4A5568" strokeWidth={2.2} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text variant="body" weight="semibold" className="text-[#1C1B1F] text-[14.5px] leading-5">{title}</Text>
          <Text variant="caption" className="text-[#8E8D94] text-[11.5px] mt-0.5">{description}</Text>
        </View>
        {valueText && (
          <Text style={styles.valueText}>{valueText}</Text>
        )}
        <ChevronRight size={14} color="#A3A1A8" strokeWidth={2.5} style={{ marginLeft: 6 }} />
      </View>
    </Pressable>
  );
}

// ─── Shared Setting Toggle Component ─────────────────────────────────────────
interface SettingToggleProps {
  Icon: any;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

function SettingToggleItem({ Icon, title, description, value, onValueChange }: SettingToggleProps) {
  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // ignore
    }
  };

  const handleToggle = (val: boolean) => {
    triggerHaptic();
    onValueChange(val);
  };

  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIconWrapper}>
        <Icon size={15} color="#4A5568" strokeWidth={2.2} />
      </View>
      <View style={styles.settingTextContainer}>
        <Text variant="body" weight="semibold" className="text-[#1C1B1F] text-[14.5px] leading-5">{title}</Text>
        <Text variant="caption" className="text-[#8E8D94] text-[11.5px] mt-0.5">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={handleToggle}
        trackColor={{ false: '#E4E4E7', true: '#7A9B76' }}
        thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : value ? '#FAF8F5' : '#FFFFFF'}
        ios_backgroundColor="#E4E4E7"
      />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 140,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandText: {
    fontFamily: Platform.select({
      ios: 'Snell Roundhand',
      android: 'cursive',
      default: 'serif',
    }),
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
  },
  adminBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(95, 103, 236, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(95, 103, 236, 0.25)',
  },
  adminBadgeText: {
    fontSize: 10,
    fontFamily: 'InterBold',
    color: '#5F67EC',
    letterSpacing: 1.2,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
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
  settingsContainer: {
    gap: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'InterBold',
    color: '#8E8D94',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginLeft: 4,
    marginBottom: -8,
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  settingRowPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.045)',
  },
  settingIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(74, 85, 104, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  valueText: {
    fontSize: 13,
    fontFamily: 'InterMedium',
    color: '#8E8D94',
    marginRight: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(28, 27, 31, 0.08)',
    marginLeft: 56,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    marginTop: 10,
    backgroundColor: '#C1584B',
    shadowColor: '#C1584B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutButtonPressed: {
    backgroundColor: '#A8493D',
    transform: [{ scale: 0.98 }],
  },
  logoutButtonText: {
    fontSize: 14,
    fontFamily: 'InterBold',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 11,
    fontFamily: 'Inter',
    color: '#A3A1A8',
    textAlign: 'center',
    marginTop: 8,
  },
});
