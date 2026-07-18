import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
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
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  User,
  Building,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ComplaintItem, ComplaintStatus } from '../types';

interface ComplaintDetailModalProps {
  complaint: ComplaintItem;
  isAdmin?: boolean;
  onUpdateStatus?: (id: string, newStatus: ComplaintStatus) => void;
  onAddComment?: (id: string, commentText: string) => void;
  onClose: () => void;
}

const CATEGORY_ICONS = {
  plumbing: Wrench,
  electrical: Zap,
  elevator: ArrowUpDown,
  maintenance: Hammer,
  security: Shield,
  other: HelpCircle,
};

const STATUS_CONFIG: Record<
  ComplaintStatus,
  { label: string; color: string; bg: string; Icon: any }
> = {
  open: { label: 'Open', color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)', Icon: AlertCircle },
  in_progress: { label: 'In Progress', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)', Icon: Clock },
  resolved: { label: 'Resolved', color: '#2E7D32', bg: 'rgba(46, 125, 50, 0.12)', Icon: CheckCircle2 },
  closed: { label: 'Closed', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.12)', Icon: CheckCircle2 },
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#2E7D32',
  medium: '#2563EB',
  high: '#D97706',
  urgent: '#DC2626',
};

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

export function ComplaintDetailModal({
  complaint,
  isAdmin = false,
  onUpdateStatus,
  onAddComment,
}: ComplaintDetailModalProps) {
  const [newComment, setNewComment] = useState('');
  const CategoryIcon = CATEGORY_ICONS[complaint.category] || HelpCircle;
  const statusInfo = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.open;
  const StatusIcon = statusInfo.Icon;

  const handleStatusChange = (status: ComplaintStatus) => {
    triggerHaptic();
    if (onUpdateStatus) {
      onUpdateStatus(complaint.id, status);
    }
  };

  const handleSendComment = () => {
    triggerHaptic();
    if (!newComment.trim()) return;
    if (onAddComment) {
      onAddComment(complaint.id, newComment.trim());
      setNewComment('');
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Top Meta Badges */}
      <View style={styles.badgeRow}>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
          <StatusIcon size={13} color={statusInfo.color} style={{ marginRight: 4 }} />
          <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>

        <View style={styles.categoryBadge}>
          <CategoryIcon size={13} color="#4A5568" style={{ marginRight: 4 }} />
          <Text style={styles.categoryBadgeText}>
            {complaint.category.toUpperCase()}
          </Text>
        </View>

        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: `${PRIORITY_COLORS[complaint.priority]}15` },
          ]}
        >
          <Text
            style={[
              styles.priorityBadgeText,
              { color: PRIORITY_COLORS[complaint.priority] },
            ]}
          >
            {complaint.priority.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Complaint Title */}
      <Text style={styles.titleText}>{complaint.title}</Text>

      {/* Sub-meta Info */}
      <View style={styles.metaInfoRow}>
        <View style={styles.metaItem}>
          <User size={13} color="#8E8D94" />
          <Text style={styles.metaText}>{complaint.residentName}</Text>
        </View>
        <View style={styles.metaItem}>
          <Building size={13} color="#8E8D94" />
          <Text style={styles.metaText}>{complaint.flatNumber}</Text>
        </View>
        <View style={styles.metaItem}>
          <Clock size={13} color="#8E8D94" />
          <Text style={styles.metaText}>
            {new Date(complaint.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>

      {/* Description Box */}
      <View style={styles.descriptionCard}>
        <Text style={uiStyles.sectionLabel}>Issue Description</Text>
        <Text style={styles.descriptionText}>{complaint.description}</Text>
      </View>

      {/* Admin Quick Status Update Actions */}
      {isAdmin && onUpdateStatus && (
        <View style={styles.adminActionCard}>
          <Text style={uiStyles.sectionLabel}>Admin Triage Action</Text>
          <View style={styles.statusButtonRow}>
            <Pressable
              onPress={() => handleStatusChange('open')}
              style={[
                styles.statusBtn,
                complaint.status === 'open' && styles.statusBtnActiveOpen,
              ]}
            >
              <Text style={styles.statusBtnText}>Open</Text>
            </Pressable>

            <Pressable
              onPress={() => handleStatusChange('in_progress')}
              style={[
                styles.statusBtn,
                complaint.status === 'in_progress' && styles.statusBtnActiveProgress,
              ]}
            >
              <Text style={styles.statusBtnText}>In Progress</Text>
            </Pressable>

            <Pressable
              onPress={() => handleStatusChange('resolved')}
              style={[
                styles.statusBtn,
                complaint.status === 'resolved' && styles.statusBtnActiveResolved,
              ]}
            >
              <Text style={styles.statusBtnText}>Resolved</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Timeline / Activity Log */}
      <View style={styles.commentsSection}>
        <Text style={uiStyles.sectionLabel}>Activity & Responses</Text>

        {(!complaint.comments || complaint.comments.length === 0) ? (
          <View style={styles.emptyComments}>
            <Text style={styles.emptyCommentsText}>
              No admin responses or notes added yet.
            </Text>
          </View>
        ) : (
          complaint.comments.map((c) => (
            <View key={c.id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentAuthor}>{c.author}</Text>
                <View style={styles.rolePill}>
                  <Text style={styles.roleText}>{c.role.toUpperCase()}</Text>
                </View>
                <Text style={styles.commentTime}>
                  {new Date(c.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Text style={styles.commentBody}>{c.text}</Text>
            </View>
          ))
        )}
      </View>

      {/* Add Response Form */}
      {onAddComment && (
        <View style={styles.addCommentRow}>
          <TextInput
            style={styles.commentInput}
            placeholder={isAdmin ? "Add admin response or status note..." : "Add a note..."}
            placeholderTextColor="#A3A1A8"
            value={newComment}
            onChangeText={setNewComment}
          />
          <Pressable style={styles.sendBtn} onPress={handleSendComment}>
            <Send size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: 'InterBold',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontFamily: 'InterSemiBold',
    color: '#4A5568',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontFamily: 'InterBold',
  },
  titleText: {
    fontSize: 20,
    fontFamily: 'ManropeBold',
    color: '#1C1B1F',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metaInfoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#8E8D94',
  },
  descriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    gap: 6,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#334155',
    lineHeight: 20,
  },
  adminActionCard: {
    backgroundColor: 'rgba(95, 103, 236, 0.06)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  statusButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  statusBtnText: {
    fontSize: 12,
    fontFamily: 'InterBold',
    color: '#1C1B1F',
  },
  statusBtnActiveOpen: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
  },
  statusBtnActiveProgress: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  statusBtnActiveResolved: {
    backgroundColor: '#DCFCE7',
    borderColor: '#2E7D32',
  },
  commentsSection: {
    marginBottom: 16,
    gap: 8,
  },
  emptyComments: {
    paddingVertical: 12,
  },
  emptyCommentsText: {
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#A3A1A8',
    fontStyle: 'italic',
  },
  commentItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentAuthor: {
    fontSize: 13,
    fontFamily: 'InterBold',
    color: '#1C1B1F',
  },
  rolePill: {
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 9,
    fontFamily: 'InterBold',
    color: '#2E7D32',
  },
  commentTime: {
    fontSize: 11,
    fontFamily: 'Inter',
    color: '#8E8D94',
    marginLeft: 'auto',
  },
  commentBody: {
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#475569',
  },
  addCommentRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  commentInput: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 14,
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#1C1B1F',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
