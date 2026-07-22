import React, { useRef } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
  Alert,
  Clipboard,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';
import { Text } from '@repo/ui';
import { X, Copy, ImageDown } from 'lucide-react-native';
import { GuestPass } from '@/services/GuestPassService';
import * as Haptics from 'expo-haptics';

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

interface GuestPassQRModalProps {
  pass: GuestPass | null;
  onClose: () => void;
}

export function GuestPassQRModal({ pass, onClose }: GuestPassQRModalProps) {
  const qrSvgRef = useRef<any>(null);

  const handleCopyCode = (code: string) => {
    triggerHaptic();
    Clipboard.setString(code);
    Alert.alert('Copied to Clipboard', `Entry code ${code} is ready to share.`);
  };

  const handleSharePass = async (p: GuestPass) => {
    triggerHaptic();
    try {
      const validLabel = new Date(p.validTo).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const message = `Hi! Here is your entry pass code for Ambit:\nCode: ${p.token}\nValid until: ${validLabel}.\nSee you soon!`;
      await Share.share({ message });
    } catch {
      // ignore
    }
  };

  const handleShareAsImage = async (p: GuestPass) => {
    triggerHaptic();
    if (!qrSvgRef.current) {
      Alert.alert('Error', 'QR Code is not ready yet.');
      return;
    }
    try {
      qrSvgRef.current.toDataURL(async (base64Data: string) => {
        const fileUri = `${FileSystem.cacheDirectory}ambit_pass_${p.token}.jpg`;
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
          dialogTitle: `Ambit Gate Pass - ${p.guestName}`,
        });
      });
    } catch {
      Alert.alert('Share Failed', 'Could not share QR code image.');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={pass !== null}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Modal Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Guest Gate Pass</Text>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <X size={18} color="#4A5568" />
            </Pressable>
          </View>

          {pass && (
            <View style={styles.content}>
              <Text style={styles.guestName}>{pass.guestName}</Text>
              <Text style={styles.validity}>
                Valid until:{' '}
                {new Date(pass.validTo).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>

              {/* QR Code */}
              <View style={styles.qrContainer}>
                <QRCode
                  value={pass.token}
                  size={180}
                  color="#1E4D2B"
                  backgroundColor="#FFFFFF"
                  logo={require('../../../../assets/ambit_logo.png')}
                  logoSize={40}
                  logoBorderRadius={10}
                  logoBackgroundColor="#FFFFFF"
                  quietZone={15}
                  getRef={(ref) => { qrSvgRef.current = ref; }}
                />
              </View>

              {/* Token Display */}
              <Text style={styles.tokenText}>{pass.token}</Text>

              {/* Actions */}
              <View style={styles.actionsRow}>
                <Pressable
                  onPress={() => handleCopyCode(pass.token)}
                  style={[styles.btn, styles.btnSec]}
                >
                  <Copy size={16} color="#1E4D2B" style={{ marginRight: 6 }} />
                  <Text style={styles.btnTextSec}>Copy Code</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleShareAsImage(pass)}
                  style={[styles.btn, styles.btnPri]}
                >
                  <ImageDown size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.btnTextPri}>Share QR</Text>
                </Pressable>
              </View>

              {/* Share as text */}
              <Pressable onPress={() => handleSharePass(pass)} style={styles.shareTextBtn}>
                <Text style={styles.shareTextBtnText}>Share as text message instead</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  btnTextPri: { color: '#FFFFFF', fontSize: 14, fontFamily: 'InterBold', fontWeight: 'bold' },
  btnTextSec: { color: '#1E4D2B', fontSize: 14, fontFamily: 'InterBold', fontWeight: 'bold' },
  shareTextBtn: { marginTop: 16, alignItems: 'center', paddingVertical: 8 },
  shareTextBtnText: {
    fontSize: 13,
    fontFamily: 'InterMedium',
    color: '#8E8D94',
    textDecorationLine: 'underline',
  },
});
