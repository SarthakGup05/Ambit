import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen, Text, Button } from '@repo/ui';
import { ScreenBackground } from '@/components/common';
import { type } from '@/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shield } from 'lucide-react-native';

export default function GuardProfileTab() {
  const { logout, user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Shield size={28} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <Text variant="h3" weight="bold" style={type.emptyTitle}>
              {user?.name || 'Guard'}
            </Text>
            <Text variant="body" style={type.greetingSub}>
              {user?.email || ''}
            </Text>
            <View style={styles.rolePill}>
              <Text variant="caption" weight="bold" style={[type.micro, { color: '#1B4332' }]}>
                SECURITY GUARD
              </Text>
            </View>
            <Button
              title="Log Out"
              variant="outline"
              onPress={logout}
              className="w-full mt-8"
            />
          </View>
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    gap: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1B4332',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  rolePill: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(27, 67, 50, 0.1)',
  },
});
