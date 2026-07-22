import React, { useState, useMemo } from 'react';
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
import { NOTICES } from '../data';
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

  const filteredNotices = useMemo(() => {
    return NOTICES.filter((notice) => {
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
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    color: '#000000',
  },
  greetingSection: {
    marginTop: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleTextHeader: {
    fontSize: 26,
    color: '#11111E',
    fontFamily: 'ManropeBold',
    letterSpacing: -0.6,
    lineHeight: 32,
    marginLeft: 12,
  },
  subtitleTextHeader: {
    fontSize: 12,
    color: '#5E5D6A',
    fontFamily: 'InterMedium',
    lineHeight: 16,
    marginTop: 6,
  },
  iconBackdrop: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: Platform.OS === 'android' ? 0 : 2,
  },
  bellOuter: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellInner: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 24,
    paddingHorizontal: 16,
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: Platform.OS === 'android' ? 0 : 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#11111E',
  },
  clearBtn: {
    padding: 4,
  },
  filterScrollWrapper: {
    height: 38,
    marginBottom: 16,
  },
  filterScrollContent: {
    gap: 8,
    paddingHorizontal: 20,
    paddingRight: 40,
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#C3E2C4',
    borderColor: 'transparent',
    shadowColor: '#C3E2C4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: Platform.OS === 'android' ? 0 : 2,
  },
  filterPillInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  filterText: {
    fontSize: 11,
    fontFamily: 'InterBold',
    letterSpacing: 0.2,
  },
  filterTextActive: {
    color: '#000000',
  },
  filterTextInactive: {
    color: '#5E5D6A',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
    gap: 12,
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1.5,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 4,
    width: '100%',
  },
  emptyText: {
    fontSize: 16,
    color: '#11111E',
    fontFamily: 'ManropeBold',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#5E5D6A',
    fontFamily: 'InterMedium',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  resetBtn: {
    width: 180,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#A8D1AA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
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
    left: 6,
    width: '90%',
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  resetBtnText: {
    color: '#000000',
    fontFamily: 'ManropeBold',
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
