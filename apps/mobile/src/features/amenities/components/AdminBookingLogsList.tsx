import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@repo/ui';
import { Clock, User, CheckCircle2, XCircle, Calendar } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';

export interface AdminBookingLog {
  id: string;
  amenityName: string;
  residentName: string;
  flatNumber: string;
  timeSlot: string;
  dateStr: string;
  status: 'confirmed' | 'cancelled' | 'pending';
}

interface AdminBookingLogsListProps {
  logs: AdminBookingLog[];
  onToggleLogStatus?: (logId: string) => void;
}

const STATUS_MAP = {
  confirmed: {
    label: 'Confirmed',
    color: '#059669',
    bg: 'rgba(209,250,229,1)',
    border: 'rgba(167,243,208,1)',
    strip: '#10B981',
    Icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    color: '#DC2626',
    bg: 'rgba(254,226,226,1)',
    border: 'rgba(252,165,165,0.8)',
    strip: '#EF4444',
    Icon: XCircle,
  },
  pending: {
    label: 'Pending',
    color: '#B45309',
    bg: 'rgba(254,243,199,1)',
    border: 'rgba(252,211,77,0.7)',
    strip: '#F59E0B',
    Icon: Clock,
  },
};

export const AdminBookingLogsList: React.FC<AdminBookingLogsListProps> = ({
  logs,
  onToggleLogStatus,
}) => {
  const triggerHaptic = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
  };

  return (
    <View style={styles.container}>
      {/* Section heading */}
      <View style={styles.sectionHeader}>
        <View style={styles.headingLeft}>
          <Calendar size={18} color="#0F172A" strokeWidth={2.2} />
          <Text style={styles.sectionTitle}>Reservation Logs</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{logs.length} entries</Text>
        </View>
      </View>

      {/* Log items */}
      <View style={styles.logsList}>
        {logs.map((log, index) => {
          const s = STATUS_MAP[log.status];
          return (
            <Animated.View
              key={log.id}
              entering={FadeInUp.duration(400).delay(index * 60)}
            >
              {/* Shadow shell */}
              <View style={styles.itemShadow}>
                <View style={styles.itemCard}>
                  {/* Left status strip */}
                  <View style={[styles.strip, { backgroundColor: s.strip }]} />

                  <View style={styles.itemContent}>
                    {/* Row 1: Resident + flat + status pill */}
                    <View style={styles.row1}>
                      <View style={styles.residentRow}>
                        <View style={styles.avatarCircle}>
                          <User size={12} color="#475569" strokeWidth={2.5} />
                        </View>
                        <Text style={styles.residentName} numberOfLines={1}>
                          {log.residentName}
                        </Text>
                        <View style={styles.flatBadge}>
                          <Text style={styles.flatText}>{log.flatNumber}</Text>
                        </View>
                      </View>

                      <Pressable
                        style={({ pressed }) => [
                          styles.statusPill,
                          { backgroundColor: s.bg, borderColor: s.border },
                          pressed && { opacity: 0.65 },
                        ]}
                        onPress={() => {
                          triggerHaptic();
                          onToggleLogStatus?.(log.id);
                        }}
                        hitSlop={6}
                      >
                        <s.Icon size={11} color={s.color} strokeWidth={2.5} />
                        <Text style={[styles.statusText, { color: s.color }]}>
                          {s.label}
                        </Text>
                      </Pressable>
                    </View>

                    {/* Divider */}
                    <View style={styles.innerDivider} />

                    {/* Row 2: Amenity + time */}
                    <View style={styles.row2}>
                      <Text style={styles.amenityName}>{log.amenityName}</Text>
                      <View style={styles.timeRow}>
                        <Clock size={11} color="#94A3B8" strokeWidth={2.2} />
                        <Text style={styles.timeText}>
                          {log.dateStr} · {log.timeSlot}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,1)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  logsList: {
    gap: 10,
  },
  itemShadow: {
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  itemCard: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.9)',
    backgroundColor: '#FFF',
  },
  strip: {
    width: 4,
  },
  itemContent: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 14,
    gap: 10,
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  residentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
    marginRight: 8,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  residentName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  flatBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,1)',
  },
  flatText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  innerDivider: {
    height: 1,
    backgroundColor: 'rgba(241,245,249,1)',
  },
  row2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amenityName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2E7D32',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
