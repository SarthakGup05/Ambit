import React from 'react';
import { View, StyleSheet, Pressable, Platform, Alert } from 'react-native';
import { Text } from '@repo/ui';
import { Car, Droplet, Activity, Clock, Users, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Poll, EnhancedPoll } from '@/services/PollService';
import { COLORS, RADIUS, FONT } from '../constants';
import { MiniCircularProgress } from './CircularProgress';

interface SecondaryPollCardProps {
  poll: EnhancedPoll;
  isPast: boolean;
  onVote: (pollId: string, option: string) => void;
  onUnlockVote: (pollId: string) => void;
}

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

export const SecondaryPollCard: React.FC<SecondaryPollCardProps> = ({
  poll,
  isPast,
  onVote,
  onUnlockVote,
}) => {
  const yesOption = poll.results.find(
    (r) => r.option.toLowerCase().includes('yes') || r.option.toLowerCase().includes('support')
  );
  const yesVotes = yesOption?.votes || 0;
  const yesPercent = poll.totalVotes > 0 ? Math.round((yesVotes / poll.totalVotes) * 100) : 0;

  const CardIcon = poll.icon === 'car' ? Car : poll.icon === 'droplet' ? Droplet : Activity;

  const handleCardPress = () => {
    triggerHaptic();
    Alert.alert(
      poll.question,
      `Total votes: ${poll.totalVotes}\nResult: ${yesPercent}% YES\n${
        poll.userVotedOption ? `Your vote: "${poll.userVotedOption}"` : 'You have not voted yet.'
      }`,
      poll.userVotedOption
        ? [
            { text: 'Close', style: 'cancel' },
            { text: 'Change My Vote', onPress: () => onUnlockVote(poll.id) },
          ]
        : [
            { text: 'Close', style: 'cancel' },
            { text: 'Vote Yes', onPress: () => onVote(poll.id, yesOption?.option || 'Yes') },
          ]
    );
  };

  return (
    <Pressable
      key={poll.id}
      onPress={handleCardPress}
      style={({ pressed }) => [styles.secondaryCard, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.secondaryCardRow}>
        {/* Left Icon wrapper */}
        <View style={styles.secondaryIconWrapper}>
          <CardIcon size={20} color={COLORS.primary} strokeWidth={2} />
        </View>

        {/* Center Texts */}
        <View style={styles.secondaryTextContainer}>
          <Text variant="label" weight="bold" style={styles.secondaryQuestion} numberOfLines={2}>
            {poll.question}
          </Text>
          <View style={styles.secondaryMetaRow}>
            <View style={styles.secondaryMetaItem}>
              <Clock size={12} color={COLORS.textMuted} style={{ marginRight: 4 }} />
              <Text variant="caption" style={styles.secondaryMetaText}>
                {isPast ? 'Closed' : poll.expiresLabel}
              </Text>
            </View>
            <View style={styles.secondaryMetaItem}>
              <Users size={12} color={COLORS.textMuted} style={{ marginRight: 4 }} />
              <Text variant="caption" style={styles.secondaryMetaText}>
                {poll.totalVotes} voted
              </Text>
            </View>
          </View>
        </View>

        {/* Right Mini Progress Ring */}
        <View style={styles.secondaryRightBlock}>
          <MiniCircularProgress percentage={yesPercent} />
          <ChevronRight size={18} color={COLORS.textMuted} style={{ marginLeft: 8 }} />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  secondaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#3A3A3A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  secondaryCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  secondaryIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryTextContainer: {
    flex: 1,
    gap: 6,
  },
  secondaryQuestion: {
    fontSize: 14.5,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: COLORS.ink,
    lineHeight: 18,
  },
  secondaryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  secondaryMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryMetaText: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: COLORS.textMuted,
  },
  secondaryRightBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
