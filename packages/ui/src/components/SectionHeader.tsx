import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from './Text';
import { cn } from '../utils/cn';

export interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
  className?: string;
}

export function SectionHeader({ title, actionText, onActionPress, className }: SectionHeaderProps) {
  return (
    <View style={styles.container} className={className}>
      <Text variant="h3" style={styles.title} className="text-[#11111E] font-extrabold tracking-tight">
        {title}
      </Text>
      {actionText && (
        <Pressable onPress={onActionPress}>
          <View style={styles.actionWrapper}>
            <Text className="text-[11px] font-extrabold text-[#2E7D32] uppercase tracking-wider">
              {actionText}
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,   // Standardized 20px grid
    paddingRight: 20,  // Standardized 20px grid
    paddingTop: 28,    // Moderate top spacing
    paddingBottom: 8,  // Clean bottom spacing
  },
  title: {
    paddingTop: 0,     // Removed massive top gap
  },
  actionWrapper: {
    opacity: 1,
  }
});
