import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@repo/ui';
import { LinearGradient } from 'expo-linear-gradient';

export function PendingVisitorCard() {
  return (
    <View style={styles.card}>
      {/* Top row: status label + time */}
      <View style={styles.topRow}>
        <View style={styles.statusRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.statusLabel}>Visitor Waiting</Text>
          <View style={styles.waitingBadge}>
            <Text style={styles.waitingBadgeText}>Waiting</Text>
          </View>
        </View>
        <Text style={styles.timeText}>2 min ago</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Visitor info */}
      <View style={styles.visitorRow}>
        {/* Avatar circle with gradient */}
        <View style={styles.avatarWrap}>
          <LinearGradient
            colors={['#C7D2FE', '#818CF8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.avatarInitial}>R</Text>
        </View>
        <View style={styles.visitorInfo}>
          <Text style={styles.visitorName}>Rahul Sharma</Text>
          <View style={styles.visitorMetaRow}>
            <View style={styles.friendPill}>
              <Text style={styles.friendPillText}>Friend</Text>
            </View>
            <Text style={styles.unitText}>Unit A-702</Text>
          </View>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.buttonsRow}>
        {/* Deny */}
        <Pressable style={styles.denyBtn}>
          <LinearGradient
            colors={['#D96B58', '#B54B3A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Gloss */}
          <View style={styles.btnGloss} />
          <Text style={styles.btnLabel}>Deny</Text>
        </Pressable>

        {/* Approve */}
        <Pressable style={styles.approveBtn}>
          <LinearGradient
            colors={['#92BC8C', '#6B9765']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Gloss */}
          <View style={[styles.btnGloss, { right: 20, width: 70 }]} />
          {/* Shiny dot */}
          <View style={styles.shineDot} />
          <Text style={styles.btnLabel}>Approve ✓</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 28,
    padding: 18,
    shadowColor: '#5B5EA6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  statusLabel: {
    fontSize: 11,
    color: '#11111E',
    fontFamily: 'ManropeBold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  waitingBadge: {
    backgroundColor: 'rgba(224,234,255,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(199,210,254,0.6)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  waitingBadgeText: {
    fontSize: 10,
    color: '#4F46E5',
    fontFamily: 'InterBold',
    letterSpacing: 0.2,
  },
  timeText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'Inter',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginBottom: 14,
  },
  visitorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  avatarInitial: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'ManropeBold',
    zIndex: 1,
  },
  visitorInfo: {
    flex: 1,
  },
  visitorName: {
    fontSize: 17,
    color: '#11111E',
    fontFamily: 'ManropeBold',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  visitorMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  friendPill: {
    backgroundColor: 'rgba(224,234,255,0.7)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(199,210,254,0.5)',
  },
  friendPillText: {
    fontSize: 10,
    color: '#4F46E5',
    fontFamily: 'InterBold',
  },
  unitText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  denyBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B54B3A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  approveBtn: {
    flex: 1.8,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A7C44',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  btnGloss: {
    position: 'absolute',
    top: 4,
    right: 14,
    width: 40,
    height: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    transform: [{ rotate: '-4deg' }],
  },
  shineDot: {
    position: 'absolute',
    top: 10,
    right: 16,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  btnLabel: {
    fontSize: 13,
    color: '#fff',
    fontFamily: 'ManropeBold',
    letterSpacing: 0.3,
    zIndex: 1,
  },
});
