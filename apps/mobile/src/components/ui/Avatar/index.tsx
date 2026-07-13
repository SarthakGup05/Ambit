import React from 'react';
import { View, Image, Text } from 'react-native';
export function Avatar({ source, fallback }: { source?: string; fallback: string }) {
  return (
    <View className="w-10 h-10 rounded-full bg-zinc-800 justify-center items-center overflow-hidden border border-zinc-700">
      {source ? (
        <Image source={{ uri: source }} className="w-full h-full" />
      ) : (
        <Text className="text-white font-bold">{fallback}</Text>
      )}
    </View>
  );
}
