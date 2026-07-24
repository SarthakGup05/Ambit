import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Text } from '@repo/ui';
import { ArrowRight, Megaphone, ShieldCheck, Calendar, AlertTriangle } from 'lucide-react-native';
import Animated, { FadeIn, LinearTransition, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const urgentColors = ['#FEF2F2', '#FEE2E2'] as const;
  const normalColors = ['#FFFFFF', '#F8FAFC'] as const;
  const gradientColors = item.isUrgent ? urgentColors : normalColors;

  return (
    <Animated.View
      entering={FadeIn.duration(400).delay(index * 80)}
      layout={LinearTransition.duration(300)}
      style={animatedStyle}
    >
      <Pressable
        onPress={() => onReadDetails(item.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ width: '100%' }}
      >
        <View style={[styles.card, item.isUrgent && styles.cardUrgent]}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.cardHeader}>
            <View style={[styles.tagPill, { backgroundColor: item.isUrgent ? '#FEE2E2' : item.tagBg, borderColor: item.isUrgent ? '#FCA5A5' : item.tagBorder }]}>
              <IconComponent size={14} color={item.isUrgent ? '#EF4444' : item.iconColor} style={{ marginRight: 6 }} />
              <Text style={[styles.tagText, { color: item.isUrgent ? '#991B1B' : item.tagText }]}>{item.tag}</Text>
            </View>

            <View style={styles.rightHeader}>
              {item.isUrgent && (
                <Animated.View entering={FadeIn.duration(300)} style={styles.urgentBadge}>
                  <AlertTriangle size={12} color="#EF4444" style={{ marginRight: 4 }} />
                  <Text style={styles.urgentText}>ACTION REQUIRED</Text>
                </Animated.View>
              )}
              {!item.isRead && (
                <View style={styles.unreadContainer}>
                  <View style={styles.unreadDot} />
                  <Text style={styles.newText}>NEW</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.dateContainer}>
              <Calendar size={14} color="#8E8D9A" style={{ marginRight: 6 }} />
              <Text style={styles.dateText}>{item.date} • {item.time}</Text>
            </View>
            <View style={styles.readBtn}>
              <Text style={styles.readText}>Read More</Text>
              <View style={styles.arrowCircle}>
                <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#11111E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: Platform.OS === 'android' ? 0 : 5,
  },
  cardUrgent: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    shadowColor: '#EF4444',
    shadowOpacity: 0.08,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'InterBold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
    marginRight: 4,
  },
  newText: {
    fontSize: 9,
    fontFamily: 'InterBold',
    color: '#2E7D32',
    letterSpacing: 0.5,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  urgentText: {
    fontSize: 9,
    fontFamily: 'InterBold',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 18,
    color: '#0F172A',
    fontFamily: 'ManropeBold',
    letterSpacing: -0.4,
    lineHeight: 24,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Inter',
    lineHeight: 22,
    marginBottom: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.8)',
    paddingTop: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'InterMedium',
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readText: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: 'InterBold',
    letterSpacing: 0.3,
    marginRight: 8,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
