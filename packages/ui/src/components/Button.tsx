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
    primary: 'bg-[#C3E2C4] active:bg-[#B0D6B1]',
    secondary: 'bg-[#FFFFFF] border border-zinc-200 active:bg-zinc-100',
    outline: 'bg-transparent border border-black active:bg-zinc-100',
    ghost: 'bg-transparent active:bg-zinc-100',
  },
  text: {
    primary: 'text-black font-bold',
    secondary: 'text-black font-bold',
    outline: 'text-black font-bold',
    ghost: 'text-black font-semibold',
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
