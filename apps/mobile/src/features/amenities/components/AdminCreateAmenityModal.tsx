import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Text } from '@repo/ui';
import { X, Sparkles, Building2, Users, Clock, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { AdminAmenityItem } from './AdminAmenityCard';

interface AdminCreateAmenityModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (amenity: Partial<AdminAmenityItem>) => void;
  editingAmenity?: AdminAmenityItem | null;
  bottomInset: number;
}

const PRESET_IMAGES = [
  { label: 'Pool', url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800' },
  { label: 'Gym', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800' },
  { label: 'Tennis', url: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800' },
  { label: 'Lounge', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' },
  { label: 'Park', url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800' },
];

export const AdminCreateAmenityModal: React.FC<AdminCreateAmenityModalProps> = ({
  visible,
  onClose,
  onSave,
  editingAmenity,
  bottomInset,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('20');
  const [operatingHours, setOperatingHours] = useState('06:00 AM - 10:00 PM');
  const [status, setStatus] = useState<'active' | 'maintenance' | 'closed'>('active');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (editingAmenity) {
      setName(editingAmenity.name);
      setDescription(editingAmenity.description);
      setCapacity(String(editingAmenity.capacity));
      setOperatingHours(editingAmenity.operatingHours || '06:00 AM - 10:00 PM');
      setStatus(editingAmenity.status);
      setImageUrl(editingAmenity.imageUrl || '');
    } else {
      setName('');
      setDescription('');
      setCapacity('20');
      setOperatingHours('06:00 AM - 10:00 PM');
      setStatus('active');
      setImageUrl('');
    }
  }, [editingAmenity, visible]);

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter a facility name.');
      return;
    }

    const parsedCapacity = parseInt(capacity, 10) || 10;
    triggerHaptic();

    onSave({
      id: editingAmenity?.id,
      name: name.trim(),
      description: description.trim() || 'Society amenity available for resident bookings.',
      capacity: parsedCapacity,
      operatingHours: operatingHours.trim(),
      status,
      imageUrl: imageUrl.trim() || undefined,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheetContainer, { paddingBottom: Math.max(bottomInset, 24) }]}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerTitleGroup}>
              <Building2 size={22} color="#2E7D32" />
              <Text style={styles.sheetTitle}>
                {editingAmenity ? 'Edit Facility' : 'Add New Amenity'}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
              onPress={onClose}
            >
              <X size={20} color="#6B7280" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.formScroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {/* Facility Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Facility Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Squash Court, Rooftop Lounge"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Brief summary of facility rules or guidelines..."
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Capacity & Operating Hours Row */}
            <View style={styles.rowTwo}>
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

              <View style={[styles.inputGroup, { flex: 1.4 }]}>
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
            </View>

            {/* Facility Image */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Facility Image</Text>
              <Text variant="caption" style={{ color: '#6B7280', marginBottom: 8 }}>
                Select a preset image or enter a custom image URL below:
              </Text>
              
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
                      style={[
                        styles.presetCard,
                        isSelected && styles.presetCardSelected
                      ]}
                      onPress={() => {
                        triggerHaptic();
                        setImageUrl(img.url);
                      }}
                    >
                      <Image source={{ uri: img.url }} style={styles.presetThumbnail} />
                      <Text 
                        variant="caption" 
                        weight="semibold"
                        style={[
                          styles.presetLabel,
                          isSelected && styles.presetLabelSelected
                        ]}
                      >
                        {img.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <TextInput
                style={[styles.textInput, { marginTop: 8 }]}
                placeholder="Or paste custom image URL (https://...)"
                placeholderTextColor="#9CA3AF"
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            {/* Status Select */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Operational Status</Text>
              <View style={styles.statusOptionsRow}>
                {(['active', 'maintenance', 'closed'] as const).map((st) => {
                  const isSelected = status === st;
                  const labelMap = {
                    active: 'Operational',
                    maintenance: 'Maintenance',
                    closed: 'Closed',
                  };
                  return (
                    <Pressable
                      key={st}
                      style={[
                        styles.statusOptionPill,
                        isSelected && styles.statusOptionSelected,
                      ]}
                      onPress={() => {
                        triggerHaptic();
                        setStatus(st);
                      }}
                    >
                      {isSelected && <Check size={14} color="#FFF" />}
                      <Text
                        style={[
                          styles.statusOptionText,
                          isSelected && styles.statusOptionTextSelected,
                        ]}
                      >
                        {labelMap[st]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Submit Button */}
          <Pressable
            style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.9 }]}
            onPress={handleSave}
          >
            <Sparkles size={18} color="#FFF" />
            <Text style={styles.submitBtnText}>
              {editingAmenity ? 'Save Changes' : 'Create Facility'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    maxHeight: '92%',
    flex: 0,
    flexShrink: 1,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  formScroll: {
    flexGrow: 1,
    flexShrink: 1,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rowTwo: {
    flexDirection: 'row',
    gap: 12,
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
  statusOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOptionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  statusOptionSelected: {
    backgroundColor: '#2E7D32',
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  statusOptionTextSelected: {
    color: '#FFF',
  },
  submitBtn: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  imagePresetsRow: {
    gap: 10,
    marginBottom: 8,
    paddingRight: 20,
    flexDirection: 'row',
  },
  presetCard: {
    width: 68,
    height: 68,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetCardSelected: {
    borderColor: '#2E7D32',
  },
  presetThumbnail: {
    width: '100%',
    height: '65%',
    resizeMode: 'cover',
  },
  presetLabel: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 1,
  },
  presetLabelSelected: {
    color: '#2E7D32',
    fontWeight: '700',
  },
});
