import React from 'react';
import { View, Text } from 'react-native';
export function ScreenHeader({ title, description }: { title: string; description?: string }) {
  return (
    <View className="px-4 py-4 border-b border-zinc-900 bg-zinc-950">
      <Text className="text-white text-2xl font-bold font-title">{title}</Text>
      {description && <Text className="text-zinc-500 text-sm mt-1">{description}</Text>}
    </View>
  );
}
