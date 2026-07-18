import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  RefreshControl,
  TextInput,
  Clipboard,
} from 'react-native';
import { Screen, Text, ListSkeleton } from '@repo/ui';
import { ScreenBackground, AppSectionCard, AppListItem } from '@/components/common';
import { uiStyles, type } from '@/theme';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  UserPlus,
  Copy,
  Clock,
  Key,
  ShieldCheck,
  User,
  Truck,
  Wrench,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GuestPassService, GuestPass } from '@/services/GuestPassService';

const FALLBACK_PASSES: GuestPass[] = [
  {
    id: 'gp1',
    guestName: 'Ananya Roy',
    token: 'AMB39A',
    validTo: new Date(Date.now() + 86400000).toISOString(),
    isUsed: false,
  },
];

const GUEST_TYPES = [
  { id: 'visitor', label: 'Guest', Icon: User },
  { id: 'delivery', label: 'Delivery', Icon: Truck },
  { id: 'service', label: 'Service', Icon: Wrench },
];

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

export default function PreApproveGuestScreen() {
  const router = useRouter();
  const [guestName, setGuestName] = useState('');
  const [guestType, setGuestType] = useState('visitor');
  const [passes, setPasses] = useState<GuestPass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const list = await GuestPassService.getResidentGuestPasses();
      if (list && list.length > 0) {
        setPasses(list);
      } else {
        setPasses(FALLBACK_PASSES);
      }
    } catch (err: any) {
      console.warn('Failed to load guest passes from API:', err.message || err);
      setPasses(FALLBACK_PASSES);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleCreatePass = async () => {
    if (!guestName.trim()) {
      Alert.alert('Missing Field', 'Please enter your guest\'s name.');
      return;
    }
    triggerHaptic();
    setIsSubmitting(true);

    try {
      const validToDate = new Date(Date.now() + 86400000).toISOString(); // 24 Hours validity
      const newPass = await GuestPassService.createGuestPass(guestName.trim(), validToDate);

      if (newPass) {
        setPasses([newPass, ...passes]);
      } else {
        const localNew: GuestPass = {
          id: `gp_${Date.now()}`,
          guestName: guestName.trim(),
          token: Math.random().toString(36).substring(2, 8).toUpperCase(),
          validTo: validToDate,
          isUsed: false,
        };
        setPasses([localNew, ...passes]);
      }
      setGuestName('');
      Alert.alert('Gate Pass Generated', 'Share the pass code with your guest for easy entry.');
    } catch {
      Alert.alert('Request Failed', 'Could not create guest pass.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = (code: string) => {
    triggerHaptic();
    Clipboard.setString(code);
    Alert.alert('Copied to Clipboard', `Entry code ${code} is ready to share.`);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <View style={[uiStyles.scroll, { paddingTop: Platform.OS === 'ios' ? 50 : 20, flex: 1 }]}>
          {/* Header */}
          <View style={uiStyles.header}>
            <Pressable
              style={uiStyles.iconBtn}
              onPress={() => {
                triggerHaptic();
                router.back();
              }}
              hitSlop={12}
            >
              <ArrowLeft size={22} color="#11111E" strokeWidth={2.2} />
            </Pressable>
            <Text variant="h3" weight="bold" style={type.navTitle}>
              Pre-Approve Guest
            </Text>
            <View style={{ width: 46 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
            }
          >
            {/* Generate form card */}
            <Animated.View entering={FadeInUp.duration(400)}>
              <AppSectionCard label="New Gate Pass">
                <View style={styles.formContainer}>
                  {/* Visitor Type Selector */}
                  <View style={styles.formGroup}>
                    <Text style={uiStyles.sectionLabel}>Visitor Type</Text>
                    <View style={styles.typeRow}>
                      {GUEST_TYPES.map((t) => {
                        const isSelected = guestType === t.id;
                        const Icon = t.Icon;
                        return (
                          <Pressable
                            key={t.id}
                            onPress={() => {
                              triggerHaptic();
                              setGuestType(t.id);
                            }}
                            style={[styles.typePill, isSelected && styles.typePillActive]}
                          >
                            <Icon size={14} color={isSelected ? '#FFFFFF' : '#4A5568'} style={{ marginRight: 4 }} />
                            <Text style={[styles.typeText, isSelected && styles.typeTextActive]}>
                              {t.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Name Input */}
                  <View style={styles.formGroup}>
                    <Text style={uiStyles.sectionLabel}>Guest Name</Text>
                    <View style={uiStyles.searchInner}>
                      <TextInput
                        style={uiStyles.searchInput}
                        placeholder="Enter full name of visitor"
                        placeholderTextColor="#A3A1A8"
                        value={guestName}
                        onChangeText={setGuestName}
                      />
                    </View>
                  </View>

                  <Pressable
                    onPress={handleCreatePass}
                    disabled={isSubmitting}
                    style={({ pressed }) => [
                      styles.submitBtn,
                      pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                    ]}
                  >
                    <Text style={styles.submitBtnText}>
                      {isSubmitting ? 'Creating...' : 'Generate Entry Pass'}
                    </Text>
                  </Pressable>
                </View>
              </AppSectionCard>
            </Animated.View>

            {/* Active passes list */}
            {isLoading ? (
              <ListSkeleton count={2} />
            ) : (
              <Animated.View entering={FadeInUp.duration(400).delay(80)}>
                <AppSectionCard label="Active Pre-approved Passes">
                  {passes.length === 0 ? (
                    <View style={uiStyles.emptyState}>
                      <Key size={40} color="#A3A1A8" strokeWidth={1.5} />
                      <Text style={uiStyles.emptyText}>No active gate passes created</Text>
                    </View>
                  ) : (
                    passes.map((item, idx) => {
                      const expDate = new Date(item.validTo).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      });
                      return (
                        <AppListItem
                          key={item.id}
                          Icon={UserPlus}
                          title={item.guestName}
                          subtitle={`Expires: ${expDate}`}
                          rightElement={
                            <Pressable
                              style={styles.codeBadge}
                              onPress={() => handleCopyCode(item.token)}
                            >
                              <Text style={styles.codeText}>{item.token}</Text>
                              <Copy size={12} color="#2E7D32" style={{ marginLeft: 6 }} />
                            </Pressable>
                          }
                          isLast={idx === passes.length - 1}
                        />
                      );
                    })
                  )}
                </AppSectionCard>
              </Animated.View>
            )}
          </ScrollView>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    paddingVertical: 4,
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  typePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.035)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typePillActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  typeText: {
    fontSize: 12,
    fontFamily: 'InterMedium',
    color: '#4A5568',
  },
  typeTextActive: {
    color: '#FFFFFF',
    fontFamily: 'InterBold',
  },
  submitBtn: {
    backgroundColor: '#2E7D32',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'InterBold',
    fontWeight: 'bold',
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.15)',
  },
  codeText: {
    fontSize: 13,
    fontFamily: 'ManropeBold',
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});
