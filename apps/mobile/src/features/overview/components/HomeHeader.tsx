import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@repo/ui';
import { Pressable } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { BellIcon } from '../../../components/icons/BellIcon';

export function HomeHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        {/* Greeting label */}
        <Animated.View 
          entering={ZoomIn.duration(400).delay(50)} 
          style={styles.greetingRow}
        >
          <View style={styles.greetingDot} />
          <Text style={styles.greetingText}>Good Evening</Text>
        </Animated.View>

        {/* Name */}
        <Animated.View 
          entering={ZoomIn.duration(500).delay(200)}
        >
          <Text style={styles.nameText}>Sarthak 👋</Text>
        </Animated.View>

        {/* Society pill */}
        <Animated.View 
          entering={ZoomIn.duration(400).delay(400)} 
          style={styles.societyPill}
        >
          <View style={styles.societyDot} />
          <Text style={styles.societyText}>Green Heights Society</Text>
        </Animated.View>
      </View>

      {/* Bell Button — dual ring glassmorphic */}
      <Animated.View 
        entering={ZoomIn.duration(400).delay(300)} 
        style={styles.bellOuter}
      >
        <Pressable>
          <View style={styles.bellInner}>
            <BellIcon size={22} />
            <View style={styles.notifBadge} />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  textBlock: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
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
    fontSize: 34,
    color: '#11111E',
    fontFamily: 'ManropeBold',
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: 6,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginTop: 4,
  },
  bellInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
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
