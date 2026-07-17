import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Clipboard, Platform, Alert, ScrollView } from 'react-native';
import { Screen, Text, Button, SettingsSkeleton } from '@repo/ui';
import { ScreenBackground } from '@/components/common';
import { useRouter } from 'expo-router';
import { ArrowLeft, Building2, ClipboardCopy, Calendar, MapPin, KeyRound } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/axios';

interface SocietyInfo {
  id: string;
  name: string;
  address: string;
  inviteCode: string;
  createdAt: string;
}

export default function SocietySettingsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [society, setSociety] = useState<SocietyInfo | null>(null);

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    async function loadSociety() {
      try {
        const response = await api.get('/api/admin/society');
        if (response.data && response.data.society) {
          setSociety(response.data.society);
        }
      } catch (err: any) {
        console.warn("Failed to fetch society details:", err.message || err);
        // Fallback mock data
        setSociety({
          id: '1',
          name: 'Ambit Heights',
          address: '123 Security Avenue, Tech City',
          inviteCode: 'AMBIT1',
          createdAt: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadSociety();
  }, []);

  const handleCopyCode = () => {
    triggerHaptic();
    if (society?.inviteCode) {
      Clipboard.setString(society.inviteCode);
      Alert.alert("Success", "Invite code copied to clipboard!");
    }
  };

  const handleBack = () => {
    triggerHaptic();
    router.back();
  };

  const formattedDate = society?.createdAt 
    ? new Date(society.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <ScreenBackground />

      <Screen className="flex-1 bg-transparent" scrollable={false}>
        {/* Back navigation header */}
        <View style={styles.navHeader}>
          <Pressable style={styles.backBtn} onPress={handleBack}>
            <ArrowLeft size={18} color="#4A5568" />
          </Pressable>
          <Text style={styles.navTitle}>Society Details</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {isLoading || !society ? (
            <SettingsSkeleton />
          ) : (
            <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
              
              {/* Profile Card Summary */}
              <View style={styles.societySummaryCard}>
                <View style={styles.iconCircle}>
                  <Building2 size={24} color="#4A5568" strokeWidth={2} />
                </View>
                <Text style={styles.societyName}>{society.name}</Text>
                <Text style={styles.societySub}>{society.address}</Text>
              </View>

              {/* Configurations List */}
              <Text style={styles.sectionLabel}>Configurations</Text>
              
              <View style={styles.infoCard}>
                {/* Invite Code Row */}
                <View style={styles.infoRow}>
                  <View style={styles.rowIconWrapper}>
                    <KeyRound size={16} color="#4A5568" strokeWidth={2} />
                  </View>
                  <View style={styles.rowTextContainer}>
                    <Text style={styles.rowLabel}>Invite Code</Text>
                    <Text style={styles.codeText}>{society.inviteCode}</Text>
                  </View>
                  <Pressable style={styles.copyBtn} onPress={handleCopyCode}>
                    <ClipboardCopy size={16} color="#4A5568" strokeWidth={2} />
                  </Pressable>
                </View>

                <View style={styles.divider} />

                {/* Address Row */}
                <View style={styles.infoRow}>
                  <View style={styles.rowIconWrapper}>
                    <MapPin size={16} color="#4A5568" strokeWidth={2} />
                  </View>
                  <View style={styles.rowTextContainer}>
                    <Text style={styles.rowLabel}>Boundary Address</Text>
                    <Text style={styles.rowVal}>{society.address}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Established Row */}
                <View style={styles.infoRow}>
                  <View style={styles.rowIconWrapper}>
                    <Calendar size={16} color="#4A5568" strokeWidth={2} />
                  </View>
                  <View style={styles.rowTextContainer}>
                    <Text style={styles.rowLabel}>Created On</Text>
                    <Text style={styles.rowVal}>{formattedDate}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.helperText}>
                Share the invite code above with residents so they can join this society and assign their flats automatically.
              </Text>

            </Animated.View>
          )}
        </ScrollView>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.045)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16.5,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#1C1B1F',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
  },
  loadingContainer: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#8E8D94',
  },
  container: {
    gap: 20,
  },
  societySummaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(74, 85, 104, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  societyName: {
    fontSize: 20,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#1C1B1F',
    textAlign: 'center',
  },
  societySub: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#6B6873',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'InterBold',
    color: '#8E8D94',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginLeft: 4,
    marginBottom: -12,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  rowIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(74, 85, 104, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  rowLabel: {
    fontSize: 11,
    fontFamily: 'InterBold',
    color: '#8E8D94',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  rowVal: {
    fontSize: 14,
    fontFamily: 'InterMedium',
    color: '#1C1B1F',
    marginTop: 2,
  },
  codeText: {
    fontSize: 16,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#2E7D32',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  copyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.035)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(28, 27, 31, 0.08)',
    marginLeft: 56,
  },
  helperText: {
    fontSize: 11.5,
    fontFamily: 'Inter',
    color: '#8E8D94',
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
