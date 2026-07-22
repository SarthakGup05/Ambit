import React from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import { Text } from '@repo/ui';
import { AppSectionCard, CustomSpinner } from '@/components/common';
import { CameraView } from 'expo-camera';
import { QrCode, Sparkles } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface VerifyPassPanelProps {
  passCode: string;
  setPassCode: (v: string) => void;
  verifying: boolean;
  scannerVisible: boolean;
  setScannerVisible: (v: boolean) => void;
  simCode: string;
  setSimCode: (v: string) => void;
  permissionGranted: boolean;
  onVerifyPass: () => void;
  onStartScanning: () => void;
  onScannedToken: (code: string) => void;
}

export function VerifyPassPanel({
  passCode,
  setPassCode,
  verifying,
  scannerVisible,
  setScannerVisible,
  simCode,
  setSimCode,
  permissionGranted,
  onVerifyPass,
  onStartScanning,
  onScannedToken,
}: VerifyPassPanelProps) {
  return (
    <>
      <Animated.View entering={FadeInUp.duration(300)}>
        <AppSectionCard label="Guest Pass Verification">
          {/* SCAN QR Button */}
          <Pressable
            onPress={onStartScanning}
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

          <Pressable onPress={onVerifyPass} disabled={verifying} style={styles.submitBtn}>
            {verifying ? (
              <CustomSpinner color="#FFFFFF" />
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

      {/* Live Scanner Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={scannerVisible}
        onRequestClose={() => setScannerVisible(false)}
        statusBarTranslucent
      >
        <View style={styles.scannerModalContainer}>
          {permissionGranted ? (
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={({ data }) => {
                if (data) onScannedToken(data);
              }}
            />
          ) : (
            <View style={styles.noCameraContainer}>
              <QrCode size={48} color="#1E4D2B" style={{ marginBottom: 16 }} />
              <Text
                variant="h3"
                weight="bold"
                style={{ color: '#1C1B1F', textAlign: 'center', marginBottom: 8 }}
              >
                Camera Mode Unavailable
              </Text>
              <Text
                variant="body"
                style={{
                  color: '#8E8D94',
                  textAlign: 'center',
                  paddingHorizontal: 32,
                  marginBottom: 24,
                }}
              >
                Running on a simulator or camera permission is denied. Use the simulator tool below
                to test the visitor verification workflow.
              </Text>
            </View>
          )}

          {/* Overlay scanning viewfinder */}
          {permissionGranted && (
            <View style={styles.overlayFrame}>
              <View style={styles.viewfinder} />
              <Text style={styles.scanText}>
                Position the visitor's QR Code inside the frame
              </Text>
            </View>
          )}

          {/* Dev Simulator Panel */}
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
                  if (simCode.trim()) onScannedToken(simCode.trim());
                }}
              >
                <Text style={styles.simBtnText}>Simulate Scan</Text>
              </Pressable>
            </View>

            <Pressable onPress={() => setScannerVisible(false)} style={styles.cancelScanBtn}>
              <Text style={styles.cancelScanText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    color: 'rgba(17,17,30,0.6)',
    marginBottom: 8,
    marginTop: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(17,17,30,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#11111E',
    padding: 0,
  },
  submitBtn: {
    marginTop: 28,
    backgroundColor: '#4E6D3B',
    borderRadius: 18,
    height: 54,
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
