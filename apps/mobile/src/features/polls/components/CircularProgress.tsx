import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '@repo/ui';
import { COLORS, FONT } from '../constants';

interface CircularProgressProps {
  percentage: number;
  color?: string;
  size?: number;
  strokeWidth?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  color = COLORS.primary,
  size = 72,
  strokeWidth = 8,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.primaryProgressTrack}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Text variant="label" weight="bold" style={{ fontSize: 16, color: COLORS.ink, fontFamily: FONT.bold }}>
          {percentage}%
        </Text>
        <Text variant="caption" style={{ fontSize: 9, color: COLORS.textMuted, marginTop: -2, fontFamily: FONT.regular }}>
          Yes
        </Text>
      </View>
    </View>
  );
};

export const MiniCircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  color = COLORS.primary,
  size = 52,
  strokeWidth = 6,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.primaryProgressTrack}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Text variant="caption" weight="bold" style={{ fontSize: 11, color: COLORS.ink, fontFamily: FONT.bold }}>
          {percentage}%
        </Text>
        <Text variant="caption" style={{ fontSize: 8, color: COLORS.textMuted, marginTop: -3, fontFamily: FONT.regular }}>
          Yes
        </Text>
      </View>
    </View>
  );
};
