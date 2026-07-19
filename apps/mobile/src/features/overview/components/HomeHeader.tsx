import React from 'react';
import { View, StyleSheet, Pressable, Platform, Image } from 'react-native';
import { Text } from '@repo/ui';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { BellIcon } from '../../../components/icons/BellIcon';
import { BadgeIconWrapper } from '@/components/common';
import { useNotificationStore } from '@/store';

export function HomeHeader() {
  const { unreadCount } = useNotificationStore();

  return (
    <View style={styles.container}>
      {/* Top Brand & Notification row */}
      <View style={styles.headerTop}>
        <Animated.View entering={ZoomIn.duration(400).delay(50)} style={styles.brandRow}>
          <Image 
            source={require('../../../../assets/ambit_logo.png')} 
            style={styles.logoImage} 
            resizeMode="contain" 
          />
          <Text style={styles.brandText}>mbit</Text>
        </Animated.View>

        {/* Bell Button — dual ring glassmorphic */}
        <Animated.View 
          entering={ZoomIn.duration(400).delay(300)} 
          style={styles.bellOuter}
        >
          <Pressable>
            <View style={styles.bellInner}>
              <BadgeIconWrapper count={unreadCount} theme="blood_red">
                <BellIcon size={22} />
              </BadgeIconWrapper>
            </View>
          </Pressable>
        </Animated.View>
      </View>

      {/* Greeting & Society info */}
      <View style={styles.greetingSection}>
        <Animated.View 
          entering={ZoomIn.duration(400).delay(150)} 
          style={styles.greetingRow}
        >
          <View style={styles.greetingDot} />
          <Text style={styles.greetingText}>Good Evening</Text>
        </Animated.View>

        {/* Name */}
        <Animated.View 
          entering={ZoomIn.duration(500).delay(250)}
        >
          <Text style={styles.nameText}>Sarthak 👋</Text>
        </Animated.View>

        {/* Society pill */}
        <Animated.View 
          entering={ZoomIn.duration(400).delay(350)} 
          style={styles.societyPill}
        >
          <View style={styles.societyDot} />
          <Text style={styles.societyText}>Green Heights Society</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  logoImage: {
    width: 28,
    height: 28,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1C1B1F',
    fontFamily: 'ManropeBold',
    letterSpacing: -0.5,
  },
  greetingSection: {
    marginTop: 2,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  greetingDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#6B7280',
    marginRight: 6,
  },
  greetingText: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Inter',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  nameText: {
    fontSize: 26,
    color: '#11111E',
    fontFamily: 'ManropeBold',
    letterSpacing: -0.6,
    lineHeight: 32,
    marginBottom: 8,
  },
  societyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  societyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
    marginRight: 6,
  },
  societyText: {
    fontSize: 11,
    color: '#2E7D32',
    fontFamily: 'InterBold',
    letterSpacing: 0.3,
  },
  bellOuter: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellInner: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
});
