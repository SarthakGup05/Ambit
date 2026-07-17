import React from 'react';
import { View, StyleSheet, Pressable, Platform, ScrollView, Alert } from 'react-native';
import { Screen, Text } from '@repo/ui';
import { ScreenBackground } from '@/components/common';
import { useRouter } from 'expo-router';
import {
  Building2,
  Users,
  ShieldCheck,
  ClipboardList,
  Megaphone,
  CreditCard,
  ChevronRight,
} from 'lucide-react-native';
import Animated, { ZoomIn, FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function ManageTab() {
  const router = useRouter();

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <ScreenBackground />

      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Animated.View entering={ZoomIn.duration(400).delay(50)}>
                <Text style={styles.brandText}>Ambit</Text>
              </Animated.View>
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
            </View>

            <View style={styles.greetingSection}>
              <Animated.View entering={FadeIn.duration(350).delay(150)}>
                <Text variant="h2" className="font-bold text-[#11111E]">
                  Manage
                </Text>
              </Animated.View>
              <Text style={styles.descriptionText}>
                Administer your society, members, and operations.
              </Text>
            </View>
          </View>

          {/* Grouped Action Lists */}
          <View style={styles.settingsContainer}>
            
            {/* Section 1: Operations */}
            <Animated.View entering={FadeInUp.duration(400).delay(100)}>
              <Text style={styles.sectionLabel}>Operations</Text>
            </Animated.View>
            
            <Animated.View entering={FadeInUp.duration(400).delay(150)} style={styles.sectionCard}>
              <ManageItem
                Icon={Building2}
                title="Society Settings"
                description="Configure towers, flats & invite code"
                valueText="AMB824"
                onPress={() => router.push('/(admin)/society-settings')}
              />
              <View style={styles.divider} />
              <ManageItem
                Icon={ShieldCheck}
                title="Guards & Gates"
                description="Add security guards & gate check-ins"
                valueText="2 Active"
                onPress={() => router.push('/(admin)/staff-directory')}
              />
              <View style={styles.divider} />
              <ManageItem
                Icon={Users}
                title="Resident Directory"
                description="Approve and manage flat members"
                valueText="18 Joined"
                onPress={() => router.push('/(admin)/manage-members')}
              />
            </Animated.View>

            {/* Section 2: Activity */}
            <Animated.View entering={FadeInUp.duration(400).delay(200)}>
              <Text style={styles.sectionLabel}>Activity & Comms</Text>
            </Animated.View>
            
            <Animated.View entering={FadeInUp.duration(400).delay(250)} style={styles.sectionCard}>
              <ManageItem
                Icon={Megaphone}
                title="Notices & Polls"
                description="Publish announcements & active voting"
                valueText="3 Live"
                onPress={() => router.push('/(admin)/notices-polls')}
              />
              <View style={styles.divider} />
              <ManageItem
                Icon={ClipboardList}
                title="Visitor Logs"
                description="Review historical entry & exit approvals"
                valueText="Logs"
                onPress={() => router.push('/(admin)/visitor-logs')}
              />
            </Animated.View>

            {/* Section 3: Plans */}
            <Animated.View entering={FadeInUp.duration(400).delay(300)}>
              <Text style={styles.sectionLabel}>Plan & Upgrades</Text>
            </Animated.View>
            
            <Animated.View entering={FadeInUp.duration(400).delay(350)} style={styles.sectionCard}>
              <ManageItem
                Icon={CreditCard}
                title="SaaS Plan"
                description="Society level subscription plan and billing"
                valueText="Free Plan"
                onPress={() => Alert.alert("Subscription & Billing", "Plan upgrade via Razorpay coming soon.")}
              />
            </Animated.View>

          </View>
        </ScrollView>
      </Screen>
    </View>
  );
}

// ─── Shared Manage List Item Component ──────────────────────────────────────
interface ManageItemProps {
  Icon: any;
  title: string;
  description: string;
  valueText?: string;
  onPress: () => void;
}

function ManageItem({ Icon, title, description, valueText, onPress }: ManageItemProps) {
  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // ignore
    }
  };

  const handlePress = () => {
    triggerHaptic();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        pressed && styles.itemPressed,
      ]}
    >
      <View style={styles.itemRow}>
        <View style={styles.iconWrapper}>
          <Icon size={15} color="#4A5568" strokeWidth={2.2} />
        </View>
        <View style={styles.textContainer}>
          <Text variant="body" weight="semibold" className="text-[#1C1B1F] text-[14.5px] leading-5">{title}</Text>
          <Text variant="caption" className="text-[#8E8D94] text-[11.5px] mt-0.5">{description}</Text>
        </View>
        {valueText && (
          <Text style={styles.valueText}>{valueText}</Text>
        )}
        <ChevronRight size={14} color="#A3A1A8" strokeWidth={2.5} style={{ marginLeft: 6 }} />
      </View>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 140,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandText: {
    fontFamily: Platform.select({
      ios: 'Snell Roundhand',
      android: 'cursive',
      default: 'serif',
    }),
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
  },
  adminBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(95, 103, 236, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(95, 103, 236, 0.25)',
  },
  adminBadgeText: {
    fontSize: 10,
    fontFamily: 'InterBold',
    color: '#5F67EC',
    letterSpacing: 1.2,
  },
  greetingSection: {
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 14,
    color: '#5E5D6A',
    fontFamily: 'Inter',
    lineHeight: 18,
    marginTop: 4,
  },
  settingsContainer: {
    gap: 16,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'InterBold',
    color: '#8E8D94',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginLeft: 4,
    marginBottom: -8,
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  itemPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.045)',
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(74, 85, 104, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  valueText: {
    fontSize: 13,
    fontFamily: 'InterMedium',
    color: '#8E8D94',
    marginRight: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(28, 27, 31, 0.08)',
    marginLeft: 56,
  },
});
