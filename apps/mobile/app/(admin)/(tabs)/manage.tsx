import React from 'react';
import { View, Pressable, Platform, ScrollView, Alert } from 'react-native';
import { Screen, Text } from '@repo/ui';
import { ScreenBackground, AppSectionCard, AppListItem } from '@/components/common';
import { uiStyles } from '@/theme';
import { useRouter } from 'expo-router';
import {
  Building2,
  Users,
  ShieldCheck,
  ClipboardList,
  Megaphone,
  CreditCard,
  ChevronRight,
  MessageSquare,
} from 'lucide-react-native';
import Animated, { ZoomIn, FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const SECTIONS = [
  {
    key: 'operations',
    label: 'Operations',
    delay: 100,
    items: [
      {
        Icon: Building2,
        title: 'Society Settings',
        description: 'Configure towers, flats & invite code',
        valueText: 'AMB824',
        route: '/(admin)/society-settings' as const,
      },
      {
        Icon: ShieldCheck,
        title: 'Guards & Gates',
        description: 'Add security guards & gate check-ins',
        valueText: '2 Active',
        route: '/(admin)/staff-directory' as const,
      },
      {
        Icon: Users,
        title: 'Resident Directory',
        description: 'Approve and manage flat members',
        valueText: '18 Joined',
        route: '/(admin)/manage-members' as const,
      },
    ],
  },
  {
    key: 'activity',
    label: 'Activity & Comms',
    delay: 200,
    items: [
      {
        Icon: MessageSquare,
        title: 'Help & Complaints',
        description: 'Triage resident tickets & track resolution',
        valueText: '4 Active',
        route: '/(admin)/complaints' as const,
      },
      {
        Icon: Megaphone,
        title: 'Notices & Polls',
        description: 'Publish announcements & active voting',
        valueText: '3 Live',
        route: '/(admin)/notices-polls' as const,
      },
      {
        Icon: ClipboardList,
        title: 'Visitor Logs',
        description: 'Review historical entry & exit approvals',
        valueText: 'Logs',
        route: '/(admin)/visitor-logs' as const,
      },
    ],
  },
  {
    key: 'plan',
    label: 'Plan & Upgrades',
    delay: 300,
    items: [
      {
        Icon: CreditCard,
        title: 'SaaS Plan',
        description: 'Society level subscription plan and billing',
        valueText: 'Free Plan',
        route: null,
      },
    ],
  },
];

function triggerHaptic() {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { /* ignore */ }
}

export default function ManageTab() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <ScrollView
          contentContainerStyle={[uiStyles.scroll, { paddingTop: 40, paddingBottom: 140 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={{ marginBottom: 24 }}>
            <View style={uiStyles.brandHeaderRow}>
              <Animated.View entering={ZoomIn.duration(400).delay(50)}>
                <Text style={uiStyles.brandText}>Ambit</Text>
              </Animated.View>
              <View style={uiStyles.adminBadge}>
                <Text style={uiStyles.adminBadgeText}>ADMIN</Text>
              </View>
            </View>
            <Animated.View entering={FadeIn.duration(350).delay(150)}>
              <Text variant="h2" className="font-bold text-[#11111E]">Manage</Text>
            </Animated.View>
            <Text style={{ fontSize: 14, color: '#5E5D6A', fontFamily: 'Inter', lineHeight: 18, marginTop: 4 }}>
              Administer your society, members, and operations.
            </Text>
          </View>

          {/* Grouped Action Sections */}
          <View style={{ gap: 16, marginTop: 8 }}>
            {SECTIONS.map((section) => (
              <Animated.View key={section.key} entering={FadeInUp.duration(400).delay(section.delay)}>
                <AppSectionCard label={section.label}>
                  {section.items.map((item, idx) => (
                    <AppListItem
                      key={item.title}
                      Icon={item.Icon}
                      title={item.title}
                      subtitle={item.description}
                      valueText={item.valueText}
                      onPress={() => {
                        triggerHaptic();
                        if (item.route) {
                          router.push(item.route);
                        } else {
                          Alert.alert('Subscription & Billing', 'Plan upgrade via Razorpay coming soon.');
                        }
                      }}
                      isLast={idx === section.items.length - 1}
                    />
                  ))}
                </AppSectionCard>
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      </Screen>
    </View>
  );
}
