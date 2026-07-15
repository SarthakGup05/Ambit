import React from 'react';
import { View, Text } from 'react-native';

export function Badge({ label, variant = 'info' }: { label: string; variant?: 'info' | 'success' | 'warning' | 'danger' }) {
  const bg = {
    info: 'bg-blue-50/70 border-blue-200/50',
    success: 'bg-green-50/70 border-green-200/50',
    warning: 'bg-amber-50/70 border-amber-200/50',
    danger: 'bg-red-50/70 border-red-200/50',
  }[variant];
  
  const text = {
    info: 'text-blue-800',
    success: 'text-green-800',
    warning: 'text-amber-800',
    danger: 'text-red-800',
  }[variant];

  return (
    <View className={`px-2 py-0.5 rounded border ${bg}`}>
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}
