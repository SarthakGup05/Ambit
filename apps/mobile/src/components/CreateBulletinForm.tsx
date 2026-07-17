import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  Switch,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { Text } from '@repo/ui';
import {
  X,
  Calendar,
  AlertTriangle,
  Clock,
  Wrench,
  Users,
  Shield,
  FileText,
  Type,
  Plus,
  Info,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/axios';

interface FormProps {
  onSuccess: () => void;
  onClose: () => void;
}

const CATEGORIES = [
  { name: 'Maintenance', icon: Wrench, color: '#3182CE', bgColor: 'rgba(49, 130, 206, 0.08)' },
  { name: 'Society', icon: Users, color: '#38A169', bgColor: 'rgba(56, 161, 105, 0.08)' },
  { name: 'Events', icon: Calendar, color: '#DD6B20', bgColor: 'rgba(221, 107, 32, 0.08)' },
  { name: 'Security', icon: Shield, color: '#E53E3E', bgColor: 'rgba(229, 62, 62, 0.08)' },
];

const EXPIRATIONS = [
  { label: '1 Day', value: 1, desc: 'Quick check' },
  { label: '3 Days', value: 3, desc: 'Standard' },
  { label: '7 Days', value: 7, desc: 'Detailed debate' },
];

const triggerHaptic = () => {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (e) {
    // ignore
  }
};

/**
 * 📢 CREATE NOTICE FORM
 */
export function CreateNoticeForm({ onSuccess, onClose }: FormProps) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Society');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a notice title');
      triggerHaptic();
      return;
    }
    if (!desc.trim()) {
      setErrorMsg('Please enter a brief description');
      triggerHaptic();
      return;
    }
    if (!content.trim()) {
      setErrorMsg('Please enter the notice details');
      triggerHaptic();
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    triggerHaptic();

    try {
      const response = await api.post('/api/notices', {
        title: title.trim(),
        description: desc.trim(),
        content: content.trim(),
        category,
        isUrgent,
      });

      if (response.status === 201) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to post notice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {errorMsg && (
          <View style={styles.errorBox}>
            <AlertTriangle size={16} color="#E53E3E" style={styles.errorIcon} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* 1. Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Notice Title</Text>
          <View style={styles.inputWrapper}>
            <Type size={18} color="#A3A1A8" style={styles.fieldIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Scheduled Substation Inspection"
              placeholderTextColor="#A3A1A8"
              value={title}
              onChangeText={(txt) => {
                setTitle(txt);
                setErrorMsg(null);
              }}
            />
          </View>
        </View>

        {/* 2. Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Summary / Description</Text>
          <View style={styles.inputWrapper}>
            <FileText size={18} color="#A3A1A8" style={styles.fieldIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Power shutdown scheduled for Sunday..."
              placeholderTextColor="#A3A1A8"
              value={desc}
              onChangeText={(txt) => {
                setDesc(txt);
                setErrorMsg(null);
              }}
            />
          </View>
        </View>

        {/* 3. Category Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = category === cat.name;

              return (
                <Pressable
                  key={cat.name}
                  style={[
                    styles.categoryCard,
                    isSelected && { borderColor: cat.color, backgroundColor: cat.bgColor },
                  ]}
                  onPress={() => {
                    triggerHaptic();
                    setCategory(cat.name);
                  }}
                >
                  <IconComponent size={18} color={isSelected ? cat.color : '#71717A'} />
                  <Text style={[styles.categoryText, isSelected && { color: cat.color, fontWeight: 'bold' }]}>
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 4. Detailed content */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Detailed Announcement</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <TextInput
              style={styles.textArea}
              placeholder="Provide the complete information here. For example, specify timestamps, impacted tower wings, backup policies, contact information for the admin desk, etc."
              placeholderTextColor="#A3A1A8"
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
              value={content}
              onChangeText={(txt) => {
                setContent(txt);
                setErrorMsg(null);
              }}
            />
          </View>
        </View>

        {/* 5. Urgent Toggle Card */}
        <View style={[styles.toggleCard, isUrgent && styles.toggleCardUrgent]}>
          <View style={styles.toggleHeader}>
            <View style={styles.toggleTitleWrapper}>
              <AlertTriangle size={18} color={isUrgent ? '#E53E3E' : '#71717A'} />
              <View style={styles.toggleTextWrapper}>
                <Text style={[styles.toggleTitle, isUrgent && { color: '#E53E3E' }]}>
                  Mark Notice as Urgent
                </Text>
                <Text style={styles.toggleSubtitle}>
                  This will broadcast instant push alerts & popups to residents.
                </Text>
              </View>
            </View>
            <Switch
              value={isUrgent}
              onValueChange={(val) => {
                triggerHaptic();
                setIsUrgent(val);
              }}
              trackColor={{ false: '#E2E8F0', true: '#E53E3E' }}
              thumbColor="#FFFFFF"
            />
          </View>
          {isUrgent && (
            <View style={styles.urgentWarning}>
              <Info size={14} color="#C53030" style={{ marginRight: 6 }} />
              <Text style={styles.urgentWarningText}>
                Please use sparingly. Urgent notices send SMS alerts to members.
              </Text>
            </View>
          )}
        </View>
      {/* Action Footer */}
      <View style={styles.formFooter}>
        <Pressable style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Publish Broadcast</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
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

    if (!question.trim()) {
      setErrorMsg('Please enter a poll question');
      triggerHaptic();
      return;
    }
    if (filteredOptions.length < 2) {
      setErrorMsg('Please provide at least 2 non-empty options');
      triggerHaptic();
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    triggerHaptic();

    try {
      const response = await api.post('/api/polls', {
        question: question.trim(),
        options: filteredOptions,
        expiresInDays,
      });

      if (response.status === 201) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to create poll');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {errorMsg && (
          <View style={styles.errorBox}>
            <AlertTriangle size={16} color="#E53E3E" style={styles.errorIcon} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* 1. Poll Question */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Question</Text>
          <View style={[styles.inputWrapper, styles.questionInputWrapper]}>
            <TextInput
              style={styles.questionInput}
              placeholder="e.g. Upgrade Clubhouse Gym equipment?"
              placeholderTextColor="#A3A1A8"
              multiline={true}
              numberOfLines={2}
              value={question}
              onChangeText={(txt) => {
                setQuestion(txt);
                setErrorMsg(null);
              }}
            />
          </View>
        </View>

        {/* 2. Poll Choices */}
        <View style={styles.inputGroup}>
          <View style={styles.optionHeaderRow}>
            <Text style={styles.fieldLabel}>Choices</Text>
            <Pressable style={styles.addOptionLink} onPress={handleAddOption}>
              <Plus size={14} color="#38A169" style={{ marginRight: 2 }} />
              <Text style={styles.addOptionLinkText}>Add Choice</Text>
            </Pressable>
          </View>

          {options.map((opt, idx) => (
            <View key={idx} style={styles.choiceRow}>
              <View style={styles.choiceNumberBadge}>
                <Text style={styles.choiceNumberText}>{`0${idx + 1}`}</Text>
              </View>
              <View style={styles.choiceInputWrapper}>
                <TextInput
                  style={styles.choiceInput}
                  placeholder={`Choice ${idx + 1}...`}
                  placeholderTextColor="#A3A1A8"
                  value={opt}
                  onChangeText={(txt) => handleOptionChange(txt, idx)}
                />
              </View>
              {options.length > 2 && (
                <Pressable style={styles.removeChoiceBtn} onPress={() => handleRemoveOption(idx)}>
                  <X size={16} color="#A0AEC0" />
                </Pressable>
              )}
            </View>
          ))}
        </View>

        {/* 3. Duration Selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Expiration Duration</Text>
          <View style={styles.expirationGrid}>
            {EXPIRATIONS.map((exp) => {
              const isSelected = expiresInDays === exp.value;

              return (
                <Pressable
                  key={exp.value}
                  style={[styles.expirationCard, isSelected && styles.expirationCardActive]}
                  onPress={() => {
                    triggerHaptic();
                    setExpiresInDays(exp.value);
                  }}
                >
                  <Clock size={16} color={isSelected ? '#38A169' : '#71717A'} />
                  <Text style={[styles.expirationLabel, isSelected && styles.expirationLabelActive]}>
                    {exp.label}
                  </Text>
                  <Text style={styles.expirationDesc}>{exp.desc}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      {/* Action Footer */}
      <View style={styles.formFooter}>
        <Pressable style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Launch Voting Poll</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    height: '100%',
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorIcon: {
    marginRight: 10,
  },
  errorText: {
    flex: 1,
    color: '#C53030',
    fontSize: 13,
    fontFamily: 'InterSemiBold',
    lineHeight: 18,
  },
  inputGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13.5,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#2D3748',
    letterSpacing: 0.1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#1A202C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  fieldIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: '#1A202C',
    fontSize: 14.5,
    fontFamily: 'InterMedium',
  },
  textAreaWrapper: {
    height: 120,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    color: '#1A202C',
    fontSize: 14.5,
    fontFamily: 'Inter',
    lineHeight: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: 'InterMedium',
    color: '#4A5568',
  },
  toggleCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  toggleCardUrgent: {
    borderColor: '#FED7D7',
    backgroundColor: '#FFF5F5',
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTitleWrapper: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    paddingRight: 12,
  },
  toggleTextWrapper: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#2D3748',
  },
  toggleSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter',
    color: '#71717A',
    lineHeight: 15,
    marginTop: 2,
  },
  urgentWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 62, 62, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  urgentWarningText: {
    fontSize: 11,
    fontFamily: 'InterMedium',
    color: '#C53030',
    flex: 1,
  },
  optionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  addOptionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 161, 105, 0.08)',
  },
  addOptionLinkText: {
    fontSize: 12,
    fontFamily: 'InterBold',
    color: '#38A169',
    fontWeight: 'bold',
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  choiceNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceNumberText: {
    fontSize: 11.5,
    fontFamily: 'InterBold',
    color: '#4A5568',
    fontWeight: 'bold',
  },
  choiceInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
  },
  choiceInput: {
    flex: 1,
    height: '100%',
    color: '#1A202C',
    fontSize: 14,
    fontFamily: 'InterMedium',
  },
  removeChoiceBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionInputWrapper: {
    height: 80,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  questionInput: {
    flex: 1,
    width: '100%',
    height: '100%',
    color: '#1A202C',
    fontSize: 14.5,
    fontFamily: 'Inter',
    lineHeight: 20,
  },
  expirationGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  expirationCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
  },
  expirationCardActive: {
    borderColor: '#38A169',
    backgroundColor: 'rgba(56, 161, 105, 0.05)',
  },
  expirationLabel: {
    fontSize: 13,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#4A5568',
    marginTop: 2,
  },
  expirationLabelActive: {
    color: '#38A169',
  },
  expirationDesc: {
    fontSize: 10,
    fontFamily: 'Inter',
    color: '#A3A1A8',
  },
  formFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
    backgroundColor: 'transparent',
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'InterSemiBold',
    color: '#4A5568',
  },
  submitButton: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 14,
    fontFamily: 'InterBold',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
