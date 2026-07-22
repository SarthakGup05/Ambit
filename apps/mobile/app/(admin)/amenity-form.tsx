import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Screen, Text } from '@repo/ui';
import { ScreenBackground, StatusModal, CustomSpinner } from '@/components/common';
import {
  ArrowLeft,
  Building2,
  Users,
  Clock,
  Check,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { api } from '@/lib/axios';
import { AdminAmenityItem } from '@/features/amenities/components/AdminAmenityCard';

// ─── Preset Images ─────────────────────────────────────────────────────────────
const PRESET_IMAGES = [
  { label: 'Pool',    url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' },
  { label: 'Gym',     url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800' },
  { label: 'Tennis',  url: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800' },
  { label: 'Lounge',  url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' },
  { label: 'Park',    url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800' },
  { label: 'Court',   url: 'https://images.unsplash.com/photo-1588776814546-1ffbb172d536?w=800' },
];

function triggerHaptic() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
}

export default function AmenityFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { id, amenityData } = useLocalSearchParams<{ id: string; amenityData?: string }>();
  const editId = id === 'new' ? undefined : id;
  const isEditing = Boolean(editId);

  // ─── Form State ──────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('20');
  const [operatingHours, setOperatingHours] = useState('06:00 AM - 10:00 PM');
  const [status, setStatus] = useState<'active' | 'maintenance' | 'closed'>('active');
  const [imageUrl, setImageUrl] = useState('');

  const [isFetching, setIsFetching] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const isButtonDisabled = isSaving;

  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    type: 'success' | 'error';
    title: string;
    description: string;
  }>({ visible: false, type: 'success', title: '', description: '' });

  // ─── Load existing amenity when editing ──────────────────────────────────────
  const loadAmenity = useCallback(async () => {
    if (!editId) return;
    
    // First try to use the pre-fetched data passed via navigation params
    if (amenityData) {
      try {
        const a: AdminAmenityItem = JSON.parse(amenityData as string);
        setName(a.name || '');
        setDescription(a.description || '');
        setCapacity(String(a.capacity || ''));
        setOperatingHours(a.operatingHours || '06:00 AM - 10:00 PM');
        setStatus(a.status || 'active');
        setImageUrl(a.imageUrl || '');
        setIsFetching(false);
        return;
      } catch (e) {
        console.warn('Failed to parse amenityData', e);
      }
    }

    try {
      const res = await api.get(`/api/admin/amenities/${editId}`);
      const a: AdminAmenityItem = res.data?.amenity;
      if (a) {
        setName(a.name);
        setDescription(a.description);
        setCapacity(String(a.capacity));
        setOperatingHours(a.operatingHours || '06:00 AM - 10:00 PM');
        setStatus(a.status);
        setImageUrl(a.imageUrl || '');
      }
    } catch {
      // fallback: just show empty form
    } finally {
      setIsFetching(false);
    }
  }, [editId, amenityData]);

  useEffect(() => { loadAmenity(); }, [loadAmenity]);

  // ─── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!name.trim()) {
      setStatusModal({
        visible: true,
        type: 'error',
        title: 'Required Field',
        description: 'Please enter a facility name before saving.',
      });
      return;
    }

    triggerHaptic();
    setIsSaving(true);

    const payload = {
      name: name.trim(),
      description: description.trim() || 'Society amenity available for resident bookings.',
      capacity: parseInt(capacity, 10) || 10,
      operatingHours: operatingHours.trim(),
      status,
      imageUrl: imageUrl.trim() || undefined,
    };

    try {
      if (isEditing) {
        await api.put(`/api/admin/amenities/${editId}`, payload);
        setStatusModal({
          visible: true,
          type: 'success',
          title: 'Facility Updated',
          description: `${payload.name} has been updated successfully.`,
        });
      } else {
        const res = await api.post('/api/admin/amenities', payload);
        const created = res.data?.amenity?.name ?? payload.name;
        setStatusModal({
          visible: true,
          type: 'success',
          title: 'Facility Created',
          description: `${created} is now available for booking.`,
        });
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to save facility. Please try again.';
      setStatusModal({ visible: true, type: 'error', title: 'Save Failed', description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusModalClose = () => {
    setStatusModal((prev) => ({ ...prev, visible: false }));
    // Go back only after a successful save so the list can refresh
    if (statusModal.type === 'success') {
      router.back();
    }
  };

  if (isFetching) {
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <ScreenBackground />
        <View style={styles.loadingContainer}>
          <CustomSpinner size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading facility…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <ScreenBackground />

      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* ─── Header ────────────────────────────────────────────────────────── */}
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[styles.header, { paddingTop: 12 }]}
          >
            <Pressable
              style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
              onPress={() => { triggerHaptic(); router.back(); }}
              hitSlop={12}
            >
              <ArrowLeft size={22} color="#0F172A" strokeWidth={2.2} />
            </Pressable>

            <View style={styles.headerCenter}>
              <Building2 size={20} color="#2E7D32" />
              <Text style={styles.headerTitle}>
                {isEditing ? 'Edit Facility' : 'Add New Amenity'}
              </Text>
            </View>

            {/* Spacer to balance back button */}
            <View style={{ width: 44 }} />
          </Animated.View>

          {/* ─── Form ─────────────────────────────────────────────────────────── */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          {/* Facility Name */}
          <Animated.View entering={FadeInDown.delay(60).duration(300)} style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Facility Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Squash Court, Rooftop Lounge"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />
          </Animated.View>

          {/* Description */}
          <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Brief summary of facility rules or guidelines…"
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </Animated.View>

          {/* Capacity & Hours */}
          <Animated.View entering={FadeInDown.delay(140).duration(300)} style={styles.rowTwo}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Max Capacity</Text>
              <View style={styles.iconInputWrapper}>
                <Users size={16} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { paddingLeft: 38 }]}
                  placeholder="20"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={capacity}
                  onChangeText={setCapacity}
                />
              </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1.5 }]}>
              <Text style={styles.inputLabel}>Operating Hours</Text>
              <View style={styles.iconInputWrapper}>
                <Clock size={16} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { paddingLeft: 38 }]}
                  placeholder="06:00 AM - 10:00 PM"
                  placeholderTextColor="#9CA3AF"
                  value={operatingHours}
                  onChangeText={setOperatingHours}
                />
              </View>
            </View>
          </Animated.View>

          {/* Facility Image */}
          <Animated.View entering={FadeInDown.delay(180).duration(300)} style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Facility Image</Text>
            <Text style={styles.inputHint}>Select a preset or paste a custom URL below:</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagePresetsRow}
            >
              {PRESET_IMAGES.map((img) => {
                const isSelected = imageUrl === img.url;
                return (
                  <Pressable
                    key={img.label}
                    style={[styles.presetCard, isSelected && styles.presetCardSelected]}
                    onPress={() => { triggerHaptic(); setImageUrl(img.url); }}
                  >
                    <Image source={{ uri: img.url }} style={styles.presetThumbnail} />
                    {isSelected && (
                      <View style={styles.presetCheckBadge}>
                        <Check size={10} color="#FFF" />
                      </View>
                    )}
                    <Text
                      style={[styles.presetLabel, isSelected && styles.presetLabelSelected]}
                    >
                      {img.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <TextInput
              style={[styles.textInput, { marginTop: 10 }]}
              placeholder="Or paste custom image URL (https://…)"
              placeholderTextColor="#9CA3AF"
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            {/* Live preview */}
            {imageUrl.startsWith('http') && (
              <Image
                source={{ uri: imageUrl }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            )}
          </Animated.View>

          {/* Status */}
          <Animated.View entering={FadeInDown.delay(220).duration(300)} style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Operational Status</Text>
            <View style={styles.statusOptionsRow}>
              {(['active', 'maintenance', 'closed'] as const).map((st) => {
                const isSelected = status === st;
                const labels = { active: 'Operational', maintenance: 'Maintenance', closed: 'Closed' };
                const colors = { active: '#2E7D32', maintenance: '#D97706', closed: '#EF4444' };
                return (
                  <Pressable
                    key={st}
                    style={[
                      styles.statusOptionPill,
                      isSelected && { backgroundColor: colors[st], borderColor: colors[st] },
                    ]}
                    onPress={() => { triggerHaptic(); setStatus(st); }}
                  >
                    {isSelected && <Check size={13} color="#FFF" />}
                    <Text style={[styles.statusOptionText, isSelected && { color: '#FFF' }]}>
                      {labels[st]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        </ScrollView>

        {/* ─── Sticky Footer Button ─────────────────────────────────────────── */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Pressable
            onPress={handleSave}
            disabled={isButtonDisabled}
            style={({ pressed }) => [
              { opacity: pressed && !isButtonDisabled ? 0.9 : 1 },
              { transform: [{ scale: pressed && !isButtonDisabled ? 0.98 : 1 }] }
            ]}
          >
            <View
              style={[
                styles.submitBtn,
                isButtonDisabled && styles.submitBtnDisabled,
              ]}
            >
              {isSaving ? (
                <CustomSpinner size="small" color={isButtonDisabled ? '#94A3B8' : '#FFF'} />
              ) : (
                <Sparkles size={18} color={isButtonDisabled ? '#94A3B8' : '#FFF'} />
              )}
              <Text style={[styles.submitBtnText, isButtonDisabled && styles.submitBtnTextDisabled]}>
                {isSaving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Facility'}
              </Text>
            </View>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      </Screen>

      <StatusModal
        visible={statusModal.visible}
        type={statusModal.type}
        title={statusModal.title}
        description={statusModal.description}
        onClose={handleStatusModalClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },

  // ─── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(226,232,240,0.8)',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  // ─── Form
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  inputHint: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111827',
  },
  textArea: {
    height: 88,
    textAlignVertical: 'top',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  iconInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },

  // ─── Image Presets
  imagePresetsRow: {
    gap: 10,
    paddingRight: 4,
    flexDirection: 'row',
    marginBottom: 4,
  },
  presetCard: {
    width: 72,
    height: 72,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetCardSelected: {
    borderColor: '#2E7D32',
    borderWidth: 2.5,
  },
  presetThumbnail: {
    width: '100%',
    height: '68%',
    resizeMode: 'cover',
  },
  presetCheckBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  presetLabelSelected: {
    color: '#2E7D32',
    fontWeight: '800',
  },
  imagePreview: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },

  // ─── Status Pills
  statusOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOptionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  statusOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  submitBtn: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  submitBtnTextDisabled: {
    color: '#94A3B8',
  },
});
