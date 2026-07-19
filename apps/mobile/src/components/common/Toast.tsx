import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@repo/ui';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  title: string;
  message?: string;
  type?: ToastType;
  duration?: number;
  onDismiss: () => void;
}

function triggerToastHaptic(type: ToastType) {
  try {
    if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else if (type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  } catch {
    // ignore
  }
}

export function Toast({ title, message, type = 'info', duration = 3200, onDismiss }: ToastProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    triggerToastHaptic(type);
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [type, duration, onDismiss]);

  const getStyleProps = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#1E4D2B', // Sleek Forest Green
          Icon: CheckCircle2,
        };
      case 'error':
        return {
          bg: '#8B0000', // Sleek Blood Red
          Icon: AlertCircle,
        };
      case 'warning':
        return {
          bg: '#8B5E00', // Sleek Dark Amber
          Icon: AlertTriangle,
        };
      case 'info':
      default:
        return {
          bg: '#1E293B', // Sleek Dark Slate
          Icon: Info,
        };
    }
  };

  const { bg, Icon } = getStyleProps();

  return (
    <Animated.View
      entering={FadeInUp.duration(240)}
      exiting={FadeOutUp.duration(200)}
      style={[
        styles.container,
        {
          top: Math.max(insets.top + 8, 16),
          backgroundColor: bg,
        },
      ]}
    >
      <View style={styles.contentRow}>
        <View style={styles.iconContainer}>
          <Icon size={18} color="#FFFFFF" />
        </View>

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text variant="body" weight="bold" style={styles.titleText}>
            {title}
          </Text>
          {message && (
            <Text variant="caption" weight="medium" style={styles.messageText}>
              {message}
            </Text>
          )}
        </View>

        <Pressable onPress={onDismiss} style={styles.closeBtn} hitSlop={12}>
          <X size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 99999,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  messageText: {
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 1,
    fontSize: 11.5,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
    opacity: 0.85,
  },
});
