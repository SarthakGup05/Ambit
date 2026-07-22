import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  Modal,
  Alert,
  KeyboardAvoidingView,
  RefreshControl,
} from 'react-native';
import { Screen, Text, CardSkeleton } from '@repo/ui';
import { useRouter } from 'expo-router';
import { ArrowLeft, Megaphone, Plus, X, AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/axios';
import { CreateNoticeForm, CreatePollForm } from '@/components/CreateBulletinForm';
import { ScreenBackground, AppEmptyState } from '@/components/common';
import { uiStyles, type } from '@/theme';
import { AdminNoticeCard, NoticeRecord } from '@/features/notices/components/AdminNoticeCard';
import { AdminPollCard, PollRecord } from '@/features/polls/components/AdminPollCard';

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

const FALLBACK_NOTICES: NoticeRecord[] = [
  {
    id: '1',
    title: 'Power Shutdown Scheduled',
    description: 'Weekly substation maintenance scheduled for Sunday.',
    content:
      'The electrical substation will undergo inspection on Sunday from 10 AM to 2 PM. Elevator backups will operate, but high-load appliances will not run.',
    category: 'Maintenance',
    isUrgent: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Annual General Meeting (AGM)',
    description: 'Important community guidelines and budget reviews.',
    content:
      'Residents are requested to attend the Annual General Meeting in the clubhouse on July 25th at 6 PM. Agenda includes security audits, maintenance review, and SaaS billing platform setup.',
    category: 'Society',
    isUrgent: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

const FALLBACK_POLLS: PollRecord[] = [
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
  },
];

export default function NoticesPollsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'notices' | 'polls'>('notices');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [polls, setPolls] = useState<PollRecord[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTab, setModalTab] = useState<'notice' | 'poll'>('notice');

  const loadData = useCallback(async () => {
    try {
      if (activeTab === 'notices') {
        const response = await api.get('/api/notices');
        if (response.data?.notices) setNotices(response.data.notices);
      } else {
        const response = await api.get('/api/polls');
        if (response.data?.polls) {
          const normalized = response.data.polls.map((p: any) => {
            const votesMap: Record<string, number> = {};
            if (p.votes) {
              Object.assign(votesMap, p.votes);
            } else if (Array.isArray(p.results)) {
              p.results.forEach((r: any) => { votesMap[r.option] = r.votes || 0; });
            }
            return { ...p, votes: votesMap, totalVotes: typeof p.totalVotes === 'number' ? p.totalVotes : 0 };
          });
          setPolls(normalized);
        }
      }
    } catch (err: any) {
      console.warn(`Failed to fetch bulletins data for ${activeTab}:`, err.message || err);
      if (activeTab === 'notices') setNotices(FALLBACK_NOTICES);
      else setPolls(FALLBACK_POLLS);
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

  const handleDeleteItem = (id: string, typeName: 'notice' | 'poll', titleOrQuestion: string) => {
    triggerHaptic();
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to permanently delete this ${typeName === 'notice' ? 'notice' : 'poll'}? \n\n"${titleOrQuestion}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            triggerHaptic();
            try {
              const url = typeName === 'notice' ? `/api/notices/${id}` : `/api/polls/${id}`;
              const response = await api.delete(url);
              if (response.status === 200) {
                Alert.alert('Deleted', `${typeName === 'notice' ? 'Notice' : 'Poll'} removed successfully.`);
                loadData();
              }
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.error || err.message || 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <View style={[uiStyles.scroll, { paddingTop: 12, flex: 1 }]}>
          {/* Header */}
          <View style={uiStyles.header}>
            <Pressable style={uiStyles.iconBtn} onPress={() => { triggerHaptic(); router.back(); }} hitSlop={12}>
              <ArrowLeft size={22} color="#11111E" strokeWidth={2.2} />
            </Pressable>
            <Text variant="h3" weight="bold" style={type.navTitle}>
              Bulletins & Cockpit
            </Text>
            <View style={{ width: 46 }} />
          </View>

          {/* Tab switch */}
          <View style={styles.tabContainer}>
            {(['notices', 'polls'] as const).map((tab) => (
              <Pressable
                key={tab}
                style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                onPress={() => { triggerHaptic(); setActiveTab(tab); }}
              >
                <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                  {tab === 'notices' ? 'Notices' : 'Polls'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Summary bar */}
          <View style={styles.summaryBar}>
            <View>
              <Text style={uiStyles.sectionLabel}>
                {activeTab === 'notices' ? 'Broadcast board' : 'Community Voting'}
              </Text>
              <Text style={styles.summaryCount}>
                {activeTab === 'notices' ? `${notices.length} Active` : `${polls.length} Live`}
              </Text>
            </View>
            <Pressable
              style={styles.addBtn}
              onPress={() => {
                triggerHaptic();
                setModalTab(activeTab === 'notices' ? 'notice' : 'poll');
                setModalVisible(true);
              }}
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
              <Text style={styles.addBtnText}>
                {activeTab === 'notices' ? 'New Notice' : 'New Poll'}
              </Text>
            </Pressable>
          </View>

          {/* List */}
          {isLoading ? (
            <View style={{ paddingTop: 4 }}>
              <CardSkeleton count={2} />
            </View>
          ) : (
            <FlatList
              data={activeTab === 'notices' ? (notices as any[]) : (polls as any[])}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) =>
                activeTab === 'notices' ? (
                  <AdminNoticeCard
                    item={item as NoticeRecord}
                    index={index}
                    onDelete={(id, title) => handleDeleteItem(id, 'notice', title)}
                  />
                ) : (
                  <AdminPollCard
                    item={item as PollRecord}
                    index={index}
                    onDelete={(id, question) => handleDeleteItem(id, 'poll', question)}
                  />
                )
              }
              contentContainerStyle={{ paddingBottom: 120 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
              }
              ListEmptyComponent={
                <AppEmptyState
                  icon={activeTab === 'notices' ? Megaphone : AlertTriangle}
                  title={activeTab === 'notices' ? 'No Notices Published' : 'No Polls Published'}
                  description={
                    activeTab === 'notices'
                      ? 'Broadcast announcements, emergency updates, or society news to residents here.'
                      : 'Create feedback questions or simple vote forms to gauge resident opinions.'
                  }
                  actionLabel={activeTab === 'notices' ? 'Publish Notice' : 'Create Poll'}
                  onAction={() => { triggerHaptic(); setModalVisible(true); }}
                />
              }
            />
          )}
        </View>

        {/* Create Modal */}
        <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => { triggerHaptic(); setModalVisible(false); }}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
              <View style={styles.modalHeaderRow}>
                <View style={styles.modalSwitchContainer}>
                  {(['notice', 'poll'] as const).map((t) => (
                    <Pressable
                      key={t}
                      style={[styles.modalSwitchBtn, modalTab === t && styles.modalSwitchBtnActive]}
                      onPress={() => { triggerHaptic(); setModalTab(t); }}
                    >
                      <Text style={[styles.modalSwitchText, modalTab === t && styles.modalSwitchTextActive]}>
                        {t === 'notice' ? 'Post Notice' : 'Create Poll'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable style={styles.closeBtn} onPress={() => { triggerHaptic(); setModalVisible(false); }}>
                  <X size={18} color="#4A5568" />
                </Pressable>
              </View>

              {modalTab === 'notice' ? (
                <CreateNoticeForm
                  onSuccess={() => { Alert.alert('Success', 'Notice posted successfully!'); setModalVisible(false); loadData(); }}
                  onClose={() => { triggerHaptic(); setModalVisible(false); }}
                />
              ) : (
                <CreatePollForm
                  onSuccess={() => { Alert.alert('Success', 'Poll published successfully!'); setModalVisible(false); loadData(); }}
                  onClose={() => { triggerHaptic(); setModalVisible(false); }}
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
