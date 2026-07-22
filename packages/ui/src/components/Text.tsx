import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { cn } from '../utils/cn';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
}

export function Text({ children, variant = 'body', weight, className, style, ...props }: TextProps) {
  // 1. Determine if it is a Title (Manrope) or Body (Inter) font
  const isTitle = variant === 'h1' || variant === 'h2' || variant === 'h3';

  // 2. Identify explicit weight classes in className
  const hasBoldClass = className && (
    className.includes('font-bold') || 
    className.includes('font-extrabold')
  );
  
  const hasMediumOrSemiBoldClass = className && (
    className.includes('font-semibold') || 
    className.includes('font-medium')
  );

  // 3. Resolve the exact fontFamily name loaded in expo-font
  let fontFamily = 'InterMedium'; // Default to medium body text for impact

  if (isTitle) {
    const isHeadingBold = weight === 'bold' || hasBoldClass || (weight !== 'normal');
    fontFamily = isHeadingBold ? 'ManropeBold' : 'ManropeMedium';
  } else {
    const isBodyBold = weight === 'bold' || hasBoldClass;
    const isBodySemi = weight === 'semibold' || weight === 'medium' || hasMediumOrSemiBoldClass;
    
    if (isBodyBold) {
      fontFamily = 'InterBold';
    } else if (isBodySemi) {
      fontFamily = 'InterSemiBold';
    } else {
      fontFamily = 'InterMedium'; // Make normal body text medium for bolder presence
    }
  }

  // 4. Base styles without the font-title/font-body classes to avoid conflicts
  const defaultSize = {
    h1: 'text-3xl',
    h2: 'text-2xl',
    h3: 'text-lg',
    body: 'text-base',
    caption: 'text-xs',
    label: 'text-sm',
  }[variant];

  const defaultColor = {
    h1: 'text-[#000000]',
    h2: 'text-[#000000]',
    h3: 'text-[#000000]',
    body: 'text-[#11111E]',
    caption: 'text-[#5E5D6A]',
    label: 'text-[#000000]',
  }[variant];

  // 5. Flatten styles and strip out fontFamily/fontWeight to prevent native OS font fallbacks
  const flatStyle = StyleSheet.flatten(style) || {};
  const cleanStyle = { ...flatStyle };
  delete cleanStyle.fontFamily;
  delete cleanStyle.fontWeight;

  // Check if color is explicitly overridden in style or className
  const hasCustomColor = 
    cleanStyle.color !== undefined || 
    (className && /\btext-(?:white|black|transparent|current|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|\[(?:#|rgb|hsl|rgba|hsla)[^\]]+\])/i.test(className));

  const resolvedClassName = cn(
    defaultSize,
    !hasCustomColor && defaultColor,
    className
  );

  return (
    <RNText 
      className={resolvedClassName} 
      style={[{ fontFamily, fontWeight: 'normal' }, cleanStyle]} 
      {...props}
    >
      {children}
    </RNText>
  );
}
