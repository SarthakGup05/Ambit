import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';
import { cn } from '../utils/cn';

export interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
  className?: string;
}

export function SectionHeader({ title, actionText, onActionPress, className }: SectionHeaderProps) {
  return (
    <View className={cn("flex-row justify-between items-center px-4 pt-5 pb-2", className)}>
      <Text variant="h3" className="text-[#2B2E4A] font-bold">{title}</Text>
      {actionText && (
        <Text 
          variant="label" 
          className="text-indigo-600 font-semibold"
          onPress={onActionPress}
        >
          {actionText}
        </Text>
      )}
    </View>
  );
}
