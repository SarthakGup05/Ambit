import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Users, ClipboardList, User } from 'lucide-react-native';
import { RoleTabBar, type RoleTabConfig } from '@/components/common';

const GUARD_TABS: RoleTabConfig[] = [
  { name: 'index', label: 'Dashboard', Icon: Home },
  { name: 'visitors', label: 'Visitors', Icon: Users },
  { name: 'logs', label: 'Logs', Icon: ClipboardList },
  { name: 'profile', label: 'Profile', Icon: User },
];
export default function GuardTabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <RoleTabBar {...props} tabs={GUARD_TABS} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="visitors" options={{ title: 'Visitors' }} />
      <Tabs.Screen name="logs" options={{ title: 'Logs' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
