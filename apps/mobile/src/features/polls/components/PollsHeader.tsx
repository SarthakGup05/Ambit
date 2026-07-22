import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@repo/ui';
import { ArrowLeft, SlidersHorizontal, Activity, Calendar, History } from 'lucide-react-native';
import { COLORS, RADIUS, FONT } from '../constants';

export type TabType = 'Active' | 'Upcoming' | 'Past';

interface PollsHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onBackPress: () => void;
  onFilterPress: () => void;
}

export const PollsHeader: React.FC<PollsHeaderProps> = ({
  activeTab,
  onTabChange,
  onBackPress,
  onFilterPress,
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <Pressable onPress={onBackPress} style={styles.backBtn} hitSlop={12}>
          <ArrowLeft size={24} color={COLORS.primary} strokeWidth={2.4} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text variant="h2" weight="bold" style={styles.headerTitle}>
            Resident Polls
          </Text>
          <Text variant="body" style={styles.headerSubtitle}>
            Your voice shapes our community
          </Text>
        </View>

        <Pressable
          onPress={onFilterPress}
          style={({ pressed }) => [styles.filterBtn, pressed && { opacity: 0.8 }]}
          hitSlop={12}
        >
          <SlidersHorizontal size={18} color={COLORS.primary} strokeWidth={2.2} />
        </Pressable>
      </View>

      {/* Capsule Tabs Row */}
      <View style={styles.tabsRow}>
        {/* Active Pill */}
        <Pressable
          onPress={() => onTabChange('Active')}
          style={[styles.tabPill, activeTab === 'Active' && styles.tabPillActive]}
        >
          <Activity
            size={14}
            color={activeTab === 'Active' ? COLORS.surface : COLORS.textMid}
            strokeWidth={2.2}
          />
          <Text
            variant="caption"
            weight="bold"
            style={[styles.tabText, activeTab === 'Active' && styles.tabTextActive]}
          >
            Active
          </Text>
        </Pressable>

        {/* Upcoming Pill */}
        <Pressable
          onPress={() => onTabChange('Upcoming')}
          style={[styles.tabPill, activeTab === 'Upcoming' && styles.tabPillActive]}
        >
          <Calendar
            size={14}
            color={activeTab === 'Upcoming' ? COLORS.surface : COLORS.textMid}
            strokeWidth={2.2}
          />
          <Text
            variant="caption"
            weight="bold"
            style={[styles.tabText, activeTab === 'Upcoming' && styles.tabTextActive]}
          >
            Upcoming
          </Text>
        </Pressable>

        {/* Past Pill */}
        <Pressable
          onPress={() => onTabChange('Past')}
          style={[styles.tabPill, activeTab === 'Past' && styles.tabPillActive]}
        >
          <History
            size={14}
            color={activeTab === 'Past' ? COLORS.surface : COLORS.textMid}
            strokeWidth={2.2}
          />
          <Text
            variant="caption"
            weight="bold"
            style={[styles.tabText, activeTab === 'Past' && styles.tabTextActive]}
          >
            Past
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONT.headingBold,
    fontWeight: '700',
    color: COLORS.ink,
  },
  headerSubtitle: {
    fontSize: 13.5,
    fontFamily: FONT.regular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceCream,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  tabPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontFamily: FONT.bold,
    fontWeight: '700',
    color: COLORS.textMid,
  },
  tabTextActive: {
    color: COLORS.surface,
  },
});
