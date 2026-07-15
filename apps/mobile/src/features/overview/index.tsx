import React, { useState } from 'react';
import { View, Pressable, Dimensions, StyleSheet } from 'react-native';
import { Screen, SectionHeader, Text } from '@repo/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, FileText, Navigation, LayoutGrid, User } from 'lucide-react-native';
import { HomeHeader } from './components/HomeHeader';
import { PendingVisitorCard } from './components/PendingVisitorCard';
import { QuickActions } from './components/QuickActions';
import { RecentVisitors } from './components/RecentVisitors';
import { LatestNotice } from './components/LatestNotice';
import Svg, { Path } from 'react-native-svg';

export function Overview() {
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = screenWidth - 40;
  const tabHeight = 68;
  const r = 30;

  // Smooth bezier center dip for FAB
  const d = `
    M 0 ${r}
    A ${r} ${r} 0 0 1 ${r} 0
    L ${tabWidth / 2 - 46} 0
    C ${tabWidth / 2 - 28} 0, ${tabWidth / 2 - 22} 26, ${tabWidth / 2} 26
    C ${tabWidth / 2 + 22} 26, ${tabWidth / 2 + 28} 0, ${tabWidth / 2 + 46} 0
    L ${tabWidth - r} 0
    A ${r} ${r} 0 0 1 ${tabWidth} ${r}
    L ${tabWidth} ${tabHeight - r}
    A ${r} ${r} 0 0 1 ${tabWidth - r} ${tabHeight}
    L ${r} ${tabHeight}
    A ${r} ${r} 0 0 1 0 ${tabHeight - r}
    Z
  `;

  const [activeTab, setActiveTab] = useState('home');

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* Richer, more vivid background gradient */}
      <LinearGradient
        colors={['#D6E4FF', '#EEE0F8', '#FFE8DC']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Subtle top color blob for depth */}
      <View
        style={{
          position: 'absolute',
          top: -60,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: 'rgba(167, 139, 250, 0.15)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 160,
          left: -60,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: 'rgba(99, 179, 237, 0.1)',
        }}
      />

      <Screen
        className="flex-1 bg-transparent"
        scrollViewProps={{
          contentContainerStyle: {
            paddingBottom: 120,
            flexGrow: 1,
          },
          showsVerticalScrollIndicator: false,
        }}
      >
        <HomeHeader />
        <PendingVisitorCard />

        <SectionHeader title="Quick Actions" />
        <QuickActions />

        <SectionHeader title="Recent Visitors" />
        <RecentVisitors />

        <SectionHeader title="Latest Notice" />
        <LatestNotice />
      </Screen>

      {/* Floating Bottom Tab Bar */}
      <View
        style={{
          position: 'absolute',
          bottom: 24,
          left: 20,
          right: 20,
          height: tabHeight,
        }}
      >
        {/* Frosted glass SVG background */}
        <Svg
          width={tabWidth}
          height={tabHeight}
          style={{ position: 'absolute' }}
        >
          <Path
            d={d}
            fill="rgba(255, 255, 255, 0.78)"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={1}
          />
        </Svg>

        {/* Shadow layer under tab bar */}
        <View
          style={{
            position: 'absolute',
            bottom: -4,
            left: 8,
            right: 8,
            height: tabHeight,
            borderRadius: r,
            backgroundColor: 'transparent',
            shadowColor: '#6B6AC0',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.18,
            shadowRadius: 20,
            elevation: 10,
          }}
        />

        <View style={styles.tabContainer}>
          {/* Tab 1: Home */}
          <Pressable onPress={() => setActiveTab('home')} style={styles.tabItem}>
            <View style={styles.tabItemInner}>
              <Home 
                size={20} 
                color={activeTab === 'home' ? "#4F46E5" : "#9CA3AF"} 
                fill={activeTab === 'home' ? "#4F46E5" : "transparent"} 
                strokeWidth={2} 
              />
              <Text 
                style={[
                  styles.tabLabel, 
                  { color: activeTab === 'home' ? "#4F46E5" : "#9CA3AF" }
                ]}
              >
                Home
              </Text>
            </View>
          </Pressable>

          {/* Tab 2: Notices */}
          <Pressable onPress={() => setActiveTab('notices')} style={styles.tabItem}>
            <View style={styles.tabItemInner}>
              <FileText 
                size={20} 
                color={activeTab === 'notices' ? "#4F46E5" : "#9CA3AF"} 
                fill={activeTab === 'notices' ? "#4F46E5" : "transparent"} 
                strokeWidth={2} 
              />
              <Text 
                style={[
                  styles.tabLabel, 
                  { color: activeTab === 'notices' ? "#4F46E5" : "#9CA3AF" }
                ]}
              >
                Notices
              </Text>
            </View>
          </Pressable>

          {/* Spacer for FAB */}
          <View style={{ width: 60 }} />

          {/* Tab 3: Services */}
          <Pressable onPress={() => setActiveTab('grid')} style={styles.tabItem}>
            <View style={styles.tabItemInner}>
              <LayoutGrid 
                size={20} 
                color={activeTab === 'grid' ? "#4F46E5" : "#9CA3AF"} 
                fill={activeTab === 'grid' ? "#4F46E5" : "transparent"} 
                strokeWidth={2} 
              />
              <Text 
                style={[
                  styles.tabLabel, 
                  { color: activeTab === 'grid' ? "#4F46E5" : "#9CA3AF" }
                ]}
              >
                Services
              </Text>
            </View>
          </Pressable>

          {/* Tab 4: Profile */}
          <Pressable onPress={() => setActiveTab('profile')} style={styles.tabItem}>
            <View style={styles.tabItemInner}>
              <User 
                size={20} 
                color={activeTab === 'profile' ? "#4F46E5" : "#9CA3AF"} 
                fill={activeTab === 'profile' ? "#4F46E5" : "transparent"} 
                strokeWidth={2} 
              />
              <Text 
                style={[
                  styles.tabLabel, 
                  { color: activeTab === 'profile' ? "#4F46E5" : "#9CA3AF" }
                ]}
              >
                Profile
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Center FAB */}
        <View
          style={{
            position: 'absolute',
            top: -28,
            left: '50%',
            marginLeft: -32,
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: 'white',
            padding: 4,
            shadowColor: '#3B4FD8',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.35,
            shadowRadius: 18,
            elevation: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              borderRadius: 28,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LinearGradient
              colors={['#7BA7F5', '#4169D8', '#2040B0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            {/* Gloss highlight on FAB */}
            <View
              style={{
                position: 'absolute',
                top: 4,
                left: 6,
                width: 26,
                height: 12,
                borderRadius: 8,
                backgroundColor: 'rgba(255,255,255,0.22)',
              }}
            />
            <View style={{ transform: [{ rotate: '45deg' }] }}>
              <Navigation size={22} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2.5} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabItemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 9,
    fontFamily: 'InterBold',
    letterSpacing: 0.1,
  }
});
