import React from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';
import { cn } from '../utils/cn';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

const inputStyles = {
  container: 'space-y-1 w-full',
  label: 'text-zinc-300 text-sm font-semibold mb-1',
  field: 'bg-zinc-900 border border-zinc-800 text-white rounded-lg p-3 text-base focus:border-indigo-500',
  error: 'text-red-500 text-xs mt-1',
};

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className={cn(inputStyles.container, className)}>
      {label && <Text className={inputStyles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor="#71717a"
        className={inputStyles.field}
        {...props}
      />
      {error && <Text className={inputStyles.error}>{error}</Text>}
    </View>
  );
}
