import React, { useState } from 'react';
import { View, StyleSheet, Platform, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { Screen, Text } from '@repo/ui';
import { AppSectionCard, AppListItem } from '@/components/common';
import { uiStyles } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  Mail,
  Moon,
  HelpCircle,
  FileText,
  Building,
  UserCheck,
} from 'lucide-react-native';
import Animated, { ZoomIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../../src/features/auth/hooks/useAuth';

export default function ResidentProfileTab() {
  const { logout, user } = useAuth();

  // Local settings state
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Micro-interaction trigger
  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
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

  // Get user initials for premium avatar
  const getInitials = (name?: string) => {
    if (!name) return "R";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* Premium calm background */}
      <LinearGradient
        colors={['#FDFCFB', '#F4F1EA', '#FAF8F5']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <ScrollView
          contentContainerStyle={uiStyles.scroll}
          showsVerticalScrollIndicator={false}
          style={{ paddingTop: 40, paddingBottom: 140 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Animated.View entering={ZoomIn.duration(400).delay(50)}>
                <Text style={styles.brandText}>Ambit</Text>
              </Animated.View>
              <View style={styles.residentBadge}>
                <Text style={styles.residentBadgeText}>RESIDENT</Text>
              </View>
            </View>
          </View>

          {/* Profile Card Section */}
          <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#C3E2C4', '#7A9B76']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.avatarGloss} />
              <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || "Resident User"}</Text>
              <Text style={styles.userEmail}>{user?.email || ""}</Text>

              {user?.flatNumber && (
                <View style={styles.flatPill}>
                  <Building size={12} color="#6B6873" style={{ marginRight: 4 }} />
                  <Text style={styles.flatText}>
                    {user.flatNumber}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Settings Sections — Reusable AppSectionCard & AppListItem */}
          <View style={styles.settingsContainer}>
            {/* Section 1: Account & Society */}
            <AppSectionCard label="Account & Society">
              <AppListItem
                Icon={Building}
                title="Switch Society"
                subtitle="Connect to another resident profile"
                valueText={user?.flatNumber || "No Flat"}
                onPress={() => {
                  Alert.alert("Society Management", "Multiple society switcher is coming soon.");
                }}
              />
              <AppListItem
                Icon={UserCheck}
                title="Family Members"
                subtitle="Manage co-resident access keys"
                valueText="0 Active"
                onPress={() => {
                  Alert.alert("Family Access", "Manage co-residents & tenant invites coming soon.");
                }}
                isLast={true}
              />
            </AppSectionCard>

            {/* Section 2: Preferences */}
            <AppSectionCard label="Preferences">
              <AppListItem
                Icon={Bell}
                title="Push Notifications"
                subtitle="Visitor entry, notices, and alerts"
                rightElement={
                  <Switch
                    value={pushEnabled}
                    onValueChange={(val) => {
                      triggerHaptic();
                      setPushEnabled(val);
                    }}
                    trackColor={{ false: '#E4E4E7', true: '#7A9B76' }}
                    thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : pushEnabled ? '#FAF8F5' : '#FFFFFF'}
                    ios_backgroundColor="#E4E4E7"
                  />
                }
              />
              <AppListItem
                Icon={Mail}
                title="Email Updates"
                subtitle="Receive monthly maintenance bills"
                rightElement={
                  <Switch
                    value={emailEnabled}
                    onValueChange={(val) => {
                      triggerHaptic();
                      setEmailEnabled(val);
                    }}
                    trackColor={{ false: '#E4E4E7', true: '#7A9B76' }}
                    thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : emailEnabled ? '#FAF8F5' : '#FFFFFF'}
                    ios_backgroundColor="#E4E4E7"
                  />
                }
              />
              <AppListItem
                Icon={Moon}
                title="Dark Mode"
                subtitle="Sleek dark themed interface"
                isLast={true}
                rightElement={
                  <Switch
                    value={darkMode}
                    onValueChange={(val) => {
                      triggerHaptic();
                      setDarkMode(val);
                      Alert.alert("Preferences", "Dark Mode will be available in the next release.");
                    }}
                    trackColor={{ false: '#E4E4E7', true: '#7A9B76' }}
                    thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : darkMode ? '#FAF8F5' : '#FFFFFF'}
                    ios_backgroundColor="#E4E4E7"
                  />
                }
              />
            </AppSectionCard>

            {/* Section 3: Support & Info */}
            <AppSectionCard label="Support & Info">
              <AppListItem
                Icon={HelpCircle}
                title="Help Center"
                subtitle="FAQ, guides, and support chat"
                valueText="FAQs"
                onPress={() => {
                  Alert.alert("Support", "Support center is under construction.");
                }}
              />
              <AppListItem
                Icon={FileText}
                title="Terms & Privacy"
                subtitle="User agreement and data practices"
                valueText="Read"
                onPress={() => {
                  Alert.alert("Legal Docs", "Terms and Privacy docs are hosted on ambit.com.");
                }}
                isLast={true}
              />
            </AppSectionCard>

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

const styles = StyleSheet.create({
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
  residentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(122, 155, 118, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(122, 155, 118, 0.25)',
  },
  residentBadgeText: {
    fontSize: 10,
    fontFamily: 'InterBold',
    color: '#7A9B76',
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
    marginBottom: 24,
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
    shadowColor: '#7A9B76',
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
  flatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 8,
  },
  flatText: {
    fontSize: 11,
    fontFamily: 'InterMedium',
    color: '#6B6873',
  },
  settingsContainer: {
    gap: 4,
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
  blob1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(122, 155, 118, 0.08)',
  },
  blob2: {
    position: 'absolute',
    bottom: 120,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(43, 46, 74, 0.04)',
  },
});
