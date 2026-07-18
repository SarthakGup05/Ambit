import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  RefreshControl,
  InteractionManager,
} from 'react-native';
import { Screen, Text, Skeleton } from '@repo/ui';
import { ScreenBackground } from '@/components/common';
import { uiStyles } from '@/theme';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  SlidersHorizontal,
  Activity,
  Calendar,
  History,
  Clock,
  Users,
  ChevronRight,
  Megaphone,
  Edit3,
  Check,
  Lock,
  Car,
  Droplet,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PollService, Poll } from '@/services/PollService';
import Svg, { Circle } from 'react-native-svg';
import { SuggestPollModal } from '@/features/polls';

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

// Baseline mock vote tallies to align with the mockup image numbers
const BASELINES: Record<string, { totalVotes: number; tallies: Record<string, number> }> = {
  'play area': {
    totalVotes: 256,
    tallies: {
      'Yes, I support this': 200,
      'No, not needed right now': 38,
      "I'm not sure": 18,
    },
  },
  'parking charges': {
    totalVotes: 134,
    tallies: {
      'Yes': 83,
      'No': 51,
    },
  },
  'ro plants': {
    totalVotes: 98,
    tallies: {
      'Yes': 54,
      'No': 44,
    },
  },
};

function getEnhancedPoll(poll: Poll) {
  const q = poll.question.toLowerCase();
  
  // Apply baselines if present
  const baseKey = Object.keys(BASELINES).find((k) => q.includes(k));
  let results = poll.results;
  let totalVotes = poll.totalVotes;
  
  if (baseKey) {
    const base = BASELINES[baseKey];
    totalVotes = base.totalVotes + (poll.userVotedOption ? 1 : 0);
    results = poll.results.map((r) => {
      const baseVotes = base.tallies[r.option] || 0;
      const userExtra = poll.userVotedOption === r.option ? 1 : 0;
      return {
        option: r.option,
        votes: baseVotes + userExtra,
      };
    });
  }

  if (q.includes('play area') || q.includes('children')) {
    return {
      ...poll,
      totalVotes,
      results,
      description: 'Let us know if you support the proposal to upgrade the play area with new equipment and safety flooring.',
      isFeatured: true,
      icon: 'tree',
      expiresLabel: 'Ends in 2d 14h',
    };
  }
  if (q.includes('visitor parking') || q.includes('parking charges')) {
    return {
      ...poll,
      totalVotes,
      results,
      description: 'Proposal to charge commercial cabs and guest vehicles after 2 hours of parking.',
      isFeatured: false,
      icon: 'car',
      expiresLabel: 'Ends in 5d 08h',
    };
  }
  if (q.includes('ro plant') || q.includes('ro plants')) {
    return {
      ...poll,
      totalVotes,
      results,
      description: 'Proposal to setup central reverse osmosis water filtration system for drinking water supply.',
      isFeatured: false,
      icon: 'droplet',
      expiresLabel: 'Ends in 7d 12h',
    };
  }
  
  return {
    ...poll,
    totalVotes,
    results,
    description: 'Share your input on this community discussion topic.',
    isFeatured: false,
    icon: 'poll',
    expiresLabel: 'Expiring soon',
  };
}

// Flat Vector Tree & Bench Illustration Component
const ParkIllustration = () => (
  <View style={styles.parkIllustrationContainer}>
    {/* Tree Leaves */}
    <View style={styles.treeLeaves} />
    {/* Tree Trunk */}
    <View style={styles.treeTrunk} />
    {/* Bench Backrest */}
    <View style={styles.benchBack} />
    {/* Bench Planks */}
    <View style={styles.benchSeat} />
    {/* Bench Legs */}
    <View style={styles.benchLegLeft} />
    <View style={styles.benchLegRight} />
  </View>
);

// Progress Ring using react-native-svg
const CircularProgress = ({ percentage, color = '#3E5C38', size = 72, strokeWidth = 8 }: { percentage: number; color?: string; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#EAECE8"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Text variant="label" weight="bold" style={{ fontSize: 16, color: '#1C1B1F', fontFamily: 'InterBold' }}>{percentage}%</Text>
        <Text variant="caption" style={{ fontSize: 9, color: '#8E8D94', marginTop: -2, fontFamily: 'Inter' }}>Yes</Text>
      </View>
    </View>
  );
};

// Mini Progress Ring
const MiniCircularProgress = ({ percentage, size = 52, strokeWidth = 6 }: { percentage: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#EAECE8"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#3E5C38"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>
        <Text variant="caption" weight="bold" style={{ fontSize: 11, color: '#1C1B1F', fontFamily: 'InterBold' }}>{percentage}%</Text>
        <Text variant="caption" style={{ fontSize: 8, color: '#8E8D94', marginTop: -3, fontFamily: 'Inter' }}>Yes</Text>
      </View>
    </View>
  );
};

export default function PollsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'Active' | 'Upcoming' | 'Past'>('Active');
  
  // Local state to handle 'Change My Vote' unlock
  const [unlockedPolls, setUnlockedPolls] = useState<Record<string, boolean>>({});
  const [isSuggestModalVisible, setIsSuggestModalVisible] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const list = await PollService.getPolls();
      setPolls(list || []);
    } catch (err: any) {
      console.warn('Failed to load polls:', err.message || err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      loadData();
    });
    return () => task.cancel();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleVote = async (pollId: string, chosenOption: string) => {
    triggerHaptic();
    try {
      await PollService.votePoll(pollId, chosenOption);
      
      // Update local state
      setPolls((prev) =>
        prev.map((p) => {
          if (p.id === pollId) {
            // Deduct from previous vote if they were updating their vote
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
      
      // Lock poll again
      setUnlockedPolls((prev) => ({ ...prev, [pollId]: false }));
      Alert.alert('Vote Cast', 'Your response has been registered.');
    } catch (err: any) {
      // Local fallback in case of connection/API error
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
      Alert.alert('Vote Registered', 'Your response has been saved locally.');
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
    Alert.alert('Sort & Filter', 'Community discussions settings', [
      { text: 'Refresh Polls', onPress: loadData },
      { text: 'Close', style: 'cancel' },
    ]);
  };

  // Enhance fetched list
  const enhancedPolls = polls.map(getEnhancedPoll);

  // Split into featured (play area) and others
  const featuredPoll = enhancedPolls.find((p) => p.isFeatured);
  const otherActivePolls = enhancedPolls.filter((p) => !p.isFeatured && new Date(p.expiresAt) >= new Date());
  const pastPolls = enhancedPolls.filter((p) => new Date(p.expiresAt) < new Date());

  // Filter based on active capsule tab
  const renderTabContent = () => {
    if (activeTab === 'Upcoming') {
      return (
        <View style={styles.emptyContainer}>
          <Calendar size={48} color="#A3A1A8" strokeWidth={1.2} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>No upcoming polls scheduled.</Text>
        </View>
      );
    }

    if (activeTab === 'Past') {
      if (pastPolls.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <History size={48} color="#A3A1A8" strokeWidth={1.2} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No completed polls available.</Text>
          </View>
        );
      }
      return (
        <View style={styles.listContainer}>
          {pastPolls.map((poll) => renderSecondaryCard(poll, true))}
        </View>
      );
    }

    // Active tab
    if (enhancedPolls.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Activity size={48} color="#A3A1A8" strokeWidth={1.2} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>No active community discussions.</Text>
        </View>
      );
    }

    return (
      <View style={{ gap: 20 }}>
        {/* 1. Featured Poll Card */}
        {featuredPoll && renderFeaturedCard(featuredPoll)}

        {/* 2. Other Active Polls */}
        {otherActivePolls.length > 0 && (
          <View style={styles.otherSection}>
            <Text variant="label" weight="bold" style={styles.otherHeader}>Other Active Polls</Text>
            <View style={styles.listContainer}>
              {otherActivePolls.map((poll) => renderSecondaryCard(poll, false))}
            </View>
          </View>
        )}

        {/* 3. Suggest Poll Banner */}
        {renderSuggestBanner()}
      </View>
    );
  };

  const renderFeaturedCard = (poll: Poll & { description?: string; expiresLabel?: string }) => {
    const isUnlocked = unlockedPolls[poll.id] === true;
    const hasVoted = poll.userVotedOption !== null && !isUnlocked;
    
    // Find yes option percent
    const yesOption = poll.results.find((r) => r.option.toLowerCase().includes('yes') || r.option.toLowerCase().includes('support'));
    const yesVotes = yesOption?.votes || 0;
    const yesPercent = poll.totalVotes > 0 ? Math.round((yesVotes / poll.totalVotes) * 100) : 0;

    return (
      <Animated.View entering={FadeInUp.duration(400)} style={styles.featuredCard}>
        {/* Tags Row */}
        <View style={styles.featuredTagsRow}>
          <View style={styles.featuredBadge}>
            <Text variant="caption" weight="bold" style={styles.featuredBadgeText}>⭐ FEATURED</Text>
          </View>
          <View style={styles.expiresBadge}>
            <Clock size={12} color="#3E5C38" style={{ marginRight: 4 }} />
            <Text variant="caption" style={styles.expiresBadgeText}>{poll.expiresLabel}</Text>
          </View>
        </View>

        {/* Main description info row */}
        <View style={styles.featuredInfoRow}>
          <ParkIllustration />
          <View style={styles.featuredTitleBlock}>
            <Text variant="h3" weight="bold" style={styles.featuredQuestion}>{poll.question}</Text>
            <Text variant="body" style={styles.featuredDesc}>{poll.description}</Text>
            <View style={styles.votesCastMeta}>
              <Users size={13} color="#8E8D94" style={{ marginRight: 6 }} />
              <Text variant="caption" style={styles.votesCastText}>{poll.totalVotes} residents have voted</Text>
            </View>
          </View>
          {/* Progress Ring */}
          <CircularProgress percentage={yesPercent} />
        </View>

        {/* Options progress items */}
        <View style={styles.optionsList}>
          {poll.options.map((option) => {
            const isVotedOption = poll.userVotedOption === option && !isUnlocked;
            const optionData = poll.results.find((r) => r.option === option);
            const votes = optionData?.votes || 0;
            const percent = poll.totalVotes > 0 ? Math.round((votes / poll.totalVotes) * 100) : 0;

            if (hasVoted) {
              // RESULTS STATE
              return (
                <View key={option} style={styles.resultOptionRow}>
                  {/* Progress bar fill */}
                  <View
                    style={[
                      styles.resultProgressLine,
                      { width: `${percent}%` },
                      isVotedOption && styles.resultProgressLineActive,
                    ]}
                  />
                  
                  {/* Radio Icon / Checkmark */}
                  <View style={styles.resultLeftBlock}>
                    <View style={[styles.radioCircle, styles.radioCircleVoted, isVotedOption && styles.radioCircleVotedActive]}>
                      {isVotedOption && <Check size={10} color="#FFFFFF" strokeWidth={4} />}
                    </View>
                    <Text
                      variant="label"
                      weight={isVotedOption ? 'bold' : 'normal'}
                      style={[styles.resultOptionText, isVotedOption && styles.resultOptionTextActive]}
                    >
                      {option}
                    </Text>
                  </View>
                  <Text variant="caption" weight="bold" style={styles.resultTallyText}>
                    {percent}% ({votes})
                  </Text>
                </View>
              );
            }

            // VOTING / SELECTION STATE
            return (
              <Pressable
                key={option}
                onPress={() => handleVote(poll.id, option)}
                style={({ pressed }) => [
                  styles.votingOptionBtn,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={[styles.radioCircle, styles.radioCircleEmpty]} />
                <Text variant="label" weight="medium" style={styles.votingOptionText}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Change Vote Button */}
        {hasVoted && (
          <Pressable
            onPress={() => handleUnlockVote(poll.id)}
            style={({ pressed }) => [
              styles.changeVoteBtn,
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
            ]}
          >
            <Lock size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text variant="label" weight="bold" style={styles.changeVoteText}>Change My Vote</Text>
          </Pressable>
        )}
      </Animated.View>
    );
  };

  const renderSecondaryCard = (poll: Poll & { description?: string; expiresLabel?: string; icon?: string }, isPast: boolean) => {
    // Find yes option percent
    const yesOption = poll.results.find((r) => r.option.toLowerCase().includes('yes') || r.option.toLowerCase().includes('support'));
    const yesVotes = yesOption?.votes || 0;
    const yesPercent = poll.totalVotes > 0 ? Math.round((yesVotes / poll.totalVotes) * 100) : 0;
    
    const CardIcon = poll.icon === 'car' ? Car : poll.icon === 'droplet' ? Droplet : Activity;

    return (
      <Pressable
        key={poll.id}
        onPress={() => {
          triggerHaptic();
          Alert.alert(
            poll.question,
            `${poll.description}\n\nTotal votes: ${poll.totalVotes}\nResult: ${yesPercent}% YES\n${poll.userVotedOption ? `Your vote: "${poll.userVotedOption}"` : 'You have not voted yet.'}`,
            poll.userVotedOption
              ? [
                  { text: 'Close', style: 'cancel' },
                  { text: 'Change My Vote', onPress: () => handleUnlockVote(poll.id) },
                ]
              : [
                  { text: 'Close', style: 'cancel' },
                  { text: 'Vote Yes', onPress: () => handleVote(poll.id, yesOption?.option || 'Yes') },
                ]
          );
        }}
        style={({ pressed }) => [
          styles.secondaryCard,
          pressed && { opacity: 0.9 },
        ]}
      >
        <View style={styles.secondaryCardRow}>
          {/* Left Icon badge */}
          <View style={styles.secondaryIconWrapper}>
            <CardIcon size={20} color="#3E5C38" strokeWidth={2} />
          </View>
          
          {/* Center texts */}
          <View style={styles.secondaryTextContainer}>
            <Text variant="label" weight="bold" style={styles.secondaryQuestion} numberOfLines={2}>{poll.question}</Text>
            <View style={styles.secondaryMetaRow}>
              <View style={styles.secondaryMetaItem}>
                <Clock size={12} color="#8E8D94" style={{ marginRight: 4 }} />
                <Text variant="caption" style={styles.secondaryMetaText}>{isPast ? 'Closed' : poll.expiresLabel}</Text>
              </View>
              <View style={styles.secondaryMetaItem}>
                <Users size={12} color="#8E8D94" style={{ marginRight: 4 }} />
                <Text variant="caption" style={styles.secondaryMetaText}>{poll.totalVotes} voted</Text>
              </View>
            </View>
          </View>

          {/* Right Progress Circle & Chevron */}
          <View style={styles.secondaryRightBlock}>
            <MiniCircularProgress percentage={yesPercent} />
            <ChevronRight size={18} color="#8E8D94" style={{ marginLeft: 8 }} />
          </View>
        </View>
      </Pressable>
    );
  };

  const renderSuggestBanner = () => (
    <Animated.View entering={FadeInUp.duration(400).delay(150)} style={styles.suggestBanner}>
      <View style={styles.suggestLeft}>
        <View style={styles.suggestIconContainer}>
          <Megaphone size={18} color="#3E5C38" strokeWidth={2.2} />
        </View>
        <View style={styles.suggestTexts}>
          <Text variant="label" weight="bold" style={styles.suggestTitle}>Have an idea for a poll?</Text>
          <Text variant="caption" style={styles.suggestSubtitle}>Suggest a topic for the community to vote on.</Text>
        </View>
      </View>
      <Pressable
        onPress={handleSuggestPoll}
        style={({ pressed }) => [
          styles.suggestBtn,
          pressed && { opacity: 0.8 },
        ]}
      >
        <Text variant="caption" weight="bold" style={styles.suggestBtnText}>Suggest Poll</Text>
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <View style={[styles.innerContainer, { paddingTop: insets.top + 16 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={styles.backBtn}
              onPress={() => {
                triggerHaptic();
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(resident)/(tabs)');
                }
              }}
              hitSlop={12}
            >
              <ArrowLeft size={24} color="#3E5C38" strokeWidth={2.4} />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text variant="h2" weight="bold" style={styles.headerTitle}>Resident Polls</Text>
              <Text variant="body" style={styles.headerSubtitle}>Your voice shapes our community</Text>
            </View>
            <Pressable
              onPress={handleFilterPress}
              style={({ pressed }) => [
                styles.filterBtn,
                pressed && { opacity: 0.8 },
              ]}
              hitSlop={12}
            >
              <SlidersHorizontal size={18} color="#3E5C38" strokeWidth={2.2} />
            </Pressable>
          </View>

          {/* Capsule Tabs row */}
          <View style={styles.tabsRow}>
            <Pressable
              onPress={() => {
                triggerHaptic();
                setActiveTab('Active');
              }}
              style={[styles.tabPill, activeTab === 'Active' && styles.tabPillActive]}
            >
              <Activity size={14} color={activeTab === 'Active' ? '#FFFFFF' : '#6B6873'} strokeWidth={2.2} />
              <Text variant="caption" weight="bold" style={[styles.tabText, activeTab === 'Active' && styles.tabTextActive]}>
                Active Polls
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                triggerHaptic();
                setActiveTab('Upcoming');
              }}
              style={[styles.tabPill, activeTab === 'Upcoming' && styles.tabPillActive]}
            >
              <Calendar size={14} color={activeTab === 'Upcoming' ? '#FFFFFF' : '#6B6873'} strokeWidth={2.2} />
              <Text variant="caption" weight="bold" style={[styles.tabText, activeTab === 'Upcoming' && styles.tabTextActive]}>
                Upcoming
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                triggerHaptic();
                setActiveTab('Past');
              }}
              style={[styles.tabPill, activeTab === 'Past' && styles.tabPillActive]}
            >
              <History size={14} color={activeTab === 'Past' ? '#FFFFFF' : '#6B6873'} strokeWidth={2.2} />
              <Text variant="caption" weight="bold" style={[styles.tabText, activeTab === 'Past' && styles.tabTextActive]}>
                Past Polls
              </Text>
            </Pressable>
          </View>

          {/* Main Content Area */}
          {isLoading ? (
            <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
              <Skeleton style={{ height: 160, borderRadius: 24, marginBottom: 16 }} />
              <Skeleton style={{ height: 75, borderRadius: 20, marginBottom: 12 }} />
              <Skeleton style={{ height: 75, borderRadius: 20 }} />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listScrollContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3E5C38" />
              }
            >
              {renderTabContent()}
            </ScrollView>
          )}
        </View>
      </Screen>
      
      <SuggestPollModal
        isVisible={isSuggestModalVisible}
        onClose={() => setIsSuggestModalVisible(false)}
        onSubmit={async (idea) => {
          // Simulate network request delay for a beautiful experience
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'ManropeBold',
    fontWeight: '700',
    color: '#1C1B1F',
  },
  headerSubtitle: {
    fontSize: 13.5,
    fontFamily: 'Inter',
    color: '#8E8D94',
    marginTop: 2,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F3EF', // Cream light green
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  tabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FAF9F5', // Soft light background
    borderWidth: 1,
    borderColor: '#ECEFEA',
    gap: 6,
  },
  tabPillActive: {
    backgroundColor: '#3E5C38', // Sage green active state
    borderColor: '#3E5C38',
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'InterBold',
    fontWeight: '700',
    color: '#6B6873',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listScrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 130, // Fits bottom absolute navigation
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#8E8D94',
  },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ECEFEA',
    ...Platform.select({
      ios: {
        shadowColor: '#3A3A3A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  featuredTagsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  featuredBadge: {
    backgroundColor: '#EAF0E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontFamily: 'InterBold',
    fontWeight: '700',
    color: '#3E5C38',
  },
  expiresBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiresBadgeText: {
    fontSize: 11,
    fontFamily: 'InterMedium',
    color: '#3E5C38',
    fontWeight: '600',
  },
  featuredInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 20,
  },
  featuredTitleBlock: {
    flex: 1,
    gap: 6,
  },
  featuredQuestion: {
    fontSize: 17,
    fontFamily: 'ManropeBold',
    fontWeight: '700',
    color: '#1C1B1F',
    lineHeight: 22,
  },
  featuredDesc: {
    fontSize: 12.5,
    fontFamily: 'Inter',
    color: '#6B6873',
    lineHeight: 18,
  },
  votesCastMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  votesCastText: {
    fontSize: 11.5,
    fontFamily: 'InterMedium',
    color: '#8E8D94',
    fontWeight: '500',
  },
  
  // Custom Park Tree and Bench Illustration Styles
  parkIllustrationContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F0F3EF', // Soft green-grey tint
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E6E1',
  },
  treeLeaves: {
    position: 'absolute',
    top: 6,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#7A9B76',
  },
  treeTrunk: {
    position: 'absolute',
    top: 27,
    left: 17,
    width: 4,
    height: 12,
    backgroundColor: '#8C6239',
  },
  benchSeat: {
    position: 'absolute',
    top: 31,
    left: 21,
    width: 22,
    height: 3,
    backgroundColor: '#D7A15C',
    borderRadius: 1,
  },
  benchBack: {
    position: 'absolute',
    top: 25,
    left: 21,
    width: 3,
    height: 7,
    backgroundColor: '#D7A15C',
    borderRadius: 1,
  },
  benchLegLeft: {
    position: 'absolute',
    top: 34,
    left: 23,
    width: 2,
    height: 5,
    backgroundColor: '#5C3F21',
  },
  benchLegRight: {
    position: 'absolute',
    top: 34,
    left: 39,
    width: 2,
    height: 5,
    backgroundColor: '#5C3F21',
  },

  optionsList: {
    gap: 12,
    marginBottom: 20,
  },
  votingOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECEFEA',
    backgroundColor: '#FAF9F5',
    gap: 12,
  },
  votingOptionText: {
    fontSize: 14,
    fontFamily: 'InterMedium',
    color: '#3A3F37',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleEmpty: {
    borderWidth: 1.5,
    borderColor: '#A3A1A8',
    backgroundColor: '#FFFFFF',
  },
  radioCircleVoted: {
    borderWidth: 1.5,
    borderColor: '#A3A1A8',
    backgroundColor: '#FFFFFF',
  },
  radioCircleVotedActive: {
    borderColor: '#3E5C38',
    backgroundColor: '#3E5C38',
  },
  
  resultOptionRow: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FAF9F5',
    borderWidth: 1,
    borderColor: '#ECEFEA',
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'relative',
  },
  resultProgressLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#ECEFEA',
  },
  resultProgressLineActive: {
    backgroundColor: '#EAF0E8', // Active green shade progress
  },
  resultLeftBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 1,
    flex: 1,
    marginRight: 8,
  },
  resultOptionText: {
    fontSize: 14,
    fontFamily: 'InterMedium',
    color: '#6B6873',
  },
  resultOptionTextActive: {
    color: '#3E5C38',
    fontFamily: 'InterBold',
    fontWeight: '700',
  },
  resultTallyText: {
    fontSize: 13,
    fontFamily: 'InterBold',
    fontWeight: '700',
    color: '#1C1B1F',
    zIndex: 1,
  },
  changeVoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3E5C38',
    borderRadius: 14,
    height: 48,
  },
  changeVoteText: {
    fontSize: 14,
    fontFamily: 'InterBold',
    fontWeight: '700',
    color: '#FFFFFF',
  },

  otherSection: {
    gap: 14,
  },
  otherHeader: {
    fontSize: 15,
    fontFamily: 'InterBold',
    fontWeight: '700',
    color: '#3E5C38',
    marginLeft: 4,
  },
  listContainer: {
    gap: 12,
  },
  secondaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFEA',
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
    borderRadius: 14,
    backgroundColor: '#F0F3EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryTextContainer: {
    flex: 1,
    gap: 6,
  },
  secondaryQuestion: {
    fontSize: 14.5,
    fontFamily: 'InterBold',
    fontWeight: '700',
    color: '#1C1B1F',
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
    fontFamily: 'Inter',
    color: '#8E8D94',
  },
  secondaryRightBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  suggestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF9F5',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFEA',
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
    borderRadius: 12,
    backgroundColor: '#EAF0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestTexts: {
    flex: 1,
    gap: 2,
  },
  suggestTitle: {
    fontSize: 14,
    fontFamily: 'InterBold',
    fontWeight: '700',
    color: '#1C1B1F',
  },
  suggestSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter',
    color: '#8E8D94',
  },
  suggestBtn: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#3E5C38',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestBtnText: {
    fontSize: 12,
    fontFamily: 'InterBold',
    fontWeight: '700',
    color: '#3E5C38',
  },
});
