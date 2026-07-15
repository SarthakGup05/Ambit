import React from 'react';
import { View, ScrollView, ViewProps, ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '../utils/cn';

interface ScreenProps extends ViewProps {
  scrollable?: boolean;
  scrollViewProps?: ScrollViewProps;
  className?: string;
}

const SafeLayout = SafeAreaView as any;

export function Screen({ children, scrollable = true, className, scrollViewProps, ...props }: ScreenProps) {
  const bgClass = className?.split(' ').find(c => c.startsWith('bg-')) || 'bg-[#FAF8F5]';
  // Keep other classes but remove solid background from ScrollView to let gradient or custom bg show
  const containerClass = cn("flex-1 bg-transparent", className?.replace(/bg-\[\#[0-9a-fA-F]+\]/g, '').replace(/bg-\w+(-\d+)?/g, ''));

  if (scrollable) {
    return (
      <SafeLayout className={cn("flex-1", bgClass)} edges={['top', 'left', 'right']}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
          className={containerClass}
        >
          {children}
        </ScrollView>
      </SafeLayout>
    );
  }

  return (
    <SafeLayout className={cn("flex-1", className)} edges={['top', 'left', 'right']} {...props}>
      {children}
    </SafeLayout>
  );
}
