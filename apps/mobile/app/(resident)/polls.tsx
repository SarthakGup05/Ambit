import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Platform, Alert, RefreshControl } from 'react-native';
import { Screen, Text, ListSkeleton } from '@repo/ui';
import { ScreenBackground, AppSectionCard } from '@/components/common';
import { uiStyles, type } from '@/theme';
import { useRouter } from 'expo-router';
import { ArrowLeft, BarChart3, Clock, Check } from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/axios';

interface PollOptionTally {
  option: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: string[];
  expiresAt: string;
  userVotedOption: string | null;
  results: PollOptionTally[];
  totalVotes: number;
}

const FALLBACK_POLLS: Poll[] = [
  {
    id: 'p1',
    question: 'Should we implement security EV patrol vehicles in the basement?',
    options: ['Yes, immediately', 'No, keep guards on foot', 'Neutral / Unsure'],
    expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    userVotedOption: null,
    totalVotes: 35,
    results: [
      { option: 'Yes, immediately', votes: 24 },
      { option: 'No, keep guards on foot', votes: 8 },
      { option: 'Neutral / Unsure', votes: 3 },
    ],
  },
];

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

export default function PollsScreen() {
  const router = useRouter();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const response = await api.get('/api/polls');
      if (response.data && response.data.polls && response.data.polls.length > 0) {
        setPolls(response.data.polls);
      } else {
        setPolls(FALLBACK_POLLS);
      }
    } catch (err: any) {
      console.warn('Failed to load polls from API:', err.message || err);
      setPolls(FALLBACK_POLLS);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleVote = async (pollId: string, chosenOption: string) => {
    triggerHaptic();
    try {
      await api.post(`/api/polls/${pollId}/vote`, { option: chosenOption });
      setPolls((prevPolls) =>
        prevPolls.map((p) => {
          if (p.id === pollId) {
            const updatedResults = p.results.map((res) => {
              if (res.option === chosenOption) {
                return { ...res, votes: res.votes + 1 };
              }
              return res;
            });
            return {
              ...p,
              userVotedOption: chosenOption,
              results: updatedResults,
              totalVotes: p.totalVotes + 1,
            };
          }
          return p;
        })
      );
      Alert.alert('Vote Registered', 'Your vote has been cast successfully.');
    } catch (err: any) {
      Alert.alert('Voting Failed', err.response?.data?.error || 'Could not register your vote.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <View style={[uiStyles.scroll, { paddingTop: Platform.OS === 'ios' ? 50 : 20, flex: 1 }]}>
          {/* Header */}
          <View style={uiStyles.header}>
            <Pressable
              style={uiStyles.iconBtn}
              onPress={() => {
                triggerHaptic();
                router.back();
              }}
              hitSlop={12}
            >
              <ArrowLeft size={22} color="#11111E" strokeWidth={2.2} />
            </Pressable>
            <Text variant="h3" weight="bold" style={type.navTitle}>
              Society Polls
            </Text>
            <View style={{ width: 46 }} />
          </View>

          {isLoading ? (
            <ListSkeleton count={2} />
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
              }
            >
              {polls.map((poll) => {
                const hasVoted = poll.userVotedOption !== null;
                const isExpired = new Date(poll.expiresAt) < new Date();
                const expDateStr = new Date(poll.expiresAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <Animated.View key={poll.id} entering={FadeInUp.duration(400)} style={{ marginBottom: 18 }}>
                    <AppSectionCard
                      label={isExpired ? 'CLOSED' : `ACTIVE · EXPIRING ${expDateStr.toUpperCase()}`}
                    >
                      <View style={styles.pollCard}>
                        {/* Question Text */}
                        <Text style={styles.questionText}>{poll.question}</Text>

                        {/* Options Stack */}
                        <View style={styles.optionsContainer}>
                          {poll.options.map((option) => {
                            const isVotedChoice = poll.userVotedOption === option;
                            const optionData = poll.results.find((r) => r.option === option);
                            const votes = optionData?.votes || 0;
                            const percent =
                              poll.totalVotes > 0 ? Math.round((votes / poll.totalVotes) * 100) : 0;

                            if (hasVoted || isExpired) {
                              return (
                                <View key={option} style={styles.resultRow}>
                                  {/* Progress fill */}
                                  <View
                                    style={[
                                      styles.resultProgress,
                                      { width: `${percent}%` },
                                      isVotedChoice && styles.resultProgressActive,
                                    ]}
                                  />
                                  <View style={styles.resultTextWrapper}>
                                    <View style={styles.optionLabelRow}>
                                      {isVotedChoice && (
                                        <Check size={13} color="#2E7D32" strokeWidth={3} style={{ marginRight: 6 }} />
                                      )}
                                      <Text
                                        style={[
                                          styles.optionText,
                                          isVotedChoice && styles.optionTextActive,
                                        ]}
                                      >
                                        {option}
                                      </Text>
                                    </View>
                                    <Text style={styles.percentText}>{percent}%</Text>
                                  </View>
                                </View>
                              );
                            }

                            return (
                              <Pressable
                                key={option}
                                onPress={() => handleVote(poll.id, option)}
                                style={({ pressed }) => [
                                  styles.optionBtn,
                                  pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
                                ]}
                              >
                                <Text style={styles.optionBtnText}>{option}</Text>
                              </Pressable>
                            );
                          })}
                        </View>

                        {/* Footer stats metadata */}
                        <View style={styles.footerRow}>
                          <View style={styles.metaItem}>
                            <BarChart3 size={13} color="#8E8D94" />
                            <Text style={styles.totalVotesText}>
                              {poll.totalVotes} votes cast
                            </Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Clock size={13} color="#8E8D94" />
                            <Text style={styles.totalVotesText}>
                              Ends {expDateStr}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </AppSectionCard>
                  </Animated.View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  pollCard: {
    paddingVertical: 4,
  },
  questionText: {
    fontSize: 16,
    fontFamily: 'ManropeBold',
    color: '#1C1B1F',
    fontWeight: 'bold',
    marginBottom: 18,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  optionBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  optionBtnText: {
    fontSize: 14,
    fontFamily: 'InterMedium',
    color: '#334155',
  },
  resultRow: {
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    overflow: 'hidden',
    justifyContent: 'center',
    position: 'relative',
  },
  resultProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.045)',
  },
  resultProgressActive: {
    backgroundColor: 'rgba(46, 125, 50, 0.12)',
  },
  resultTextWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 1,
  },
  optionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  optionText: {
    fontSize: 13.5,
    fontFamily: 'InterMedium',
    color: '#475569',
  },
  optionTextActive: {
    color: '#2E7D32',
    fontFamily: 'InterBold',
  },
  percentText: {
    fontSize: 13.5,
    fontFamily: 'InterBold',
    color: '#1E293B',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  totalVotesText: {
    fontSize: 11,
    fontFamily: 'Inter',
    color: '#8E8D94',
  },
});
