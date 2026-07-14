import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { cn } from '../utils/cn';

export interface CardProps extends ViewProps {
  title?: string;
  description?: string;
  className?: string;
}

const cardStyles = {
  container: 'bg-zinc-900 border border-zinc-800 rounded-xl p-4',
  title: 'text-white text-lg font-bold',
  description: 'text-zinc-400 text-sm mt-1',
};

export function Card({ title, description, children, className, ...props }: CardProps) {
  return (
    <View className={cn(cardStyles.container, className)} {...props}>
      {title && <Text className={cardStyles.title}>{title}</Text>}
      {description && <Text className={cardStyles.description}>{description}</Text>}
      {children}
    </View>
  );
}
