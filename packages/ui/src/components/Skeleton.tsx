import React from 'react';
import { View } from 'react-native';

export function Skeleton({ className }: { className?: string }) {
  return <View className={`bg-zinc-800 animate-pulse rounded ${className}`} />;
}
