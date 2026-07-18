import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Clipboard, Platform, Alert, ScrollView, Share } from 'react-native';
import { Screen, Text, SettingsSkeleton } from '@repo/ui';
import { ScreenBackground, AppSectionCard, AppListItem } from '@/components/common';
import { uiStyles, type } from '@/theme';
import { useRouter } from 'expo-router';
import { ArrowLeft, Building2, ClipboardCopy, Calendar, MapPin, KeyRound, Share2 } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
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
    } catch {
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

  const handleShareCode = async () => {
    triggerHaptic();
    if (society?.inviteCode) {
      try {
        await Share.share({
          message: `Join ${society.name} on Ambit! Use our Society Invite Code: ${society.inviteCode} during registration.`,
          title: `Join ${society.name}`,
        });
      } catch (error) {
        console.warn('Failed to share invite code:', error);
      }
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
        <View style={[uiStyles.scroll, { paddingTop: Platform.OS === 'ios' ? 50 : 20, flex: 1 }]}>
          {/* Header */}
          <View style={uiStyles.header}>
            <Pressable style={uiStyles.iconBtn} onPress={handleBack} hitSlop={12}>
              <ArrowLeft size={22} color="#11111E" strokeWidth={2.2} />
            </Pressable>
            <Text variant="h3" weight="bold" style={type.navTitle}>
              Society Details
            </Text>
            <View style={{ width: 46 }} />
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
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

                {/* Configurations List inside AppSectionCard */}
                <AppSectionCard label="Configurations">
                  <AppListItem
                    Icon={KeyRound}
                    title="Invite Code"
                    subtitle={society.inviteCode}
                    rightElement={
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Pressable style={styles.copyBtn} onPress={handleCopyCode}>
                          <ClipboardCopy size={16} color="#4A5568" strokeWidth={2} />
                        </Pressable>
                        <Pressable style={styles.copyBtn} onPress={handleShareCode}>
                          <Share2 size={16} color="#2E7D32" strokeWidth={2} />
                        </Pressable>
                      </View>
                    }
                  />
                  <AppListItem
                    Icon={MapPin}
                    title="Boundary Address"
                    subtitle={society.address}
                    hideChevron={true}
                  />
                  <AppListItem
                    Icon={Calendar}
                    title="Created On"
                    subtitle={formattedDate}
                    hideChevron={true}
                    isLast={true}
                  />
                </AppSectionCard>

                <Text style={styles.helperText}>
                  Share the invite code above with residents and security guards so they can join this society automatically during registration.
                </Text>

              </Animated.View>
            )}
          </ScrollView>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  societySummaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
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
  copyBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.035)',
    alignItems: 'center',
    justifyContent: 'center',
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
