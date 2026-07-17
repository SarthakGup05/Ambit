import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, Platform, Modal, Alert, KeyboardAvoidingView, RefreshControl } from 'react-native';
import { Screen, Text, ListSkeleton } from '@repo/ui';
import { ScreenBackground } from '@/components/common';
import { OnboardGuardForm } from '@/components/OnboardGuardForm';
import { useRouter } from 'expo-router';
import { ArrowLeft, UserPlus, Shield, X, User } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/axios';

interface GuardMember {
  id: string;
  name: string;
  email: string;
  flatNumber?: string | null;
  createdAt: string;
}

export default function StaffDirectoryScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [guards, setGuards] = useState<GuardMember[]>([]);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // ignore
    }
  };

  const loadGuards = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/guards');
      if (response.data && response.data.guards) {
        setGuards(response.data.guards);
      }
    } catch (err: any) {
      console.warn("Failed to fetch guards:", err.message || err);
      // Fallback mock data
      setGuards([
        {
          id: '1',
          name: 'Ambit Guard',
          email: 'guard@ambit.com',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        },
        {
          id: '2',
          name: 'Bahadur Singh',
          email: 'bahadur@ambit.com',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
        }
      ]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadGuards();
  }, [loadGuards]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGuards();
  }, [loadGuards]);

  const handleOpenAddGuard = () => {
    triggerHaptic();
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    triggerHaptic();
    setModalVisible(false);
  };

  const handleBack = () => {
    triggerHaptic();
    router.back();
  };

  const renderGuardItem = ({ item, index }: { item: GuardMember; index: number }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <Animated.View entering={FadeInDown.duration(350).delay(index * 40)} style={styles.guardCard}>
        <View style={styles.avatarCircle}>
          <Shield size={20} color="#4A5568" strokeWidth={2} />
        </View>
        <View style={styles.guardInfo}>
          <Text style={styles.guardName}>{item.name}</Text>
          <Text style={styles.guardEmail}>{item.email}</Text>
          <Text style={styles.guardDate}>Registered {formattedDate}</Text>
        </View>
        <View style={styles.gateBadge}>
          <Text style={styles.gateBadgeText}>
            {item.flatNumber ? (item.flatNumber.toLowerCase().startsWith('gate') ? item.flatNumber : `Gate ${item.flatNumber}`) : 'Gate 1'}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        {/* Header */}
        <View style={styles.navHeader}>
          <Pressable style={styles.backBtn} onPress={handleBack}>
            <ArrowLeft size={18} color="#4A5568" />
          </Pressable>
          <Text style={styles.navTitle}>Guards & Gates</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Top summary + Add Guard Row */}
        <View style={styles.summaryBar}>
          <View>
            <Text style={styles.summaryLabel}>Gate Security Roster</Text>
            <Text style={styles.summaryCount}>{guards.length} Active Officers</Text>
          </View>
          <Pressable style={styles.addBtn} onPress={handleOpenAddGuard}>
            <UserPlus size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
            <Text style={styles.addBtnText}>Add Guard</Text>
          </Pressable>
        </View>

        {/* Guard List */}
        {isLoading ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 4 }}>
            <ListSkeleton count={3} />
          </View>
        ) : (
          <FlatList
            data={guards}
            keyExtractor={(item) => item.id}
            renderItem={renderGuardItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Shield size={40} color="#A3A1A8" strokeWidth={1.5} />
                <Text style={styles.emptyText}>No guards onboarded yet</Text>
              </View>
            }
          />
        )}

        {/* Add Guard Modal Form */}
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
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Onboard Security Guard</Text>
                <Pressable style={styles.closeBtn} onPress={handleCloseModal}>
                  <X size={18} color="#4A5568" />
                </Pressable>
              </View>

              <OnboardGuardForm
                onSuccess={() => {
                  Alert.alert("Success", "Guard created successfully!");
                  setModalVisible(false);
                  loadGuards();
                }}
                onClose={handleCloseModal}
              />
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.045)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16.5,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#1C1B1F',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: 'InterBold',
    color: '#8E8D94',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
    paddingVertical: 8,
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 100,
  },
  guardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(74, 85, 104, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  guardInfo: {
    flex: 1,
    paddingRight: 6,
  },
  guardName: {
    fontSize: 15,
    fontFamily: 'InterBold',
    color: '#1C1B1F',
  },
  guardEmail: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#8E8D94',
    marginTop: 2,
  },
  guardDate: {
    fontSize: 10.5,
    fontFamily: 'Inter',
    color: '#A3A1A8',
    marginTop: 4,
  },
  gateBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(74, 85, 104, 0.06)',
  },
  gateBadgeText: {
    fontSize: 11,
    fontFamily: 'InterSemiBold',
    color: '#4A5568',
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: 'ManropeBold',
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
  modalForm: {
    gap: 14,
  },
  inputWrap: {
    marginBottom: 4,
  },
  errorBox: {
    backgroundColor: 'rgba(193, 88, 75, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(193, 88, 75, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  errorText: {
    color: '#C1584B',
    fontSize: 13,
    fontFamily: 'InterMedium',
    textAlign: 'center',
  },
});
