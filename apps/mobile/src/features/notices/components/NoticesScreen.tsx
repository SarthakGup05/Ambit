import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  FlatList,
  Platform,
  Alert,
} from 'react-native';
import { Screen, Text } from '@repo/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenBackground } from '../../../components/common';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  X,
  Megaphone,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  CheckCheck,
} from 'lucide-react-native';
import { NoticeService } from '../../../services/NoticeService';
import { Notice } from '../types';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { MegaphoneIcon } from '../../../components/icons/MegaphoneIcon';
import { HeaderBackgroundSVG, EmptyStateSVG } from './NoticesHeaderSVG';
import { NoticeCard } from './NoticeCard';

const FILTERS = ['All', 'Maintenance', 'Society', 'Events', 'Security'];


export function NoticesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotices = async () => {
    try {
      const data = await NoticeService.getNotices();
      setNotices(data);
    } catch (e) {
      console.error('Failed to load notices', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotices();
  };

  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const matchesCategory = activeFilter === 'All' || notice.category === activeFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const handleReadDetails = (noticeId: string) => {
    router.push({ pathname: '/(resident)/notice-details', params: { id: noticeId } });
  };

  const handleMarkAllRead = () => {
    Alert.alert('Success', 'All active notices have been marked as read.');
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setActiveFilter('All');
  };

  const renderNoticeItem = ({ item, index }: { item: Notice; index: number }) => (
    <NoticeCard item={item} index={index} onReadDetails={handleReadDetails} />
  );

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <ScreenBackground />

      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <View style={styles.container}>
          {/* Premium Header */}
          <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
            <HeaderBackgroundSVG />
            <View style={styles.headerTop}>
              <Animated.View entering={ZoomIn.duration(400).delay(50)}>
                <Text style={styles.brandText}>Ambit</Text>
              </Animated.View>

              <Animated.View entering={ZoomIn.duration(400).delay(250)} style={styles.bellOuter}>
                <Pressable onPress={handleMarkAllRead}>
                  <View style={styles.bellInner}>
                    <CheckCheck size={20} color="#2E7D32" strokeWidth={2.2} />
                  </View>
                </Pressable>
              </Animated.View>
            </View>

            <View style={styles.greetingSection}>
              <Animated.View entering={FadeIn.duration(350).delay(150)} style={styles.titleContainer}>
                <View style={styles.iconBackdrop}>
                  <MegaphoneIcon size={24} color="gold" />
                </View>
                <Text style={styles.titleTextHeader}>Notice Board</Text>
              </Animated.View>
              <Animated.View entering={FadeIn.duration(350).delay(250)}>
                <Text style={styles.subtitleTextHeader}>
                  Stay updated with official society bulletins and alerts.
                </Text>
              </Animated.View>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={18} color="#8E8D9A" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search notices, categories, or keywords..."
              placeholderTextColor="#8E8D9A"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                <X size={16} color="#5E5D6A" />
              </Pressable>
            )}
          </View>

          {/* Filter Bar */}
          <View style={styles.filterScrollWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              {FILTERS.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <Pressable key={filter} onPress={() => setActiveFilter(filter)}>
                    <View
                      style={[
                        styles.filterPill,
                        isActive ? styles.filterPillActive : styles.filterPillInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          isActive ? styles.filterTextActive : styles.filterTextInactive,
                        ]}
                      >
                        {filter}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Notices List */}
          <FlatList
            data={filteredNotices}
            keyExtractor={(item) => item.id}
            renderItem={renderNoticeItem}
            style={{ flex: 1 }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={
              <Animated.View entering={FadeIn.duration(350)} style={styles.emptyCard}>
                <EmptyStateSVG />
                <Text style={styles.emptyText}>No Matches Found</Text>
                <Text style={styles.emptySubtext}>
                  We couldn't find any notices matching your query or filters.
                </Text>
                <Pressable
                  onPress={handleResetSearch}
                  style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.85 }]}
                >
                  <LinearGradient
                    colors={['#C3E2C4', '#A8D1AA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.resetBtnGradient}
                  >
                    <View style={styles.resetBtnGloss} />
                    <Text style={styles.resetBtnText}>Clear Search & Filters</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            }
          />
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  brandText: {
    fontFamily: Platform.select({
      ios: 'Snell Roundhand',
      android: 'cursive',
      default: 'serif',
    }),
    fontSize: 34,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  greetingSection: {
    marginTop: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleTextHeader: {
    fontSize: 28,
    color: '#0F172A',
    fontFamily: 'ManropeBold',
    letterSpacing: -0.6,
    lineHeight: 34,
    marginLeft: 12,
  },
  subtitleTextHeader: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'InterMedium',
    lineHeight: 20,
    marginTop: 8,
  },
  iconBackdrop: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: Platform.OS === 'android' ? 0 : 3,
  },
  bellOuter: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellInner: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    borderRadius: 26,
    paddingHorizontal: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: Platform.OS === 'android' ? 0 : 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'InterMedium',
    fontSize: 15,
    color: '#0F172A',
  },
  clearBtn: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
  },
  filterScrollWrapper: {
    height: 44,
    marginBottom: 20,
  },
  filterScrollContent: {
    gap: 12,
    paddingHorizontal: 20,
    paddingRight: 40,
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: Platform.OS === 'android' ? 0 : 4,
  },
  filterPillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  filterText: {
    fontSize: 13,
    fontFamily: 'InterBold',
    letterSpacing: 0.3,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterTextInactive: {
    color: '#64748B',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
    gap: 16,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(226, 232, 240, 0.8)',
    borderWidth: 1,
    borderRadius: 32,
    paddingHorizontal: 28,
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
    width: '100%',
  },
  emptyText: {
    fontSize: 18,
    color: '#0F172A',
    fontFamily: 'ManropeBold',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'InterMedium',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  resetBtn: {
    width: 200,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  resetBtnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  resetBtnGloss: {
    position: 'absolute',
    top: 2,
    left: 8,
    width: '90%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontFamily: 'ManropeBold',
    fontSize: 14,
    letterSpacing: 0.4,
  },
});

