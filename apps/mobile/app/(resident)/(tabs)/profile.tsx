import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Screen, Text } from '@repo/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { User, LogOut } from 'lucide-react-native';
import Animated, { ZoomIn, FadeIn } from 'react-native-reanimated';

export default function ProfileTab() {
  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* Premium background gradient */}
      <LinearGradient
        colors={['#E8F5E9', '#F4F7F4', '#FAF8F5']}
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
            <View style={styles.headerTop}>
              <Animated.View entering={ZoomIn.duration(400).delay(50)}>
                <Text style={styles.brandText}>Ambit</Text>
              </Animated.View>
            </View>

            <View style={styles.greetingSection}>
              <Animated.View entering={FadeIn.duration(350).delay(150)}>
                <Text variant="h2" className="font-bold text-[#11111E]">
                  Profile
                </Text>
              </Animated.View>
              <Text style={styles.descriptionText}>
                Manage your personal settings and apartment credentials.
              </Text>
            </View>
          </View>

          {/* Body Card */}
          <View style={styles.card}>
            <View style={styles.iconWrapper}>
              <LinearGradient
                colors={['#C3E2C4', '#2E7D32']}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  greetingSection: {
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 14,
    color: '#5E5D6A',
    fontFamily: 'Inter',
    lineHeight: 18,
    marginTop: 4,
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
    shadowColor: '#71717A',
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
    shadowColor: '#2E7D32',
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
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.25)',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'InterBold',
    color: '#2E7D32',
    letterSpacing: 1,
  },
  blob1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(195, 226, 196, 0.25)',
  },
  blob2: {
    position: 'absolute',
    bottom: 120,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(168, 209, 170, 0.15)',
  },
});
