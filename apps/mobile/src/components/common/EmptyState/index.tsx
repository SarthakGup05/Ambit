import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@repo/ui';
import { LucideIcon } from 'lucide-react-native';

export interface AppEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AppEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: AppEmptyStateProps) {
  return (
    <View style={styles.container}>
      {Icon && (
        <View style={styles.iconWrapper}>
          <Icon size={32} color="#1E4D2B" strokeWidth={1.5} />
        </View>
      )}
      <Text variant="body" weight="bold" style={styles.title}>
        {title}
      </Text>
      <Text variant="caption" weight="medium" style={styles.description}>
        {description}
      </Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [
            styles.actionBtn,
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
        >
          <Text variant="caption" weight="bold" style={styles.actionBtnText}>
            {actionLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 77, 43, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(30, 77, 43, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#11111E',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    color: '#8E8D94',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
    marginBottom: 20,
  },
  actionBtn: {
    backgroundColor: '#1E4D2B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});
