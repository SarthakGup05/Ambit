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
  const containerClass = cn("flex-1 bg-[#FAF8F5]", className);

  if (scrollable) {
    return (
      <SafeLayout className="flex-1 bg-[#FAF8F5]" edges={['top', 'left', 'right']}>
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
    <SafeLayout className={containerClass} edges={['top', 'left', 'right']} {...props}>
      {children}
    </SafeLayout>
  );
}
