import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { cn } from '../utils/cn';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
}

export function Text({ children, variant = 'body', weight, className, ...props }: TextProps) {
  const variantStyles = {
    h1: 'text-3xl font-title text-[#2B2E4A]',
    h2: 'text-2xl font-title text-[#2B2E4A]',
    h3: 'text-lg font-title text-[#2B2E4A]',
    body: 'text-base font-body text-[#6B6873]',
    caption: 'text-xs font-body text-[#6B6873]',
    label: 'text-sm font-body font-semibold text-[#1C1B1F]',
  }[variant];

  const weightStyles = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }[weight || (variant === 'h1' || variant === 'h2' || variant === 'h3' ? 'bold' : 'normal')];

  return (
    <RNText className={cn(variantStyles, weightStyles, className)} {...props}>
      {children}
    </RNText>
  );
}
