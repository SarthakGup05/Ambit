import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TextInput, Pressable, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { Screen, Text, ListSkeleton } from '@repo/ui';
import { ScreenBackground } from '@/components/common';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, X, ClipboardList } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { api } from '@/lib/axios';

interface VisitorLog {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  flatNumber: string;
  status: 'pending' | 'approved' | 'denied' | 'checked_in' | 'checked_out';
  createdAt: string;
}

export default function VisitorLogsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<VisitorLog[]>([]);

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // ignore
    }
  };

  const loadLogs = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/visitors');
      if (response.data && response.data.visitors) {
        setLogs(response.data.visitors);
        setFilteredLogs(response.data.visitors);
      }
    } catch (err: any) {
      console.warn("Failed to fetch visitor logs:", err.message || err);
      // Fallback mock logs
      const mockLogs = [
        {
          id: '1',
          name: 'Rahul Sharma',
          phone: '+91 98765 43210',
          purpose: 'Friend',
          flatNumber: 'A-702',
          status: 'checked_in',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Zomato Delivery',
          phone: '+91 99999 88888',
          purpose: 'Delivery',
          flatNumber: 'B-104',
          status: 'approved',
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: '3',
          name: 'Urban Company',
          phone: '+91 88888 77777',
          purpose: 'Service',
          flatNumber: 'C-309',
          status: 'denied',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          id: '4',
          name: 'Ola Cab',
          phone: '+91 77777 66666',
          purpose: 'Cab',
          flatNumber: 'D-512',
          status: 'checked_out',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        }
      ] as VisitorLog[];
      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadLogs();
  }, [loadLogs]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredLogs(logs);
      return;
    }
    const filtered = logs.filter(
      (log) =>
        log.name.toLowerCase().includes(text.toLowerCase()) ||
        log.flatNumber.toLowerCase().includes(text.toLowerCase()) ||
        log.purpose.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredLogs(filtered);
  };

  const handleClearSearch = () => {
    triggerHaptic();
    setSearchQuery('');
    setFilteredLogs(logs);
  };

  const handleBack = () => {
    triggerHaptic();
    router.back();
  };

  const renderLogItem = ({ item, index }: { item: VisitorLog; index: number }) => {
    const timeText = new Date(item.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const dateText = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return (
      <Animated.View entering={FadeInDown.duration(350).delay(index * 30)} style={styles.logCard}>
        <View style={styles.logAvatar}>
          <Text style={styles.avatarLetter}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.logDetails}>
          <View style={styles.row}>
            <Text style={styles.visitorName}>{item.name}</Text>
            <Text style={styles.timeText}>{dateText}, {timeText}</Text>
          </View>
          <Text style={styles.visitorMeta}>
            Flat {item.flatNumber} • {item.purpose}
          </Text>
          <Text style={styles.phoneText}>{item.phone}</Text>
        </View>

        <View style={[
          styles.statusBadge,
          item.status === 'checked_in' && styles.statusCheckedIn,
          item.status === 'approved' && styles.statusApproved,
          item.status === 'denied' && styles.statusDenied,
          item.status === 'checked_out' && styles.statusCheckedOut,
        ]}>
          <Text style={[
            styles.statusBadgeText,
            item.status === 'checked_in' && styles.statusCheckedInText,
            item.status === 'approved' && styles.statusApprovedText,
            item.status === 'denied' && styles.statusDeniedText,
            item.status === 'checked_out' && styles.statusCheckedOutText,
          ]}>
            {item.status === 'checked_in' ? 'Inside' : 
             item.status === 'approved' ? 'Approved' : 
             item.status === 'denied' ? 'Denied' : 
             item.status === 'checked_out' ? 'Left' : item.status}
          </Text>
        </View>
      </Animated.View>
    );
  };
  return (
    <View style={StyleSheet.absoluteFillObject}>
      <ScreenBackground />
      <Screen className="flex-1 bg-transparent" scrollable={false}>
        {/* Header */}
        <View style={styles.navHeader}>
          <Pressable style={styles.backBtn} onPress={handleBack}>
            <ArrowLeft size={18} color="#4A5568" />
          </Pressable>
          <Text style={styles.navTitle}>Visitor History Logs</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInner}>
            <Search size={18} color="#A3A1A8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search logs by visitor, flat, type..."
              placeholderTextColor="#A3A1A8"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable style={styles.clearBtn} onPress={handleClearSearch}>
                <X size={14} color="#A3A1A8" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Timeline Logs List */}
        {isLoading ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
            <ListSkeleton count={4} />
          </View>
        ) : (
          <FlatList
            data={filteredLogs}
            keyExtractor={(item) => item.id}
            renderItem={renderLogItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <ClipboardList size={40} color="#A3A1A8" strokeWidth={1.5} />
                <Text style={styles.emptyText}>No visitor logs recorded</Text>
              </View>
            }
          />
        )}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.045)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16.5,
    fontFamily: 'ManropeBold',
    fontWeight: 'bold',
    color: '#1C1B1F',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#1C1B1F',
    height: '100%',
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  logAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(74, 85, 104, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarLetter: {
    fontSize: 16,
    fontFamily: 'ManropeBold',
    color: '#4A5568',
    fontWeight: 'bold',
  },
  logDetails: {
    flex: 1,
    paddingRight: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visitorName: {
    fontSize: 14.5,
    fontFamily: 'InterBold',
    color: '#1C1B1F',
    flex: 1,
  },
  timeText: {
    fontSize: 10.5,
    fontFamily: 'Inter',
    color: '#A3A1A8',
  },
  visitorMeta: {
    fontSize: 12,
    fontFamily: 'InterMedium',
    color: '#6B6873',
    marginTop: 2,
  },
  phoneText: {
    fontSize: 11,
    fontFamily: 'Inter',
    color: '#8E8D94',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignSelf: 'center',
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontFamily: 'InterBold',
    color: '#8E8D94',
  },
  statusCheckedIn: {
    backgroundColor: 'rgba(122, 155, 118, 0.12)',
  },
  statusCheckedInText: {
    color: '#7A9B76',
  },
  statusApproved: {
    backgroundColor: 'rgba(122, 155, 118, 0.12)',
  },
  statusApprovedText: {
    color: '#7A9B76',
  },
  statusDenied: {
    backgroundColor: 'rgba(193, 88, 75, 0.12)',
  },
  statusDeniedText: {
    color: '#C1584B',
  },
  statusCheckedOut: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  statusCheckedOutText: {
    color: '#4A5568',
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter',
    color: '#8E8D94',
  },
});
