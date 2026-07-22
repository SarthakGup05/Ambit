import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@repo/ui';
import {
  AlertTriangle,
  Wrench,
  Users,
  Calendar,
  Shield,
  FileText,
  Type,
  Info,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/axios';
import { sharedStyles } from './bulletinFormStyles';

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

const CATEGORIES = [
  { name: 'Maintenance', icon: Wrench, color: '#3182CE', bgColor: 'rgba(49, 130, 206, 0.08)' },
  { name: 'Society', icon: Users, color: '#38A169', bgColor: 'rgba(56, 161, 105, 0.08)' },
  { name: 'Events', icon: Calendar, color: '#DD6B20', bgColor: 'rgba(221, 107, 32, 0.08)' },
  { name: 'Security', icon: Shield, color: '#E53E3E', bgColor: 'rgba(229, 62, 62, 0.08)' },
];

interface FormProps {
  onSuccess: () => void;
  onClose: () => void;
}

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

  const s = sharedStyles;

  const handleSubmit = async () => {
    if (!title.trim()) { setErrorMsg('Please enter a notice title'); triggerHaptic(); return; }
    if (!desc.trim()) { setErrorMsg('Please enter a brief description'); triggerHaptic(); return; }
    if (!content.trim()) { setErrorMsg('Please enter the notice details'); triggerHaptic(); return; }

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
      if (response.status === 201) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to post notice');
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

      {/* Title */}
      <View style={s.inputGroup}>
        <Text style={s.fieldLabel}>Notice Title</Text>
        <View style={s.inputWrapper}>
          <Type size={18} color="#A3A1A8" style={s.fieldIcon} />
          <TextInput
            style={s.textInput}
            placeholder="e.g. Scheduled Substation Inspection"
            placeholderTextColor="#A3A1A8"
            value={title}
            onChangeText={(txt) => { setTitle(txt); setErrorMsg(null); }}
          />
        </View>
      </View>

      {/* Description */}
      <View style={s.inputGroup}>
        <Text style={s.fieldLabel}>Summary / Description</Text>
        <View style={s.inputWrapper}>
          <FileText size={18} color="#A3A1A8" style={s.fieldIcon} />
          <TextInput
            style={s.textInput}
            placeholder="e.g. Power shutdown scheduled for Sunday..."
            placeholderTextColor="#A3A1A8"
            value={desc}
            onChangeText={(txt) => { setDesc(txt); setErrorMsg(null); }}
          />
        </View>
      </View>

      {/* Category */}
      <View style={s.inputGroup}>
        <Text style={s.fieldLabel}>Category</Text>
        <View style={s.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = category === cat.name;
            return (
              <Pressable
                key={cat.name}
                style={[s.categoryCard, isSelected && { borderColor: cat.color, backgroundColor: cat.bgColor }]}
                onPress={() => { triggerHaptic(); setCategory(cat.name); }}
              >
                <IconComponent size={18} color={isSelected ? cat.color : '#71717A'} />
                <Text style={[s.categoryText, isSelected && { color: cat.color, fontWeight: 'bold' }]}>
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Detailed Content */}
      <View style={s.inputGroup}>
        <Text style={s.fieldLabel}>Detailed Announcement</Text>
        <View style={[s.inputWrapper, s.textAreaWrapper]}>
          <TextInput
            style={s.textArea}
            placeholder="Provide the complete information here. For example, specify timestamps, impacted tower wings, backup policies, contact information for the admin desk, etc."
            placeholderTextColor="#A3A1A8"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={content}
            onChangeText={(txt) => { setContent(txt); setErrorMsg(null); }}
          />
        </View>
      </View>

      {/* Urgent Toggle */}
      <View style={[s.toggleCard, isUrgent && s.toggleCardUrgent]}>
        <View style={s.toggleHeader}>
          <View style={s.toggleTitleWrapper}>
            <AlertTriangle size={18} color={isUrgent ? '#E53E3E' : '#71717A'} />
            <View style={s.toggleTextWrapper}>
              <Text style={[s.toggleTitle, isUrgent && { color: '#E53E3E' }]}>
                Mark Notice as Urgent
              </Text>
              <Text style={s.toggleSubtitle}>
                This will broadcast instant push alerts & popups to residents.
              </Text>
            </View>
          </View>
          <Switch
            value={isUrgent}
            onValueChange={(val) => { triggerHaptic(); setIsUrgent(val); }}
            trackColor={{ false: '#E2E8F0', true: '#E53E3E' }}
            thumbColor="#FFFFFF"
          />
        </View>
        {isUrgent && (
          <View style={s.urgentWarning}>
            <Info size={14} color="#C53030" style={{ marginRight: 6 }} />
            <Text style={s.urgentWarningText}>
              Please use sparingly. Urgent notices send SMS alerts to members.
            </Text>
          </View>
        )}
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
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={s.submitButtonText}>Publish Broadcast</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
