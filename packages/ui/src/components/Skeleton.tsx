import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';

interface SkeletonProps {
  style?: ViewStyle;
  className?: string;
  borderRadius?: number;
}

/**
 * 💫 Pulsing Skeleton Block
 * High-performance, native-thread driven animated placeholder block.
 */
export function Skeleton({ style, className, borderRadius = 8 }: SkeletonProps) {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.75,
        duration: 750,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 0.35,
        duration: 750,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(pulse).start();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        { opacity: pulseAnim, borderRadius },
        style,
      ]}
      className={`bg-zinc-200 dark:bg-zinc-700 ${className}`}
    />
  );
}

/**
 * 👥 List Item Skeleton (Instagram Directory style)
 * Pulsing list rows with circular avatar on the left, and text rows on the right.
 */
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, idx) => (
        <View key={idx} style={styles.listRow}>
          <Skeleton style={styles.avatar} borderRadius={22} />
          <View style={styles.textContainer}>
            <Skeleton style={styles.titleLine} />
            <Skeleton style={styles.subtitleLine} />
          </View>
          <Skeleton style={styles.badge} borderRadius={10} />
        </View>
      ))}
    </View>
  );
}

/**
 * 📢 Notice Card Skeleton (Announcements style)
 * Large block layout with category, title, description, and paragraph lines.
 */
export function CardSkeleton({ count = 2 }: { count?: number }) {
  return (
    <View style={styles.cardContainer}>
      {Array.from({ length: count }).map((_, idx) => (
        <View key={idx} style={styles.card}>
          <View style={styles.cardHeader}>
            <Skeleton style={styles.categoryBadge} borderRadius={8} />
            <Skeleton style={styles.dateStamp} />
          </View>
          <Skeleton style={styles.cardTitle} />
          <Skeleton style={styles.cardDesc} />
          <View style={styles.paragraphBlock}>
            <Skeleton style={styles.paraLineLong} />
            <Skeleton style={styles.paraLineMedium} />
            <Skeleton style={styles.paraLineShort} />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * 📊 Dashboard Analytics Grid Skeleton
 * Standard 2x2 grid of pulsing analytics metrics cards.
 */
export function GridSkeleton() {
  return (
    <View style={styles.grid}>
      <View style={styles.gridRow}>
        <View style={styles.gridCard}>
          <Skeleton style={styles.iconCircle} borderRadius={8} />
          <Skeleton style={styles.statNum} />
          <Skeleton style={styles.statLabel} />
        </View>
        <View style={styles.gridCard}>
          <Skeleton style={styles.iconCircle} borderRadius={8} />
          <Skeleton style={styles.statNum} />
          <Skeleton style={styles.statLabel} />
        </View>
      </View>
      <View style={styles.gridRow}>
        <View style={styles.gridCard}>
          <Skeleton style={styles.iconCircle} borderRadius={8} />
          <Skeleton style={styles.statNum} />
          <Skeleton style={styles.statLabel} />
        </View>
        <View style={styles.gridCard}>
          <Skeleton style={styles.iconCircle} borderRadius={8} />
          <Skeleton style={styles.statNum} />
          <Skeleton style={styles.statLabel} />
        </View>
      </View>
    </View>
  );
}

/**
 * 🏢 Society Settings Screen Skeleton
 * Detailed details placeholder showing circular icon, heading block, and configuration item rows.
 */
export function SettingsSkeleton() {
  return (
    <View style={styles.settingsSkeletonContainer}>
      {/* Top summary card */}
      <View style={styles.summarySkeletonCard}>
        <Skeleton style={styles.summaryAvatar} borderRadius={26} />
        <Skeleton style={styles.summaryName} />
        <Skeleton style={styles.summarySub} />
      </View>
      
      {/* Configuration rows */}
      <View style={styles.card}>
        {/* Row 1 */}
        <View style={styles.row}>
          <Skeleton style={styles.rowIcon} borderRadius={8} />
          <View style={styles.rowTextContainer}>
            <Skeleton style={styles.rowLabel} />
            <Skeleton style={styles.rowVal} />
          </View>
        </View>
        <View style={styles.divider} />
        {/* Row 2 */}
        <View style={styles.row}>
          <Skeleton style={styles.rowIcon} borderRadius={8} />
          <View style={styles.rowTextContainer}>
            <Skeleton style={styles.rowLabel} />
            <Skeleton style={styles.rowVal} />
          </View>
        </View>
        <View style={styles.divider} />
        {/* Row 3 */}
        <View style={styles.row}>
          <Skeleton style={styles.rowIcon} borderRadius={8} />
          <View style={styles.rowTextContainer}>
            <Skeleton style={styles.rowLabel} />
            <Skeleton style={styles.rowVal} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    gap: 12,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatar: {
    width: 44,
    height: 44,
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    gap: 8,
  },
  titleLine: {
    height: 14,
    width: '60%',
  },
  subtitleLine: {
    height: 10,
    width: '45%',
  },
  badge: {
    width: 50,
    height: 22,
  },
  cardContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 24,
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryBadge: {
    width: 70,
    height: 18,
  },
  dateStamp: {
    width: 60,
    height: 10,
  },
  cardTitle: {
    height: 16,
    width: '75%',
    marginBottom: 8,
  },
  cardDesc: {
    height: 12,
    width: '90%',
    marginBottom: 14,
  },
  paragraphBlock: {
    gap: 6,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 12,
  },
  paraLineLong: {
    height: 10,
    width: '100%',
  },
  paraLineMedium: {
    height: 10,
    width: '85%',
  },
  paraLineShort: {
    height: 10,
    width: '50%',
  },
  grid: {
    gap: 12,
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 24,
    padding: 16,
  },
  iconCircle: {
    width: 28,
    height: 28,
    marginBottom: 12,
  },
  statNum: {
    height: 22,
    width: '50%',
    marginBottom: 8,
  },
  statLabel: {
    height: 10,
    width: '70%',
  },
  settingsSkeletonContainer: {
    gap: 20,
  },
  summarySkeletonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  summaryAvatar: {
    width: 52,
    height: 52,
  },
  summaryName: {
    height: 18,
    width: '60%',
  },
  summarySub: {
    height: 12,
    width: '80%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowIcon: {
    width: 28,
    height: 28,
  },
  rowTextContainer: {
    flex: 1,
    gap: 6,
  },
  rowLabel: {
    height: 10,
    width: '30%',
  },
  rowVal: {
    height: 14,
    width: '50%',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(28, 27, 31, 0.08)',
    marginLeft: 56,
  },
});
