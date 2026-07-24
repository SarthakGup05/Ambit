import React, { useState, useEffect } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Screen, Text } from '@repo/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Check,
  CalendarDays,
  Share2,
  MoreHorizontal,
} from 'lucide-react-native';
import { NoticeService } from '../../../services/NoticeService';
import { Notice } from '../types';
import { getNoticeIcon } from './NoticeCard';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  SlideInDown,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomSpinner } from '@/components/common';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function NoticeDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [notice, setNotice] = useState<Notice | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const notices = await NoticeService.getNotices();
        const found = notices.find((n) => n.id === id);
        setNotice(found || notices[0]);
      } catch (e) {
        console.error('Failed to load notice details', e);
      } finally {
        setFetching(false);
      }
    };
    fetchNotice();
  }, [id]);

  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const triggerAcknowledgement = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAcknowledged(true);
    }, 600);
  };

  const checkIfAutoAcknowledgeNeeded = (cHeight: number, svHeight: number) => {
    if (cHeight > 0 && svHeight > 0 && cHeight <= svHeight + 10) {
      if (!acknowledged && !loading) {
        triggerAcknowledgement();
      }
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    // Check if the scroll position is near the bottom (within 30px)
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 30;
    
    if (isCloseToBottom && !acknowledged && !loading) {
      triggerAcknowledgement();
    }
  };

  const isMegaphone = notice?.iconName === 'megaphone';
  const iconColor = isMegaphone ? '#D4AF37' : (notice?.iconColor || '#2E7D32');
  const iconSize = isMegaphone ? 18 : 14;
  const badgeBg = isMegaphone ? 'rgba(212, 175, 55, 0.1)' : (notice?.tagBg || '#EAF5EB');
  const badgeTextColor = isMegaphone ? '#B8860B' : (notice?.tagText || notice?.iconColor || '#2E7D32');

  const IconComponent = notice ? getNoticeIcon(notice.iconName) : null;

  return (
    <View style={styles.container}>
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        {/* ── Minimalist Header ── */}
        <Animated.View entering={FadeInDown.duration(350)} style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <Pressable onPress={() => router.back()} style={styles.headerIconBtn}>
            <ChevronLeft size={24} color="#111827" strokeWidth={2.5} />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerIconBtn}>
              <Share2 size={20} color="#111827" strokeWidth={2} />
            </Pressable>
            <Pressable style={styles.headerIconBtn}>
              <MoreHorizontal size={24} color="#111827" strokeWidth={2} />
            </Pressable>
          </View>
        </Animated.View>

        {fetching ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <CustomSpinner size="large" color="#2E7D32" />
          </View>
        ) : notice ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 20) + (acknowledged ? 100 : 40) },
            ]}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onContentSizeChange={(w, h) => {
              setContentHeight(h);
              checkIfAutoAcknowledgeNeeded(h, scrollViewHeight);
            }}
            onLayout={(e) => {
              const { height } = e.nativeEvent.layout;
              setScrollViewHeight(height);
              checkIfAutoAcknowledgeNeeded(contentHeight, height);
            }}
          >
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.tagsContainer}>
                <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                  {IconComponent && <IconComponent size={iconSize} color={iconColor} />}
                  <Text style={[styles.badgeText, { color: badgeTextColor }]}>
                    {notice.category}
                  </Text>
                </View>
                {notice.isUrgent && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentBadgeText}>URGENT</Text>
                  </View>
                )}
              </Animated.View>

              <Animated.View entering={FadeInUp.duration(450).delay(200)}>
                <Text style={styles.title}>{notice.title}</Text>
              </Animated.View>

              <Animated.View entering={FadeInUp.duration(450).delay(300)} style={styles.metaRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{notice.author.charAt(0)}</Text>
                </View>
                <View style={styles.metaTextContainer}>
                  <Text style={styles.authorName}>{notice.author}</Text>
                  <View style={styles.dateRow}>
                    <CalendarDays size={12} color="#6B7280" />
                    <Text style={styles.dateText}>{notice.date} • {notice.time}</Text>
                  </View>
                </View>
              </Animated.View>
            </View>

            {/* Divider */}
            <Animated.View entering={FadeIn.duration(500).delay(350)} style={styles.divider} />

            {/* Body Content */}
            <Animated.View entering={FadeInUp.duration(500).delay(400)}>
              <Text style={styles.bodyText}>{notice.content}</Text>
            </Animated.View>

            {/* Loading indicator when auto-acknowledging */}
            {loading && (
              <Animated.View entering={FadeIn} style={styles.loadingContainer}>
                <CustomSpinner size="small" color="#2E7D32" />
                <Text style={styles.loadingText}>Acknowledging receipt...</Text>
              </Animated.View>
            )}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Notice not found</Text>
          </View>
        )}

        {/* ── Floating Action Bar (Only shows when acknowledged) ── */}
        {acknowledged && (
          <Animated.View 
            entering={SlideInDown.duration(300)} 
            style={[styles.floatingBottomBar, { bottom: Math.max(insets.bottom, 24) }]}
          >
            <View style={styles.successPill}>
              <View style={styles.successIconWrapper}>
                <Check size={16} color="#ffffff" strokeWidth={3} />
              </View>
              <Text style={styles.successPillText}>Receipt Acknowledged</Text>
            </View>
          </Animated.View>
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  heroSection: {
    marginBottom: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  urgentBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  urgentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 32,
    color: '#111827',
    fontWeight: '800',
    lineHeight: 38,
    letterSpacing: -0.8,
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4B5563',
  },
  metaTextContainer: {
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 24,
  },
  bodyText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    letterSpacing: -0.1,
    marginBottom: 32,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 32,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  floatingBottomBar: {
    position: 'absolute',
    left: 24,
    right: 24,
    zIndex: 100,
  },
  successPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  successIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  successPillText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 16,
  },
});