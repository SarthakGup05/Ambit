import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  TextInput,
  Pressable,
  Platform,
  RefreshControl,
  Modal,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { Screen, Text, ListSkeleton } from '@repo/ui';
import { ScreenBackground, AppSectionCard, AppListItem } from '@/components/common';
import { uiStyles, type } from '@/theme';
import { CreateEditMemberForm } from '@/components/CreateEditMemberForm';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, X, User, UserPlus, Trash2 } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/axios';

interface ResidentMember {
  id: string;
  name: string;
  email: string;
  flatNumber: string | null;
  createdAt: string;
}

function triggerHaptic() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* ignore */ }
}

export default function ManageMembersScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<ResidentMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<ResidentMember[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<ResidentMember | null>(null);

  const loadMembers = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/members');
      if (response.data?.members) {
        setMembers(response.data.members);
        setFilteredMembers(response.data.members);
      }
    } catch {
      const mockList: ResidentMember[] = [
        { id: '1', name: 'Ambit Resident', email: 'resident@ambit.com', flatNumber: '101-A', createdAt: new Date(Date.now() - 432000000).toISOString() },
        { id: '2', name: 'Rohit Verma', email: 'rohit@ambit.com', flatNumber: 'B-305', createdAt: new Date(Date.now() - 172800000).toISOString() },
        { id: '3', name: 'Priyanka Sen', email: 'priyanka@ambit.com', flatNumber: 'C-702', createdAt: new Date(Date.now() - 43200000).toISOString() },
      ];
      setMembers(mockList);
      setFilteredMembers(mockList);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadMembers(); }, [loadMembers]);
  const onRefresh = useCallback(() => { setRefreshing(true); loadMembers(); }, [loadMembers]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) { setFilteredMembers(members); return; }
    setFilteredMembers(
      members.filter(
        (m) =>
          m.name.toLowerCase().includes(text.toLowerCase()) ||
          (m.flatNumber && m.flatNumber.toLowerCase().includes(text.toLowerCase()))
      )
    );
  };

  const openAdd = () => { triggerHaptic(); setEditingMember(null); setModalVisible(true); };
  const openEdit = (member: ResidentMember) => { triggerHaptic(); setEditingMember(member); setModalVisible(true); };
  const closeModal = () => { triggerHaptic(); setModalVisible(false); setEditingMember(null); };

  const handleDelete = async (memberId: string) => {
    Alert.alert(
      'Remove Resident',
      'Are you sure? This action is permanent and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            try {
              triggerHaptic();
              const res = await api.delete(`/api/admin/members/${memberId}`);
              if (res.status === 200) {
                Alert.alert('Success', 'Resident removed from society directory!');
                closeModal();
                loadMembers();
              }
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.error || err.message || 'Failed to remove resident');
            }
          },
        },
      ]
    );
  };

  const renderMemberItem = ({ item, index }: { item: ResidentMember; index: number }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    return (
      <Animated.View entering={FadeInUp.duration(300).delay(index * 40)}>
        <AppListItem
          iconNode={
            <View style={uiStyles.avatarCircle}>
              <Text style={uiStyles.avatarCircleText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
          }
          title={item.name}
          subtitle={`${item.email} · Joined ${formattedDate}`}
          valueText={item.flatNumber || 'No Flat'}
          onPress={() => openEdit(item)}
          isLast={index === filteredMembers.length - 1}
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
            <Text variant="h3" weight="bold" style={type.navTitle}>Resident Directory</Text>
            <View style={{ width: 46 }} />
          </View>

          {/* Summary Bar */}
          <View style={uiStyles.summaryBar}>
            <View>
              <Text style={uiStyles.sectionLabel}>Society Association</Text>
              <Text style={uiStyles.summaryCount}>{members.length} Members</Text>
            </View>
            <Pressable
              style={[uiStyles.addBtn, { backgroundColor: '#2E7D32', shadowColor: '#2E7D32' }]}
              onPress={openAdd}
            >
              <UserPlus size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 6 }} />
              <Text style={uiStyles.addBtnText}>Add Resident</Text>
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={uiStyles.searchContainer}>
            <View style={uiStyles.searchInner}>
              <Search size={18} color="#A3A1A8" style={uiStyles.searchIcon} />
              <TextInput
                style={uiStyles.searchInput}
                placeholder="Search by name or flat number..."
                placeholderTextColor="#A3A1A8"
                value={searchQuery}
                onChangeText={handleSearch}
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <Pressable style={{ padding: 4 }} onPress={() => { triggerHaptic(); setSearchQuery(''); setFilteredMembers(members); }}>
                  <X size={14} color="#A3A1A8" />
                </Pressable>
              )}
            </View>
          </View>

          {/* Members List */}
          {isLoading ? (
            <View style={{ paddingTop: 8 }}>
              <ListSkeleton count={4} />
            </View>
          ) : (
            <AppSectionCard label="Directory Roster">
              <FlatList
                data={filteredMembers}
                keyExtractor={(item) => item.id}
                renderItem={renderMemberItem}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />}
                ListEmptyComponent={
                  <View style={uiStyles.emptyState}>
                    <User size={40} color="#A3A1A8" strokeWidth={1.5} />
                    <Text style={uiStyles.emptyText}>No residents found</Text>
                  </View>
                }
              />
            </AppSectionCard>
          )}
        </View>

        {/* Add / Edit Resident Modal */}
        <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={closeModal}>
          <View style={uiStyles.modalOverlay}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={uiStyles.modalContent}>
              <View style={uiStyles.modalHeader}>
                <Text style={uiStyles.modalTitle}>
                  {editingMember ? 'Update Resident Details' : 'Register New Resident'}
                </Text>
                <View style={uiStyles.modalHeaderActions}>
                  {editingMember && (
                    <Pressable style={uiStyles.deleteBtn} onPress={() => handleDelete(editingMember.id)}>
                      <Trash2 size={16} color="#C1584B" />
                    </Pressable>
                  )}
                  <Pressable style={uiStyles.closeBtn} onPress={closeModal}>
                    <X size={18} color="#4A5568" />
                  </Pressable>
                </View>
              </View>
              <CreateEditMemberForm
                member={editingMember}
                onSuccess={() => {
                  Alert.alert('Success', editingMember ? 'Resident details updated!' : 'Resident registered successfully!');
                  closeModal();
                  loadMembers();
                }}
                onClose={closeModal}
              />
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </Screen>
    </View>
  );
}
