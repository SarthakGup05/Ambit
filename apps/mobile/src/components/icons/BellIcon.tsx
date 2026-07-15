import React from 'react';
import Svg, { Path, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';

export interface BellIconProps {
  size?: number;
}

export function BellIcon({ size = 24 }: BellIconProps) {
  return (
    <Svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
    >
      <Defs>
        {/* 3D Bell Body Gradient */}
        <LinearGradient id="bellBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFAD1" />
          <Stop offset="25%" stopColor="#FDD835" />
          <Stop offset="65%" stopColor="#F57F17" />
          <Stop offset="100%" stopColor="#D84315" />
        </LinearGradient>

        {/* 3D Bell Highlight/Gloss Gradient */}
        <LinearGradient id="bellHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.8} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </LinearGradient>

        {/* 3D Bell Base/Lip Gradient */}
        <LinearGradient id="bellBase" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#E65100" />
          <Stop offset="50%" stopColor="#FFE082" />
          <Stop offset="100%" stopColor="#E65100" />
        </LinearGradient>

        {/* 3D Clapper Gradient */}
        <RadialGradient id="clapper" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#FFF9C4" />
          <Stop offset="60%" stopColor="#FF8F00" />
          <Stop offset="100%" stopColor="#D84315" />
        </RadialGradient>
        
        {/* Loop Gradient */}
        <LinearGradient id="loop" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFF9C4" />
          <Stop offset="100%" stopColor="#FF8F00" />
        </LinearGradient>
      </Defs>

      {/* Shadow */}
      <Path fill="#45413c" d="M8.71 45.01a15.29 1.99 0 1 0 30.58 0a15.29 1.99 0 1 0-30.58 0" opacity={0.12}/>
      
      {/* Top Loop */}
      <Path fill="url(#loop)" stroke="#3E3A35" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" d="M21.34 6.25a2.66 2.66 0 1 0 5.32 0a2.66 2.66 0 1 0-5.32 0"/>
      
      {/* Bell Body */}
      <Path fill="url(#bellBody)" d="M42.62 35.51c0-3.44-3.77-5.71-5.32-8.64s-.83-7.76-2.66-13.3S27.77 6.92 24 6.92S15.19 8 13.36 13.57s-1.11 10.36-2.66 13.3s-5.32 5.2-5.32 8.64Z"/>
      
      {/* Inner Gloss reflection */}
      <Path fill="url(#bellHighlight)" d="M24 11.57c4.1 0 9.55 1.08 11.66 6.38a26.4 26.4 0 0 0-1-4.38C32.81 8 27.77 6.92 24 6.92S15.19 8 13.36 13.57a26.6 26.6 0 0 0-1 4.37c2.09-5.29 7.54-6.37 11.64-6.37"/>
      
      {/* Body Outline */}
      <Path fill="none" stroke="#3E3A35" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" d="M42.62 35.51c0-3.44-3.77-5.71-5.32-8.64s-.83-7.76-2.66-13.3S27.77 6.92 24 6.92S15.19 8 13.36 13.57s-1.11 10.36-2.66 13.3s-5.32 5.2-5.32 8.64Z"/>
      
      {/* Bell Lip Base */}
      <Path fill="url(#bellBase)" d="M5.38 35.51a18.62 1.99 0 1 0 37.24 0a18.62 1.99 0 1 0-37.24 0"/>
      
      {/* Lip Highlight Shadow */}
      <Path fill="#D84315" opacity={0.3} d="M24 33.52c-10.28 0-18.62.89-18.62 2c0 .36.91.71 2.5 1a102.4 102.4 0 0 1 16.12-1a102.4 102.4 0 0 1 16.12 1c1.59-.29 2.5-.64 2.5-1c0-1.11-8.34-2-18.62-2"/>
      
      {/* Lip Outline */}
      <Path fill="none" stroke="#3E3A35" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" d="M5.38 35.51a18.62 1.99 0 1 0 37.24 0a18.62 1.99 0 1 0-37.24 0"/>
      
      {/* Clapper Ball */}
      <Path fill="url(#clapper)" d="M24 33.52h-3.46a4 4 0 1 0 6.92 0c-1.13.01-2.27 0-3.46 0"/>
      
      {/* Clapper Outline */}
      <Path fill="none" stroke="#3E3A35" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" d="M24 33.52h-3.46a4 4 0 1 0 6.92 0c-1.13.01-2.27 0-3.46 0"/>
    </Svg>
  );
}
