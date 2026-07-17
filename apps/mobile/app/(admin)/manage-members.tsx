import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TextInput, Pressable, Platform, ActivityIndicator, RefreshControl, Modal, Alert, KeyboardAvoidingView } from 'react-native';
import { Screen, Text, ListSkeleton } from '@repo/ui';
import { ScreenBackground } from '@/components/common';
import { CreateEditMemberForm } from '@/components/CreateEditMemberForm';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, X, User, UserPlus, Trash2 } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/axios';

interface ResidentMember {
  id: string;
  name: string;
  email: string;
  flatNumber: string | null;
  createdAt: string;
}

export default function ManageMembersScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<ResidentMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<ResidentMember[]>([]);
  
  // Modal & Edit State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<ResidentMember | null>(null);

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // ignore
    }
  };

  const loadMembers = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/members');
      if (response.data && response.data.members) {
        setMembers(response.data.members);
        setFilteredMembers(response.data.members);
      }
    } catch (err: any) {
      console.warn("Failed to fetch residents directory:", err.message || err);
      // Fallback mock data
      const mockList = [
        {
          id: '1',
          name: 'Ambit Resident',
          email: 'resident@ambit.com',
          flatNumber: '101-A',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        },
        {
          id: '2',
          name: 'Rohit Verma',
          email: 'rohit@ambit.com',
          flatNumber: 'B-305',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        },
        {
          id: '3',
          name: 'Priyanka Sen',
          email: 'priyanka@ambit.com',
          flatNumber: 'C-702',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        }
      ];
      setMembers(mockList);
      setFilteredMembers(mockList);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMembers();
  }, [loadMembers]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredMembers(members);
      return;
    }
    const filtered = members.filter(
      (m) =>
        m.name.toLowerCase().includes(text.toLowerCase()) ||
        (m.flatNumber && m.flatNumber.toLowerCase().includes(text.toLowerCase()))
    );
    setFilteredMembers(filtered);
  };

  const handleClearSearch = () => {
    triggerHaptic();
    setSearchQuery('');
    setFilteredMembers(members);
  };

  const handleOpenAddMember = () => {
    triggerHaptic();
    setEditingMember(null);
    setModalVisible(true);
  };

  const handleEditMember = (member: ResidentMember) => {
    triggerHaptic();
    setEditingMember(member);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    triggerHaptic();
    setModalVisible(false);
    setEditingMember(null);
  };

  const handleDeleteMember = async (memberId: string) => {
    Alert.alert(
      "Remove Resident",
      "Are you sure you want to delete this resident's account? This action is permanent and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            try {
              triggerHaptic();
              const res = await api.delete(`/api/admin/members/${memberId}`);
              if (res.status === 200) {
                Alert.alert("Success", "Resident removed from society directory!");
                setModalVisible(false);
                setEditingMember(null);
                loadMembers();
              }
            } catch (err: any) {
              Alert.alert("Error", err.response?.data?.error || err.message || "Failed to remove resident");
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

  const renderMemberItem = ({ item, index }: { item: ResidentMember; index: number }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <Pressable onPress={() => handleEditMember(item)}>
        <Animated.View entering={FadeInDown.duration(350).delay(index * 40)} style={styles.memberCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{item.name}</Text>
            <Text style={styles.memberEmail}>{item.email}</Text>
            <Text style={styles.memberDate}>Joined {formattedDate}</Text>
          </View>
          <View style={styles.flatBadge}>
            <Text style={styles.flatText}>{item.flatNumber || 'No Flat'}</Text>
          </View>
        </Animated.View>
      </Pressable>
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
          <Text style={styles.navTitle}>Resident Directory</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Top summary + Add Resident Row */}
        <View style={styles.summaryBar}>
          <View>
            <Text style={styles.summaryLabel}>Society Association</Text>
            <Text style={styles.summaryCount}>{members.length} Members</Text>
          </View>
          <Pressable style={styles.addBtn} onPress={handleOpenAddMember}>
            <UserPlus size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
            <Text style={styles.addBtnText}>Add Resident</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInner}>
            <Search size={18} color="#A3A1A8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or flat number..."
              placeholderTextColor="#A3A1A8"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable style={styles.clearBtn} onPress={handleClearSearch}>
                <X size={14} color="#A3A1A8" />
              </Pressable>
            )}
          </View>
        </View>

        {/* List of members */}
        {isLoading ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
            <ListSkeleton count={4} />
          </View>
        ) : (
          <FlatList
            data={filteredMembers}
            keyExtractor={(item) => item.id}
            renderItem={renderMemberItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <User size={40} color="#A3A1A8" strokeWidth={1.5} />
                <Text style={styles.emptyText}>No residents found</Text>
              </View>
            }
          />
        )}

        {/* Add/Edit Resident Modal Form */}
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
                <Text style={styles.modalTitle}>
                  {editingMember ? 'Update Resident Details' : 'Register New Resident'}
                </Text>
                <View style={styles.modalHeaderActions}>
                  {editingMember && (
                    <Pressable 
                      style={styles.deleteHeaderBtn} 
                      onPress={() => handleDeleteMember(editingMember.id)}
                    >
                      <Trash2 size={16} color="#C1584B" />
                    </Pressable>
                  )}
                  <Pressable style={styles.closeBtn} onPress={handleCloseModal}>
                    <X size={18} color="#4A5568" />
                  </Pressable>
                </View>
              </View>

              <CreateEditMemberForm
                member={editingMember}
                onSuccess={() => {
                  Alert.alert("Success", editingMember ? "Resident details updated!" : "Resident registered successfully!");
                  setModalVisible(false);
                  setEditingMember(null);
                  loadMembers();
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#1C1B1F',
    height: '100%',
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  memberCard: {
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
  avatarText: {
    fontSize: 18,
    fontFamily: 'ManropeBold',
    color: '#4A5568',
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
    paddingRight: 6,
  },
  memberName: {
    fontSize: 15,
    fontFamily: 'InterBold',
    color: '#1C1B1F',
  },
  memberEmail: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#8E8D94',
    marginTop: 2,
  },
  memberDate: {
    fontSize: 10.5,
    fontFamily: 'Inter',
    color: '#A3A1A8',
    marginTop: 4,
  },
  flatBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.035)',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  flatText: {
    fontSize: 11.5,
    fontFamily: 'InterSemiBold',
    color: '#6B6873',
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
    backgroundColor: '#2E7D32',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#2E7D32',
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
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteHeaderBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(193, 88, 75, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
