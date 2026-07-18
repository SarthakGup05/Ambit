import React, { useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Text } from '@repo/ui';
import { AppSectionCard } from '@/components/common';
import { uiStyles } from '@/theme';
import { X, Inbox, Check, UserCheck, Megaphone, MessageSquare, Bell } from 'lucide-react-native';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.82;

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationDrawerProps {
  visible: boolean;
  onClose: () => void;
  notificationsList: NotificationItem[];
  unreadCount: number;
  handleMarkAllRead: () => void;
  handleMarkSingleRead: (id: string) => void;
  insetsTop: number;
  insetsBottom: number;
}

function getNotificationMetadata(title: string) {
  const t = title.toLowerCase();
  if (t.includes('visitor') || t.includes('guest') || t.includes('gate') || t.includes('check-in') || t.includes('checked')) {
    return {
      Icon: UserCheck,
      color: '#2E7D32',
      bg: 'rgba(46, 125, 50, 0.08)',
    };
  }
  if (t.includes('notice') || t.includes('maintenance') || t.includes('power') || t.includes('office') || t.includes('announcement')) {
    return {
      Icon: Megaphone,
      color: '#2563EB',
      bg: 'rgba(37, 99, 235, 0.08)',
    };
  }
  if (t.includes('complaint') || t.includes('ticket') || t.includes('resolved') || t.includes('elevator') || t.includes('issue')) {
    return {
      Icon: MessageSquare,
      color: '#DC2626',
      bg: 'rgba(220, 38, 38, 0.08)',
    };
  }
  return {
    Icon: Bell,
    color: '#64748B',
    bg: 'rgba(100, 116, 139, 0.08)',
  };
}

export function NotificationDrawer({
  visible,
  onClose,
  notificationsList,
  unreadCount,
  handleMarkAllRead,
  handleMarkSingleRead,
  insetsTop,
  insetsBottom,
}: NotificationDrawerProps) {
  const drawerAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(drawerAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 180,
          mass: 0.8,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(drawerAnim, {
          toValue: DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, drawerAnim, backdropAnim]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Blurred backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            styles.backdrop,
            { opacity: backdropAnim },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Sliding panel from right */}
      <Animated.View
        style={[
          styles.sideDrawer,
          {
            transform: [{ translateX: drawerAnim }],
            paddingTop: insetsTop + 12,
            paddingBottom: insetsBottom + 16,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.drawerHeader}>
          <View style={styles.notifTitleRow}>
            <Pressable onPress={onClose} style={styles.closeDrawerBtn} hitSlop={10}>
              <X size={20} color="#4A5568" strokeWidth={2.2} />
            </Pressable>
            <Text style={styles.drawerTitle}>Notifications</Text>
          </View>
          {unreadCount > 0 && (
            <View style={styles.drawerHeaderRight}>
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{unreadCount} New</Text>
              </View>
              <Pressable onPress={handleMarkAllRead} style={styles.clearAllBtn}>
                <Check size={13} color="#2E7D32" style={{ marginRight: 4 }} />
                <Text style={styles.clearAllText}>All read</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.drawerDivider} />

        {/* Notification list */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
        >
          {notificationsList.length === 0 ? (
            <View style={styles.emptyInbox}>
              <Inbox size={42} color="#A3A1A8" strokeWidth={1.5} />
              <Text style={uiStyles.emptyText}>You are all caught up!</Text>
            </View>
          ) : (
            notificationsList.map((item) => {
              const meta = getNotificationMetadata(item.title);
              const Icon = meta.Icon;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleMarkSingleRead(item.id)}
                  style={({ pressed }) => [
                    styles.notifCard,
                    { borderLeftColor: meta.color },
                    !item.isRead && styles.notifCardUnread,
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <View style={styles.notifCardTop}>
                    <View style={[styles.iconWrapper, { backgroundColor: meta.bg }]}>
                      <Icon size={14} color={meta.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.notifTitle,
                          !item.isRead && styles.notifTitleBold,
                        ]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text style={styles.notifTime}>
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    {!item.isRead && <View style={styles.bulletUnread} />}
                  </View>
                  <Text style={styles.notifBody}>{item.body}</Text>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  sideDrawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#F8FAF8',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 20,
  },
  drawerHeader: {
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  closeDrawerBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.045)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerTitle: {
    fontSize: 18,
    fontFamily: 'ManropeBold',
    color: '#1C1B1F',
    fontWeight: 'bold',
  },
  drawerHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeCount: {
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeCountText: {
    fontSize: 10,
    fontFamily: 'InterBold',
    color: '#2E7D32',
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(46, 125, 50, 0.06)',
  },
  clearAllText: {
    fontSize: 11,
    fontFamily: 'InterBold',
    color: '#2E7D32',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginHorizontal: 20,
    marginBottom: 4,
  },
  emptyInbox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  notifCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    gap: 4,
  },
  notifCardUnread: {
    backgroundColor: 'rgba(46, 125, 50, 0.03)',
    borderColor: 'rgba(46, 125, 50, 0.08)',
  },
  notifCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletUnread: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
    marginRight: 4,
  },
  notifTitle: {
    fontSize: 13.5,
    fontFamily: 'InterMedium',
    color: '#475569',
    flex: 1,
  },
  notifTitleBold: {
    fontFamily: 'InterBold',
    color: '#1E293B',
  },
  notifBody: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#64748B',
    lineHeight: 17,
    paddingLeft: 38,
  },
  notifTime: {
    fontSize: 10,
    fontFamily: 'Inter',
    color: '#94A3B8',
    marginTop: 2,
  },
});
