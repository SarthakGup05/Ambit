import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Text } from '@repo/ui';
import {
  Wrench,
  Zap,
  ArrowUpDown,
  Hammer,
  Shield,
  HelpCircle,
  AlertTriangle,
  X,
  Send,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ComplaintCategory, ComplaintPriority, CreateComplaintInput } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const FOREST_GREEN = '#1E4D2B';

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
  { id: 'low',    label: 'Low',    color: '#2E7D32', bg: 'rgba(46, 125, 50, 0.1)' },
  { id: 'medium', label: 'Medium', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.1)' },
  { id: 'high',   label: 'High',   color: '#D97706', bg: 'rgba(217, 119, 6, 0.1)'  },
  { id: 'urgent', label: 'Urgent', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.12)' },
];

function haptic() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface RaiseTicketSheetProps {
  onSubmit: (data: CreateComplaintInput) => Promise<void> | void;
  onClose: () => void;
  bottomInset: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * RaiseTicketSheet
 *
 * Self-contained bottom-sheet for raising a complaint ticket.
 * Uses flex layout inside the parent Modal, constraining height to prevent overflow.
 */
export function RaiseTicketSheet({ onSubmit, onClose, bottomInset }: RaiseTicketSheetProps) {
  const [title, setTitle] = useState('');
  const [flatNumber, setFlatNumber] = useState('A-1203');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('maintenance');
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const actualBottomPadding = Math.max(bottomInset, 16);

  const handleSubmit = useCallback(async () => {
    haptic();
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a short title for your complaint.');
      return;
    }
    if (!flatNumber.trim()) {
      Alert.alert('Missing Flat Number', 'Please enter your flat number.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please describe the issue in detail.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        flatNumber: flatNumber.trim(),
        description: description.trim(),
        category,
        priority,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [title, flatNumber, description, category, priority, onSubmit]);

  return (
    <View style={s.sheet}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Raise Helpdesk Ticket</Text>
        <Pressable onPress={onClose} style={s.closeBtn} hitSlop={10}>
          <X size={18} color="#4A5568" />
        </Pressable>
      </View>

      {/* ── Scrollable form ── */}
      <ScrollView
        style={{ flexShrink: 1 }}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category */}
        <Field label="Select Category">
          <View style={s.categoryGrid}>
            {CATEGORIES.map(({ id, label, Icon }) => {
              const active = category === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => { haptic(); setCategory(id); }}
                  style={[s.chip, active && s.chipActive]}
                >
                  <Icon size={15} color={active ? FOREST_GREEN : '#4A5568'} />
                  <Text style={[s.chipLabel, active && s.chipLabelActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        {/* Priority */}
        <Field label="Priority Level">
          <View style={s.priorityRow}>
            {PRIORITIES.map((p) => {
              const active = priority === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => { haptic(); setPriority(p.id); }}
                  style={[
                    s.priorityChip,
                    { backgroundColor: active ? p.bg : 'rgba(0,0,0,0.03)' },
                    active && { borderColor: p.color, borderWidth: 1.5 },
                  ]}
                >
                  {p.id === 'urgent' && (
                    <AlertTriangle size={11} color={p.color} style={{ marginRight: 3 }} />
                  )}
                  <Text style={[s.priorityLabel, { color: active ? p.color : '#8E8D94' }]}>
                    {p.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>

        {/* Title */}
        <Field label="Complaint Title">
          <View style={s.inputBox}>
            <TextInput
              style={s.input}
              placeholder="e.g., Water leakage in master bathroom"
              placeholderTextColor="#B0ADB8"
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
            />
          </View>
        </Field>

        {/* Flat Number */}
        <Field label="Flat Number">
          <View style={s.inputBox}>
            <TextInput
              style={s.input}
              placeholder="e.g., A-1203"
              placeholderTextColor="#B0ADB8"
              value={flatNumber}
              onChangeText={setFlatNumber}
              returnKeyType="next"
            />
          </View>
        </Field>

        {/* Description */}
        <Field label="Detailed Description">
          <View style={[s.inputBox, s.textAreaBox]}>
            <TextInput
              style={[s.input, s.textArea]}
              placeholder="Provide location, timing, or details to help resolve this quickly…"
              placeholderTextColor="#B0ADB8"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </Field>
      </ScrollView>

      {/* ── RAISE TICKET button — always pinned at bottom using dynamic safe bottom insets ── */}
      <View style={[s.footer, { paddingBottom: actualBottomPadding }]}>
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={({ pressed }) => [
            { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
          ]}
        >
          <View style={[s.raiseBtn, isSubmitting && { opacity: 0.65 }]}>
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Send size={17} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 8 }} />
                <Text style={s.raiseBtnText}>RAISE TICKET</Text>
              </>
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label.toUpperCase()}</Text>
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  sheet: {
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 10,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 72,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'ManropeBold',
    color: '#1C1B1F',
    fontWeight: '700',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Scroll ──
  scrollContent: {
    paddingBottom: 8,
  },

  // ── Field ──
  field: {
    marginBottom: 16,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: 'InterSemiBold',
    color: '#8E8D94',
    letterSpacing: 0.6,
  },

  // ── Category chips ──
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.035)',
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  chipActive: {
    backgroundColor: 'rgba(30, 77, 43, 0.10)',
    borderColor: FOREST_GREEN,
  },
  chipLabel: {
    fontSize: 13,
    fontFamily: 'InterMedium',
    color: '#4A5568',
  },
  chipLabelActive: {
    color: FOREST_GREEN,
    fontFamily: 'InterBold',
  },

  // ── Priority chips ──
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
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
  priorityLabel: {
    fontSize: 12,
    fontFamily: 'InterBold',
  },

  // ── Inputs ──
  inputBox: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textAreaBox: {
    minHeight: 96,
  },
  input: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#1C1B1F',
    padding: 0,
    margin: 0,
  },
  textArea: {
    flex: 1,
    minHeight: 72,
  },

  // ── Footer ──
  footer: {
    paddingTop: 12,
  },
  raiseBtn: {
    backgroundColor: FOREST_GREEN,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: FOREST_GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  raiseBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'InterBold',
    fontWeight: '700',
    letterSpacing: 0.7,
  },
});
