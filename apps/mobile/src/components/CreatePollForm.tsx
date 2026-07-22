import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { Text } from '@repo/ui';
import { AlertTriangle, Clock, X, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/axios';
import { sharedStyles } from './bulletinFormStyles';
import { CustomSpinner } from '@/components/common';

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

const EXPIRATIONS = [
  { label: '1 Day', value: 1, desc: 'Quick check' },
  { label: '3 Days', value: 3, desc: 'Standard' },
  { label: '7 Days', value: 7, desc: 'Detailed debate' },
];

interface FormProps {
  onSuccess: () => void;
  onClose: () => void;
}

/**
 * 🗳️ CREATE POLL FORM
 */
export function CreatePollForm({ onSuccess, onClose }: FormProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [expiresInDays, setExpiresInDays] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const s = sharedStyles;

  const handleAddOption = () => {
    triggerHaptic();
    if (options.length >= 6) {
      Alert.alert('Limit Reached', 'A maximum of 6 choices are allowed per poll.');
      return;
    }
    setOptions([...options, '']);
  };

  const handleRemoveOption = (idx: number) => {
    triggerHaptic();
    if (options.length <= 2) return;
    const nextOpts = [...options];
    nextOpts.splice(idx, 1);
    setOptions(nextOpts);
  };

  const handleOptionChange = (txt: string, idx: number) => {
    const nextOpts = [...options];
    nextOpts[idx] = txt;
    setOptions(nextOpts);
    setErrorMsg(null);
  };

  const handleSubmit = async () => {
    const filteredOptions = options.map((opt) => opt.trim()).filter((opt) => opt.length > 0);
    if (!question.trim()) { setErrorMsg('Please enter a poll question'); triggerHaptic(); return; }
    if (filteredOptions.length < 2) { setErrorMsg('Please provide at least 2 non-empty options'); triggerHaptic(); return; }

    setErrorMsg(null);
    setIsSubmitting(true);
    triggerHaptic();

    try {
      const response = await api.post('/api/polls', {
        question: question.trim(),
        options: filteredOptions,
        expiresInDays,
      });
      if (response.status === 201) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to create poll');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
      {errorMsg && (
        <View style={s.errorBox}>
          <AlertTriangle size={16} color="#E53E3E" style={s.errorIcon} />
          <Text style={s.errorText}>{errorMsg}</Text>
        </View>
      )}

      {/* Question */}
      <View style={s.inputGroup}>
        <Text style={s.fieldLabel}>Question</Text>
        <View style={[s.inputWrapper, s.questionInputWrapper]}>
          <TextInput
            style={s.questionInput}
            placeholder="e.g. Upgrade Clubhouse Gym equipment?"
            placeholderTextColor="#A3A1A8"
            multiline
            numberOfLines={2}
            value={question}
            onChangeText={(txt) => { setQuestion(txt); setErrorMsg(null); }}
          />
        </View>
      </View>

      {/* Choices */}
      <View style={s.inputGroup}>
        <View style={s.optionHeaderRow}>
          <Text style={s.fieldLabel}>Choices</Text>
          <Pressable style={s.addOptionLink} onPress={handleAddOption}>
            <Plus size={14} color="#38A169" style={{ marginRight: 2 }} />
            <Text style={s.addOptionLinkText}>Add Choice</Text>
          </Pressable>
        </View>

        {options.map((opt, idx) => (
          <View key={idx} style={s.choiceRow}>
            <View style={s.choiceNumberBadge}>
              <Text style={s.choiceNumberText}>{`0${idx + 1}`}</Text>
            </View>
            <View style={s.choiceInputWrapper}>
              <TextInput
                style={s.choiceInput}
                placeholder={`Choice ${idx + 1}...`}
                placeholderTextColor="#A3A1A8"
                value={opt}
                onChangeText={(txt) => handleOptionChange(txt, idx)}
              />
            </View>
            {options.length > 2 && (
              <Pressable style={s.removeChoiceBtn} onPress={() => handleRemoveOption(idx)}>
                <X size={16} color="#A0AEC0" />
              </Pressable>
            )}
          </View>
        ))}
      </View>

      {/* Duration */}
      <View style={s.inputGroup}>
        <Text style={s.fieldLabel}>Expiration Duration</Text>
        <View style={s.expirationGrid}>
          {EXPIRATIONS.map((exp) => {
            const isSelected = expiresInDays === exp.value;
            return (
              <Pressable
                key={exp.value}
                style={[s.expirationCard, isSelected && s.expirationCardActive]}
                onPress={() => { triggerHaptic(); setExpiresInDays(exp.value); }}
              >
                <Clock size={16} color={isSelected ? '#38A169' : '#71717A'} />
                <Text style={[s.expirationLabel, isSelected && s.expirationLabelActive]}>
                  {exp.label}
                </Text>
                <Text style={s.expirationDesc}>{exp.desc}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Footer */}
      <View style={s.formFooter}>
        <Pressable style={s.cancelButton} onPress={onClose}>
          <Text style={s.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[s.submitButton, isSubmitting && s.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <CustomSpinner color="#FFFFFF" size="small" />
          ) : (
            <Text style={s.submitButtonText}>Launch Voting Poll</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
