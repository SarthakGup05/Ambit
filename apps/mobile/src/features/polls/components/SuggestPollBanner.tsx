import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@repo/ui';
import { Megaphone } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS, RADIUS, FONT } from '../constants';

interface SuggestPollBannerProps {
  onSuggestPress: () => void;
}

export const SuggestPollBanner: React.FC<SuggestPollBannerProps> = ({ onSuggestPress }) => {
  return (
    <Animated.View entering={FadeInUp.duration(400).delay(150)} style={styles.suggestBanner}>
      <View style={styles.suggestLeft}>
        <View style={styles.suggestIconContainer}>
          <Megaphone size={18} color={COLORS.primaryAccent} strokeWidth={2.2} />
        </View>
        <View style={styles.suggestTexts}>
          <Text variant="label" weight="bold" style={styles.suggestTitle}>
            Have an idea for a poll?
          </Text>
          <Text variant="caption" style={styles.suggestSubtitle}>
            Suggest a topic for the community to vote on.
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onSuggestPress}
        style={({ pressed }) => [styles.suggestBtn, pressed && { opacity: 0.8 }]}
      >
        <Text variant="caption" weight="bold" style={styles.suggestBtnText}>
          Suggest Poll
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  suggestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceCream,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 10,
    gap: 12,
  },
  suggestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  suggestIconContainer: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryProgressTrack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestTexts: {
    flex: 1,
    gap: 2,
  },
  suggestTitle: {
    fontSize: 14,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: COLORS.ink,
  },
  suggestSubtitle: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: COLORS.textMuted,
  },
  suggestBtn: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestBtnText: {
    fontSize: 12,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
