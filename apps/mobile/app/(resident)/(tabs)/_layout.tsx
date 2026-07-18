import React from 'react';
import { Tabs } from 'expo-router';
import {
  Home,
  Calendar,
  MessageSquare,
  FileText,
  MoreHorizontal,
} from 'lucide-react-native';
import { RoleTabBar, type RoleTabConfig } from '@/components/common';

const RESIDENT_TABS: RoleTabConfig[] = [
  { name: 'index', label: 'Home', Icon: Home },
  { name: 'bookings', label: 'Bookings', Icon: Calendar },
  { name: 'complaints', label: 'Complaints', Icon: MessageSquare },
  { name: 'notices', label: 'Notices', Icon: FileText },
  { name: 'more', label: 'More', Icon: MoreHorizontal },
];
export default function ResidentTabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <RoleTabBar {...props} tabs={RESIDENT_TABS} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
      <Tabs.Screen name="complaints" options={{ title: 'Complaints' }} />
      <Tabs.Screen name="notices" options={{ title: 'Notices' }} />
      <Tabs.Screen name="more" options={{ title: 'More' }} />
      {/* Hidden legacy routes */}
      <Tabs.Screen name="services" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
