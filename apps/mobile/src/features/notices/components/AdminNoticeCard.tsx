import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@repo/ui';
import { AlertTriangle, Trash2 } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export interface NoticeRecord {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  isUrgent: boolean;
  createdAt: string;
}

interface AdminNoticeCardProps {
  item: NoticeRecord;
  index: number;
  onDelete: (id: string, title: string) => void;
}

export function AdminNoticeCard({ item, index, onDelete }: AdminNoticeCardProps) {
  const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Animated.View entering={FadeInDown.duration(350).delay(index * 40)} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
          {item.isUrgent && (
            <View style={styles.urgentBadge}>
              <AlertTriangle size={10} color="#C1584B" style={{ marginRight: 3 }} />
              <Text style={styles.urgentBadgeText}>URGENT</Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.date}>{formattedDate}</Text>
          <Pressable
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
            onPress={() => onDelete(item.id, item.title)}
          >
            <Trash2 size={14} color="#8E8D94" />
          </Pressable>
        </View>
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
      <Text style={styles.content}>{item.content}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 28,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(74, 85, 104, 0.06)',
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontFamily: 'InterSemiBold',
    color: '#4A5568',
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(193, 88, 75, 0.12)',
  },
  urgentBadgeText: {
    fontSize: 10,
    fontFamily: 'InterBold',
    color: '#C1584B',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  date: {
    fontSize: 11,
    fontFamily: 'Inter',
    color: '#A3A1A8',
  },
  deleteBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnPressed: {
    backgroundColor: 'rgba(193, 88, 75, 0.15)',
  },
  title: {
    fontSize: 16,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#1C1B1F',
    marginBottom: 4,
  },
  desc: {
    fontSize: 13,
    fontFamily: 'InterMedium',
    color: '#5E5D6A',
    lineHeight: 18,
    marginBottom: 8,
  },
  content: {
    fontSize: 12.5,
    fontFamily: 'Inter',
    color: '#8E8D94',
    lineHeight: 17,
    backgroundColor: 'rgba(0,0,0,0.015)',
    borderRadius: 12,
    padding: 10,
  },
});
