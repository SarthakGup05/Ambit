import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Text } from '@repo/ui';
import { uiStyles } from '@/theme';
import {
  Wrench,
  Zap,
  ArrowUpDown,
  Hammer,
  Shield,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  ComplaintCategory,
  ComplaintPriority,
  CreateComplaintInput,
} from '../types';

export interface CreateComplaintModalProps {
  onSubmit: (data: CreateComplaintInput) => void;
  onClose: () => void;
  /** Called on mount with the form's submit function so the parent button can trigger it */
  registerSubmit?: (fn: () => void) => void;
}

const CATEGORIES: {
  id: ComplaintCategory;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}[] = [
  { id: 'plumbing', label: 'Plumbing', Icon: Wrench },
  { id: 'electrical', label: 'Electrical', Icon: Zap },
  { id: 'elevator', label: 'Elevator', Icon: ArrowUpDown },
  { id: 'maintenance', label: 'Maintenance', Icon: Hammer },
  { id: 'security', label: 'Security', Icon: Shield },
  { id: 'other', label: 'Other', Icon: HelpCircle },
];

const PRIORITIES: {
  id: ComplaintPriority;
  label: string;
  color: string;
  bg: string;
}[] = [
  { id: 'low', label: 'Low', color: '#2E7D32', bg: 'rgba(46, 125, 50, 0.1)' },
  { id: 'medium', label: 'Medium', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.1)' },
  { id: 'high', label: 'High', color: '#D97706', bg: 'rgba(217, 119, 6, 0.1)' },
  { id: 'urgent', label: 'Urgent', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.12)' },
];

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

/**
 * CreateComplaintModal renders only the scrollable form fields.
 * The submit button lives in the parent (complaints.tsx) so it is
 * always visible — outside the scroll area, inside the modal card.
 */
export function CreateComplaintModal({ onSubmit, onClose, registerSubmit }: CreateComplaintModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('maintenance');
  const [priority, setPriority] = useState<ComplaintPriority>('medium');

  const handleSubmit = () => {
    triggerHaptic();
    if (!title.trim()) {
      Alert.alert('Missing Field', 'Please enter a title for your complaint.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing Field', 'Please describe the issue in detail.');
      return;
    }
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      flatNumber: 'A-1203',
    });
  };

  // Register the submit function with the parent so its RAISE TICKET button can call it
  useEffect(() => {
    registerSubmit?.(handleSubmit);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, category, priority]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={{ flex: 1 }}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Category Picker */}
      <View style={styles.fieldGroup}>
        <Text style={uiStyles.sectionLabel}>Select Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            const Icon = cat.Icon;
            return (
              <Pressable
                key={cat.id}
                onPress={() => {
                  triggerHaptic();
                  setCategory(cat.id);
                }}
                style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
              >
                <Icon size={16} color={isSelected ? '#1E4D2B' : '#4A5568'} />
                <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Priority Picker */}
      <View style={styles.fieldGroup}>
        <Text style={uiStyles.sectionLabel}>Priority Level</Text>
        <View style={styles.priorityRow}>
          {PRIORITIES.map((p) => {
            const isSelected = priority === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => {
                  triggerHaptic();
                  setPriority(p.id);
                }}
                style={[
                  styles.priorityChip,
                  { backgroundColor: isSelected ? p.bg : 'rgba(0, 0, 0, 0.03)' },
                  isSelected && { borderColor: p.color, borderWidth: 1.5 },
                ]}
              >
                {p.id === 'urgent' && (
                  <AlertTriangle size={12} color={p.color} style={{ marginRight: 3 }} />
                )}
                <Text style={[styles.priorityText, { color: isSelected ? p.color : '#8E8D94' }]}>
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Title Input */}
      <View style={styles.fieldGroup}>
        <Text style={uiStyles.sectionLabel}>Complaint Title</Text>
        <View style={uiStyles.searchInner}>
          <TextInput
            style={uiStyles.searchInput}
            placeholder="e.g., Water leakage in master bathroom"
            placeholderTextColor="#A3A1A8"
            value={title}
            onChangeText={setTitle}
          />
        </View>
      </View>

      {/* Description Input */}
      <View style={styles.fieldGroup}>
        <Text style={uiStyles.sectionLabel}>Detailed Description</Text>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Provide specific location, timing, or details to help resolve this quickly..."
            placeholderTextColor="#A3A1A8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 12,
  },
  fieldGroup: {
    marginBottom: 16,
    gap: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.035)',
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  categoryChipSelected: {
    backgroundColor: 'rgba(30, 77, 43, 0.12)',
    borderColor: '#1E4D2B',
  },
  categoryText: {
    fontSize: 13,
    fontFamily: 'InterMedium',
    color: '#4A5568',
  },
  categoryTextSelected: {
    color: '#1E4D2B',
    fontFamily: 'InterBold',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  priorityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  priorityText: {
    fontSize: 12,
    fontFamily: 'InterBold',
  },
  textAreaContainer: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    padding: 12,
    minHeight: 100,
  },
  textArea: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#1C1B1F',
    flex: 1,
    padding: 0,
  },
});
