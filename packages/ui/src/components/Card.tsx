import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { cn } from '../utils/cn';

export interface CardProps extends ViewProps {
  title?: string;
  description?: string;
  className?: string;
}

const cardStyles = {
  container: 'bg-white border border-zinc-200 rounded-xl p-4',
  title: 'text-black text-lg font-bold',
  description: 'text-zinc-500 text-sm mt-1',
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
