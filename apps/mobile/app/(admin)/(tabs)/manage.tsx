import React from 'react';
import { View, StyleSheet, Pressable, Platform, ScrollView } from 'react-native';
import { Screen, Text } from '@repo/ui';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Building2,
  Users,
  ShieldCheck,
  ClipboardList,
  Megaphone,
  CreditCard,
} from 'lucide-react-native';
import Animated, { ZoomIn, FadeIn, FadeInUp } from 'react-native-reanimated';

const ADMIN_ACTIONS = [
  {
    id: 'society-settings',
    title: 'Society Settings',
    description: 'Name, address, towers & invite code',
    Icon: Building2,
    colors: ['#5F67EC', '#474EE0'] as const,
  },
  {
    id: 'manage-members',
    title: 'Manage Members',
    description: 'View residents, assign flats, remove members',
    Icon: Users,
    colors: ['#10B981', '#059669'] as const,
  },
  {
    id: 'staff-directory',
    title: 'Staff & Guards',
    description: 'Add guards, assign gates, manage staff',
    Icon: ShieldCheck,
    colors: ['#F59E0B', '#D97706'] as const,
  },
  {
    id: 'visitor-logs',
    title: 'Visitor Logs',
    description: 'Oversee all visitor entries across society',
    Icon: ClipboardList,
    colors: ['#8B5CF6', '#7C3AED'] as const,
  },
  {
    id: 'notices-polls',
    title: 'Notices & Polls',
    description: 'Create, edit and manage announcements',
    Icon: Megaphone,
    colors: ['#F43F5E', '#E11D48'] as const,
  },
  {
    id: 'plans-billing',
    title: 'Plans & Billing',
    description: 'Society plan management & upgrades',
    Icon: CreditCard,
    colors: ['#0EA5E9', '#0284C7'] as const,
  },
];

export default function ManageTab() {
  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* Premium background gradient */}
      <LinearGradient
        colors={['#E8F5E9', '#F4F7F4', '#FAF8F5']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Background blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

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

          {/* Action Cards Grid */}
          <View style={styles.grid}>
            {ADMIN_ACTIONS.map((action, index) => {
              const { Icon } = action;
              return (
                <Animated.View
                  key={action.id}
                  entering={FadeInUp.duration(400).delay(100 + index * 80)}
                >
                  <Pressable
                    style={({ pressed }) => [
                      styles.card,
                      pressed && styles.cardPressed,
                    ]}
                  >
                    {/* Icon circle */}
                    <View style={styles.iconCircle}>
                      <LinearGradient
                        colors={action.colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <View style={styles.iconGloss} />
                      <Icon size={22} color="#FFFFFF" strokeWidth={2.2} />
                    </View>

                    {/* Text */}
                    <Text style={styles.cardTitle}>{action.title}</Text>
                    <Text style={styles.cardDescription}>{action.description}</Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>
      </Screen>
    </View>
  );
}

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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconGloss: {
    position: 'absolute',
    top: 3,
    left: 5,
    width: 18,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#11111E',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    fontFamily: 'Inter',
    color: '#6B6873',
    lineHeight: 17,
  },
  blob1: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(195, 226, 196, 0.25)',
  },
  blob2: {
    position: 'absolute',
    bottom: 120,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(168, 209, 170, 0.15)',
  },
});
