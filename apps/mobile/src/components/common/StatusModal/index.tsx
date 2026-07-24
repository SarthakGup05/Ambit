import React, { useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { Text } from '@repo/ui';
import { CheckCircle2, AlertCircle, ArrowRight, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Spring Config for Playful yet Snappy Native Feel ─────────────────────────
const BOUNCE_SPRING = {
  damping: 14,     // controls oscillation (lower = more bouncy)
  stiffness: 110,  // controls speed/force of spring
  mass: 0.7,       // controls inertia (lower = lighter, faster start)
};

const SMOOTH_SPRING = {
  damping: 18,
  stiffness: 100,
  mass: 0.8,
};

interface StatusModalProps {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
  dismissible?: boolean;
}

export function StatusModal({
  visible,
  type,
  title,
  description,
  actionLabel = 'Continue',
  onAction,
  onClose,
  dismissible = true,
}: StatusModalProps) {
  
  // ─── Animation Shared Values ────────────────────────────────────────────────
  const backdropOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.7);
  const cardOpacity = useSharedValue(0);
  
  const iconScale = useSharedValue(0);
  const iconRotate = useSharedValue(-35); // rotates into view
  
  const textTranslateY = useSharedValue(20);
  const textOpacity = useSharedValue(0);
  
  const buttonScale = useSharedValue(0.9);
  const buttonOpacity = useSharedValue(0);

  // ─── Animated Styles ────────────────────────────────────────────────────────
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconScale.value,
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotate.value}deg` }
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  // ─── Trigger Animations on Visibility Change ────────────────────────────────
  useEffect(() => {
    if (visible) {
      // 1. Fade in backdrop
      backdropOpacity.value = withTiming(1, { duration: 250 });

      // 2. Zoom in content card with spring
      cardOpacity.value = withTiming(1, { duration: 200 });
      cardScale.value = withSpring(1, BOUNCE_SPRING);

      // 3. Staggered icon pop (scale and spin)
      iconScale.value = withDelay(150, withSpring(1, BOUNCE_SPRING));
      iconRotate.value = withDelay(150, withSpring(0, BOUNCE_SPRING));

      // 4. Staggered text content slide up
      textTranslateY.value = withDelay(100, withSpring(0, SMOOTH_SPRING));
      textOpacity.value = withDelay(100, withTiming(1, { duration: 250 }));

      // 5. Staggered CTA button slide / scale in
      buttonScale.value = withDelay(200, withSpring(1, BOUNCE_SPRING));
      buttonOpacity.value = withDelay(200, withTiming(1, { duration: 250 }));

      // Haptic Feedback
      try {
        if (type === 'success') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      } catch (_) {}
    } else {
      // Outward animations
      backdropOpacity.value = withTiming(0, { duration: 200 });
      cardOpacity.value = withTiming(0, { duration: 180 });
      cardScale.value = withTiming(0.85, { duration: 180 });
      
      iconScale.value = withTiming(0, { duration: 150 });
      iconRotate.value = withTiming(-35, { duration: 150 });
      
      textTranslateY.value = withTiming(15, { duration: 150 });
      textOpacity.value = withTiming(0, { duration: 150 });
      
      buttonScale.value = withTiming(0.9, { duration: 150 });
      buttonOpacity.value = withTiming(0, { duration: 150 });
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

  const handleDismiss = () => {
    if (dismissible) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (_) {}
      onClose();
    }
  };

  const isSuccess = type === 'success';
  const brandColor = isSuccess ? '#10B981' : '#EF4444'; // Emerald vs Rose Red
  const ringBg = isSuccess ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop (Tappable for dismissal if allowed) */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.backdropPressable} onPress={handleDismiss} />
        </Animated.View>

        {/* Modal Card */}
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Subtle top decoration ring */}
          <View style={[styles.topColorStrip, { backgroundColor: brandColor }]} />

          {/* Close button (top right) */}
          {dismissible && (
            <Pressable
              onPress={handleDismiss}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && { opacity: 0.6 }
              ]}
              hitSlop={12}
            >
              <X size={20} color="#94A3B8" strokeWidth={2} />
            </Pressable>
          )}

          {/* Inner Content Area */}
          <View style={styles.content}>
            {/* Concentric rings behind icon for premium depth */}
            <Animated.View style={[styles.iconOuterRing, { backgroundColor: ringBg }, iconStyle]}>
              <View style={[styles.iconInnerRing, { backgroundColor: ringBg }]}>
                {isSuccess ? (
                  <CheckCircle2 size={42} color={brandColor} strokeWidth={2.4} />
                ) : (
                  <AlertCircle size={42} color={brandColor} strokeWidth={2.4} />
                )}
              </View>
            </Animated.View>

            {/* Staggered text block */}
            <Animated.View style={[styles.textBlock, textStyle]}>
              <Text variant="h2" weight="bold" style={styles.title}>
                {title}
              </Text>
              <Text variant="body" style={styles.description}>
                {description}
              </Text>
            </Animated.View>

            {/* Action button */}
            <Animated.View style={[styles.actionWrapper, buttonStyle]}>
              <Pressable
                onPress={handleAction}
                style={({ pressed }) => [
                  styles.button,
                  { backgroundColor: brandColor },
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text weight="bold" style={styles.buttonText}>
                  {actionLabel}
                </Text>
                <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
            </Animated.View>
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
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)', // Sleek modern dark tone overlay
  },
  backdropPressable: {
    flex: 1,
  },
  card: {
    width: '100%',
    maxWidth: SCREEN_WIDTH * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.16,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  topColorStrip: {
    height: 5,
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 28,
    alignItems: 'center',
  },
  iconOuterRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconInnerRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 26,
  },
  title: {
    fontSize: 22,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  actionWrapper: {
    width: '100%',
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
