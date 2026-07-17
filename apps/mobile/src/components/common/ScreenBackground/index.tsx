import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function ScreenBackground() {
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
    </View>
  );
}

const styles = StyleSheet.create({
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
