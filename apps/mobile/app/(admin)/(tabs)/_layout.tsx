import React from 'react';
import { View, Pressable, StyleSheet, Dimensions, Alert } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, FileText, Settings, User } from 'lucide-react-native';
import { Text } from '@repo/ui';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

function AmbitAIcon({ size = 24, color = '#000000' }: { size?: number; color?: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path
        d="M 5 19 L 12 4 L 19 19"
        stroke={color}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M 8.5 13 C 10.5 11.5, 13.5 11.5, 15.5 13"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function AdminTabLayout() {
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
        name="manage"
        options={{
          title: 'Manage',
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
      "Admin Actions",
      "Quick admin actions for managing your society.",
      [
        { text: "Post Notice", onPress: () => {} },
        { text: "Invite Resident", onPress: () => {} },
        { text: "View Visitor Logs", style: "default" },
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
    const color = isFocused ? "#000000" : "#9CA3AF";
    const fill = isFocused ? "#000000" : "transparent";

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
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.08,
          shadowRadius: 15,
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

        {/* Tab 3: Manage */}
        {getTabItem('manage', 'Manage', Settings)}

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
          shadowColor: '#2E7D32',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 8,
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
            colors={['#D0F0C0', '#C3E2C4']}
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
          <View style={{ transform: [{ rotate: '0deg' }] }}>
            <AmbitAIcon size={24} color="#000000" />
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
