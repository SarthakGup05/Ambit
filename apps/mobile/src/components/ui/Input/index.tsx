import React from 'react';
import { View, TextInput, Text } from 'react-native';
import { InputProps } from './types';
import { inputStyles } from './styles';
import { cn } from '../../../lib/cn';

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
