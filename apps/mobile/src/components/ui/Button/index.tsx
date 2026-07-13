import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { ButtonProps } from './types';
import { buttonStyles } from './styles';
import { cn } from '../../../lib/cn';

export function Button({ title, variant = 'primary', isLoading, className, ...props }: ButtonProps) {
  return (
    <Pressable
      className={cn(buttonStyles.container, buttonStyles.variants[variant], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color="#fafafa" size="small" />
      ) : (
        <Text className={buttonStyles.text[variant]}>{title}</Text>
      )}
    </Pressable>
  );
}
