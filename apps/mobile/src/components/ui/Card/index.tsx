import React from 'react';
import { View, Text } from 'react-native';
import { CardProps } from './types';
import { cardStyles } from './styles';
import { cn } from '../../../lib/cn';

export function Card({ title, description, children, className, ...props }: CardProps) {
  return (
    <View className={cn(cardStyles.container, className)} {...props}>
      {title && <Text className={cardStyles.title}>{title}</Text>}
      {description && <Text className={cardStyles.description}>{description}</Text>}
      {children}
    </View>
  );
}
