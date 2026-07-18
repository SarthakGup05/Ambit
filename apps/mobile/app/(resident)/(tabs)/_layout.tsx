import React from 'react';
import { Tabs } from 'expo-router';
import {
  Home,
  Calendar,
  UserCheck,
  BarChart2,
  LayoutGrid,
} from 'lucide-react-native';
import { RoleTabBar, type RoleTabConfig } from '@/components/common';

const RESIDENT_TABS: RoleTabConfig[] = [
  { name: 'index', label: 'Home', Icon: Home },
  { name: 'visitors', label: 'Visitors', Icon: UserCheck },
  { name: 'bookings', label: 'Bookings', Icon: Calendar },
  { name: 'polls', label: 'Polls', Icon: BarChart2 },
  { name: 'more', label: 'More', Icon: LayoutGrid },
];
export default function ResidentTabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <RoleTabBar {...props} tabs={RESIDENT_TABS} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="visitors" options={{ title: 'Visitors' }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings' }} />
      <Tabs.Screen name="polls" options={{ title: 'Polls' }} />
      <Tabs.Screen name="more" options={{ title: 'More' }} />
      {/* Hidden routes still accessible via deep linking/push */}
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="complaints" options={{ href: null }} />
      <Tabs.Screen name="notices" options={{ href: null }} />
      <Tabs.Screen name="services" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
