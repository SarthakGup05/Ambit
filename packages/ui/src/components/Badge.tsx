import React from 'react';
import { View, Text } from 'react-native';

export function Badge({ label, variant = 'info' }: { label: string; variant?: 'info' | 'success' | 'warning' | 'danger' }) {
  const bg = {
    info: 'bg-blue-500/20 border-blue-500/30',
    success: 'bg-green-500/20 border-green-500/30',
    warning: 'bg-yellow-500/20 border-yellow-500/30',
    danger: 'bg-red-500/20 border-red-500/30',
  }[variant];
  
  const text = {
    info: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
  }[variant];

  return (
    <View className={`px-2 py-0.5 rounded border ${bg}`}>
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}
