import React from 'react';
import { View, Pressable, StyleSheet, Dimensions, Alert } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, FileText, LayoutGrid, User, Navigation } from 'lucide-react-native';
import { Text } from '@repo/ui';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="notices"
        options={{
          title: 'Notices',
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
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

  // Helper to trigger haptic feedback safely
  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // ignore
    }
  };

  const handleFABPress = () => {
    triggerHaptic();
    Alert.alert(
      "Quick Actions",
      "Scan Gate QR Pass or screen a new visitor directly from here.",
      [
        { text: "Generate Guest Pass", onPress: () => {} },
        { text: "Scan Gate QR", style: "default" },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  // Helper to map tab names
  const getTabItem = (routeName: string, label: string, Icon: any) => {
    const routeIndex = state.routes.findIndex((r: any) => r.name === routeName);
    if (routeIndex === -1) return null;

    const route = state.routes[routeIndex];
    const isFocused = state.index === routeIndex;
    const color = isFocused ? "#4F46E5" : "#9CA3AF";
    const fill = isFocused ? "#4F46E5" : "transparent";

    const onPress = () => {
      triggerHaptic();
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    return (
      <Pressable onPress={onPress} style={styles.tabItem} key={routeName}>
        <View style={styles.tabItemInner}>
          <Icon 
            size={20} 
            color={color} 
            fill={fill} 
            strokeWidth={2} 
          />
          <Text 
            style={[
              styles.tabLabel, 
              { color: color }
            ]}
          >
            {label}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 24,
        left: 20,
        right: 20,
        height: tabHeight,
        elevation: 10,
        backgroundColor: 'transparent',
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
          zIndex: -1,
        }}
      />

      <View style={styles.tabContainer}>
        {/* Tab 1: Home */}
        {getTabItem('index', 'Home', Home)}

        {/* Tab 2: Notices */}
        {getTabItem('notices', 'Notices', FileText)}

        {/* Spacer for FAB */}
        <View style={{ width: 60 }} />

        {/* Tab 3: Services */}
        {getTabItem('services', 'Services', LayoutGrid)}

        {/* Tab 4: Profile */}
        {getTabItem('profile', 'Profile', User)}
      </View>

      {/* Center FAB */}
      <Pressable
        onPress={handleFABPress}
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
      </Pressable>
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
