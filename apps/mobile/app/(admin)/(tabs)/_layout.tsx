import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Users, MoreHorizontal } from 'lucide-react-native';
import { RoleTabBar, type RoleTabConfig } from '@/components/common';

const ADMIN_TABS: RoleTabConfig[] = [
  { name: 'index', label: 'Dashboard', Icon: Home },
  { name: 'residents', label: 'Residents', Icon: Users },
  { name: 'more', label: 'More', Icon: MoreHorizontal },
];
export default function AdminTabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <RoleTabBar {...props} tabs={ADMIN_TABS} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="residents" options={{ title: 'Residents' }} />
      <Tabs.Screen name="more" options={{ title: 'More' }} />
      {/* Hidden legacy routes kept for deep links */}
      <Tabs.Screen name="notices" options={{ href: null }} />
      <Tabs.Screen name="manage" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
