import React, { useState, useMemo } from 'react';
import { View, Pressable, ScrollView, StyleSheet, TextInput, FlatList, Dimensions, Alert, Platform } from 'react-native';
import { Screen, Text } from '@repo/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, X, Megaphone, ShieldCheck, Calendar, AlertTriangle, ArrowRight, CheckCheck } from 'lucide-react-native';
import { NOTICES } from '../data';
import { Notice } from '../types';
import Animated, { FadeIn, FadeInDown, FadeInUp, Layout, ZoomIn, LinearTransition } from 'react-native-reanimated';
import { MegaphoneIcon } from '../../../components/icons/MegaphoneIcon';
import { BellIcon } from '../../../components/icons/BellIcon';
import Svg, { Path, Circle, Defs, RadialGradient, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

const FILTERS = ['All', 'Maintenance', 'Society', 'Events', 'Security'];

function HeaderBackgroundSVG() {
  return (
    <Svg
      width={180}
      height={140}
      viewBox="0 0 180 140"
      style={{
        position: 'absolute',
        top: -15,
        right: -10,
        opacity: 0.85,
        zIndex: -1,
      }}
    >
      <Defs>
        <RadialGradient id="headerGlow" cx="70%" cy="30%" r="65%">
          <Stop offset="0%" stopColor="#C3E2C4" stopOpacity={0.28} />
          <Stop offset="50%" stopColor="#A8D1AA" stopOpacity={0.14} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
        <SvgLinearGradient id="headerWaves" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#2E7D32" stopOpacity={0.12} />
          <Stop offset="100%" stopColor="#C3E2C4" stopOpacity={0.03} />
        </SvgLinearGradient>
      </Defs>

      <Circle cx={130} cy={45} r={75} fill="url(#headerGlow)" />

      <Path
        d="M -20 70 C 50 110, 110 30, 210 90"
        fill="none"
        stroke="url(#headerWaves)"
        strokeWidth={2}
      />
      <Path
        d="M -10 50 C 70 90, 90 50, 210 70"
        fill="none"
        stroke="url(#headerWaves)"
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />
    </Svg>
  );
}

function EmptyStateSVG() {
  return (
    <Svg
      width={120}
      height={120}
      viewBox="0 0 120 120"
      style={{ marginBottom: 16 }}
    >
      <Defs>
        <RadialGradient id="emptyGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#C3E2C4" stopOpacity={0.25} />
          <Stop offset="60%" stopColor="#A8D1AA" stopOpacity={0.08} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
        <SvgLinearGradient id="searchGlass" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#C3E2C4" stopOpacity={0.6} />
          <Stop offset="100%" stopColor="#A8D1AA" stopOpacity={0.2} />
        </SvgLinearGradient>
      </Defs>

      <Circle cx={60} cy={60} r={40} fill="url(#emptyGlow)" />

      <Circle cx={60} cy={60} r={32} fill="none" stroke="rgba(46, 125, 80, 0.15)" strokeWidth={1} strokeDasharray="3 3" />
      <Circle cx={60} cy={60} r={24} fill="none" stroke="rgba(46, 125, 80, 0.25)" strokeWidth={1.5} />

      <Path
        d="M 52 52 A 12 12 0 1 1 52 76 A 12 12 0 1 1 52 52"
        fill="url(#searchGlass)"
        stroke="#2E7D32"
        strokeWidth={2}
      />
      <Path
        d="M 68 68 L 84 84"
        fill="none"
        stroke="#2E7D32"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M 32 32 L 36 32 M 34 30 L 34 34"
        fill="none"
        stroke="#F59E0B"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      <Path
        d="M 88 40 L 92 40 M 90 38 L 90 42"
        fill="none"
        stroke="#F59E0B"
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// Map iconName to Lucide components
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

export function NoticesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and search notices
  const filteredNotices = useMemo(() => {
    return NOTICES.filter((notice) => {
      // Category filter
      const matchesCategory = activeFilter === 'All' || notice.category === activeFilter;
      
      // Search query filter (matches title, description or content)
      const matchesSearch = searchQuery.trim() === '' || 
        notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchQuery.toLowerCase());
        
      return matchesCategory && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const handleReadDetails = (noticeId: string) => {
    router.push({
      pathname: '/(resident)/notice-details',
      params: { id: noticeId }
    });
  };

  const handleMarkAllRead = () => {
    Alert.alert("Success", "All active notices have been marked as read.");
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setActiveFilter('All');
  };

  const renderNoticeItem = ({ item, index }: { item: Notice; index: number }) => {
    const IconComponent = getNoticeIcon(item.iconName);
    
    return (
      <Animated.View 
        entering={FadeIn.duration(350).delay(index * 65)}
        layout={LinearTransition.duration(250)}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          {/* Tag / Category */}
          <View 
            style={[
              styles.tagPill, 
              { backgroundColor: item.tagBg, borderColor: item.tagBorder }
            ]}
          >
            <IconComponent size={12} color={item.iconColor} style={{ marginRight: 4 }} />
            <Text style={[styles.tagText, { color: item.tagText }]}>
              {item.tag}
            </Text>
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
        <Text style={styles.titleText}>
          {item.title}
        </Text>
        
        {/* Short Description */}
        <Text style={styles.descriptionText} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Footer Actions */}
        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>{item.date}</Text>
          <Pressable onPress={() => handleReadDetails(item.id)}>
            <View style={styles.readBtn}>
              <Text style={styles.readText}>Read Details</Text>
              <ArrowRight size={13} color="#11111E" strokeWidth={2.4} />
            </View>
          </Pressable>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* Rich, vivid background gradient */}
      <LinearGradient
        colors={['#D6E4FF', '#EEE0F8', '#FFE8DC']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Background depth blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <View style={styles.container}>
          {/* ── Premium Header ── */}
          <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
            <HeaderBackgroundSVG />
            {/* Top Brand row */}
            <View style={styles.headerTop}>
              <Animated.View entering={ZoomIn.duration(400).delay(50)}>
                <Text style={styles.brandText}>Ambit</Text>
              </Animated.View>

              {/* Header Right Action (Bell notification / Mark all read) */}
              <Animated.View 
                entering={ZoomIn.duration(400).delay(250)} 
                style={styles.bellOuter}
              >
                <Pressable onPress={handleMarkAllRead}>
                  <View style={styles.bellInner}>
                    <CheckCheck size={20} color="#2E7D32" strokeWidth={2.2} />
                  </View>
                </Pressable>
              </Animated.View>
            </View>

            {/* Title & Subtitle block */}
            <View style={styles.greetingSection}>
              <Animated.View 
                entering={FadeIn.duration(350).delay(150)} 
                style={styles.titleContainer}
              >
                <View style={styles.iconBackdrop}>
                  <MegaphoneIcon size={24} color="gold" />
                </View>
                <Text style={styles.titleTextHeader}>
                  Notice Board
                </Text>
              </Animated.View>
              <Animated.View entering={FadeIn.duration(350).delay(250)}>
                <Text style={styles.subtitleTextHeader}>
                  Stay updated with official society bulletins and alerts.
                </Text>
              </Animated.View>
            </View>
          </View>

          {/* Premium Search Bar */}
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

          {/* Horizontal Scrollable Filter Bar */}
          <View style={styles.filterScrollWrapper}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              {FILTERS.map((filter) => {
                const isActive = activeFilter === filter;
                
                return (
                  <Pressable
                    key={filter}
                    onPress={() => setActiveFilter(filter)}
                  >
                    <View 
                      style={[
                        styles.filterPill, 
                        isActive ? styles.filterPillActive : styles.filterPillInactive
                      ]}
                    >
                      <Text 
                        style={[
                          styles.filterText, 
                          isActive ? styles.filterTextActive : styles.filterTextInactive
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
              <Animated.View 
                entering={FadeIn.duration(350)}
                style={styles.emptyCard}
              >
                <EmptyStateSVG />
                <Text style={styles.emptyText}>No Matches Found</Text>
                <Text style={styles.emptySubtext}>
                  We couldn't find any notices matching your query or filters.
                </Text>
                <Pressable 
                  onPress={handleResetSearch}
                  style={({ pressed }) => [
                    styles.resetBtn,
                    pressed && { opacity: 0.85 }
                  ]}
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
    elevation: 2,
  },
  bellOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  bellInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
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
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#11111E',
    fontFamily: 'InterMedium',
    fontSize: 13,
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
    paddingVertical: 7,
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
    elevation: 2,
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
    paddingBottom: 140, // offset floating tab bar
    gap: 12,
  },
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
    elevation: 4,
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
  blob1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(195, 226, 196, 0.25)',
  },
  blob2: {
    position: 'absolute',
    top: 240,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(168, 209, 170, 0.15)',
  },
});
