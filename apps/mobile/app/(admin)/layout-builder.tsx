import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, Modal, Alert } from 'react-native';
import { Screen, Text, Button } from '@repo/ui';
import { Stack, useRouter } from 'expo-router';
import { ScreenBackground, StatusModal, CustomSpinner } from '@/components/common';
import { Building, Plus, ChevronDown, ChevronUp, Trash2, Home, Hash, X } from 'lucide-react-native';
import Animated, { FadeInUp, FadeIn, Layout, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/axios';

function triggerHaptic() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
}

// ─── Data Types ─────────────────────────────────────────────────────────────
interface Flat {
  id: string;
  name: string;
}

interface Floor {
  id: string;
  name: string;
  flats: Flat[];
}

interface Tower {
  id: string;
  name: string;
  floors: Floor[];
}

// ─── Tower Accordion Component ──────────────────────────────────────────────
const TowerAccordion = ({
  tower,
  onDelete,
}: {
  tower: Tower;
  onDelete: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  const totalFlats = tower.floors.reduce((acc, f) => acc + f.flats.length, 0);

  return (
    <Animated.View layout={Layout.springify().damping(20).stiffness(90)} style={styles.towerCard}>
      <Pressable
        style={styles.towerHeader}
        onPress={() => {
          triggerHaptic();
          setExpanded(!expanded);
        }}
      >
        <View style={styles.towerHeaderLeft}>
          <View style={styles.towerIconWrap}>
            <Building size={20} color="#059669" strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.towerName}>{tower.name}</Text>
            <Text style={styles.towerSub}>
              {tower.floors.length} Floors • {totalFlats} Flats
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            hitSlop={10}
            onPress={() => {
              triggerHaptic();
              Alert.alert('Delete Tower', `Are you sure you want to delete ${tower.name}?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDelete(tower.id) },
              ]);
            }}
          >
            <Trash2 size={18} color="#94A3B8" />
          </Pressable>
          {expanded ? <ChevronUp size={20} color="#64748B" /> : <ChevronDown size={20} color="#64748B" />}
        </View>
      </Pressable>

      {expanded && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.floorsContainer}>
          <View style={styles.divider} />
          {tower.floors.map((floor, index) => (
            <View key={floor.id} style={styles.floorRow}>
              <View style={styles.floorHeader}>
                <Text style={styles.floorName}>{floor.name}</Text>
                <Text style={styles.floorCount}>{floor.flats.length} flats</Text>
              </View>
              <View style={styles.flatsWrap}>
                {floor.flats.map((flat) => (
                  <View key={flat.id} style={styles.flatPill}>
                    <Text style={styles.flatText}>{flat.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </Animated.View>
      )}
    </Animated.View>
  );
};

// ─── Main Screen ────────────────────────────────────────────────────────────
export default function LayoutBuilderScreen() {
  const router = useRouter();
  const [towers, setTowers] = useState<Tower[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLayout();
  }, []);

  const fetchLayout = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/layout');
      if (response.data?.layout) {
        setTowers(response.data.layout);
      }
    } catch (error) {
      console.error('Failed to fetch layout', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Modal Form State
  const [newTowerName, setNewTowerName] = useState('');
  const [newFloors, setNewFloors] = useState('');
  const [newFlatsPerFloor, setNewFlatsPerFloor] = useState('');

  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    title: string;
    description: string;
  }>({ visible: false, title: '', description: '' });

  const handleAddTowerSubmit = () => {
    if (!newTowerName || !newFloors || !newFlatsPerFloor) {
      Alert.alert('Missing Fields', 'Please fill in all fields to generate the tower layout.');
      return;
    }

    triggerHaptic();

    const floorsCount = parseInt(newFloors, 10);
    const flatsCount = parseInt(newFlatsPerFloor, 10);

    const generatedFloors: Floor[] = [];
    for (let f = 1; f <= floorsCount; f++) {
      const generatedFlats: Flat[] = [];
      for (let i = 1; i <= flatsCount; i++) {
        const flatNumber = `${f}${i.toString().padStart(2, '0')}`; // e.g., 101, 1205
        generatedFlats.push({
          id: Math.random().toString(),
          name: flatNumber,
        });
      }
      generatedFloors.push({
        id: Math.random().toString(),
        name: `Floor ${f}`,
        flats: generatedFlats,
      });
    }

    const newTower: Tower = {
      id: Math.random().toString(),
      name: newTowerName,
      floors: generatedFloors,
    };

    setTowers((prev) => [...prev, newTower]);
    setModalVisible(false);
    setNewTowerName('');
    setNewFloors('');
    setNewFlatsPerFloor('');
  };

  const handleSaveLayout = async () => {
    if (towers.length === 0) {
      Alert.alert('Empty Layout', 'Please add at least one tower before saving.');
      return;
    }

    triggerHaptic();
    setIsSaving(true);
    
    try {
      await api.post('/admin/layout', { towers });
      
      setStatusModal({
        visible: true,
        title: 'Layout Saved',
        description: 'Society structure has been successfully configured.',
      });
    } catch (error) {
      console.error('Failed to save layout', error);
      Alert.alert('Error', 'Failed to save layout. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      <Stack.Screen options={{ headerShown: false }} />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={() => {
              triggerHaptic();
              router.back();
            }}
          >
            <X size={24} color="#0F172A" />
          </Pressable>
          <Text style={styles.headerTitle}>Layout Builder</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <CustomSpinner size="large" />
            </View>
          ) : towers.length === 0 ? (
            <Animated.View entering={FadeInUp.duration(400)} style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Building size={32} color="#059669" strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>No Towers Configured</Text>
              <Text style={styles.emptyDesc}>
                Add towers, floors, and flats to mirror your society's physical layout.
              </Text>
              <Pressable
                style={styles.emptyAddBtn}
                onPress={() => {
                  triggerHaptic();
                  setModalVisible(true);
                }}
              >
                <Plus size={18} color="#FFF" strokeWidth={2.5} />
                <Text style={styles.emptyAddBtnText}>Add First Tower</Text>
              </Pressable>
            </Animated.View>
          ) : (
            <View style={{ gap: 16 }}>
              {towers.map((tower, idx) => (
                <Animated.View key={tower.id} entering={FadeInUp.duration(400).delay(idx * 50)}>
                  <TowerAccordion
                    tower={tower}
                    onDelete={(id) => setTowers((prev) => prev.filter((t) => t.id !== id))}
                  />
                </Animated.View>
              ))}

              <Pressable
                style={styles.addMoreBtn}
                onPress={() => {
                  triggerHaptic();
                  setModalVisible(true);
                }}
              >
                <Plus size={18} color="#059669" strokeWidth={2.5} />
                <Text style={styles.addMoreBtnText}>Add Another Tower</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* Bottom Sticky Button */}
        {towers.length > 0 && (
          <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.bottomSticky}>
            <Button
              title="Save Configuration"
              onPress={handleSaveLayout}
              isLoading={isSaving}
              variant="primary"
            />
          </Animated.View>
        )}
      </Screen>

      {/* Add Tower Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Tower</Text>
              <Pressable onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#64748B" />
              </Pressable>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tower Name</Text>
              <View style={styles.inputWrap}>
                <Home size={18} color="#94A3B8" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Tower A"
                  placeholderTextColor="#94A3B8"
                  value={newTowerName}
                  onChangeText={setNewTowerName}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Total Floors</Text>
                <View style={styles.inputWrap}>
                  <Building size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 15"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={newFloors}
                    onChangeText={setNewFloors}
                  />
                </View>
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>Flats per Floor</Text>
                <View style={styles.inputWrap}>
                  <Hash size={18} color="#94A3B8" />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 4"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={newFlatsPerFloor}
                    onChangeText={setNewFlatsPerFloor}
                  />
                </View>
              </View>
            </View>

            <Button title="Generate Layout" onPress={handleAddTowerSubmit} style={{ marginTop: 8 }} />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Success Modal */}
      <StatusModal
        visible={statusModal.visible}
        type="success"
        title={statusModal.title}
        description={statusModal.description}
        actionLabel="Done"
        onAction={() => {
          setStatusModal({ ...statusModal, visible: false });
          router.back();
        }}
        onClose={() => setStatusModal({ ...statusModal, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  emptyState: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyAddBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  towerCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  towerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  towerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  towerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  towerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  towerSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  floorsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  floorRow: {
    marginBottom: 16,
  },
  floorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  floorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  floorCount: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  flatsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flatPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  flatText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
    gap: 8,
  },
  addMoreBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
  },
  bottomSticky: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#FAF8F5',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
  },
});
