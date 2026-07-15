import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Screen, Text } from '@repo/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { User, LogOut } from 'lucide-react-native';

export default function ProfileTab() {
  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* Premium background gradient */}
      <LinearGradient
        colors={['#D6E4FF', '#EEE0F8', '#FFE8DC']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Background blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text variant="h1" className="font-bold text-[#11111E]">
              Profile
            </Text>
            <Text className="text-[#5E5D6A] text-sm mt-1">
              Manage your personal settings and apartment credentials.
            </Text>
          </View>

          {/* Body Card */}
          <View style={styles.card}>
            <View style={styles.iconWrapper}>
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.gloss} />
              <User size={32} color="#FFFFFF" strokeWidth={2} />
            </View>

            <Text variant="h3" className="font-bold text-[#11111E] text-center mt-6">
              Resident Account
            </Text>
            
            <Text style={styles.description}>
              Configure your notifications, switch between multiple owned/rented properties, update family members access details, and view logs of security entries.
            </Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>COMING SOON</Text>
            </View>
          </View>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    justifyContent: 'space-between',
    paddingBottom: 140, // offset tab bar
  },
  header: {
    marginBottom: 20,
  },
  card: {
    flex: 1,
    maxHeight: 420,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5B5EA6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  gloss: {
    position: 'absolute',
    top: 4,
    left: 8,
    width: 32,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  description: {
    fontSize: 14,
    color: '#5E5D6A',
    fontFamily: 'Inter',
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
  },
  badge: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'InterBold',
    color: '#2563EB',
    letterSpacing: 1,
  },
  blob1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
  },
  blob2: {
    position: 'absolute',
    bottom: 120,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(99, 179, 237, 0.1)',
  },
});
