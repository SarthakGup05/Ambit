import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Platform, Alert, Linking } from 'react-native';
import { Screen, Text } from '@repo/ui';
import { ScreenBackground, AppSectionCard, AppListItem } from '@/components/common';
import { uiStyles, type } from '@/theme';
import {
  ShieldCheck,
  Building,
  Wrench,
  Zap,
  PhoneCall,
  Flame,
  Plus,
} from 'lucide-react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EMERGENCY_CONTACTS = [
  { id: 'e1', title: 'Main Security Gate', subtitle: 'Gate 1 Intercom Desk', phone: '+91 99999 11111', Icon: ShieldCheck, color: '#C1584B' },
  { id: 'e2', title: 'Society Admin Office', subtitle: 'Inquiries & Approvals Desk', phone: '+91 99999 22222', Icon: Building, color: '#5F67EC' },
  { id: 'e3', title: 'Fire & Safety Marshal', subtitle: 'Emergency Fire Incident Control', phone: '101', Icon: Flame, color: '#EF4444' },
];

const UTILITY_STAFF = [
  { id: 'u1', name: 'Ramesh Kumar (Plumber)', subtitle: 'Tap leak, pipes, bathroom maintenance', phone: '+91 88888 11111', Icon: Wrench },
  { id: 'u2', name: 'Sanjay Singh (Electrician)', subtitle: 'Wiring, switches, backup inverter fix', phone: '+91 88888 22222', Icon: Zap },
  { id: 'u3', name: 'Devendra Pal (Plumber)', subtitle: 'Drain cleaning & blockages', phone: '+91 88888 33333', Icon: Wrench },
];

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore
  }
}

export default function ServicesTab() {
  const insets = useSafeAreaInsets();

  const handleCall = (phoneNumber: string, name: string) => {
    triggerHaptic();
    Alert.alert(
      'Place Direct Call',
      `Would you like to dial ${name} at ${phoneNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dial Call',
          style: 'default',
          onPress: () => {
            Linking.openURL(`tel:${phoneNumber}`).catch(() => {
              Alert.alert('Call Failed', 'Your device does not support telephone calling.');
            });
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <ScrollView
          contentContainerStyle={[
            uiStyles.scroll,
            { paddingTop: insets.top + 16, paddingBottom: 130 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(300)} style={uiStyles.header}>
            <View style={{ flex: 1, paddingRight: 12, gap: 2 }}>
              <Text variant="h2" weight="bold" style={type.greeting}>
                Society Services
              </Text>
              <Text variant="body" style={type.greetingSub}>
                Quick contact roster & local utilities
              </Text>
            </View>
            <View style={uiStyles.iconBtn}>
              <PhoneCall size={22} color="#2E7D32" strokeWidth={2.2} />
            </View>
          </Animated.View>

          {/* Emergency society contacts */}
          <Animated.View entering={FadeInUp.duration(400).delay(80)}>
            <AppSectionCard label="Society Gate & Admin">
              {EMERGENCY_CONTACTS.map((item, idx) => (
                <AppListItem
                  key={item.id}
                  Icon={item.Icon}
                  iconColor={item.color}
                  iconBg={`${item.color}12`}
                  title={item.title}
                  subtitle={item.subtitle}
                  valueText="Call Desk"
                  onPress={() => handleCall(item.phone, item.title)}
                  isLast={idx === EMERGENCY_CONTACTS.length - 1}
                />
              ))}
            </AppSectionCard>
          </Animated.View>

          {/* Utility plumbers/electricians contacts */}
          <Animated.View entering={FadeInUp.duration(400).delay(140)}>
            <AppSectionCard label="Registered Society Utilities">
              {UTILITY_STAFF.map((item, idx) => (
                <AppListItem
                  key={item.id}
                  Icon={item.Icon}
                  iconColor="#4A5568"
                  iconBg="rgba(74, 85, 104, 0.08)"
                  title={item.name}
                  subtitle={item.subtitle}
                  valueText="Dial"
                  onPress={() => handleCall(item.phone, item.name)}
                  isLast={idx === UTILITY_STAFF.length - 1}
                />
              ))}
            </AppSectionCard>
          </Animated.View>

        </ScrollView>
      </Screen>
    </View>
  );
}
