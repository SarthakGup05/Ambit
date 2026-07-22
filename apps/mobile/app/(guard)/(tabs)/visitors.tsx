import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Screen, Text } from '@repo/ui';
import { ScreenBackground } from '@/components/common';
import { type, uiStyles } from '@/theme';
import { VisitorService, ResidentDirectoryMember } from '@/services/VisitorService';
import { GuestPassService } from '@/services/GuestPassService';
import { useVisitorStore } from '@/store';
import { UserPlus, QrCode, Search } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import {
  RegisterVisitorPanel,
  VerifyPassPanel,
  ResidentDirectoryPanel,
} from '@/features/guard/components';
import { useToast } from '@/components/common';

function triggerHaptic(style = Haptics.ImpactFeedbackStyle.Light) {
  try {
    Haptics.impactAsync(style).catch(() => {});
  } catch {
    // ignore
  }
}

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

type TabType = 'register' | 'verify' | 'directory';

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
    if (activeTab === 'directory') fetchDirectory();
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
      if (newVisitor) useVisitorStore.getState().addVisitor(newVisitor);
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
    } catch {
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
    } catch {
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
            <Text
              variant="caption"
              weight="medium"
              style={{ color: 'rgba(17,17,30,0.6)', marginTop: 2 }}
            >
              Register walk-ins, verify guest QR passes, or search directory
            </Text>

            {/* Segmented Control */}
            <View style={styles.segmentContainer}>
              {([
                { key: 'register', label: 'Register', Icon: UserPlus },
                { key: 'verify', label: 'Verify Pass', Icon: QrCode },
                { key: 'directory', label: 'Flats', Icon: Search },
              ] as const).map(({ key, label, Icon }) => (
                <Pressable
                  key={key}
                  onPress={() => {
                    triggerHaptic();
                    setActiveTab(key);
                  }}
                  style={[styles.segmentBtn, activeTab === key && styles.segmentBtnActive]}
                >
                  <Icon size={14} color={activeTab === key ? '#FFFFFF' : '#11111E'} />
                  <Text
                    variant="caption"
                    weight="bold"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.85}
                    style={[styles.segmentText, activeTab === key && styles.segmentTextActive]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <ScrollView
            contentContainerStyle={[uiStyles.scroll, { paddingBottom: insets.bottom + 120 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {activeTab === 'register' && (
              <RegisterVisitorPanel
                flatNumber={flatNumber}
                setFlatNumber={setFlatNumber}
                visitorName={visitorName}
                setVisitorName={setVisitorName}
                visitorPhone={visitorPhone}
                setVisitorPhone={setVisitorPhone}
                selectedPurpose={selectedPurpose}
                setSelectedPurpose={setSelectedPurpose}
                registering={registering}
                registerSuccess={registerSuccess}
                onRegister={handleRegister}
              />
            )}

            {activeTab === 'verify' && (
              <VerifyPassPanel
                passCode={passCode}
                setPassCode={setPassCode}
                verifying={verifying}
                scannerVisible={scannerVisible}
                setScannerVisible={setScannerVisible}
                simCode={simCode}
                setSimCode={setSimCode}
                permissionGranted={!!(permission && permission.granted)}
                onVerifyPass={handleVerifyPass}
                onStartScanning={handleStartScanning}
                onScannedToken={handleScannedToken}
              />
            )}

            {activeTab === 'directory' && (
              <ResidentDirectoryPanel
                directory={directory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                loadingDirectory={loadingDirectory}
                onSelectFlat={(flat) => {
                  setFlatNumber(flat);
                  setActiveTab('register');
                }}
              />
            )}
          </ScrollView>
        </Screen>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(17,17,30,0.06)',
    borderRadius: 18,
    padding: 5,
    marginTop: 20,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderRadius: 14,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#4E6D3B',
  },
  segmentText: {
    color: '#11111E',
    fontSize: 12,
    fontFamily: 'InterMedium',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
});
