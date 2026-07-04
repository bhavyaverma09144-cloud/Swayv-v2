import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppTheme } from '../../src/context/ThemeContext';

// Import newly separated tabs
import SuggestedTab from '../../src/components/subTabs/SuggestedTab';
import ArtistsTab from '../../src/components/subTabs/ArtistsTab';
import SongsTab from '../../src/components/subTabs/SongsTab';
import AlbumsTab from '../../src/components/subTabs/AlbumsTab';
import PlaylistsTab from '../../src/components/subTabs/PlaylistsTab';

const topTabSpringConfig = { damping: 25, stiffness: 800, mass: 0.5 };
const TOP_TABS = ['Suggested', 'Artists', 'Songs', 'Albums', 'Playlists'];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [tabLayouts, setTabLayouts] = useState<Record<number, { x: number; width: number }>>({});
  const { currentTheme: activeColors } = useAppTheme();

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const currentLayout = tabLayouts[activeTab];
    return {
      transform: [{ translateX: withSpring(currentLayout ? currentLayout.x : 0, topTabSpringConfig) }],
      width: withSpring(currentLayout ? currentLayout.width : 0, topTabSpringConfig),
    };
  }, [tabLayouts, activeTab]);

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 0: return <SuggestedTab />;
      case 1: return <ArtistsTab />;
      case 2: return <SongsTab />;
      case 3: return <AlbumsTab />;
      case 4: return <PlaylistsTab />;
      default: return <SuggestedTab />;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
        
        {/* Header */}
        <View style={[styles.headerRow, { backgroundColor: activeColors.background }]}>
          <View style={styles.headerLeft}>
            <Ionicons name="musical-notes" size={30} color={activeColors.accent} style={styles.icon}/>
            <Text style={[styles.title, { color: activeColors.textPrimary }]}>Swayv</Text>
          </View>
          <Pressable style={[styles.searchContainer, { backgroundColor: activeColors.surface }]}>
            <Ionicons name="search" size={20} color={activeColors.textSecondary} />
          </Pressable>
        </View>
        
        {/* Top Tab Bar */}
        <View style={styles.topTabBarWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
            {TOP_TABS.map((tab, index) => {
              const isFocused = activeTab === index;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(index)}
                  onLayout={(event) => {
                    const { x, width } = event.nativeEvent.layout;
                    setTabLayouts((prev) => ({ ...prev, [index]: { x, width } }));
                  }}
                  style={styles.tabPressable}
                >
                  <Text style={[
                    styles.tabText, 
                    { color: isFocused ? activeColors.accent : activeColors.textSecondary }
                  ]}>
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
            <Animated.View style={[
              styles.activeUnderline, 
              { backgroundColor: activeColors.accent }, 
              animatedIndicatorStyle
            ]} />
          </ScrollView>
        </View>

        {/* Content View Container */}
        <View style={styles.contentContainer}>
          {renderActiveTabContent()}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24,
    paddingBottom: 15,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 5 },
  title: { 
    fontSize: 20, 
    letterSpacing: 0.3,
    fontFamily: 'Brand-Header', 
    margin: 10,
    marginLeft: 0,
  },
  searchContainer: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  topTabBarWrapper: { height: 45, marginBottom: 10 },
  scrollContainer: { paddingHorizontal: 16, position: 'relative', flexDirection: 'row' },
  tabPressable: { paddingHorizontal: 14, justifyContent: 'center', height: '100%' },
  tabText: { fontSize: 12, fontFamily: 'AppFont-Medium', letterSpacing: 0.1 },
  activeUnderline: { 
    position: 'absolute', 
    bottom: 0, 
    height: 3, 
    borderRadius: 1.5 
  },
  contentContainer: { 
    flex: 1, 
    paddingHorizontal: 20 
  },
});

