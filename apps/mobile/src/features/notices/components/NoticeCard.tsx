import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Text } from '@repo/ui';
import { ArrowRight, Megaphone, ShieldCheck, Calendar, AlertTriangle } from 'lucide-react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { Notice } from '../types';

export function getNoticeIcon(name: string) {
  switch (name) {
    case 'megaphone':
      return Megaphone;
    case 'shield-check':
      return ShieldCheck;
    case 'calendar':
      return Calendar;
    case 'alert-triangle':
      return AlertTriangle;
    default:
      return Megaphone;
  }
}

interface NoticeCardProps {
  item: Notice;
  index: number;
  onReadDetails: (id: string) => void;
}

export function NoticeCard({ item, index, onReadDetails }: NoticeCardProps) {
  const IconComponent = getNoticeIcon(item.iconName);


  return (
    <Animated.View
      entering={FadeIn.duration(350).delay(index * 65)}
      layout={LinearTransition.duration(250)}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        {/* Tag / Category */}
        <View style={[styles.tagPill, { backgroundColor: item.tagBg, borderColor: item.tagBorder }]}>
          <IconComponent size={12} color={item.iconColor} style={{ marginRight: 4 }} />
          <Text style={[styles.tagText, { color: item.tagText }]}>{item.tag}</Text>
        </View>

        {/* Time & Read/Unread Status */}
        <View style={styles.rightHeader}>
          {item.isUrgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>URGENT</Text>
            </View>
          )}
          {!item.isRead && <View style={styles.unreadDot} />}
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.titleText}>{item.title}</Text>

      {/* Short Description */}
      <Text style={styles.descriptionText} numberOfLines={2}>
        {item.description}
      </Text>

      {/* Footer Actions */}
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>{item.date}</Text>
        <Pressable onPress={() => onReadDetails(item.id)}>
          <View style={styles.readBtn}>
            <Text style={styles.readText}>Read Details</Text>
            <ArrowRight size={13} color="#11111E" strokeWidth={2.4} />
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: Platform.OS === 'android' ? 0 : 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 9,
    fontFamily: 'InterBold',
    letterSpacing: 0.5,
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
  },
  urgentBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  urgentText: {
    fontSize: 8,
    fontFamily: 'InterBold',
    color: '#EF4444',
    letterSpacing: 0.3,
  },
  timeText: {
    fontSize: 11,
    color: '#C1584B',
    fontFamily: 'InterBold',
  },
  titleText: {
    fontSize: 16,
    color: '#11111E',
    fontFamily: 'ManropeBold',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 12,
    color: '#5E5D6A',
    fontFamily: 'Inter',
    lineHeight: 18,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    paddingTop: 12,
  },
  dateText: {
    fontSize: 11,
    color: '#8E8D9A',
    fontFamily: 'InterMedium',
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  readText: {
    fontSize: 12,
    color: '#11111E',
    fontFamily: 'ManropeBold',
    letterSpacing: 0.3,
    marginRight: 4,
  },
});
