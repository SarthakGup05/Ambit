import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, G, Ellipse } from 'react-native-svg';

export function AuthIllustration() {
  return (
    <View style={styles.container}>
      <Svg width={220} height={200} viewBox="0 0 220 200" fill="none">
        {/* Background decorative concentric ellipses/floor lines */}
        <Ellipse cx={110} cy={175} rx={50} ry={12} stroke="#E4E4E7" strokeWidth={1.5} strokeDasharray="3 3" />
        <Ellipse cx={110} cy={178} rx={75} ry={18} stroke="#D4D4D8" strokeWidth={1.5} />
        
        {/* Spark/focus lines around head */}
        <Path d="M48 65l-8-6M172 65l8-6M40 85h-8M180 85h8" stroke="#11111E" strokeWidth={1.5} strokeLinecap="round" />
        
        {/* Floor shadows under laptop */}
        <Path d="M88 185h44" stroke="#11111E" strokeWidth={2} strokeLinecap="round" />

        <G transform="translate(10, 10)">
          {/* 1. Hair */}
          <Path 
            d="M85 36c-5-2-12-2-16 2-3 3-3 7-1 10-2-1-6 0-7 3-2 3-1 7 1 9-2 2-3 5-2 8 1 3 4 5 7 4 1 2 4 4 7 3s4-3 4-5c3 1 7 1 9-1 3-3 3-7 1-10 3 0 7-3 7-6 1-4-2-7-5-8 1-3 0-7-2-9-2-3-7-3-11-1z" 
            fill="#11111E" 
          />

          {/* 2. Head & Neck */}
          <Circle cx={100} cy={55} r={18} fill="#FFFFFF" stroke="#11111E" strokeWidth={2} />
          <Path d="M96 73v8h8v-8" fill="#FFFFFF" stroke="#11111E" strokeWidth={2} />

          {/* 3. Face Details (Glasses, Eyes, Smile) */}
          {/* Glasses */}
          <Circle cx={93} cy={53} r={7} stroke="#11111E" strokeWidth={1.8} fill="none" />
          <Circle cx={107} cy={53} r={7} stroke="#11111E" strokeWidth={1.8} fill="none" />
          <Path d="M100 53h1" stroke="#11111E" strokeWidth={1.8} />
          {/* Eyes (Pupils) */}
          <Circle cx={93} cy={53} r={1.5} fill="#11111E" />
          <Circle cx={107} cy={53} r={1.5} fill="#11111E" />
          {/* Smile */}
          <Path d="M97 61q3 3 6 0" stroke="#11111E" strokeWidth={1.8} strokeLinecap="round" fill="none" />

          {/* 4. Body & Clothes */}
          {/* Shirt Collar / V-neck */}
          <Path d="M80 81c5 10 35 10 40 0" fill="#FFFFFF" stroke="#11111E" strokeWidth={2} />
          {/* Shoulders & Sleeves */}
          <Path d="M80 81l-18 10 6 18h14v22h36v-22h14l6-18-18-10" fill="#FFFFFF" stroke="#11111E" strokeWidth={2} strokeLinejoin="round" />

          {/* 5. Left Arm gesturing (waving/resting) */}
          <Path d="M62 91c-10-5-20-4-26 5-3 5-1 9 4 8" stroke="#11111E" strokeWidth={2} strokeLinecap="round" fill="none" />
          {/* Right Arm resting on desk */}
          <Path d="M138 91c8 6 15 12 18 18" stroke="#11111E" strokeWidth={2} strokeLinecap="round" fill="none" />

          {/* 6. Laptop Screen & Base */}
          {/* Opened Laptop Lid */}
          <Path d="M72 120h56l8 38H64l8-38z" fill="#11111E" stroke="#11111E" strokeWidth={2} strokeLinejoin="round" />
          {/* Screen highlight / details */}
          <Circle cx={100} cy={139} r={3.5} fill="#FFFFFF" />
          {/* Laptop Base (Keyboard Part) */}
          <Path d="M58 158h84l6 8H52l6-8z" fill="#FFFFFF" stroke="#11111E" strokeWidth={2} strokeLinejoin="round" />
          
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
});
