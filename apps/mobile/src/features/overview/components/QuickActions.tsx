import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@repo/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { QrCode, Users } from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';

// Custom Pool Icon
function PoolIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 20V9a3 3 0 0 1 6 0v2" />
      <Path d="M18 20V9a3 3 0 0 0-6 0v2" />
      <Path d="M6 13h12" />
      <Path d="M6 17h12" />
      <Path d="M2 20c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />
    </Svg>
  );
}

// Custom Helpdesk Icon
function HelpdeskIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="8" r="3.5" />
      <Path d="M5 15h7a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8l-3 3H3v-8z" />
    </Svg>
  );
}

const ACTIONS = [
  {
    id: 'qr-pass',
    title: 'QR Pass',
    Icon: QrCode,
    colors: ['#5F67EC', '#474EE0'] as const,
    iconColor: '#FFFFFF',
    isCustom: false,
  },
  {
    id: 'visitors',
    title: 'Visitors',
    Icon: Users,
    colors: ['#FFC107', '#FF8F00'] as const,
    iconColor: '#FFFFFF',
    isCustom: false,
  },
  {
    id: 'helpdesk',
    title: 'Helpdesk',
    Icon: HelpdeskIcon,
    colors: ['#10B981', '#059669'] as const,
    iconColor: '#FFFFFF',
    isCustom: true,
  },
  {
    id: 'amenities',
    title: 'Amenities',
    Icon: PoolIcon,
    colors: ['#F43F5E', '#E11D48'] as const,
    iconColor: '#FFFFFF',
    isCustom: true,
  },
];

export function QuickActions() {
  return (
    <View style={styles.container}>
      {ACTIONS.map((action) => {
        const { Icon } = action;
        return (
          <Pressable key={action.id} style={styles.actionItem}>
            {/* Circle container */}
            <View style={styles.circle}>
              <LinearGradient
                colors={action.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              
              {/* Gloss highlight */}
              <View style={styles.circleGloss} />

              {/* Icon */}
              {action.isCustom ? (
                <Icon color={action.iconColor} />
              ) : (
                <Icon size={20} color={action.iconColor} strokeWidth={2.4} />
              )}
            </View>

            {/* Label */}
            <Text style={styles.label}>
              {action.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  actionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  circleGloss: {
    position: 'absolute',
    top: 3,
    left: 6,
    width: 22,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  label: {
    fontSize: 11,
    fontFamily: 'InterBold',
    color: '#11111E',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.1,
  }
});
