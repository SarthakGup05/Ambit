import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  Text as RNText,
} from 'react-native';
import { Text } from '@repo/ui';
import {
  Users,
  Clock,
  ChevronRight,
  Edit3,
  Trash2,
  CheckCircle2,
  Wrench,
  X,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react-native';
import Animated, {
  FadeInUp,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export interface AdminAmenityItem {
  id: string;
  name: string;
  description: string;
  capacity: number;
  operatingHours?: string;
  status: 'active' | 'maintenance' | 'closed';
  imageUrl?: string;
}

interface AdminAmenityCardProps {
  item: AdminAmenityItem;
  index: number;
  onEdit: (item: AdminAmenityItem) => void;
  onToggleStatus: (item: AdminAmenityItem) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG = {
  active: {
    label: 'OPERATIONAL',
    dot: '#10B981',
    textColor: '#047857',
    bg: '#ECFDF5',
    border: '#A7F3D0',
  },
  maintenance: {
    label: 'MAINTENANCE',
    dot: '#F59E0B',
    textColor: '#B45309',
    bg: '#FEF3C7',
    border: '#FDE68A',
  },
  closed: {
    label: 'CLOSED',
    dot: '#EF4444',
    textColor: '#B91C1C',
    bg: '#FEE2E2',
    border: '#FCA5A5',
  },
};

const DEFAULT_IMAGES: Record<string, string> = {
  pool: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800',
  gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
  tennis: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800',
  lounge: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
};

export const AdminAmenityCard: React.FC<AdminAmenityCardProps> = ({
  item,
  index,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const [sheetVisible, setSheetVisible] = useState(false);
  const scale = useSharedValue(1);

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    try {
      Haptics.impactAsync(style);
    } catch {}
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.985, { damping: 18, stiffness: 320 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 18, stiffness: 320 });
  };

  const openSheet = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setSheetVisible(true);
  };

  const closeSheet = () => setSheetVisible(false);

  const statusConfig = STATUS_CONFIG[item.status];

  const getImage = () => {
    if (item.imageUrl) return item.imageUrl;
    const lower = item.name.toLowerCase();
    if (lower.includes('pool')) return DEFAULT_IMAGES.pool;
    if (lower.includes('gym') || lower.includes('fitness')) return DEFAULT_IMAGES.gym;
    if (lower.includes('tennis') || lower.includes('court')) return DEFAULT_IMAGES.tennis;
    return DEFAULT_IMAGES.lounge;
  };

  return (
    <>
      {/* ── MAIN CARD (Blinkit Architectural Style) ─────── */}
      <Animated.View
        entering={FadeInUp.duration(450).delay(80 + index * 60)}
        style={[styles.wrapper, animatedCardStyle]}
      >
        <View style={styles.shadowShell}>
          <View style={styles.cardContainer}>
            {/* Hero Image Media Container */}
            <Pressable
              style={styles.mediaPanel}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={openSheet}
            >
              <Image source={{ uri: getImage() }} style={styles.cardImage} resizeMode="cover" />
              <View style={styles.scrimTop} />
              <View style={styles.scrimBottom} />

              {/* Top Row Glass Badges */}
              <View style={styles.imgTopRow}>
                <View style={styles.glassStatusBadge}>
                  <View style={[styles.statusDot, { backgroundColor: statusConfig.dot }]} />
                  <Text style={styles.statusBadgeText}>{statusConfig.label}</Text>
                </View>

                <View style={styles.glassCapacityBadge}>
                  <Users size={11} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.capacityBadgeText}>Max {item.capacity}</Text>
                </View>
              </View>

              {/* Bottom Title & Subtitle */}
              <View style={styles.imgBottomBlock}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.cardDesc} numberOfLines={1}>
                  {item.description}
                </Text>
              </View>
            </Pressable>

            {/* Full-Width Blinkit Signature Green CTA Button */}
            <Pressable
              className="flex-row items-center justify-center gap-2 bg-[#0C831F] active:bg-[#096918] py-4"
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={openSheet}
            >
              <SlidersHorizontal size={14} color="#FFFFFF" strokeWidth={2.5} />
              <RNText className="text-white text-[13px] font-black tracking-[0.8px]">MANAGE FACILITY</RNText>
              <ChevronRight size={14} color="#FFFFFF" strokeWidth={3} />
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {/* ── BLINKIT INSPIRED BOTTOM SHEET MODAL ─────────── */}
      <Modal
        visible={sheetVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeSheet}
      >
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View entering={FadeIn.duration(200)} style={styles.sheetContainer}>
          {/* Centered Drag Handle */}
          <View style={styles.sheetHandle} />

          {/* Modal Header Header Row */}
          <View style={styles.modalHeaderRow}>
            <Image source={{ uri: getImage() }} style={styles.modalHeaderImage} resizeMode="cover" />

            <View style={styles.modalHeaderMeta}>
              <View
                style={[
                  styles.modalStatusChip,
                  { backgroundColor: statusConfig.bg, borderColor: statusConfig.border },
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: statusConfig.dot }]} />
                <Text style={[styles.modalStatusText, { color: statusConfig.textColor }]}>
                  {statusConfig.label}
                </Text>
              </View>
              <Text style={styles.modalHeaderTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.modalHeaderSubtitle} numberOfLines={1}>
                Max {item.capacity} guests · {item.operatingHours ?? '06:00 AM – 10:00 PM'}
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [styles.closeButtonCircle, pressed && { opacity: 0.6 }]}
              onPress={closeSheet}
              hitSlop={10}
            >
              <X size={16} color="#64748B" strokeWidth={2.5} />
            </Pressable>
          </View>

          <View style={styles.sheetHorizontalDivider} />

          {/* Blinkit Style Floating Action Cards */}
          <View style={styles.actionCardsContainer}>

            {/* Action Card 1: Edit Details */}
            <Pressable
              style={({ pressed }) => [styles.blinkitTileCard, pressed && styles.tileCardPressed]}
              onPress={() => {
                closeSheet();
                setTimeout(() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                  onEdit(item);
                }, 180);
              }}
            >
              <View style={styles.tileCardRow}>
                <View style={[styles.tileIconContainer, { backgroundColor: '#EFF6FF' }]}>
                  <Edit3 size={18} color="#2563EB" strokeWidth={2.2} />
                </View>
                <View style={styles.tileTextContent}>
                  <Text style={styles.tileTitle}>Edit Amenity Details</Text>
                  <Text style={styles.tileSubtitle}>Update name, image, capacity & timing</Text>
                </View>
                <View style={styles.tileArrowCircle}>
                  <ChevronRight size={14} color="#64748B" strokeWidth={2.5} />
                </View>
              </View>
            </Pressable>

            {/* Action Card 2: Toggle Operational / Maintenance */}
            <Pressable
              style={({ pressed }) => [styles.blinkitTileCard, pressed && styles.tileCardPressed]}
              onPress={() => {
                closeSheet();
                setTimeout(() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
                  onToggleStatus(item);
                }, 180);
              }}
            >
              <View style={styles.tileCardRow}>
                <View
                  style={[
                    styles.tileIconContainer,
                    {
                      backgroundColor:
                        item.status === 'maintenance' ? '#ECFDF5' : '#FEF3C7',
                    },
                  ]}
                >
                  {item.status === 'maintenance' ? (
                    <ShieldCheck size={18} color="#047857" strokeWidth={2.2} />
                  ) : (
                    <Wrench size={18} color="#B45309" strokeWidth={2.2} />
                  )}
                </View>
                <View style={styles.tileTextContent}>
                  <Text
                    style={[
                      styles.tileTitle,
                      { color: item.status === 'maintenance' ? '#047857' : '#B45309' },
                    ]}
                  >
                    {item.status === 'maintenance' ? 'Set to Operational' : 'Mark for Maintenance'}
                  </Text>
                  <Text style={styles.tileSubtitle}>
                    {item.status === 'maintenance'
                      ? 'Re-enable resident bookings & access'
                      : 'Temporarily pause bookings for service'}
                  </Text>
                </View>
                <View style={styles.tileArrowCircle}>
                  <ChevronRight size={14} color="#64748B" strokeWidth={2.5} />
                </View>
              </View>
            </Pressable>

            {/* Action Card 3: Delete Facility */}
            <Pressable
              style={({ pressed }) => [
                styles.blinkitTileCard,
                styles.deleteTileCard,
                pressed && styles.tileCardPressed,
              ]}
              onPress={() => {
                closeSheet();
                setTimeout(() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
                  onDelete(item.id);
                }, 180);
              }}
            >
              <View style={styles.tileCardRow}>
                <View style={[styles.tileIconContainer, { backgroundColor: '#FEE2E2' }]}>
                  <Trash2 size={18} color="#DC2626" strokeWidth={2.2} />
                </View>
                <View style={styles.tileTextContent}>
                  <Text style={[styles.tileTitle, { color: '#DC2626' }]}>Remove Facility</Text>
                  <Text style={styles.tileSubtitle}>Permanently delete this amenity</Text>
                </View>
                <View style={styles.tileArrowCircle}>
                  <ChevronRight size={14} color="#DC2626" strokeWidth={2.5} />
                </View>
              </View>
            </Pressable>

          </View>

          {/* Bottom Padding */}
          <View style={{ height: Platform.OS === 'ios' ? 36 : 20 }} />
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // ── CARD STYLES ──────────────────────────────────
  wrapper: {
    marginHorizontal: 20,
    marginBottom: 18,
  },
  shadowShell: {
    borderRadius: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
    backgroundColor: '#FFFFFF',
  },
  cardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
    backgroundColor: '#FFFFFF',
  },

  // ── MEDIA PANEL ──────────────────────────────────
  mediaPanel: {
    height: 205,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  scrimTop: {
    ...StyleSheet.absoluteFillObject,
    height: 90,
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
  },
  scrimBottom: {
    ...StyleSheet.absoluteFillObject,
    top: 85,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
  },
  imgTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 10,
  },
  glassStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  glassCapacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  capacityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  imgBottomBlock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingBottom: 16,
    gap: 3,
    zIndex: 10,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  cardDesc: {
    color: 'rgba(255, 255, 255, 0.86)',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },


  // ── MODAL SHEET & BLINKIT ACTION CARDS ───────────
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.16,
    shadowRadius: 26,
    elevation: 24,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 12,
  },
  modalHeaderImage: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  modalHeaderMeta: {
    flex: 1,
    gap: 2,
  },
  modalStatusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 2,
  },
  modalStatusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  modalHeaderSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  closeButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sheetHorizontalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
  },
  actionCardsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  blinkitTileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  deleteTileCard: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FFF5F5',
  },
  tileCardPressed: {
    backgroundColor: '#F8FAFC',
    transform: [{ scale: 0.985 }],
  },
  tileCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  tileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileTextContent: {
    flex: 1,
    gap: 2,
  },
  tileTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  tileSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    lineHeight: 16,
  },
  tileArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});