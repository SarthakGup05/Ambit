import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@repo/ui';
import { Clock, User, CheckCircle2, XCircle, Calendar, Dumbbell, Armchair, Waves, Bell, LucideIcon } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

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
  onAccept?: (logId: string) => void;
  onDecline?: (logId: string) => void;
}

const STATUS_MAP = {
  confirmed: {
    label: 'Confirmed',
    color: '#059669',
    bg: '#D1FAE5',
    border: '#A7F3D0',
    Icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    color: '#DC2626',
    bg: '#FEE2E2',
    border: '#FECACA',
    Icon: XCircle,
  },
  pending: {
    label: 'Pending',
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A',
    Icon: Clock,
  },
};

const getAmenityConfig = (name: string): { Icon: LucideIcon; color: string; bg: string } => {
  const n = name.toLowerCase();
  if (n.includes('tennis')) return { Icon: Dumbbell, color: '#DC2626', bg: '#FEE2E2' };
  if (n.includes('pool') || n.includes('swim')) return { Icon: Waves, color: '#059669', bg: '#D1FAE5' };
  if (n.includes('lounge') || n.includes('club')) return { Icon: Armchair, color: '#D97706', bg: '#FEF3C7' };
  return { Icon: Calendar, color: '#2563EB', bg: '#DBEAFE' };
};

export const AdminBookingLogsList: React.FC<AdminBookingLogsListProps> = ({
  logs,
  onToggleLogStatus,
  onAccept,
  onDecline,
}) => {
  const triggerHaptic = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.headingLeft}>
          <Calendar size={28} color="#064E3B" strokeWidth={2} />
          <View>
            <Text style={styles.sectionTitle}>Reservation Logs</Text>
            <Text style={styles.sectionSubTitle}>Recent facility reservations</Text>
          </View>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{logs.length} entries</Text>
        </View>
      </View>

      <View style={styles.logsList}>
        {logs.map((log, index) => {
          const s = STATUS_MAP[log.status];
          const amenityCfg = getAmenityConfig(log.amenityName);
          
          return (
            <Animated.View
              key={log.id}
              entering={FadeInUp.duration(400).delay(index * 60)}
            >
              <View style={styles.itemShadow}>
                <View style={styles.itemCard}>
                  <View style={styles.itemContent}>
                    <View style={[styles.accentBar, { backgroundColor: s.color }]} />
                    
                    <View style={styles.mainContent}>
                      <View style={styles.topRow}>
                        <View style={styles.amenityNameRow}>
                          <View style={[styles.amenityIconBox, { backgroundColor: amenityCfg.bg }]}>
                            <amenityCfg.Icon size={24} color={amenityCfg.color} strokeWidth={2} />
                          </View>
                          <Text style={styles.amenityName} numberOfLines={1}>
                            {log.amenityName}
                          </Text>
                        </View>
                        <Pressable
                          style={({ pressed }) => [
                            styles.statusPill,
                            { backgroundColor: s.bg, borderColor: s.border },
                            pressed && { opacity: 0.65 },
                          ]}
                          onPress={() => {
                            triggerHaptic();
                            if (log.status !== 'pending') {
                              onToggleLogStatus?.(log.id);
                            }
                          }}
                        >
                          <s.Icon size={12} color={s.color} strokeWidth={2.5} />
                          <Text style={[styles.statusText, { color: s.color }]}>
                            {s.label}
                          </Text>
                        </Pressable>
                      </View>

                      <View style={styles.divider} />

                      <View style={styles.detailsRow}>
                        <View style={styles.detailBlock}>
                          <View style={styles.detailIconWrap}>
                            <User size={16} color="#059669" strokeWidth={2} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.detailLabel}>Resident</Text>
                            <View style={styles.residentNameRow}>
                              <Text style={styles.residentName} numberOfLines={1}>{log.residentName}</Text>
                              <View style={styles.flatBadge}>
                                <Text style={styles.flatText}>{log.flatNumber}</Text>
                              </View>
                            </View>
                          </View>
                        </View>
                        
                        <View style={styles.verticalDivider} />

                        <View style={styles.detailBlock}>
                          <View style={styles.detailIconWrap}>
                            <Calendar size={16} color="#059669" strokeWidth={2} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.detailLabel}>{log.dateStr}</Text>
                            <Text style={styles.timeText} numberOfLines={1}>{log.timeSlot}</Text>
                          </View>
                        </View>
                      </View>

                      {log.status === 'pending' && (
                        <View style={styles.pendingActionBox}>
                          <View style={styles.pendingBoxLeft}>
                            <Bell size={20} color="#D97706" strokeWidth={2.2} />
                            <View>
                              <Text style={styles.pendingBoxTitle}>Awaiting your action</Text>
                              <Text style={styles.pendingBoxDesc}>Please review and respond to this request</Text>
                            </View>
                          </View>
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Pressable
                              style={({ pressed }) => [
                                styles.declineBtn,
                                pressed && { backgroundColor: '#FFEDD5' },
                              ]}
                              onPress={() => {
                                triggerHaptic();
                                onDecline?.(log.id);
                              }}
                            >
                              <Text style={styles.declineBtnText}>Decline</Text>
                            </Pressable>
                          </View>
                        </View>
                      )}
                      
                      {log.status === 'confirmed' && (
                        <View style={styles.confirmedActionBox}>
                          <View style={styles.pendingBoxLeft}>
                            <View style={styles.confirmedIconCircle}>
                              <CheckCircle2 size={16} color="#FFF" strokeWidth={2.5} />
                            </View>
                            <View>
                              <Text style={styles.confirmedBoxTitle}>Reservation confirmed</Text>
                              <Text style={styles.pendingBoxDesc}>We look forward to your visit!</Text>
                            </View>
                          </View>
                        </View>
                      )}
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
    marginTop: 16,
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  sectionSubTitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
  countBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  logsList: {
    gap: 16,
  },
  itemShadow: {
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  itemCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  itemContent: {
    position: 'relative',
  },
  accentBar: {
    width: 6,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  mainContent: {
    padding: 20,
    paddingLeft: 26,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  amenityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  amenityIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  divider: {
    height: 0,
    marginVertical: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  detailIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  detailLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  residentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  residentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },
  flatBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  flatText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  pendingActionBox: {
    marginTop: 20,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  confirmedActionBox: {
    marginTop: 20,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pendingBoxLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  pendingBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
    marginBottom: 2,
  },
  confirmedBoxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 2,
  },
  pendingBoxDesc: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  confirmedIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDBA74',
    backgroundColor: 'transparent',
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C2410C',
  },
});
