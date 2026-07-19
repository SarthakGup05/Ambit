import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Modal,
  Share,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Screen, Text, ListSkeleton } from '@repo/ui';
import { ScreenBackground, AppSectionCard, AppListItem, AppEmptyState } from '@/components/common';
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
  X,
  ImageDown,
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
  const [selectedPassForQr, setSelectedPassForQr] = useState<GuestPass | null>(null);
  const qrSvgRef = useRef<any>(null);

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

      let createdPass: GuestPass;
      if (newPass) {
        createdPass = newPass;
        setPasses((prev) => [newPass, ...prev]);
      } else {
        createdPass = {
          id: `gp_${Date.now()}`,
          guestName: guestName.trim(),
          token: Math.random().toString(36).substring(2, 8).toUpperCase(),
          validTo: validToDate,
          isUsed: false,
        };
        setPasses((prev) => [createdPass, ...prev]);
      }
      setGuestName('');
      // Immediately show QR modal for the newly created pass
      setSelectedPassForQr(createdPass);
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

  const handleSharePass = async (pass: GuestPass) => {
    triggerHaptic();
    try {
      const message = `Hi! Here is your entry pass code for Ambit:\nCode: ${pass.token}\nValid until: ${new Date(pass.validTo).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.\nSee you soon!`;
      await Share.share({ message });
    } catch (err) {
      // ignore
    }
  };

  const handleShareAsImage = async (pass: GuestPass) => {
    triggerHaptic();
    if (!qrSvgRef.current) {
      Alert.alert('Error', 'QR Code is not ready yet.');
      return;
    }
    try {
      qrSvgRef.current.toDataURL(async (base64Data: string) => {
        const fileUri = `${FileSystem.cacheDirectory}ambit_pass_${pass.token}.jpg`;
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const canShare = await Sharing.isAvailableAsync();
        if (!canShare) {
          Alert.alert('Sharing Not Available', 'Sharing is not supported on this device.');
          return;
        }
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/jpeg',
          dialogTitle: `Ambit Gate Pass - ${pass.guestName}`,
        });
      });
    } catch (err) {
      Alert.alert('Share Failed', 'Could not share QR code image.');
    }
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
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E4D2B" />
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
                      { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }
                    ]}
                  >
                    <View style={styles.submitBtn}>
                      <Text style={styles.submitBtnText}>
                        {isSubmitting ? 'Creating...' : 'Generate QR Entry Pass'}
                      </Text>
                    </View>
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
                    <AppEmptyState
                      icon={Key}
                      title="No Gate Passes Created"
                      description="Create a guest pass to allow visitors fast and seamless gate verification."
                    />
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
                          onPress={() => {
                            triggerHaptic();
                            setSelectedPassForQr(item);
                          }}
                          rightElement={
                            <Pressable
                              style={styles.codeBadge}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleCopyCode(item.token);
                              }}
                            >
                              <Text style={styles.codeText}>{item.token}</Text>
                              <Copy size={12} color="#1E4D2B" style={{ marginLeft: 6 }} />
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

      {/* QR Code Pass Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={selectedPassForQr !== null}
        onRequestClose={() => setSelectedPassForQr(null)}
        statusBarTranslucent
      >
        <View style={qrStyles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedPassForQr(null)} />
          <View style={qrStyles.sheet}>
            {/* Header */}
            <View style={qrStyles.header}>
              <Text style={qrStyles.headerTitle}>Guest Gate Pass</Text>
              <Pressable style={qrStyles.closeBtn} onPress={() => setSelectedPassForQr(null)}>
                <X size={18} color="#4A5568" />
              </Pressable>
            </View>

            {selectedPassForQr && (
              <View style={qrStyles.content}>
                <Text style={qrStyles.guestName}>{selectedPassForQr.guestName}</Text>
                <Text style={qrStyles.validity}>
                  Valid until:{' '}
                  {new Date(selectedPassForQr.validTo).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>

                {/* QR Code Container */}
                <View style={qrStyles.qrContainer}>
                  <QRCode
                    value={selectedPassForQr.token}
                    size={180}
                    color="#1E4D2B"
                    backgroundColor="#FFFFFF"
                    logo={require('../../assets/ambit_logo.png')}
                    logoSize={40}
                    logoBorderRadius={10}
                    logoBackgroundColor="#FFFFFF"
                    quietZone={15}
                    getRef={(ref) => { qrSvgRef.current = ref; }}
                  />
                </View>

                {/* Large Code Display */}
                <Text style={qrStyles.tokenText}>{selectedPassForQr.token}</Text>

                {/* Actions */}
                <View style={qrStyles.actionsRow}>
                  <Pressable
                    onPress={() => handleCopyCode(selectedPassForQr.token)}
                    style={[qrStyles.btn, qrStyles.btnSec]}
                  >
                    <Copy size={16} color="#1E4D2B" style={{ marginRight: 6 }} />
                    <Text style={qrStyles.btnTextSec}>Copy Code</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleShareAsImage(selectedPassForQr)}
                    style={[qrStyles.btn, qrStyles.btnPri]}
                  >
                    <ImageDown size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={qrStyles.btnTextPri}>Share QR</Text>
                  </Pressable>
                </View>

                {/* Share text pass link */}
                <Pressable
                  onPress={() => handleSharePass(selectedPassForQr)}
                  style={qrStyles.shareTextBtn}
                >
                  <Text style={qrStyles.shareTextBtnText}>Share as text message instead</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#1E4D2B',
    borderColor: '#1E4D2B',
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
    backgroundColor: '#1E4D2B',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#1E4D2B',
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
    backgroundColor: 'rgba(30, 77, 43, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(30, 77, 43, 0.15)',
  },
  codeText: {
    fontSize: 13,
    fontFamily: 'ManropeBold',
    color: '#1E4D2B',
    fontWeight: 'bold',
  },
});

const qrStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'ManropeBold',
    color: '#1C1B1F',
    fontWeight: 'bold',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  guestName: {
    fontSize: 22,
    fontFamily: 'ManropeBold',
    fontWeight: '700',
    color: '#1C1B1F',
  },
  validity: {
    fontSize: 12,
    fontFamily: 'InterMedium',
    color: '#8E8D94',
    marginTop: 4,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 28,
    marginTop: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(30, 77, 43, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  tokenText: {
    fontSize: 26,
    fontFamily: 'InterBold',
    fontWeight: 'bold',
    color: '#1E4D2B',
    letterSpacing: 4,
    marginTop: 18,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnPri: {
    backgroundColor: '#1E4D2B',
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  btnSec: {
    backgroundColor: 'rgba(30, 77, 43, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(30, 77, 43, 0.15)',
  },
  btnTextPri: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'InterBold',
    fontWeight: 'bold',
  },
  btnTextSec: {
    color: '#1E4D2B',
    fontSize: 14,
    fontFamily: 'InterBold',
    fontWeight: 'bold',
  },
  shareTextBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  shareTextBtnText: {
    fontSize: 13,
    fontFamily: 'InterMedium',
    color: '#8E8D94',
    textDecorationLine: 'underline',
  },
});
