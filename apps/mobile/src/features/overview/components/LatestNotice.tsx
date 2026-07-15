import React, { useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@repo/ui';
import { ArrowRight, Megaphone, Calendar, ShieldCheck } from 'lucide-react-native';

const NOTICES = [
  {
    id: '1',
    category: 'Maintenance',
    title: 'Pool Maintenance',
    description: 'Swimming pool will remain closed tomorrow from 10 AM to 2 PM for deep cleaning and water filtration check.',
    tag: 'Announcement',
    time: 'Tomorrow',
    tagBg: 'rgba(245, 158, 11, 0.08)',
    tagBorder: 'rgba(245, 158, 11, 0.25)',
    tagText: '#B45309',
    icon: Megaphone,
    iconColor: '#B45309'
  },
  {
    id: '2',
    category: 'Society',
    title: 'Annual General Meeting',
    description: 'The AGM has been rescheduled to this Sunday at 10 AM in the clubhouse. Attendance is highly requested.',
    tag: 'Official',
    time: '4 days ago',
    tagBg: 'rgba(79, 70, 229, 0.08)',
    tagBorder: 'rgba(79, 70, 229, 0.25)',
    tagText: '#4F46E5',
    icon: ShieldCheck,
    iconColor: '#4F46E5'
  },
  {
    id: '3',
    category: 'Events',
    title: 'Monsoon Festival 2026',
    description: 'Join us for food trucks, live music, and rain dance in the society lawns this Saturday at 6 PM! Entry is free.',
    tag: 'Event',
    time: 'In 2 days',
    tagBg: 'rgba(124, 58, 237, 0.08)',
    tagBorder: 'rgba(124, 58, 237, 0.25)',
    tagText: '#7C3AED',
    icon: Calendar,
    iconColor: '#7C3AED'
  }
];

const FILTERS = ['All', 'Maintenance', 'Society', 'Events'];

export function LatestNotice() {
  const [activeFilter, setActiveFilter] = useState('All');

  // Filter notices
  const filteredNotices = activeFilter === 'All' 
    ? NOTICES 
    : NOTICES.filter(n => n.category === activeFilter);

  return (
    <View style={styles.container}>
      {/* Horizontal Scrollable Filter Bar */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterScrollContent}
      >
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter;
          
          return (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
            >
              <View 
                style={[
                  styles.filterPill, 
                  isActive ? styles.filterPillActive : styles.filterPillInactive
                ]}
              >
                <Text 
                  style={[
                    styles.filterText, 
                    isActive ? styles.filterTextActive : styles.filterTextInactive
                  ]}
                >
                  {filter}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Notice Card List */}
      {filteredNotices.length > 0 ? (
        filteredNotices.map((notice) => {
          const IconComponent = notice.icon;
          return (
            <View key={notice.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View 
                  style={[
                    styles.tagPill, 
                    { backgroundColor: notice.tagBg, borderColor: notice.tagBorder }
                  ]}
                >
                  <IconComponent size={12} color={notice.iconColor} style={{ marginRight: 4 }} />
                  <Text style={[styles.tagText, { color: notice.tagText }]}>
                    {notice.tag}
                  </Text>
                </View>
                <Text style={styles.timeText}>{notice.time}</Text>
              </View>

              <Text style={styles.titleText}>
                {notice.title}
              </Text>
              
              <Text style={styles.descriptionText}>
                {notice.description}
              </Text>

              <Pressable>
                <View style={styles.readBtn}>
                  <Text style={styles.readText}>Read Details</Text>
                  <ArrowRight size={13} color="#11111E" strokeWidth={2.4} />
                </View>
              </Pressable>
            </View>
          );
        })
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No announcements in this category</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterScrollContent: {
    gap: 8,
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  filterPill: {
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: '#11111E',
    borderColor: 'transparent',
    shadowColor: '#11111E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  filterPillInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderColor: 'rgba(255, 255, 255, 0.55)',
  },
  filterText: {
    fontSize: 11,
    fontFamily: 'InterBold',
    letterSpacing: 0.2,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterTextInactive: {
    color: '#5E5D6A',
  },
  card: {
    marginHorizontal: 20,
    marginVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.38)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#5B5EA6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 9,
    fontFamily: 'InterBold',
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 11,
    color: '#C1584B',
    fontFamily: 'InterBold',
  },
  titleText: {
    fontSize: 16,
    color: '#11111E',
    fontFamily: 'ManropeBold',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 12,
    color: '#5E5D6A',
    fontFamily: 'Inter',
    lineHeight: 18,
    marginBottom: 16,
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  readText: {
    fontSize: 12,
    color: '#11111E',
    fontFamily: 'ManropeBold',
    letterSpacing: 0.3,
    marginRight: 4,
  },
  emptyCard: {
    marginHorizontal: 20,
    marginVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 28,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#5E5D6A',
    fontFamily: 'InterBold',
  }
});
