import React from 'react';
import { View, Text } from 'react-native';
export function EmptyState({ message }: { message: string }) {
  return (
    <View className="flex-1 justify-center items-center p-6 bg-transparent">
      <Text className="text-zinc-500 text-center text-base">{message}</Text>
    </View>
  );
}
