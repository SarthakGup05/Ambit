import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Text } from '@repo/ui';
import { Star, Clock, Users, Lock } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Poll, EnhancedPoll } from '@/services/PollService';
import { COLORS, RADIUS, FONT } from '../constants';
import { CircularProgress } from './CircularProgress';
import { PollOptionRow } from './PollOptionRow';

interface FeaturedPollCardProps {
  poll: EnhancedPoll;
  isUnlocked: boolean;
  hasVoted: boolean;
  onVote: (pollId: string, option: string) => void;
  onUnlockVote: (pollId: string) => void;
}

export const FeaturedPollCard: React.FC<FeaturedPollCardProps> = ({
  poll,
  isUnlocked,
  hasVoted,
  onVote,
  onUnlockVote,
}) => {
  const yesOption = poll.results.find(
    (r) => r.option.toLowerCase().includes('yes') || r.option.toLowerCase().includes('support')
  );
  const yesVotes = yesOption?.votes || 0;
  const yesPercent = poll.totalVotes > 0 ? Math.round((yesVotes / poll.totalVotes) * 100) : 78;

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.featuredCard}>
      {/* Tags Header Row */}
      <View style={styles.featuredTagsRow}>
        <View style={styles.featuredBadge}>
          <Star size={13} color={COLORS.accentGold} fill={COLORS.accentGold} style={{ marginRight: 5 }} />
          <Text variant="caption" weight="bold" style={styles.featuredBadgeText}>
            FEATURED
          </Text>
        </View>
        <View style={styles.expiresBadge}>
          <Clock size={14} color={COLORS.primaryAccent} style={{ marginRight: 6 }} />
          <Text variant="caption" style={styles.expiresBadgeText}>
            {poll.expiresLabel || 'Ends in 2d 14h'}
          </Text>
        </View>
      </View>

      {/* Question Header & Donut Progress Ring */}
      <View style={styles.featuredHeaderRow}>
        <View style={styles.featuredTitleBlock}>
          <Text variant="h2" weight="bold" style={styles.featuredQuestion}>
            {poll.question}
          </Text>
          <View style={styles.greenTitleBar} />
        </View>
        <CircularProgress percentage={yesPercent} />
      </View>

      {/* Voted Count Pill */}
      <View style={styles.votedCountPill}>
        <Users size={16} color={COLORS.primaryAccent} style={{ marginRight: 8 }} />
        <Text variant="caption" style={styles.votedCountText}>
          <Text weight="bold" style={{ color: COLORS.primaryDark }}>
            {poll.totalVotes || 256}
          </Text>{' '}
          residents have voted
        </Text>
      </View>

      {/* Options List */}
      <View style={styles.optionsList}>
        {poll.options.map((option, idx) => {
          const isSelected = poll.userVotedOption === option && !isUnlocked;
          const optionData = poll.results.find((r) => r.option === option);
          const votes = optionData?.votes || 0;
          const percent = poll.totalVotes > 0 ? Math.round((votes / poll.totalVotes) * 100) : 0;

          return (
            <PollOptionRow
              key={option}
              option={option}
              idx={idx}
              isSelected={isSelected}
              hasVoted={hasVoted}
              percent={percent}
              votes={votes}
              onSelectOption={() => onVote(poll.id, option)}
            />
          );
        })}
      </View>

      {/* Change Vote Action Button */}
      {hasVoted && (
        <Pressable
          onPress={() => onUnlockVote(poll.id)}
          style={({ pressed }) => [
            styles.changeVoteBtn,
            pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
          ]}
        >
          <Lock size={14} color={COLORS.surface} style={{ marginRight: 8 }} />
          <Text variant="label" weight="bold" style={styles.changeVoteText}>
            Change My Vote
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  featuredCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primaryDark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  featuredTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  featuredBadge: {
    backgroundColor: COLORS.primarySurfaceStrong,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredBadgeText: {
    fontSize: 11,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: COLORS.primaryAccent,
    letterSpacing: 0.6,
  },
  expiresBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiresBadgeText: {
    fontSize: 13,
    fontFamily: FONT.medium,
    color: COLORS.primaryAccent,
    fontWeight: '600',
  },
  featuredHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  featuredTitleBlock: {
    flex: 1,
    marginRight: 12,
  },
  featuredQuestion: {
    fontSize: 22,
    fontFamily: FONT.headingBold,
    fontWeight: '800',
    color: COLORS.primaryDark,
    lineHeight: 28,
  },
  greenTitleBar: {
    width: 30,
    height: 3,
    backgroundColor: COLORS.primaryAccent,
    borderRadius: 2,
    marginTop: 10,
  },
  votedCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySurfaceSubtle,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignSelf: 'flex-start',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.primaryBorderFaint,
  },
  votedCountText: {
    fontSize: 12.5,
    fontFamily: FONT.medium,
    color: COLORS.inkMuted,
  },
  optionsList: {
    gap: 12,
  },
  changeVoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    height: 48,
    marginTop: 16,
  },
  changeVoteText: {
    fontSize: 14,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: COLORS.surface,
  },
});
