import React from 'react';
import { View, ActivityIndicator } from 'react-native';
export function LoadingView() {
  return (
    <View className="flex-1 justify-center items-center bg-zinc-950">
      <ActivityIndicator size="large" color="#4f46e5" />
    </View>
  );
}
