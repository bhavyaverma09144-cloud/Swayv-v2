import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Tabs, usePathname, useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLibrary } from '../../src/context/LibraryContext';

import { 
  useFonts, 
  PlusJakartaSans_300Light, 
  PlusJakartaSans_400Regular, 
  PlusJakartaSans_500Medium, 
  PlusJakartaSans_600SemiBold, 
  PlusJakartaSans_700Bold 
} from '@expo-google-fonts/plus-jakarta-sans';
import { Inter_400Regular } from '@expo-google-fonts/inter';
import { SpaceGrotesk_300Light, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { Sora_400Regular, Sora_700Bold } from '@expo-google-fonts/sora';
import { Syne_400Regular, Syne_700Bold } from '@expo-google-fonts/syne';

import AnimatedButton from '../../src/components/AnimatedButton';
import { useAppTheme } from '../../src/context/ThemeContext';
import AudioPlayerOverlay from '../../src/components/AudioPlayerOverlay/index';

SplashScreen.preventAutoHideAsync();

const pillSpringConfig = { damping: 18, stiffness: 160, mass: 0.5 };
const iconSpringConfig = { damping: 12, stiffness: 180, mass: 0.4 };

function TabItem({ route, isFocused, onPress, activeColors }: any) {
  const labels: Record<string, string> = {
    index: 'Songs',
    favorite: 'Albums',
    library: 'Artists',
    settings: 'Playlists',
  };

  const icons: Record<string, string> = {
    index: 'musical-notes',
    favorite: 'albums',
    library: 'people',
    settings: 'list',
  };

  const label = labels[route.name] || route.name;
  const iconName = icons[route.name] || 'ellipse';

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isFocused ? 1.15 : 1, iconSpringConfig) }],
  }));

  const animatedPillStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -28 },
      { translateY: -18 },
      { scale: withSpring(isFocused ? 1 : 0.5, pillSpringConfig) },
    ],
    opacity: withSpring(isFocused ? 1 : 0, pillSpringConfig),
  }));

  return (
    <AnimatedButton onPress={onPress} style={styles.buttonWrapper}>
      <View style={styles.tabItemContainer}>
        <View style={styles.iconContainer}>
          <Animated.View style={[
            styles.pillBackground, 
            { backgroundColor: `${activeColors.accent}1a` }, 
            animatedPillStyle
          ]} />
          
          <Animated.View style={animatedIconStyle}>
            <Ionicons 
              name={iconName as any} 
              size={22} 
              color={isFocused ? activeColors.accent : activeColors.textSecondary} 
            />
          </Animated.View>
        </View>

        <Text
          numberOfLines={1}
          style={[
            styles.tabLabel,
            { 
              color: isFocused ? activeColors.accent : activeColors.textSecondary, 
              fontFamily: isFocused ? 'Mono-Bold' : 'Mono-Light' 
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </AnimatedButton>
  );
}

function CustomTabBar(props: any) {
  const { currentTheme: activeColors } = useAppTheme();

  return (
    <View style={[styles.tabBarContainer, { backgroundColor: activeColors.background, borderTopColor: activeColors.border }]}>
      {props.state.routes.map((route: any, index: number) => {
        const isFocused = props.state.index === index;
        const onPress = () => {
          const event = props.navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) props.navigation.navigate(route.name);
        };
        return <TabItem key={route.key} route={route} isFocused={isFocused} onPress={onPress} activeColors={activeColors} />;
      })}
    </View>
  );
}

export default function TabsLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const expansionProgress = useSharedValue(0);
  const { currentTheme: activeColors } = useAppTheme();
  const { clearCacheAndRescan } = useLibrary();

  const [fontsLoaded, fontError] = useFonts({
    'AppFont-Light': PlusJakartaSans_300Light,
    'AppFont-Regular': PlusJakartaSans_400Regular,
    'AppFont-Medium': PlusJakartaSans_500Medium,
    'AppFont-SemiBold': PlusJakartaSans_600SemiBold,
    'AppFont-Bold': PlusJakartaSans_700Bold,
    'Brand-Header': Syne_700Bold,
    'Inter': Inter_400Regular,
    'Sora': Sora_400Regular,
    'Sora-Bold': Sora_700Bold,
    'Syne-Regular': Syne_400Regular,
    'Syne-Bold': Syne_700Bold,
    'Mono-Light': SpaceGrotesk_300Light,
    'Mono-Regular': SpaceGrotesk_600SemiBold,
    'Mono-Bold': SpaceGrotesk_700Bold,
  });

  const labels: Record<string, string> = {
    '/': 'Songs',
    '/favorite': 'Albums',
    '/library': 'Artists',
    '/settings': 'Playlists',
  };

  const currentHeaderTitle = labels[pathname] || 'Music';
  
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  const isSettings = pathname === '/settings';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]} edges={['top']}>
      {/* Global Persistent Header Section */}
      <View style={[styles.headerContainer, { borderColor: activeColors.border, backgroundColor: activeColors.background }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Pressable 
              style={[styles.utilityButton, { backgroundColor: activeColors.surface }]}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="reorder-three" size={20} color={activeColors.textSecondary} />
            </Pressable>
            <Pressable onPress={clearCacheAndRescan} style={[styles.scanButton, { backgroundColor: activeColors.accent }]}>
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <Text style={[styles.title, { color: activeColors.textPrimary }]}>
            {currentHeaderTitle}
          </Text>

          <View style={styles.headerRight}>
            <Pressable 
              style={[styles.utilityButton, { backgroundColor: activeColors.surface }]} 
              onPress={() => router.setParams({ openSearch: 'true' })}
            >
              <Ionicons name="search" size={20} color={activeColors.textSecondary} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Main Tabs Content Router Outlet */}
      <View style={styles.contentContainer}>
        <Tabs
          screenOptions={{ headerShown: false }}
          tabBar={(props) => <CustomTabBar {...props} />}
        />
      </View>

      {/* Player overlay - visually sits under the navigation bar natively */}
      {!isSettings && (
        <AudioPlayerOverlay expansionProgress={expansionProgress} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  headerContainer: { 
    height: 64,
    borderBottomWidth: 1,
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    height: '100%' 
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 20, letterSpacing: 0.3, fontFamily: 'Mono-Bold' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  utilityButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  contentContainer: {
    flex: 1,
  },
  tabBarContainer: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    height: 105, 
    paddingBottom: 25, 
    alignItems: 'center', 
    paddingHorizontal: 10,
    zIndex: 2,           // Kept elevated on top of PlayerOverlay
    elevation: 2,
  },
  buttonWrapper: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100%', 
    zIndex: 3
  },
  tabItemContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '100%', 
    gap: 4 
  },
  iconContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: 60, 
    height: 32 
  },
  pillBackground: { 
    position: 'absolute', 
    width: 56, 
    height: 36, 
    borderRadius: 20, 
    left: '50%', 
    top: '50%', 
    zIndex: 0 
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  scanButton: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40 ,
  }
});
