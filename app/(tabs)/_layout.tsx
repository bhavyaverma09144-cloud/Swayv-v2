// app/(tabs)/_layout.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Tabs } from 'expo-router';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import Ionicons from '@react-native-vector-icons/ionicons';

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

SplashScreen.preventAutoHideAsync();

const pillSpringConfig = { damping: 18, stiffness: 160, mass: 0.5 };
const iconSpringConfig = { damping: 12, stiffness: 180, mass: 0.4 };

function TabItem({ route, isFocused, onPress, activeColors }: any) {
  const labels: Record<string, string> = {
    index: 'Home',
    favorite: 'Favorite',
    library: 'Library',
    settings: 'Settings',
  };

  const icons: Record<string, string> = {
    index: 'musical-notes',
    favorite: 'heart',
    library: 'albums',
    settings: 'settings',
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

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    />
  );
}

const styles = StyleSheet.create({
  tabBarContainer: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    height: 105, 
    paddingBottom: 25, 
    alignItems: 'center', 
    paddingHorizontal: 10 
  },
  buttonWrapper: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100%', 
    zIndex: 2 
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
});