import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@repo/ui';
import { Trash2 } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export interface PollRecord {
  id: string;
  question: string;
  options: string[];
  expiresAt: string;
  createdAt: string;
  votes: Record<string, number>;
  totalVotes: number;
}

interface AdminPollCardProps {
  item: PollRecord;
  index: number;
  onDelete: (id: string, question: string) => void;
}

export function AdminPollCard({ item, index, onDelete }: AdminPollCardProps) {
  const isExpired = new Date(item.expiresAt) < new Date();
  const votesObj: Record<string, number> = item.votes || {};

  let maxVotes = -1;
  let winningOption = '';
  Object.entries(votesObj).forEach(([opt, vCount]) => {
    if (vCount > maxVotes && vCount > 0) {
      maxVotes = vCount;
      winningOption = opt;
    }
  });

  const optionsList = Array.isArray(item.options) ? item.options : [];
  const totalVotesCount = item.totalVotes || 0;

  return (
    <Animated.View entering={FadeInDown.duration(350).delay(index * 40)} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={[styles.categoryBadge, { backgroundColor: 'rgba(74, 85, 104, 0.08)' }]}>
            <Text style={styles.categoryBadgeText}>Poll Bulletin</Text>
          </View>
          <View style={[styles.statusBadge, isExpired ? styles.expiredBadge : styles.activeBadge]}>
            <Text
              style={[
                styles.statusBadgeText,
                isExpired ? styles.expiredBadgeText : styles.activeBadgeText,
              ]}
            >
              {isExpired ? 'EXPIRED' : 'ACTIVE'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.votesLabel}>{totalVotesCount} votes</Text>
          <Pressable
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
            onPress={() => onDelete(item.id, item.question)}
          >
            <Trash2 size={14} color="#8E8D94" />
          </Pressable>
        </View>
      </View>

      <Text style={styles.question}>{item.question}</Text>

      <View style={styles.votesContainer}>
        {optionsList.map((opt) => {
          const vCount = votesObj[opt] || 0;
          const pct = totalVotesCount > 0 ? Math.round((vCount / totalVotesCount) * 100) : 0;
          const isWinner = opt === winningOption;

          return (
            <View key={opt} style={styles.voteOptionRow}>
              <View style={styles.optionLabelRow}>
                <Text style={[styles.optText, isWinner && styles.optTextWinner]}>
                  {opt} {isWinner && '👑'}
                </Text>
                <Text style={styles.optPercentText}>
                  {pct}% ({vCount})
                </Text>
              </View>
              <View style={styles.barBackground}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${pct}%` as any },
                    isWinner && styles.barFillWinner,
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 28,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontFamily: 'InterSemiBold',
    color: '#4A5568',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: 'InterBold',
  },
  expiredBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  expiredBadgeText: {
    color: '#8E8D94',
  },
  activeBadge: {
    backgroundColor: 'rgba(46, 125, 50, 0.09)',
  },
  activeBadgeText: {
    color: '#2E7D32',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  votesLabel: {
    fontSize: 11,
    fontFamily: 'Inter',
    color: '#A3A1A8',
  },
  deleteBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnPressed: {
    backgroundColor: 'rgba(193, 88, 75, 0.15)',
  },
  question: {
    fontSize: 16,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#1C1B1F',
    lineHeight: 22,
    marginBottom: 12,
  },
  votesContainer: {
    gap: 10,
    marginTop: 4,
  },
  voteOptionRow: {
    gap: 4,
  },
  optionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optText: {
    fontSize: 13,
    fontFamily: 'InterMedium',
    color: '#5E5D6A',
  },
  optTextWinner: {
    fontFamily: 'InterBold',
    color: '#1C1B1F',
    fontWeight: 'bold',
  },
  optPercentText: {
    fontSize: 11,
    fontFamily: 'InterSemiBold',
    color: '#8E8D94',
  },
  barBackground: {
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: 'rgba(74, 85, 104, 0.3)',
    borderRadius: 4,
  },
  barFillWinner: {
    backgroundColor: '#7A9B76',
  },
});
