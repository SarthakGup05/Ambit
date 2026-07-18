import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  Pressable,
  Platform,
  Modal,
  Alert,
  KeyboardAvoidingView,
  RefreshControl,
} from 'react-native';
import { Screen, Text, ListSkeleton } from '@repo/ui';
import { ScreenBackground, AppSectionCard, AppListItem } from '@/components/common';
import { uiStyles, type } from '@/theme';
import { OnboardGuardForm } from '@/components/OnboardGuardForm';
import { useRouter } from 'expo-router';
import { ArrowLeft, UserPlus, Shield, X } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/axios';

interface GuardMember {
  id: string;
  name: string;
  email: string;
  flatNumber?: string | null;
  createdAt: string;
}

function triggerHaptic() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* ignore */ }
}

export default function StaffDirectoryScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [guards, setGuards] = useState<GuardMember[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const loadGuards = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/guards');
      if (response.data?.guards) setGuards(response.data.guards);
    } catch {
      setGuards([
        { id: '1', name: 'Ambit Guard', email: 'guard@ambit.com', createdAt: new Date(Date.now() - 864000000).toISOString() },
        { id: '2', name: 'Bahadur Singh', email: 'bahadur@ambit.com', createdAt: new Date(Date.now() - 345600000).toISOString() },
      ]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadGuards(); }, [loadGuards]);

  const onRefresh = useCallback(() => { setRefreshing(true); loadGuards(); }, [loadGuards]);

  const renderGuardItem = ({ item, index }: { item: GuardMember; index: number }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    const gateLabel = item.flatNumber
      ? item.flatNumber.toLowerCase().startsWith('gate') ? item.flatNumber : `Gate ${item.flatNumber}`
      : 'Gate 1';

    return (
      <Animated.View entering={FadeInUp.duration(300).delay(index * 40)}>
        <AppListItem
          Icon={Shield}
          title={item.name}
          subtitle={`${item.email} · Registered ${formattedDate}`}
          rightElement={
            <View style={uiStyles.gateBadge}>
              <Text style={uiStyles.gateBadgeText}>{gateLabel}</Text>
            </View>
          }
          hideChevron={true}
          isLast={index === guards.length - 1}
        />
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <View style={[uiStyles.scroll, { paddingTop: Platform.OS === 'ios' ? 50 : 20, flex: 1 }]}>

          {/* Header */}
          <View style={uiStyles.header}>
            <Pressable style={uiStyles.iconBtn} onPress={() => { triggerHaptic(); router.back(); }} hitSlop={12}>
              <ArrowLeft size={22} color="#11111E" strokeWidth={2.2} />
            </Pressable>
            <Text variant="h3" weight="bold" style={type.navTitle}>Guards & Gates</Text>
            <View style={{ width: 46 }} />
          </View>

          {/* Summary Bar */}
          <View style={uiStyles.summaryBar}>
            <View>
              <Text style={uiStyles.sectionLabel}>Gate Security Roster</Text>
              <Text style={uiStyles.summaryCount}>{guards.length} Active Officers</Text>
            </View>
            <Pressable
              style={[uiStyles.addBtn, { backgroundColor: '#4A5568', shadowColor: '#4A5568' }]}
              onPress={() => { triggerHaptic(); setModalVisible(true); }}
            >
              <UserPlus size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
              <Text style={uiStyles.addBtnText}>Add Guard</Text>
            </Pressable>
          </View>

          {/* Guard Roster */}
          {isLoading ? (
            <View style={{ paddingTop: 8 }}>
              <ListSkeleton count={3} />
            </View>
          ) : (
            <AppSectionCard label="Security Directory">
              <FlatList
                data={guards}
                keyExtractor={(item) => item.id}
                renderItem={renderGuardItem}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />}
                ListEmptyComponent={
                  <View style={uiStyles.emptyState}>
                    <Shield size={40} color="#A3A1A8" strokeWidth={1.5} />
                    <Text style={uiStyles.emptyText}>No guards onboarded yet</Text>
                  </View>
                }
              />
            </AppSectionCard>
          )}
        </View>

        {/* Add Guard Modal */}
        <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => { triggerHaptic(); setModalVisible(false); }}>
          <View style={uiStyles.modalOverlay}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={uiStyles.modalContent}>
              <View style={uiStyles.modalHeader}>
                <Text style={uiStyles.modalTitle}>Onboard Security Guard</Text>
                <Pressable style={uiStyles.closeBtn} onPress={() => { triggerHaptic(); setModalVisible(false); }}>
                  <X size={18} color="#4A5568" />
                </Pressable>
              </View>
              <OnboardGuardForm
                onSuccess={() => {
                  Alert.alert('Success', 'Guard created successfully!');
                  setModalVisible(false);
                  loadGuards();
                }}
                onClose={() => { triggerHaptic(); setModalVisible(false); }}
              />
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </Screen>
    </View>
  );
}
