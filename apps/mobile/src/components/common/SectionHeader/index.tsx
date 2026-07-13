import React from 'react';
import { View, Text } from 'react-native';
export function SectionHeader({ title }: { title: string }) {
  return (
    <View className="px-4 py-2 bg-zinc-900/50">
      <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider">{title}</Text>
    </View>
  );
}
