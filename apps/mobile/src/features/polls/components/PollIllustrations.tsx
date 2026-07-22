import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { COLORS, RADIUS } from '../constants';

export function CommunityIllustration() {
  return (
    <Svg width={44} height={36} viewBox="0 0 44 36" fill="none">
      <Circle cx={22} cy={12} r={6} fill="#A3C997" opacity={0.4} />
      <Circle cx={22} cy={12} r={4} fill={COLORS.primary} />
      <Path
        d="M13 28c0-4.4 4-8 9-8s9 3.6 9 8"
        stroke={COLORS.primary}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx={11} cy={15} r={3} fill={COLORS.inkMuted} opacity={0.7} />
      <Path
        d="M5 28c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke={COLORS.inkMuted}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.7}
      />
      <Circle cx={33} cy={15} r={3} fill={COLORS.inkMuted} opacity={0.7} />
      <Path
        d="M27 28c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke={COLORS.inkMuted}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.7}
      />
    </Svg>
  );
}

export function SwingIllustration() {
  return (
    <Svg width={32} height={28} viewBox="0 0 32 28" fill="none">
      <Path d="M6 24L12 4M26 24L20 4M12 4L20 4" stroke={COLORS.primary} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M13 4V18M19 4V18" stroke={COLORS.primary} strokeWidth={1} />
      <Rect x={11} y={18} width={10} height={3} rx={1} fill={COLORS.primary} />
    </Svg>
  );
}

export function BenchIllustration() {
  return (
    <Svg width={32} height={28} viewBox="0 0 32 28" fill="none">
      <Rect x={5} y={12} width={22} height={3} rx={1} fill={COLORS.accentTerracotta} opacity={0.85} />
      <Path d="M6 8V12M26 8V12" stroke={COLORS.accentTerracotta} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M8 15V23M24 15V23" stroke={COLORS.textMuted} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function CloudIllustration() {
  return (
    <Svg width={32} height={28} viewBox="0 0 32 28" fill="none">
      <Path
        d="M8 20C5.8 20 4 18.2 4 16C4 14.1 5.4 12.4 7.2 12.1C7.1 11.6 7 11 7 10.5C7 7.5 9.5 5 12.5 5C14.8 5 16.8 6.4 17.6 8.4C18.2 7.8 19.1 7.5 20 7.5C22.2 7.5 24 9.3 24 11.5C24 12 23.9 12.4 23.8 12.8C25.6 13.4 27 15 27 17C27 19.2 25.2 21 23 21H8Z"
        fill={COLORS.accentBlue}
        opacity={0.22}
      />
      <Path
        d="M8 20C5.8 20 4 18.2 4 16C4 14.1 5.4 12.4 7.2 12.1C7.1 11.6 7 11 7 10.5C7 7.5 9.5 5 12.5 5C14.8 5 16.8 6.4 17.6 8.4C18.2 7.8 19.1 7.5 20 7.5C22.2 7.5 24 9.3 24 11.5C24 12 23.9 12.4 23.8 12.8C25.6 13.4 27 15 27 17C27 19.2 25.2 21 23 21H8Z"
        stroke={COLORS.accentBlue}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ParkIllustration() {
  return (
    <View style={styles.parkIllustrationContainer}>
      <View style={styles.treeLeaves} />
      <View style={styles.treeTrunk} />
      <View style={styles.benchSeat} />
      <View style={styles.benchBack} />
      <View style={styles.benchLegLeft} />
      <View style={styles.benchLegRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  parkIllustrationContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primarySurface,
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  treeLeaves: {
    position: 'absolute',
    top: 6,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.leaf,
  },
  treeTrunk: {
    position: 'absolute',
    top: 27,
    left: 17,
    width: 4,
    height: 12,
    backgroundColor: COLORS.bark,
  },
  benchSeat: {
    position: 'absolute',
    top: 31,
    left: 21,
    width: 22,
    height: 3,
    backgroundColor: COLORS.wood,
    borderRadius: 1,
  },
  benchBack: {
    position: 'absolute',
    top: 25,
    left: 21,
    width: 3,
    height: 7,
    backgroundColor: COLORS.wood,
    borderRadius: 1,
  },
  benchLegLeft: {
    position: 'absolute',
    top: 34,
    left: 23,
    width: 2,
    height: 5,
    backgroundColor: COLORS.woodDark,
  },
  benchLegRight: {
    position: 'absolute',
    top: 34,
    left: 39,
    width: 2,
    height: 5,
    backgroundColor: COLORS.woodDark,
  },
});
