import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@repo/ui';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function RoleSwitcherBar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setAuth, token } = useAuthStore();

  if (!__DEV__ || !user) {
    return null;
  }

  const handleSwitchRole = (newRole: 'admin' | 'resident' | 'guard') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // ignore
    }

    const updatedUser = {
      ...user,
      role: newRole,
      societyId: user.societyId || '78ccd827-8e95-491f-9669-6d0dc1af36c9',
      flatNumber: newRole === 'resident' ? (user.flatNumber || '101-A') : newRole === 'guard' ? 'Gate 1' : null,
    };

    setAuth(token, updatedUser);

    if (newRole === 'admin') {
      router.replace('/(admin)/(tabs)');
    } else if (newRole === 'guard') {
      router.replace('/(guard)');
    } else {
      router.replace('/(resident)/(tabs)');
    }
  };

  return (
    <View style={[styles.container, { top: Math.max(insets.top + 4, 38) }]}>
      <Text style={styles.label}>DEV ROLE:</Text>
      {(['resident', 'admin', 'guard'] as const).map((r) => {
        const isActive = user.role === r;
        return (
          <Pressable
            key={r}
            onPress={() => handleSwitchRole(r)}
            style={[styles.pill, isActive && styles.pillActive]}
          >
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
              {r.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 17, 30, 0.88)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  label: {
    fontSize: 9,
    fontFamily: 'InterBold',
    color: '#A3A1A8',
    letterSpacing: 0.8,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pillActive: {
    backgroundColor: '#2E7D32',
  },
  pillText: {
    fontSize: 10,
    fontFamily: 'InterBold',
    color: '#D1D5DB',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
});
