import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  InteractionManager,
} from 'react-native';
import { Screen, Text, Skeleton } from '@repo/ui';
import { ScreenBackground } from '@/components/common';
import { useRouter } from 'expo-router';
import { Activity, Calendar, History } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { PollService, Poll, EnhancedPoll } from '@/services/PollService';
import {
  PollsHeader,
  TabType,
  FeaturedPollCard,
  SecondaryPollCard,
  SuggestPollBanner,
  SuggestPollModal,
} from '@/features/polls';
import { COLORS, RADIUS, FONT } from '@/features/polls/constants';

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

function getEnhancedPoll(poll: Poll): EnhancedPoll {
  const q = poll.question.toLowerCase();

  // Compute a dynamic expiry label from the actual expiresAt date
  const msLeft = new Date(poll.expiresAt).getTime() - Date.now();
  const daysLeft = Math.floor(msLeft / 86400000);
  const hoursLeft = Math.floor((msLeft % 86400000) / 3600000);
  const expiresLabel = msLeft <= 0
    ? 'Closed'
    : daysLeft > 0
      ? `Ends in ${daysLeft}d ${hoursLeft}h`
      : `Ends in ${hoursLeft}h`;

  // Icon heuristic (visual only, no effect on data)
  let icon: string | undefined;
  if (q.includes('parking') || q.includes('car')) icon = 'car';
  else if (q.includes('water') || q.includes('ro') || q.includes('plant')) icon = 'droplet';

  return {
    ...poll,
    isFeatured: poll.isFeatured ?? false,
    expiresLabel,
    icon,
    // Featured polls also get a description if they don't have one
    description: poll.isFeatured && !poll.description
      ? poll.question
      : poll.description,
  };
}

export default function PollsScreen() {
  const router = useRouter();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unlockedPolls, setUnlockedPolls] = useState<Record<string, boolean>>({});
  const [isSuggestModalVisible, setIsSuggestModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('Active');

  const loadPolls = useCallback(async () => {
    try {
      const data = await PollService.getPolls();
      setPolls(data);
    } catch {
      // Keep fallbacks
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      loadPolls();
    });
    return () => task.cancel();
  }, [loadPolls]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    triggerHaptic();
    loadPolls();
  }, [loadPolls]);

  const handleVote = async (pollId: string, chosenOption: string) => {
    triggerHaptic();
    try {
      await PollService.votePoll(pollId, chosenOption);

      setPolls((prev) =>
        prev.map((p) => {
          if (p.id === pollId) {
            const oldVote = p.userVotedOption;
            const updatedResults = p.results.map((res) => {
              let offset = 0;
              if (res.option === chosenOption) offset += 1;
              if (oldVote && res.option === oldVote) offset -= 1;
              return { ...res, votes: Math.max(0, res.votes + offset) };
            });

            return {
              ...p,
              userVotedOption: chosenOption,
              results: updatedResults,
              totalVotes: p.totalVotes + (oldVote ? 0 : 1),
            };
          }
          return p;
        })
      );

      setUnlockedPolls((prev) => ({ ...prev, [pollId]: false }));
      Alert.alert('Vote Cast', 'Your response has been registered.');
    } catch {
      setPolls((prev) =>
        prev.map((p) => {
          if (p.id === pollId) {
            const oldVote = p.userVotedOption;
            const updatedResults = p.results.map((res) => {
              let offset = 0;
              if (res.option === chosenOption) offset += 1;
              if (oldVote && res.option === oldVote) offset -= 1;
              return { ...res, votes: Math.max(0, res.votes + offset) };
            });

            return {
              ...p,
              userVotedOption: chosenOption,
              results: updatedResults,
              totalVotes: p.totalVotes + (oldVote ? 0 : 1),
            };
          }
          return p;
        })
      );
      setUnlockedPolls((prev) => ({ ...prev, [pollId]: false }));
    }
  };

  const handleUnlockVote = (pollId: string) => {
    triggerHaptic();
    setUnlockedPolls((prev) => ({ ...prev, [pollId]: true }));
  };

  const handleSuggestPoll = () => {
    triggerHaptic();
    setIsSuggestModalVisible(true);
  };

  const handleFilterPress = () => {
    triggerHaptic();
    Alert.alert('Filter Discussions', 'Sort by newest, most active, or ending soon.', [
      { text: 'Ending Soon', onPress: () => {} },
      { text: 'Most Active', onPress: () => {} },
      { text: 'Newest', onPress: () => {} },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const enhancedPolls = polls.map(getEnhancedPoll);
  const featuredPoll = enhancedPolls.find((p) => p.isFeatured);
  const otherActivePolls = enhancedPolls.filter((p) => !p.isFeatured && new Date(p.expiresAt) >= new Date());
  const pastPolls = enhancedPolls.filter((p) => new Date(p.expiresAt) < new Date());

  const renderTabContent = () => {
    if (activeTab === 'Upcoming') {
      return (
        <View style={styles.emptyContainer}>
          <Calendar size={48} color={COLORS.textFaint} strokeWidth={1.2} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>No upcoming polls scheduled.</Text>
        </View>
      );
    }

    if (activeTab === 'Past') {
      if (pastPolls.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <History size={48} color={COLORS.textFaint} strokeWidth={1.2} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No completed polls available.</Text>
          </View>
        );
      }
      return (
        <View style={styles.listContainer}>
          {pastPolls.map((poll) => (
            <SecondaryPollCard
              key={poll.id}
              poll={poll}
              isPast={true}
              onVote={handleVote}
              onUnlockVote={handleUnlockVote}
            />
          ))}
        </View>
      );
    }

    if (enhancedPolls.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Activity size={48} color={COLORS.textFaint} strokeWidth={1.2} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>No active community discussions.</Text>
        </View>
      );
    }

    return (
      <View style={{ gap: 20 }}>
        {featuredPoll && (
          <FeaturedPollCard
            poll={featuredPoll}
            isUnlocked={unlockedPolls[featuredPoll.id] === true}
            hasVoted={featuredPoll.userVotedOption !== null && !unlockedPolls[featuredPoll.id]}
            onVote={handleVote}
            onUnlockVote={handleUnlockVote}
          />
        )}

        {otherActivePolls.length > 0 && (
          <View style={styles.otherSection}>
            <Text variant="label" weight="bold" style={styles.otherHeader}>
              Other Active Polls
            </Text>
            <View style={styles.listContainer}>
              {otherActivePolls.map((poll) => (
                <SecondaryPollCard
                  key={poll.id}
                  poll={poll}
                  isPast={false}
                  onVote={handleVote}
                  onUnlockVote={handleUnlockVote}
                />
              ))}
            </View>
          </View>
        )}

        <SuggestPollBanner onSuggestPress={handleSuggestPoll} />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <View style={[styles.innerContainer, { paddingTop: 12 }]}>
          <PollsHeader
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onBackPress={() => {
              triggerHaptic();
              router.back();
            }}
            onFilterPress={handleFilterPress}
          />

          {isLoading ? (
            <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
              <Skeleton style={{ height: 160, borderRadius: RADIUS.xxl, marginBottom: 16 }} />
              <Skeleton style={{ height: 75, borderRadius: RADIUS.xl, marginBottom: 12 }} />
              <Skeleton style={{ height: 75, borderRadius: RADIUS.xl }} />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listScrollContent}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            >
              {renderTabContent()}
            </ScrollView>
          )}
        </View>
      </Screen>

      <SuggestPollModal
        isVisible={isSuggestModalVisible}
        onClose={() => setIsSuggestModalVisible(false)}
        onSubmit={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
  },
  listScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 130,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.textMuted,
  },
  otherSection: {
    gap: 14,
  },
  otherHeader: {
    fontSize: 15,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
  },
  listContainer: {
    gap: 12,
  },
});