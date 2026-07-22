import React from 'react';
import Svg, {
  Path,
  Circle,
  Defs,
  RadialGradient,
  Stop,
  LinearGradient as SvgLinearGradient,
} from 'react-native-svg';

export function HeaderBackgroundSVG() {
  return (
    <Svg
      width={180}
      height={140}
      viewBox="0 0 180 140"
      style={{
        position: 'absolute',
        top: -15,
        right: -10,
        opacity: 0.85,
        zIndex: -1,
      }}
    >
      <Defs>
        <RadialGradient id="headerGlow" cx="70%" cy="30%" r="65%">
          <Stop offset="0%" stopColor="#C3E2C4" stopOpacity={0.28} />
          <Stop offset="50%" stopColor="#A8D1AA" stopOpacity={0.14} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
        <SvgLinearGradient id="headerWaves" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#2E7D32" stopOpacity={0.12} />
          <Stop offset="100%" stopColor="#C3E2C4" stopOpacity={0.03} />
        </SvgLinearGradient>
      </Defs>

      <Circle cx={130} cy={45} r={75} fill="url(#headerGlow)" />

      <Path
        d="M -20 70 C 50 110, 110 30, 210 90"
        fill="none"
        stroke="url(#headerWaves)"
        strokeWidth={2}
      />
      <Path
        d="M -10 50 C 70 90, 90 50, 210 70"
        fill="none"
        stroke="url(#headerWaves)"
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />
    </Svg>
  );
}

export function EmptyStateSVG() {
  return (
    <Svg width={120} height={120} viewBox="0 0 120 120" style={{ marginBottom: 16 }}>
      <Defs>
        <RadialGradient id="emptyGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#C3E2C4" stopOpacity={0.25} />
          <Stop offset="60%" stopColor="#A8D1AA" stopOpacity={0.08} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
        <SvgLinearGradient id="searchGlass" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#C3E2C4" stopOpacity={0.6} />
          <Stop offset="100%" stopColor="#A8D1AA" stopOpacity={0.2} />
        </SvgLinearGradient>
      </Defs>

      <Circle cx={60} cy={60} r={40} fill="url(#emptyGlow)" />
      <Circle
        cx={60}
        cy={60}
        r={32}
        fill="none"
        stroke="rgba(46, 125, 80, 0.15)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <Circle
        cx={60}
        cy={60}
        r={24}
        fill="none"
        stroke="rgba(46, 125, 80, 0.25)"
        strokeWidth={1.5}
      />
      <Path
        d="M 52 52 A 12 12 0 1 1 52 76 A 12 12 0 1 1 52 52"
        fill="url(#searchGlass)"
        stroke="#2E7D32"
        strokeWidth={2}
      />
      <Path d="M 68 68 L 84 84" fill="none" stroke="#2E7D32" strokeWidth={3} strokeLinecap="round" />
      <Path
        d="M 32 32 L 36 32 M 34 30 L 34 34"
        fill="none"
        stroke="#F59E0B"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <Path
        d="M 88 40 L 92 40 M 90 38 L 90 42"
        fill="none"
        stroke="#F59E0B"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
