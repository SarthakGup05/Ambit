import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@repo/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Check } from 'lucide-react-native';
import { recentVisitors } from '../data/mock';

export function RecentVisitors() {
  return (
    <View style={styles.card}>
      {recentVisitors.map((visitor, index) => {
        const isLast = index === recentVisitors.length - 1;
        const isApproved = visitor.status === 'approved';
        const statusLabel = isApproved ? 'APPROVED' : 'COMPLETED';
        const badgeBg = isApproved
          ? 'rgba(235, 247, 238, 0.9)'
          : 'rgba(243, 243, 245, 0.9)';
        const badgeBorder = isApproved ? 'rgba(169, 223, 178, 0.7)' : 'rgba(208, 207, 212, 0.7)';
        const badgeColor = isApproved ? '#2E7D32' : '#5E5D6A';

        return (
          <View
            key={visitor.id}
            style={[
              styles.row,
              !isLast && styles.rowBorder,
            ]}
          >
            {/* Avatar */}
            <View style={styles.avatar}>
              <User size={17} color="#8B93A8" strokeWidth={2} />
            </View>

            {/* Info */}
            <View style={styles.info}>
              <Text style={styles.visitorName} numberOfLines={1}>
                {visitor.name}
              </Text>
              <Text style={styles.visitorDate}>{visitor.date}</Text>
            </View>

            {/* Status badge */}
            <View
              style={[
                styles.badge,
                { backgroundColor: badgeBg, borderColor: badgeBorder },
              ]}
            >
              <Check size={10} color={badgeColor} strokeWidth={3} style={{ marginRight: 3 }} />
              <Text style={[styles.badgeText, { color: badgeColor }]}>
                {statusLabel}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.38)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    borderRadius: 28,
    paddingHorizontal: 20,
    shadowColor: '#5B5EA6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 4,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.35)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  visitorName: {
    fontSize: 13,
    color: '#11111E',
    fontFamily: 'ManropeBold',
    letterSpacing: -0.2,
  },
  visitorDate: {
    fontSize: 11,
    color: '#8B93A8',
    fontFamily: 'Inter',
    marginTop: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: 'InterBold',
    letterSpacing: 0.5,
  },
});
