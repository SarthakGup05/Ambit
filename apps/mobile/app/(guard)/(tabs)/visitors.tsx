import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Screen, Text, ListSkeleton } from '@repo/ui';
import { ScreenBackground, AppSectionCard, useToast, AppEmptyState } from '@/components/common';
import { type, uiStyles } from '@/theme';
import {
  VisitorService,
  ResidentDirectoryMember,
} from '@/services/VisitorService';
import {
  GuestPassService,
  VerifyPassResult,
} from '@/services/GuestPassService';
import { useVisitorStore } from '@/store';
import {
  UserPlus,
  QrCode,
  Search,
  CheckCircle2,
  XCircle,
  Package,
  Car,
  User,
  Wrench,
  Building2,
  ArrowRight,
  Sparkles,
  Clock,
  X,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

function triggerHaptic(style = Haptics.ImpactFeedbackStyle.Light) {
  try {
    Haptics.impactAsync(style).catch(() => {});
  } catch {
    // ignore
  }
}

type TabType = 'register' | 'verify' | 'directory';

const PURPOSES = [
  { id: 'Delivery', label: 'Delivery', Icon: Package },
  { id: 'Cab', label: 'Cab / Taxi', Icon: Car },
  { id: 'Guest', label: 'Personal Guest', Icon: User },
  { id: 'Service', label: 'Service / Worker', Icon: Wrench },
];

function parseErrorMsg(err: any): string {
  const data = err?.response?.data;
  if (data) {
    if (typeof data.error === 'string') return data.error;
    if (typeof data.error === 'object' && data.error?.message) return String(data.error.message);
    if (typeof data.message === 'string') return data.message;
  }
  if (typeof err?.message === 'string') return err.message;
  return 'Could not register visitor. Please check server connection.';
}

export default function GuardVisitorsTab() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('register');

  useEffect(() => {
    if (params?.tab && ['register', 'verify', 'directory'].includes(params.tab)) {
      setActiveTab(params.tab as TabType);
    }
  }, [params?.tab]);

  // Register Form State
  const [flatNumber, setFlatNumber] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('Delivery');
  const [registering, setRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  // Verify Pass State
  const [passCode, setPassCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [simCode, setSimCode] = useState('');
  const [permission, requestPermission] = useCameraPermissions();

  // Directory State
  const [directory, setDirectory] = useState<ResidentDirectoryMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDirectory, setLoadingDirectory] = useState(false);

  const fetchDirectory = useCallback(async () => {
    setLoadingDirectory(true);
    try {
      const data = await VisitorService.getResidentDirectory();
      setDirectory(data);
    } catch (err) {
      console.warn('Failed to load resident directory:', err);
    } finally {
      setLoadingDirectory(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'directory') {
      fetchDirectory();
    }
  }, [activeTab, fetchDirectory]);

  const handleRegister = async () => {
    if (!flatNumber.trim() || !visitorName.trim()) {
      toast.warning('Required Fields', 'Please enter flat number and visitor name.');
      return;
    }
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setRegistering(true);
    setRegisterSuccess(null);
    try {
      const newVisitor = await VisitorService.registerVisitor({
        flatNumber: flatNumber.trim().toUpperCase(),
        name: visitorName.trim(),
        phone: visitorPhone.trim(),
        purpose: selectedPurpose,
        autoCheckIn: true,
      });
      if (newVisitor) {
        useVisitorStore.getState().addVisitor(newVisitor);
      }
      triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
      const entryTimeStr = new Date(newVisitor?.checkInTime || Date.now()).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const msg = `Checked in ${visitorName} (Flat ${flatNumber.toUpperCase()}) at ${entryTimeStr}`;
      setRegisterSuccess(msg);
      toast.success('Visitor Checked In', msg);
      setVisitorName('');
      setVisitorPhone('');
    } catch (err: any) {
      toast.error('Registration Failed', parseErrorMsg(err));
    } finally {
      setRegistering(false);
    }
  };

  const handleVerifyPass = async () => {
    if (!passCode.trim()) {
      toast.warning('Missing Pass Code', 'Please enter a 6-character pass code.');
      return;
    }
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setVerifying(true);
    try {
      const res = await GuestPassService.verifyGuestPass(passCode.trim());
      if (res.valid) {
        useVisitorStore.getState().fetchVisitors('all');
        triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
        toast.success('ACCESS GRANTED', `Guest: ${res.pass?.guestName} (Flat ${res.flatNumber})`);
      } else {
        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
        toast.error('ACCESS DENIED', res.error || 'Invalid or expired pass code');
      }
    } catch (err: any) {
      toast.error('Verification Error', 'Failed to connect to verification server');
    } finally {
      setVerifying(false);
    }
  };

  const handleScannedToken = async (scannedCode: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
    setScannerVisible(false);
    setPassCode(scannedCode);
    setSimCode('');
    
    // Automatically trigger verification
    setVerifying(true);
    try {
      const res = await GuestPassService.verifyGuestPass(scannedCode.trim());
      if (res.valid) {
        useVisitorStore.getState().fetchVisitors('all');
        triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
        toast.success('ACCESS GRANTED', `Guest: ${res.pass?.guestName} (Flat ${res.flatNumber})`);
      } else {
        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
        toast.error('ACCESS DENIED', res.error || 'Invalid or expired pass code');
      }
    } catch (err: any) {
      toast.error('Verification Error', 'Failed to connect to verification server');
    } finally {
      setVerifying(false);
    }
  };

  const handleStartScanning = async () => {
    triggerHaptic();
    if (!permission || !permission.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        setScannerVisible(true);
        return;
      }
    }
    setScannerVisible(true);
  };

  const filteredDirectory = directory.filter(
    (item) =>
      item.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <ScreenBackground />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Screen className="flex-1 bg-transparent" scrollable={false}>
          <View style={[styles.headerContainer, { paddingTop: insets.top + 16 }]}>
          <Text variant="h2" weight="bold" style={type.navTitle}>
            Visitor Gate Management
          </Text>
          <Text variant="caption" weight="medium" style={{ color: 'rgba(17,17,30,0.6)', marginTop: 2 }}>
            Register walk-ins, verify guest QR passes, or search directory
          </Text>

          {/* Segmented Control Header */}
          <View style={styles.segmentContainer}>
            <Pressable
              onPress={() => {
                triggerHaptic();
                setActiveTab('register');
              }}
              style={[styles.segmentBtn, activeTab === 'register' && styles.segmentBtnActive]}
            >
              <UserPlus size={16} color={activeTab === 'register' ? '#FFFFFF' : '#11111E'} />
              <Text
                variant="caption"
                weight="bold"
                style={[styles.segmentText, activeTab === 'register' && styles.segmentTextActive]}
              >
                Register
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                triggerHaptic();
                setActiveTab('verify');
              }}
              style={[styles.segmentBtn, activeTab === 'verify' && styles.segmentBtnActive]}
            >
              <QrCode size={16} color={activeTab === 'verify' ? '#FFFFFF' : '#11111E'} />
              <Text
                variant="caption"
                weight="bold"
                style={[styles.segmentText, activeTab === 'verify' && styles.segmentTextActive]}
              >
                Verify Code
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                triggerHaptic();
                setActiveTab('directory');
              }}
              style={[styles.segmentBtn, activeTab === 'directory' && styles.segmentBtnActive]}
            >
              <Search size={16} color={activeTab === 'directory' ? '#FFFFFF' : '#11111E'} />
              <Text
                variant="caption"
                weight="bold"
                style={[styles.segmentText, activeTab === 'directory' && styles.segmentTextActive]}
              >
                Flats
              </Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[uiStyles.scroll, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* TAB 1: REGISTER VISITOR */}
          {activeTab === 'register' && (
            <Animated.View entering={FadeInUp.duration(300)}>
              {registerSuccess && (
                <View style={styles.successBanner}>
                  <CheckCircle2 size={20} color="#2E7D32" />
                  <Text variant="body" weight="bold" style={styles.successText}>
                    {registerSuccess}
                  </Text>
                </View>
              )}

              <AppSectionCard label="Entry Details">
                {/* Flat Number Input */}
                <Text variant="caption" weight="bold" style={styles.inputLabel}>
                  TARGET FLAT NUMBER *
                </Text>
                <View style={styles.inputWrapper}>
                  <Building2 size={18} color="#4E6D3B" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. A-102, B-501"
                    placeholderTextColor="rgba(17,17,30,0.4)"
                    value={flatNumber}
                    onChangeText={setFlatNumber}
                    autoCapitalize="characters"
                  />
                </View>

                {/* Visitor Purpose Selector */}
                <Text variant="caption" weight="bold" style={styles.inputLabel}>
                  ENTRY PURPOSE
                </Text>
                <View style={styles.purposeGrid}>
                  {PURPOSES.map((item) => {
                    const isSelected = selectedPurpose === item.id;
                    const IconComp = item.Icon;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => {
                          triggerHaptic();
                          setSelectedPurpose(item.id);
                        }}
                        style={[styles.purposeCard, isSelected && styles.purposeCardSelected]}
                      >
                        <IconComp size={20} color={isSelected ? '#FFFFFF' : '#4E6D3B'} />
                        <Text
                          variant="caption"
                          weight="bold"
                          style={[styles.purposeText, isSelected && styles.purposeTextSelected]}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Visitor Name */}
                <Text variant="caption" weight="bold" style={styles.inputLabel}>
                  VISITOR NAME *
                </Text>
                <View style={styles.inputWrapper}>
                  <User size={18} color="#4E6D3B" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name (or Delivery Agency)"
                    placeholderTextColor="rgba(17,17,30,0.4)"
                    value={visitorName}
                    onChangeText={setVisitorName}
                  />
                </View>

                {/* Visitor Phone */}
                <Text variant="caption" weight="bold" style={styles.inputLabel}>
                  PHONE NUMBER (OPTIONAL)
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="+91 98765 43210"
                    placeholderTextColor="rgba(17,17,30,0.4)"
                    keyboardType="phone-pad"
                    value={visitorPhone}
                    onChangeText={setVisitorPhone}
                  />
                </View>

                {/* Automatic Entry Timestamp Preview */}
                <View style={styles.timeInfoBox}>
                  <Clock size={16} color="#4E6D3B" />
                  <Text variant="caption" weight="medium" style={{ color: '#4E6D3B', flex: 1 }}>
                    Auto Entry Timestamp:{' '}
                    <Text variant="caption" weight="bold" style={{ color: '#4E6D3B' }}>
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </Text>
                </View>

                {/* Submit Action Button */}
                <Pressable
                  onPress={handleRegister}
                  disabled={registering}
                  style={styles.submitBtn}
                >
                  {registering ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text variant="body" weight="bold" style={styles.submitBtnText}>
                        CHECK IN AT GATE
                      </Text>
                      <ArrowRight size={20} color="#FFFFFF" />
                    </>
                  )}
                </Pressable>
              </AppSectionCard>
            </Animated.View>
          )}

          {/* TAB 2: VERIFY PASSCODE / QR */}
          {activeTab === 'verify' && (
            <Animated.View entering={FadeInUp.duration(300)}>
              <AppSectionCard label="Guest Pass Verification">
                {/* SCAN QR Button */}
                <Pressable
                  onPress={handleStartScanning}
                  style={[styles.submitBtn, { backgroundColor: '#1E4D2B', marginBottom: 16 }]}
                >
                  <QrCode size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text variant="body" weight="bold" style={styles.submitBtnText}>
                    SCAN QR CODE PASS
                  </Text>
                </Pressable>

                <Text variant="caption" weight="bold" style={styles.inputLabel}>
                  OR ENTER 6-DIGIT PASS CODE / QR TOKEN
                </Text>
                <View style={styles.inputWrapper}>
                  <QrCode size={20} color="#4E6D3B" style={{ marginRight: 10 }} />
                  <TextInput
                    style={[styles.input, { letterSpacing: 2, fontSize: 18, fontFamily: 'InterBold' }]}
                    placeholder="e.g. AB1234"
                    placeholderTextColor="rgba(17,17,30,0.4)"
                    value={passCode}
                    onChangeText={(t) => setPassCode(t.toUpperCase())}
                    maxLength={10}
                    autoCapitalize="characters"
                  />
                </View>
 
                <Pressable
                  onPress={handleVerifyPass}
                  disabled={verifying}
                  style={styles.submitBtn}
                >
                  {verifying ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Sparkles size={20} color="#FFFFFF" />
                      <Text variant="body" weight="bold" style={styles.submitBtnText}>
                        VERIFY PASS CODE
                      </Text>
                    </>
                  )}
                </Pressable>
              </AppSectionCard>
            </Animated.View>
          )}

          {/* TAB 3: FLAT DIRECTORY */}
          {activeTab === 'directory' && (
            <Animated.View entering={FadeInUp.duration(300)}>
              <AppSectionCard label="Society Resident Directory">
                <View style={styles.inputWrapper}>
                  <Search size={18} color="rgba(17,17,30,0.5)" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="Search flat number or resident..."
                    placeholderTextColor="rgba(17,17,30,0.4)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                {loadingDirectory ? (
                  <ListSkeleton count={3} />
                ) : filteredDirectory.length === 0 ? (
                  <AppEmptyState
                    icon={Search}
                    title="No Matching Flats"
                    description={`Could not find any resident matching "${searchQuery}".`}
                  />
                ) : (
                  filteredDirectory.map((member) => (
                    <Pressable
                      key={member.id}
                      onPress={() => {
                        triggerHaptic();
                        setFlatNumber(member.flatNumber);
                        setActiveTab('register');
                      }}
                      style={styles.directoryTile}
                    >
                      <View style={styles.flatBadge}>
                        <Text variant="caption" weight="bold" style={{ color: '#4E6D3B' }}>
                          {member.flatNumber}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text variant="body" weight="bold" style={{ color: '#11111E' }}>
                          {member.name}
                        </Text>
                        <Text variant="caption" weight="medium" style={{ color: 'rgba(17,17,30,0.6)' }}>
                          {member.email}
                        </Text>
                      </View>
                      <View style={styles.quickEntryBtn}>
                        <Text variant="caption" weight="bold" style={{ color: '#FFFFFF' }}>
                          Select Flat
                        </Text>
                      </View>
                    </Pressable>
                  ))
                )}
              </AppSectionCard>
            </Animated.View>
          )}
        </ScrollView>
      </Screen>
    </KeyboardAvoidingView>

    {/* Live Scanner Modal with Simulator Fallback */}
    <Modal
      animationType="slide"
      transparent={false}
      visible={scannerVisible}
      onRequestClose={() => setScannerVisible(false)}
      statusBarTranslucent
    >
      <View style={styles.scannerModalContainer}>
        {permission && permission.granted ? (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={({ data }) => {
              if (data) {
                handleScannedToken(data);
              }
            }}
          />
        ) : (
          <View style={styles.noCameraContainer}>
            <QrCode size={48} color="#1E4D2B" style={{ marginBottom: 16 }} />
            <Text variant="h3" weight="bold" style={{ color: '#1C1B1F', textAlign: 'center', marginBottom: 8 }}>
              Camera Mode Unavailable
            </Text>
            <Text variant="body" style={{ color: '#8E8D94', textAlign: 'center', paddingHorizontal: 32, marginBottom: 24 }}>
              Running on a simulator or camera permission is denied. Use the simulator tool below to test the visitor verification workflow.
            </Text>
          </View>
        )}

        {/* Overlay scanning viewfinder grid frame */}
        {permission && permission.granted && (
          <View style={styles.overlayFrame}>
            <View style={styles.viewfinder} />
            <Text style={styles.scanText}>Position the visitor's QR Code inside the frame</Text>
          </View>
        )}

        {/* Dev Simulator Panel at the bottom of scanner screen */}
        <View style={styles.scannerFooter}>
          <Text style={styles.devLabel}>EXPO GO / SIMULATOR SCANNER TOOL</Text>
          <View style={styles.simRow}>
            <TextInput
              style={styles.simInput}
              placeholder="Enter Code (e.g. AMB39A)"
              placeholderTextColor="rgba(17,17,30,0.4)"
              value={simCode}
              onChangeText={(t) => setSimCode(t.toUpperCase())}
              autoCapitalize="characters"
            />
            <Pressable
              style={styles.simBtn}
              onPress={() => {
                if (simCode.trim()) {
                  handleScannedToken(simCode.trim());
                }
              }}
            >
              <Text style={styles.simBtnText}>Simulate Scan</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => setScannerVisible(false)}
            style={styles.cancelScanBtn}
          >
            <Text style={styles.cancelScanText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(17,17,30,0.06)',
    borderRadius: 16,
    padding: 4,
    marginTop: 16,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#4E6D3B',
  },
  segmentText: {
    color: '#11111E',
    fontSize: 13,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 11,
    letterSpacing: 1,
    color: 'rgba(17,17,30,0.6)',
    marginBottom: 8,
    marginTop: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(17,17,30,0.12)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#11111E',
    padding: 0,
  },
  purposeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  purposeCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(17,17,30,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(17,17,30,0.08)',
    gap: 8,
  },
  purposeCardSelected: {
    backgroundColor: '#4E6D3B',
    borderColor: '#4E6D3B',
  },
  purposeText: {
    color: '#4E6D3B',
    fontSize: 13,
  },
  purposeTextSelected: {
    color: '#FFFFFF',
  },
  submitBtn: {
    marginTop: 24,
    backgroundColor: '#4E6D3B',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    gap: 10,
  },
  successText: {
    color: '#2E7D32',
    flex: 1,
    fontSize: 14,
  },
  grantedCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#81C784',
  },
  deniedCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E57373',
  },
  grantedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultDetails: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(46,125,50,0.2)',
  },
  directoryTile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17,17,30,0.06)',
  },
  flatBadge: {
    backgroundColor: '#E4EFE0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  quickEntryBtn: {
    backgroundColor: '#4E6D3B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  timeInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4EFE0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
    gap: 8,
  },
  scannerModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  noCameraContainer: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  overlayFrame: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  viewfinder: {
    width: 240,
    height: 240,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#1E4D2B',
    backgroundColor: 'transparent',
    shadowColor: '#1E4D2B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  scanText: {
    color: '#FFFFFF',
    marginTop: 24,
    fontSize: 14,
    fontFamily: 'InterMedium',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scannerFooter: {
    backgroundColor: '#FAF8F5',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  devLabel: {
    fontSize: 10,
    fontFamily: 'InterBold',
    color: '#8E8D94',
    letterSpacing: 1.2,
    marginBottom: 10,
    textAlign: 'center',
  },
  simRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  simInput: {
    flex: 1,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.035)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: 'InterBold',
    color: '#1C1B1F',
  },
  simBtn: {
    backgroundColor: '#1E4D2B',
    paddingHorizontal: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  simBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'InterBold',
    fontWeight: 'bold',
  },
  cancelScanBtn: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  cancelScanText: {
    color: '#4A5568',
    fontSize: 14,
    fontFamily: 'InterBold',
    fontWeight: 'bold',
  },
});
