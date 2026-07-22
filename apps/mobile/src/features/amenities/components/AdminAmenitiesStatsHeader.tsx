import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@repo/ui';
import { Building2, CalendarCheck, ShieldAlert } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface AdminAmenitiesStatsHeaderProps {
  totalCount: number;
  activeBookingsCount: number;
  maintenanceCount: number;
}

const STAT_ITEMS = (
  totalCount: number,
  activeBookingsCount: number,
  maintenanceCount: number
) => [
  {
    Icon: Building2,
    value: totalCount,
    label: 'Facilities',
    iconColor: '#2E7D32',
    tint: 'rgba(46, 125, 50, 0.10)',
    border: 'rgba(46, 125, 50, 0.16)',
  },
  {
    Icon: CalendarCheck,
    value: activeBookingsCount,
    label: 'Bookings Today',
    iconColor: '#0284C7',
    tint: 'rgba(2, 132, 199, 0.10)',
    border: 'rgba(2, 132, 199, 0.16)',
  },
  {
    Icon: ShieldAlert,
    value: maintenanceCount,
    label: 'Maintenance',
    iconColor: '#D97706',
    tint: 'rgba(217, 119, 6, 0.10)',
    border: 'rgba(217, 119, 6, 0.16)',
  },
];

export const AdminAmenitiesStatsHeader: React.FC<AdminAmenitiesStatsHeaderProps> = ({
  totalCount,
  activeBookingsCount,
  maintenanceCount,
}) => {
  const stats = STAT_ITEMS(totalCount, activeBookingsCount, maintenanceCount);

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(100)} style={styles.container}>
      {stats.map((stat, i) => (
        <View
          key={i}
          style={[
            styles.statCard,
            { borderColor: stat.border },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: stat.tint }]}>
            <stat.Icon size={18} color={stat.iconColor} strokeWidth={2.2} />
          </View>

          <View style={styles.textStack}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        </View>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStack: {
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.2,
    marginTop: 1,
  },
});
