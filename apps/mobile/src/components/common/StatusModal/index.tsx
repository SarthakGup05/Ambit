import React, { useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Text } from '@repo/ui';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface StatusModalProps {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
}

export function StatusModal({
  visible,
  type,
  title,
  description,
  actionLabel = 'Continue',
  onAction,
  onClose,
}: StatusModalProps) {
  // ─── ALL hooks must come before any conditional return ───────────────────
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 220 });
      scale.value = withTiming(1, { duration: 220 });

      try {
        if (type === 'success') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      } catch (_) {}
    } else {
      opacity.value = withTiming(0, { duration: 180 });
      scale.value = withTiming(0.92, { duration: 180 });
    }
  }, [visible, type]);

  const handleAction = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  const isSuccess = type === 'success';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.backdropPressable} onPress={onClose} />
        </Animated.View>

        {/* Content Card */}
        <Animated.View style={[styles.card, cardStyle, { backgroundColor: isSuccess ? '#F0FDF4' : '#FEF2F2' }]}>
          {/* Icon Badge */}
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: isSuccess ? '#E8F5E9' : '#FFEBEE' },
            ]}
          >
            {isSuccess ? (
              <CheckCircle2 size={36} color="#2E7D32" strokeWidth={2.2} />
            ) : (
              <AlertCircle size={36} color="#DC2626" strokeWidth={2.2} />
            )}
          </View>

          {/* Title & Description */}
          <Text variant="h2" weight="bold" style={styles.title}>
            {title}
          </Text>
          <Text variant="body" style={styles.description}>
            {description}
          </Text>

          <View style={{ width: '100%', alignSelf: 'stretch' }}>
            <Pressable
              onPress={handleAction}
              style={({ pressed }) => [
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
            >
              <View
                style={[
                  styles.button,
                  {
                    backgroundColor: isSuccess ? '#2E7D32' : '#DC2626',
                  },
                ]}
              >
                <Text weight="bold" style={styles.buttonText}>
                  {actionLabel}
                </Text>
                <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  backdropPressable: {
    flex: 1,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FAF8F5',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  iconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 19,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
