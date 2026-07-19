import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, Platform, Modal, Alert, KeyboardAvoidingView, RefreshControl } from 'react-native';
import { Screen, Text, CardSkeleton } from '@repo/ui';
import { useRouter } from 'expo-router';
import { ArrowLeft, Megaphone, Plus, X, AlertTriangle, Trash2 } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/axios';
import { CreateNoticeForm, CreatePollForm } from '@/components/CreateBulletinForm';
import { ScreenBackground, AppEmptyState } from '@/components/common';
import { uiStyles, type } from '@/theme';

interface NoticeRecord {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  isUrgent: boolean;
  createdAt: string;
}

interface PollRecord {
  id: string;
  question: string;
  options: string[];
  expiresAt: string;
  createdAt: string;
  votes: Record<string, number>;
  totalVotes: number;
}

export default function NoticesPollsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'notices' | 'polls'>('notices');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data lists
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [polls, setPolls] = useState<PollRecord[]>([]);

  // Modal toggle
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTab, setModalTab] = useState<'notice' | 'poll'>('notice');

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
  };

  const loadData = useCallback(async () => {
    try {
      if (activeTab === 'notices') {
        const response = await api.get('/api/notices');
        if (response.data && response.data.notices) {
          setNotices(response.data.notices);
        }
      } else {
        const response = await api.get('/api/polls');
        if (response.data && response.data.polls) {
          const normalizedPolls = response.data.polls.map((p: any) => {
            const votesMap: Record<string, number> = {};
            if (p.votes) {
              Object.assign(votesMap, p.votes);
            } else if (Array.isArray(p.results)) {
              p.results.forEach((r: any) => {
                votesMap[r.option] = r.votes || 0;
              });
            }
            return {
              ...p,
              votes: votesMap,
              totalVotes: typeof p.totalVotes === 'number' ? p.totalVotes : 0,
            };
          });
          setPolls(normalizedPolls);
        }
      }
    } catch (err: any) {
      console.warn(`Failed to fetch bulletins data for ${activeTab}:`, err.message || err);
      // Fallback mocks
      if (activeTab === 'notices') {
        setNotices([
          {
            id: '1',
            title: 'Power Shutdown Scheduled',
            description: 'Weekly substation maintenance scheduled for Sunday.',
            content: 'The electrical substation will undergo inspection on Sunday from 10 AM to 2 PM. Elevator backups will operate, but high-load appliances will not run.',
            category: 'Maintenance',
            isUrgent: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            title: 'Annual General Meeting (AGM)',
            description: 'Important community guidelines and budget reviews.',
            content: 'Residents are requested to attend the Annual General Meeting in the clubhouse on July 25th at 6 PM. Agenda includes security audits, maintenance review, and SaaS billing platform setup.',
            category: 'Society',
            isUrgent: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          }
        ]);
      } else {
        setPolls([
          {
            id: '1',
            question: 'Should we upgrade the Clubhouse Gym equipment?',
            options: ['Yes, fully support', 'Only repair existing', 'No, not needed'],
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
            createdAt: new Date().toISOString(),
            votes: { 'Yes, fully support': 12, 'Only repair existing': 4, 'No, not needed': 2 },
            totalVotes: 18,
          },
          {
            id: '2',
            question: 'Change visitor gate restriction timings to 10 PM?',
            options: ['Restrict at 10 PM', 'Keep at 11 PM', 'No restrictions'],
            expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
            votes: { 'Restrict at 10 PM': 6, 'Keep at 11 PM': 14, 'No restrictions': 1 },
            totalVotes: 21,
          }
        ]);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setIsLoading(true);
    loadData();
  }, [loadData, activeTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleTabChange = (tab: 'notices' | 'polls') => {
    triggerHaptic();
    setActiveTab(tab);
  };

  const handleOpenModal = () => {
    triggerHaptic();
    setModalTab(activeTab === 'notices' ? 'notice' : 'poll');
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    triggerHaptic();
    setModalVisible(false);
  };

  const handleDeleteItem = (id: string, typeName: 'notice' | 'poll', titleOrQuestion: string) => {
    triggerHaptic();
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to permanently delete this ${typeName === 'notice' ? 'notice' : 'poll'}? \n\n"${titleOrQuestion}"`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            triggerHaptic();
            try {
              const url = typeName === 'notice' ? `/api/notices/${id}` : `/api/polls/${id}`;
              const response = await api.delete(url);
              if (response.status === 200) {
                Alert.alert("Deleted", `${typeName === 'notice' ? 'Notice' : 'Poll'} removed successfully.`);
                loadData();
              }
            } catch (err: any) {
              Alert.alert("Error", err.response?.data?.error || err.message || "Failed to delete item");
            }
          }
        }
      ]
    );
  };

  const handleBack = () => {
    triggerHaptic();
    router.back();
  };

  // Render Notice item card
  const renderNoticeItem = ({ item, index }: { item: NoticeRecord; index: number }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <Animated.View entering={FadeInDown.duration(350).delay(index * 40)} style={styles.noticeCard}>
        <View style={styles.noticeHeader}>
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
            {item.isUrgent && (
              <View style={styles.urgentBadge}>
                <AlertTriangle size={10} color="#C1584B" style={{ marginRight: 3 }} />
                <Text style={styles.urgentBadgeText}>URGENT</Text>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.noticeDate}>{formattedDate}</Text>
            <Pressable 
              style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
              onPress={() => handleDeleteItem(item.id, 'notice', item.title)}
            >
              <Trash2 size={14} color="#8E8D94" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.noticeTitle}>{item.title}</Text>
        <Text style={styles.noticeDesc}>{item.description}</Text>
        <Text style={styles.noticeContent}>{item.content}</Text>
      </Animated.View>
    );
  };

  // Render Poll item card
  const renderPollItem = ({ item, index }: { item: PollRecord; index: number }) => {
    const isExpired = new Date(item.expiresAt) < new Date();
    
    // Safely retrieve votes map
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
      <Animated.View entering={FadeInDown.duration(350).delay(index * 40)} style={styles.noticeCard}>
        <View style={styles.noticeHeader}>
          <View style={styles.badgeRow}>
            <View style={[styles.categoryBadge, { backgroundColor: 'rgba(74, 85, 104, 0.08)' }]}>
              <Text style={styles.categoryBadgeText}>Poll Bulletin</Text>
            </View>
            <View style={[
              styles.urgentBadge, 
              isExpired ? styles.expiredBadge : styles.activeBadge
            ]}>
              <Text style={[
                styles.urgentBadgeText,
                isExpired ? styles.expiredBadgeText : styles.activeBadgeText
              ]}>
                {isExpired ? 'EXPIRED' : 'ACTIVE'}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <Text style={styles.noticeDate}>{totalVotesCount} votes</Text>
            <Pressable 
              style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
              onPress={() => handleDeleteItem(item.id, 'poll', item.question)}
            >
              <Trash2 size={14} color="#8E8D94" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.pollQuestion}>{item.question}</Text>

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
                  <Text style={styles.optPercentText}>{pct}% ({vCount})</Text>
                </View>
                <View style={styles.barBackground}>
                  <View style={[styles.barFill, { width: `${pct}%` }, isWinner && styles.barFillWinner]} />
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <View style={[uiStyles.scroll, { paddingTop: Platform.OS === 'ios' ? 50 : 20, flex: 1 }]}>
          {/* Header */}
          <View style={uiStyles.header}>
            <Pressable style={uiStyles.iconBtn} onPress={handleBack} hitSlop={12}>
              <ArrowLeft size={22} color="#11111E" strokeWidth={2.2} />
            </Pressable>
            <Text variant="h3" weight="bold" style={type.navTitle}>
              Bulletins & Cockpit
            </Text>
            <View style={{ width: 46 }} />
          </View>

          {/* Tab switch header */}
          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tabBtn, activeTab === 'notices' && styles.tabBtnActive]}
              onPress={() => handleTabChange('notices')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'notices' && styles.tabBtnTextActive]}>
                Notices
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabBtn, activeTab === 'polls' && styles.tabBtnActive]}
              onPress={() => handleTabChange('polls')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'polls' && styles.tabBtnTextActive]}>
                Polls
              </Text>
            </Pressable>
          </View>

          {/* Action row summary */}
          <View style={styles.summaryBar}>
            <View>
              <Text style={uiStyles.sectionLabel}>
                {activeTab === 'notices' ? 'Broadcast board' : 'Community Voting'}
              </Text>
              <Text style={styles.summaryCount}>
                {activeTab === 'notices' ? `${notices.length} Active` : `${polls.length} Live`}
              </Text>
            </View>
            <Pressable style={styles.addBtn} onPress={handleOpenModal}>
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
              <Text style={styles.addBtnText}>
                {activeTab === 'notices' ? 'New Notice' : 'New Poll'}
              </Text>
            </Pressable>
          </View>

          {/* Bulletins lists */}
          {isLoading ? (
            <View style={{ paddingTop: 4 }}>
              <CardSkeleton count={2} />
            </View>
          ) : (
            <FlatList
              data={activeTab === 'notices' ? (notices as any[]) : (polls as any[])}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => 
                activeTab === 'notices' 
                  ? renderNoticeItem({ item: item as NoticeRecord, index })
                  : renderPollItem({ item: item as PollRecord, index })
              }
              contentContainerStyle={{ paddingBottom: 120 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
              }
              ListEmptyComponent={
                <AppEmptyState
                  icon={activeTab === 'notices' ? Megaphone : AlertTriangle}
                  title={activeTab === 'notices' ? "No Notices Published" : "No Polls Published"}
                  description={activeTab === 'notices' 
                    ? "Broadcast announcements, emergency updates, or society news to residents here." 
                    : "Create feedback questions or simple vote forms to gauge resident opinions."}
                  actionLabel={activeTab === 'notices' ? "Publish Notice" : "Create Poll"}
                  onAction={() => { triggerHaptic(); setModalVisible(true); }}
                />
              }
            />
          )}
        </View>

        {/* Add Modal Form */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContent}
            >
              {/* Modal Switch Header */}
              <View style={styles.modalHeaderRow}>
                <View style={styles.modalSwitchContainer}>
                  <Pressable
                    style={[styles.modalSwitchBtn, modalTab === 'notice' && styles.modalSwitchBtnActive]}
                    onPress={() => { triggerHaptic(); setModalTab('notice'); }}
                  >
                    <Text style={[styles.modalSwitchText, modalTab === 'notice' && styles.modalSwitchTextActive]}>
                      Post Notice
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalSwitchBtn, modalTab === 'poll' && styles.modalSwitchBtnActive]}
                    onPress={() => { triggerHaptic(); setModalTab('poll'); }}
                  >
                    <Text style={[styles.modalSwitchText, modalTab === 'poll' && styles.modalSwitchTextActive]}>
                      Create Poll
                    </Text>
                  </Pressable>
                </View>
                <Pressable style={styles.closeBtn} onPress={handleCloseModal}>
                  <X size={18} color="#4A5568" />
                </Pressable>
              </View>

              {modalTab === 'notice' ? (
                <CreateNoticeForm
                  onSuccess={() => {
                    Alert.alert("Success", "Notice posted successfully!");
                    setModalVisible(false);
                    loadData();
                  }}
                  onClose={handleCloseModal}
                />
              ) : (
                <CreatePollForm
                  onSuccess={() => {
                    Alert.alert("Success", "Poll published successfully!");
                    setModalVisible(false);
                    loadData();
                  }}
                  onClose={handleCloseModal}
                />
              )}
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  tabBtn: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.035)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  tabBtnActive: {
    backgroundColor: '#4A5568',
    borderColor: '#4A5568',
  },
  tabBtnText: {
    fontSize: 13,
    fontFamily: 'InterMedium',
    color: '#6B6873',
  },
  tabBtnTextActive: {
    fontFamily: 'InterBold',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryCount: {
    fontSize: 18,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#4A5568',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#4A5568',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  addBtnText: {
    fontSize: 12,
    fontFamily: 'InterBold',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  noticeCard: {
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
  noticeHeader: {
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
    backgroundColor: 'rgba(74, 85, 104, 0.06)',
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontFamily: 'InterSemiBold',
    color: '#4A5568',
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(193, 88, 75, 0.12)',
  },
  urgentBadgeText: {
    fontSize: 10,
    fontFamily: 'InterBold',
    color: '#C1584B',
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
  noticeDate: {
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
  noticeTitle: {
    fontSize: 16,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginBottom: 4,
  },
  noticeDesc: {
    fontSize: 13,
    fontFamily: 'InterMedium',
    color: '#5E5D6A',
    lineHeight: 18,
    marginBottom: 8,
  },
  noticeContent: {
    fontSize: 12.5,
    fontFamily: 'Inter',
    color: '#8E8D94',
    lineHeight: 17,
    backgroundColor: 'rgba(0,0,0,0.015)',
    borderRadius: 12,
    padding: 10,
  },
  pollQuestion: {
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
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#8E8D94',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    maxHeight: '90%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 10,
    padding: 2,
    width: 220,
  },
  modalSwitchBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  modalSwitchBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  modalSwitchText: {
    fontSize: 12,
    fontFamily: 'InterMedium',
    color: '#8E8D94',
  },
  modalSwitchTextActive: {
    fontFamily: 'InterBold',
    color: '#1C1B1F',
    fontWeight: 'bold',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
