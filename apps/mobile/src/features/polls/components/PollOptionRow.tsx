import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@repo/ui';
import { Check, ThumbsUp, Pause, HelpCircle } from 'lucide-react-native';
import { COLORS, RADIUS, FONT } from '../constants';
import { SwingIllustration, BenchIllustration, CloudIllustration } from './PollIllustrations';

interface PollOptionRowProps {
  option: string;
  idx: number;
  isSelected: boolean;
  hasVoted: boolean;
  percent: number;
  votes: number;
  onSelectOption?: () => void;
}

export const PollOptionRow: React.FC<PollOptionRowProps> = ({
  option,
  idx,
  isSelected,
  hasVoted,
  percent,
  votes,
  onSelectOption,
}) => {
  let badgeBg: string = COLORS.primary;
  let OptionIcon = ThumbsUp;
  let RightIllustration = SwingIllustration;

  if (idx === 1 || option.toLowerCase().includes('no')) {
    badgeBg = COLORS.accentTerracotta;
    OptionIcon = Pause;
    RightIllustration = BenchIllustration;
  } else if (idx === 2 || option.toLowerCase().includes('sure') || option.toLowerCase().includes('maybe')) {
    badgeBg = COLORS.accentBlue;
    OptionIcon = HelpCircle;
    RightIllustration = CloudIllustration;
  }

  // 1. Result State (User has voted)
  if (hasVoted) {
    return (
      <View key={option} style={styles.resultOptionRow}>
        <View
          style={[
            styles.resultProgressLine,
            { width: `${percent}%` },
            isSelected && styles.resultProgressLineActive,
          ]}
        />
        
        <View style={styles.contentRow}>
          {/* Radio / Check Circle */}
          <View style={[styles.radioCircle, styles.radioCircleVoted, isSelected && styles.radioCircleVotedActive]}>
            {isSelected && <Check size={10} color={COLORS.surface} strokeWidth={4} />}
          </View>

          {/* Icon Badge */}
          <View style={[styles.optionIconBadge, { backgroundColor: badgeBg }]}>
            <OptionIcon size={16} color={COLORS.surface} strokeWidth={2.5} />
          </View>

          {/* Option Label */}
          <Text
            variant="label"
            weight={isSelected ? 'bold' : 'normal'}
            style={[styles.optionText, isSelected && styles.optionTextActive]}
            numberOfLines={2}
          >
            {option}
          </Text>

          {/* Tally Percentage */}
          <Text variant="caption" weight="bold" style={styles.resultTallyText}>
            {percent}% ({votes})
          </Text>
        </View>
      </View>
    );
  }

  // 2. Voting State (Interactive button)
  return (
    <Pressable
      key={option}
      onPress={onSelectOption}
      style={({ pressed }) => [
        styles.votingOptionBtn,
        isSelected && styles.votingOptionBtnSelected,
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.contentRow}>
        {/* Radio Circle */}
        <View style={[styles.radioCircle, isSelected ? styles.radioCircleSelected : styles.radioCircleEmpty]}>
          {isSelected && <View style={styles.radioInnerDot} />}
        </View>

        {/* Icon Badge */}
        <View style={[styles.optionIconBadge, { backgroundColor: badgeBg }]}>
          <OptionIcon size={16} color={COLORS.surface} strokeWidth={2.5} />
        </View>

        {/* Option Label */}
        <Text
          variant="body"
          weight={isSelected ? 'bold' : 'medium'}
          style={[styles.optionText, isSelected && styles.optionTextSelected]}
          numberOfLines={2}
        >
          {option}
        </Text>

        {/* Right Illustration */}
        <View style={styles.optionRightGraphic}>
          <RightIllustration />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // Interactive Button Container
  votingOptionBtn: {
    minHeight: 52,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBorderStrong,
    backgroundColor: '#FAFCFA',
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  votingOptionBtnSelected: {
    backgroundColor: COLORS.primarySurfaceSubtle,
    borderColor: COLORS.primaryAccent,
  },

  // Common horizontal flex row for strict 1-line alignment
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    zIndex: 1,
  },

  // Radio selection circle
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  radioCircleEmpty: {
    borderColor: COLORS.trackNeutral,
    backgroundColor: 'transparent',
  },
  radioCircleSelected: {
    borderColor: COLORS.primaryAccent,
    backgroundColor: 'transparent',
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primaryAccent,
  },
  radioCircleVoted: {
    borderWidth: 1.5,
    borderColor: COLORS.textFaint,
    backgroundColor: COLORS.surface,
  },
  radioCircleVotedActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },

  // Icon Badge
  optionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },

  // Option text
  optionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONT.medium,
    color: COLORS.primaryDark,
    marginRight: 8,
  },
  optionTextSelected: {
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  optionTextActive: {
    color: COLORS.primary,
    fontFamily: FONT.bold,
    fontWeight: '700',
  },

  // Right graphic illustration
  optionRightGraphic: {
    marginLeft: 'auto',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Voted Result Row with background progress line fill
  resultOptionRow: {
    minHeight: 52,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceCream,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: 'relative',
  },
  resultProgressLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.border,
  },
  resultProgressLineActive: {
    backgroundColor: COLORS.primaryProgressTrack,
  },
  resultTallyText: {
    fontSize: 13,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: COLORS.ink,
    marginLeft: 'auto',
    flexShrink: 0,
  },
});
