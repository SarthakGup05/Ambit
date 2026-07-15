import React from 'react';
import { View, ActivityIndicator } from 'react-native';
export function LoadingView() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF8F5' }}>
      <ActivityIndicator size="large" color="#2E7D32" />
    </View>
  );
}
