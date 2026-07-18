import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Text } from '@repo/ui';
import { uiStyles } from '@/theme';
import { ArrowLeft, Bell, Inbox } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.88;

import { NotificationItem } from '@/services/NotificationService';

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

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

// Simple relative time formatter helper
function getRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
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
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

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

  const filteredNotifications = notificationsList.filter((item) => {
    if (activeTab === 'unread') return !item.isRead;
    return true;
  });

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
            paddingTop: insetsTop + 16,
            paddingBottom: insetsBottom + 16,
          },
        ]}
      >
        {/* Header (Aligned precisely with mock image design) */}
        <View style={styles.drawerHeader}>
          <View style={styles.notifTitleRow}>
            <Pressable
              onPress={onClose}
              style={styles.closeDrawerBtn}
              hitSlop={12}
            >
              <ArrowLeft size={22} color="#1C1B1F" strokeWidth={2} />
            </Pressable>
            <Text style={styles.drawerTitle}>Notifications</Text>
          </View>

          {/* Tab Selector: All & Unread */}
          <View style={styles.tabContainer}>
            <Pressable
              onPress={() => {
                triggerHaptic();
                setActiveTab('all');
              }}
              style={styles.tabBtn}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'all' && styles.tabTextActive,
                ]}
              >
                All
              </Text>
              {activeTab === 'all' && <View style={styles.tabIndicator} />}
            </Pressable>

            <Pressable
              onPress={() => {
                triggerHaptic();
                setActiveTab('unread');
              }}
              style={styles.tabBtn}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'unread' && styles.tabTextActive,
                ]}
              >
                Unread
              </Text>
              {activeTab === 'unread' && <View style={styles.tabIndicator} />}
            </Pressable>
          </View>
        </View>

        {/* Notification list */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
        >
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyInbox}>
              <Inbox size={46} color="#A3A1A8" strokeWidth={1.2} />
              <Text style={uiStyles.emptyText}>You are all caught up!</Text>
            </View>
          ) : (
            filteredNotifications.map((item) => {
              const relativeTime = getRelativeTime(item.createdAt);
              
              if (!item.isRead) {
                // UNREAD NOTIFICATION CARD (Stylish White Box with subtle shadow & Mark as read button)
                return (
                  <View key={item.id} style={styles.unreadCard}>
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.iconBadge}>
                        <Bell size={18} color="#2E7D32" fill="#2E7D32" />
                      </View>
                      <View style={styles.cardHeaderRight}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardTime}>{relativeTime}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.cardBody}>{item.body}</Text>
                    
                    <View style={styles.cardFooter}>
                      <Pressable
                        onPress={() => handleMarkSingleRead(item.id)}
                        style={styles.markReadAction}
                      >
                        <Text style={styles.markReadText}>Mark as read</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              } else {
                // READ NOTIFICATION CARD (Inline list layout, transparent, no card boundary)
                return (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [
                      styles.readRow,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.iconBadgeRead}>
                        <Bell size={18} color="#A3A1A8" fill="#A3A1A8" />
                      </View>
                      <View style={styles.cardHeaderRight}>
                        <Text style={styles.cardTitleRead}>{item.title}</Text>
                        <Text style={styles.cardTimeRead}>{relativeTime}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardBodyRead}>{item.body}</Text>
                  </Pressable>
                );
              }
            })
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sideDrawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 32,
    borderBottomLeftRadius: 32,
    shadowColor: '#000000',
    shadowOffset: { width: -6, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 24,
  },
  drawerHeader: {
    paddingHorizontal: 20,
    gap: 16,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  closeDrawerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  drawerTitle: {
    fontSize: 20,
    fontFamily: 'ManropeBold',
    color: '#1C1B1F',
    fontWeight: '700',
  },
  
  // Tab Bar Styles (Clean horizontal strip with indicator)
  tabContainer: {
    flexDirection: 'row',
    gap: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
  },
  tabBtn: {
    paddingVertical: 8,
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'InterMedium',
    color: '#8E8D94',
  },
  tabTextActive: {
    color: '#1C1B1F',
    fontFamily: 'InterBold',
    fontWeight: 'bold',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -5,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#2E7D32', // Theme Green Color
    borderRadius: 1.5,
  },

  emptyInbox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
    gap: 16,
  },

  // 1. UNREAD CARD DESIGN (Elevated rounded container)
  unreadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(46, 125, 50, 0.08)', // Theme Green Tint
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardHeaderRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'InterBold',
    color: '#1C1B1F',
    fontWeight: 'bold',
    flex: 1,
    paddingRight: 8,
  },
  cardTime: {
    fontSize: 11,
    fontFamily: 'Inter',
    color: '#8E8D94',
    marginTop: 2,
  },
  cardBody: {
    fontSize: 12.5,
    fontFamily: 'Inter',
    color: '#4A5568',
    lineHeight: 18,
    paddingLeft: 44,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  markReadAction: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  markReadText: {
    fontSize: 12,
    fontFamily: 'InterBold',
    color: '#2E7D32', // Theme Green Color
    fontWeight: 'bold',
  },

  // 2. READ CARD DESIGN (Inline listing style, transparent)
  readRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.04)',
  },
  iconBadgeRead: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardTitleRead: {
    fontSize: 14,
    fontFamily: 'InterMedium',
    color: '#4A5568',
    flex: 1,
    paddingRight: 8,
  },
  cardTimeRead: {
    fontSize: 11,
    fontFamily: 'Inter',
    color: '#A3A1A8',
    marginTop: 2,
  },
  cardBodyRead: {
    fontSize: 12.5,
    fontFamily: 'Inter',
    color: '#718096',
    lineHeight: 18,
    paddingLeft: 44,
  },
});
