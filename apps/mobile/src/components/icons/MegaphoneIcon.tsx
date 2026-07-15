import React from 'react';
import Svg, { Path, Defs, LinearGradient, RadialGradient, Stop, Circle } from 'react-native-svg';

export interface MegaphoneIconProps {
  size?: number;
  color?: 'purple' | 'gold';
}

export function MegaphoneIcon({ size = 24, color = 'purple' }: MegaphoneIconProps) {
  const isGold = color === 'gold';
  const strokeColor = isGold ? '#78350F' : '#1E1B4B'; // Rich dark brown-gold outline instead of navy/black
  
  return (
    <Svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
    >
      <Defs>
        <LinearGradient id="hornBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={isGold ? "#FDE047" : "#C4B5FD"} />
          <Stop offset="40%" stopColor={isGold ? "#EAB308" : "#8B5CF6"} />
          <Stop offset="80%" stopColor={isGold ? "#D97706" : "#6D28D9"} />
          <Stop offset="100%" stopColor={isGold ? "#92400E" : "#4C1D95"} />
        </LinearGradient>

        <LinearGradient id="hornMouth" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={isGold ? "#FEF9C3" : "#ECFDF5"} />
          <Stop offset="50%" stopColor={isGold ? "#FDE047" : "#A7F3D0"} />
          <Stop offset="100%" stopColor={isGold ? "#CA8A04" : "#059669"} />
        </LinearGradient>

        <LinearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={isGold ? "#FEF08A" : "#9CA3AF"} />
          <Stop offset="100%" stopColor={isGold ? "#B45309" : "#374151"} />
        </LinearGradient>

        <LinearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={isGold ? "#FDE047" : "#F87171"} />
          <Stop offset="100%" stopColor={isGold ? "#CA8A04" : "#EF4444"} />
        </LinearGradient>
      </Defs>

      <Path 
        fill="#78350F" 
        d="M 12 40 C 22 40, 36 38, 38 34 C 38 30, 22 36, 12 36 C 2 36, 2 40, 12 40 Z" 
        opacity={isGold ? 0.08 : 0.15}
      />

      <Path 
        fill="url(#handleGrad)" 
        stroke={strokeColor} 
        strokeWidth={1}
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M 16.5 24 L 14.5 35 C 14 38, 17.5 38.5, 18 35 L 19.5 24 Z"
      />

      <Path 
        fill="url(#hornBody)" 
        stroke={strokeColor} 
        strokeWidth={1.2}
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M 12 18 C 12 18, 22 19, 31 11 C 33 9.5, 35.5 11, 35.5 13.5 L 35.5 28.5 C 35.5 31, 33 32.5, 31 31 C 22 23, 12 24, 12 24 C 10 24, 8 22, 8 20 C 8 18, 10 18, 12 18 Z"
      />

      <Path 
        fill="url(#hornMouth)" 
        stroke={strokeColor} 
        strokeWidth={1} 
        d="M 35.5 12 C 37.4 12, 39 15.6, 39 20 C 39 24.4, 37.4 28, 35.5 28 C 33.6 28, 32 24.4, 32 20 C 32 15.6, 33.6 12, 35.5 12 Z"
      />

      <Path 
        fill={isGold ? "#EAB308" : "#EF4444"} 
        stroke={strokeColor} 
        strokeWidth={1} 
        d="M 8 19 C 8.5 19, 9 19.5, 9 20 C 9 20.5, 8.5 21, 8 21 C 7.5 21, 7 20.5, 7 20 C 7 19.5, 7.5 19, 8 19 Z"
      />

      <Path 
        fill="none" 
        stroke="url(#waveGrad)" 
        strokeWidth={1.8} 
        strokeLinecap="round" 
        d="M 41.5 16 A 6 6 0 0 1 41.5 24" 
      />

      <Path 
        fill="none" 
        stroke="url(#waveGrad)" 
        strokeWidth={2.2} 
        strokeLinecap="round" 
        d="M 44.5 12 A 11 11 0 0 1 44.5 28" 
      />
    </Svg>
  );
}
