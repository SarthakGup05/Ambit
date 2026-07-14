import React from 'react';
import { Pressable, Text, ActivityIndicator, PressableProps } from 'react-native';
import { cn } from '../utils/cn';

export interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  className?: string;
}

const buttonStyles = {
  container: 'py-3 px-4 rounded-lg flex-row justify-center items-center',
  variants: {
    primary: 'bg-indigo-600 active:bg-indigo-700',
    secondary: 'bg-zinc-800 active:bg-zinc-700',
    outline: 'bg-transparent border border-zinc-700 active:bg-zinc-900',
    ghost: 'bg-transparent active:bg-zinc-900',
  },
  text: {
    primary: 'text-white font-bold',
    secondary: 'text-zinc-200 font-bold',
    outline: 'text-zinc-200 font-bold',
    ghost: 'text-indigo-400 font-semibold',
  },
};

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
