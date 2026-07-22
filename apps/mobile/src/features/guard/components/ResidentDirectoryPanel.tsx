import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Text, ListSkeleton } from '@repo/ui';
import { AppSectionCard, AppEmptyState } from '@/components/common';
import { Search } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { ResidentDirectoryMember } from '@/services/VisitorService';
import * as Haptics from 'expo-haptics';

function triggerHaptic() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  } catch {
    // ignore
  }
}

interface ResidentDirectoryPanelProps {
  directory: ResidentDirectoryMember[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  loadingDirectory: boolean;
  onSelectFlat: (flatNumber: string) => void;
}

export function ResidentDirectoryPanel({
  directory,
  searchQuery,
  setSearchQuery,
  loadingDirectory,
  onSelectFlat,
}: ResidentDirectoryPanelProps) {
  const filtered = directory.filter(
    (item) =>
      item.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Animated.View entering={FadeInUp.duration(300)}>
      <AppSectionCard label="Society Resident Directory">
        <View style={styles.inputWrapper}>
          <Search size={18} color="rgba(17,17,30,0.5)" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.input}
            placeholder="Search flat number or resident..."
            placeholderTextColor="rgba(17,17,30,0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loadingDirectory ? (
          <ListSkeleton count={3} />
        ) : filtered.length === 0 ? (
          <AppEmptyState
            icon={Search}
            title="No Matching Flats"
            description={`Could not find any resident matching "${searchQuery}".`}
          />
        ) : (
          filtered.map((member) => (
            <Pressable
              key={member.id}
              onPress={() => {
                triggerHaptic();
                onSelectFlat(member.flatNumber);
              }}
              style={styles.directoryTile}
            >
              <View style={styles.flatBadge}>
                <Text variant="caption" weight="bold" style={{ color: '#4E6D3B' }}>
                  {member.flatNumber}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text variant="body" weight="bold" style={{ color: '#11111E' }}>
                  {member.name}
                </Text>
                <Text variant="caption" weight="medium" style={{ color: 'rgba(17,17,30,0.6)' }}>
                  {member.email}
                </Text>
              </View>
              <View style={styles.quickEntryBtn}>
                <Text variant="caption" weight="bold" style={{ color: '#FFFFFF' }}>
                  Select Flat
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </AppSectionCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(17,17,30,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#11111E',
    padding: 0,
  },
  directoryTile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(17,17,30,0.06)',
  },
  flatBadge: {
    backgroundColor: '#E4EFE0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  quickEntryBtn: {
    backgroundColor: '#4E6D3B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
});
