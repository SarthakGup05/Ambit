import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { Text } from '@repo/ui';
import { NotificationItem } from '@/services/NotificationService';
import { getNotificationMeta, formatNotificationTime } from '../notificationHelpers';

interface NotificationCardProps {
  item: NotificationItem;
  onPress: (id: string, route: string | null) => void;
}

export function NotificationCard({ item, onPress }: NotificationCardProps) {
  const meta = getNotificationMeta(item.title);
  const relativeTime = formatNotificationTime(item.createdAt);
  const CardIcon = meta.Icon;

  return (
    <Pressable
      key={item.id}
      onPress={() => onPress(item.id, meta.route)}
      style={({ pressed }) => [
        styles.notifCard,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={styles.cardContentRow}>
        {/* Icon Wrapper */}
        <View style={[styles.iconWrapper, { backgroundColor: meta.bgColor }]}>
          <CardIcon size={20} color={meta.iconColor} strokeWidth={2} />
        </View>

        {/* Texts */}
        <View style={styles.cardTextContainer}>
          <View style={styles.cardHeaderRow}>
            <Text variant="label" weight="bold" style={styles.cardTitle}>
              {item.title}
            </Text>
            <Text variant="caption" style={styles.cardTime}>
              {relativeTime}
            </Text>
          </View>
          <Text style={styles.cardBody} numberOfLines={2}>
            {item.body}
          </Text>
        </View>
      </View>

      {/* Unread Dot */}
      {!item.isRead && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#ECEFEA',
    ...Platform.select({
      ios: {
        shadowColor: '#3A3A3A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardTextContainer: {
    flex: 1,
    gap: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'InterBold',
    fontWeight: '700',
    color: '#1C1B1F',
    flex: 1,
  },
  cardTime: {
    fontSize: 11,
    fontFamily: 'Inter',
    color: '#8E8D94',
    marginTop: 2,
  },
  cardBody: {
    fontSize: 13,
    fontFamily: 'Inter',
    color: '#6B6873',
    lineHeight: 18,
    paddingRight: 12,
  },
  unreadDot: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
  },
});
