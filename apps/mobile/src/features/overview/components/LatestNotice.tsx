import React, { useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@repo/ui';
import { ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { NOTICES } from '../../notices/data';
import { getNoticeIcon } from '../../notices/components/NoticesScreen';
import Animated, { FadeIn, FadeInUp, LinearTransition, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const FILTERS = ['All', 'Maintenance', 'Society', 'Events'];

export function LatestNotice() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');

  // Filter notices (show only first 3 matching items on Home for brevity)
  const filteredNotices = (
    activeFilter === 'All' 
      ? NOTICES 
      : NOTICES.filter(n => n.category === activeFilter)
  ).slice(0, 3);

  return (
    <View style={styles.container}>
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

      {filteredNotices.length > 0 ? (
        filteredNotices.map((notice, index) => {
          const IconComponent = getNoticeIcon(notice.iconName);
          return (
            <Animated.View 
              key={notice.id} 
              entering={FadeIn.duration(350).delay(index * 65)}
              layout={LinearTransition.duration(250)}
              style={styles.card}
            >
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

              <Pressable onPress={() => router.push({ pathname: '/(resident)/notice-details', params: { id: notice.id } })}>
                <View style={styles.readBtn}>
                  <Text style={styles.readText}>Read Details</Text>
                  <ArrowRight size={13} color="#11111E" strokeWidth={2.4} />
                </View>
              </Pressable>
            </Animated.View>
          );
        })
      ) : (
        <Animated.View 
          entering={FadeIn.duration(350)}
          style={styles.emptyCard}
        >
          <Text style={styles.emptyText}>No Notices Available</Text>
          <Text style={styles.emptySubtext}>There are currently no updates posted in this category.</Text>
          <Pressable 
            onPress={() => setActiveFilter('All')}
            style={({ pressed }) => [
              styles.resetBtn,
              pressed && { opacity: 0.85 }
            ]}
          >
            <LinearGradient
              colors={['#C3E2C4', '#A8D1AA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.resetBtnGradient}
            >
              <View style={styles.resetBtnGloss} />
              <Text style={styles.resetBtnText}>Show All Notices</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
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
    backgroundColor: '#C3E2C4',
    borderColor: 'transparent',
    shadowColor: '#C3E2C4',
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
    color: '#000000',
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
    shadowColor: '#71717A',
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
    marginVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1.5,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#71717A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  emptyText: {
    fontSize: 15,
    color: '#11111E',
    fontFamily: 'ManropeBold',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  emptySubtext: {
    fontSize: 11,
    color: '#5E5D6A',
    fontFamily: 'InterMedium',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resetBtn: {
    width: 150,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#A8D1AA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  resetBtnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  resetBtnGloss: {
    position: 'absolute',
    top: 2,
    left: 6,
    width: '90%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  resetBtnText: {
    color: '#000000',
    fontFamily: 'ManropeBold',
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
