import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppTheme } from '../../src/context/ThemeContext';
import { useLibrary } from '../../src/context/LibraryContext';
import { useAudio } from '../../src/context/AudioContext';
import { Song } from '../types/song';

const folderTabSpringConfig = { damping: 25, stiffness: 800, mass: 0.5 };

interface SortableTabProps {
  folder: string;
  isActive: boolean;
  onPress: () => void;
  onLayout: (x: number, width: number) => void;
  onDragEnd: (folderName: string, translationX: number) => void;
  activeColors: any;
}

function SortableFolderTab({ folder, isActive, onPress, onLayout, onDragEnd, activeColors }: SortableTabProps) {
  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(400)
    .onStart(() => {
      contextX.value = translateX.value;
      isDragging.value = true;
    })
    .onUpdate((event) => {
      translateX.value = contextX.value + event.translationX;
    })
    .onEnd((event) => {
      isDragging.value = false;
      runOnJS(onDragEnd)(folder, event.translationX);
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      zIndex: isDragging.value ? 999 : 1,
      opacity: isDragging.value ? 0.8 : 1,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View 
        style={[animatedStyle, styles.tabPressable]}
        onLayout={(event) => {
          const { x, width } = event.nativeEvent.layout;
          onLayout(x, width);
        }}
      >
        <Pressable onPress={onPress}>
          <Text style={[
            styles.tabText, 
            { color: isActive ? activeColors.accent : activeColors.textSecondary }
          ]}>
            {folder}
          </Text>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

export default function HomeScreen() {
  const { songs } = useLibrary();
  const { handlePlayPause } = useAudio();
  const { currentTheme: activeColors } = useAppTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ openSearch?: string }>();

  const [activeFolder, setActiveFolder] = useState<string>('All');
  const [tabLayouts, setTabLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const [orderedFolders, setOrderedFolders] = useState<string[]>([]);

  // Search States
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);

  // Synchronize opening lookups triggered from Global Context Layout Header Action
  useEffect(() => {
    if (params.openSearch === 'true') {
      setSearchVisible(true);
      // Reset router parameter flag to allow future triggers cleanly
      router.setParams({ openSearch: undefined });
      setTimeout(() => searchInputRef.current?.focus(), 150);
    }
  }, [params.openSearch]);

  const rawFolders = useMemo(() => {
    const uniqueFolders = new Set<string>();
    songs.forEach((song) => {
      let folderName = (song as any).folder;
      if (!folderName && song.uri) {
        const parts = song.uri.split('/');
        if (parts.length > 1) {
          try { folderName = decodeURIComponent(parts[parts.length - 2]); } catch { folderName = parts[parts.length - 2]; }
        }
      }
      uniqueFolders.add(folderName || 'Internal Storage');
    });
    return Array.from(uniqueFolders);
  }, [songs]);

  useEffect(() => {
    if (rawFolders.length > 0) {
      setOrderedFolders((prev) => {
        const structuralDiff = rawFolders.filter(f => !prev.includes(f));
        return [...prev.filter(f => rawFolders.includes(f)), ...structuralDiff];
      });
    }
  }, [rawFolders]);

  const handleDragEnd = useCallback((folderName: string, translationX: number) => {
    const currentLayout = tabLayouts[folderName];
    if (!currentLayout) return;

    const targetX = currentLayout.x + translationX;
    const itemsWithLayout = orderedFolders
      .map(name => ({ name, layout: tabLayouts[name] }))
      .filter(item => item.layout);

    let targetIndex = orderedFolders.indexOf(folderName);
    
    for (let i = 0; i < itemsWithLayout.length; i++) {
      const item = itemsWithLayout[i];
      if (item.name === folderName) continue;
      
      const midpoint = item.layout.x + item.layout.width / 2;
      if (translationX > 0 && targetX > midpoint) {
        targetIndex = orderedFolders.indexOf(item.name);
      } else if (translationX < 0 && targetX < midpoint) {
        targetIndex = orderedFolders.indexOf(item.name);
        break;
      }
    }

    const currentIndex = orderedFolders.indexOf(folderName);
    if (currentIndex !== targetIndex) {
      const updatedList = [...orderedFolders];
      updatedList.splice(currentIndex, 1);
      updatedList.splice(targetIndex, 0, folderName);
      setOrderedFolders(updatedList);
    }
  }, [orderedFolders, tabLayouts]);

  const displayedSongs = useMemo(() => {
    if (activeFolder === 'All') return songs;
    return songs.filter((song) => {
      let folderName = (song as any).folder;
      if (!folderName && song.uri) {
        const parts = song.uri.split('/');
        folderName = parts.length > 1 ? decodeURIComponent(parts[parts.length - 2]) : null;
      }
      return (folderName || 'Internal Storage') === activeFolder;
    });
  }, [songs, activeFolder]);

  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return songs.filter(song => 
      song.title?.toLowerCase().includes(query) || 
      song.artist?.toLowerCase().includes(query)
    );
  }, [songs, searchQuery]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const currentLayout = tabLayouts[activeFolder];
    return {
      transform: [{ translateX: withSpring(currentLayout ? currentLayout.x : 0, folderTabSpringConfig) }],
      width: withSpring(currentLayout ? currentLayout.width : 0, folderTabSpringConfig),
    };
  }, [tabLayouts, activeFolder]);

  const renderSongItem = useCallback(({ item: song }: { item: Song }) => {
    const isHslArtwork = song.artwork && song.artwork.startsWith('hsl');
    const artworkBg = isHslArtwork ? activeColors.border : (song.artwork || activeColors.border);

    return (
      <Pressable
        style={[styles.listItem, { backgroundColor: activeColors.surface, borderColor: activeColors.border }]}
        onPress={() => {
          handlePlayPause(song);
          if (searchVisible) setSearchVisible(false);
        }}
      >
        <View style={[styles.listArtwork, { backgroundColor: artworkBg }]}>
          {song.artwork && !isHslArtwork ? (
            <Image source={{ uri: song.artwork }} style={styles.listArtworkImage} />
          ) : (
            <Ionicons name="musical-note" size={20} color="#FFFFFF" />
          )}
        </View>
        <View style={styles.listTextContainer}>
          <Text style={[styles.listTitle, { color: activeColors.textPrimary }]} numberOfLines={1}>
            {song.title}
          </Text>
          {song.artist && song.artist !== 'Unknown Artist' && (
            <Text style={[styles.listArtist, { color: activeColors.textSecondary }]} numberOfLines={1}>
              {song.artist}
            </Text>
          )}
        </View>
        <Ionicons name="play-circle" size={28} color={activeColors.accent} style={styles.listPlayButton} />
      </Pressable>
    );
  }, [activeColors, handlePlayPause, searchVisible]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: activeColors.background }]}>
        
        {/* Sortable Dynamic Folders Sub-Header Tray */}
        <View style={styles.topTabBarWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
            <View 
              style={styles.tabPressable}
              onLayout={(event) => {
                const { x, width } = event.nativeEvent.layout;
                setTabLayouts((prev) => ({ ...prev, All: { x, width } }));
              }}
            >
              <Pressable onPress={() => setActiveFolder('All')}>
                <Text style={[styles.tabText, { color: activeFolder === 'All' ? activeColors.accent : activeColors.textSecondary, fontWeight: '700' }]}>
                  All
                </Text>
              </Pressable>
            </View>

            {orderedFolders.map((folder) => (
              <SortableFolderTab
                key={folder}
                folder={folder}
                isActive={activeFolder === folder}
                activeColors={activeColors}
                onPress={() => setActiveFolder(folder)}
                onLayout={(x, width) => setTabLayouts((prev) => ({ ...prev, [folder]: { x, width } }))}
                onDragEnd={handleDragEnd}
              />
            ))}

            <Animated.View style={[styles.activeUnderline, { backgroundColor: activeColors.accent }, animatedIndicatorStyle]} />
          </ScrollView>
        </View>

        {/* Dynamic Track Panel Feed */}
        <View style={styles.contentContainer}>
          <FlatList
            data={displayedSongs}
            keyExtractor={(item) => item.id}
            renderItem={renderSongItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.mainListContent}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: activeColors.textSecondary }]}>No audio items located here.</Text>
            }
          />
        </View>

        {/* Global Modal Layer context */}
        <Modal visible={searchVisible} animationType="slide" transparent={false} onRequestClose={() => setSearchVisible(false)}>
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: activeColors.background }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalSearchInputRow, { backgroundColor: activeColors.surface }]}>
                <Ionicons name="search" size={20} color={activeColors.textSecondary} />
                <TextInput
                  ref={searchInputRef}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search across songs or artists..."
                  placeholderTextColor={activeColors.textSecondary}
                  style={[styles.textInput, { color: activeColors.textPrimary }]}
                  returnKeyType="search"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')} style={styles.closeButton}>
                    <Ionicons name="close-circle" size={18} color={activeColors.textSecondary} />
                  </Pressable>
                )}
              </View>
              <Pressable onPress={() => { setSearchVisible(false); setSearchQuery(''); }} style={styles.cancelTextButton}>
                <Text style={{ color: activeColors.accent, fontSize: 15, fontFamily: 'AppFont-Medium' }}>Cancel</Text>
              </Pressable>
            </View>

            <View style={{ flex: 1, paddingHorizontal: 20 }}>
              <FlatList
                data={filteredSearchResults}
                keyExtractor={(item) => item.id}
                renderItem={renderSongItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.mainListContent}
                ListEmptyComponent={
                  searchQuery.trim().length > 0 ? (
                    <Text style={[styles.emptyText, { color: activeColors.textSecondary }]}>No matches for "{searchQuery}"</Text>
                  ) : (
                    <View style={styles.modalPromptContainer}>
                      <Ionicons name="musical-notes-outline" size={54} color={activeColors.border} />
                      <Text style={[styles.emptyText, { color: activeColors.textSecondary }]}>Type track title or artist information</Text>
                    </View>
                  )
                }
              />
            </View>
          </SafeAreaView>
        </Modal>

      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topTabBarWrapper: { height: 45, marginBottom: 10 },
  scrollContainer: { paddingHorizontal: 16, position: 'relative', flexDirection: 'row', alignItems: 'center', },
  tabPressable: { paddingHorizontal: 14, justifyContent: 'center', height: '100%' },
  tabText: { fontSize: 13, fontFamily: 'AppFont-Medium', letterSpacing: 0.1 },
  activeUnderline: { position: 'absolute', bottom: 0, height: 3, borderRadius: 1.5 },
  contentContainer: { flex: 1, paddingHorizontal: 20 },
  mainListContent: { paddingBottom: 100, paddingTop: 10 },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1 },
  listArtwork: { width: 48, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
  listArtworkImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  listTextContainer: { flex: 1 },
  listTitle: { fontSize: 15, fontFamily: 'AppFont-Medium' },
  listArtist: { fontSize: 13, fontFamily: 'AppFont-Regular', marginTop: 2 },
  listPlayButton: { padding: 4 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 14, fontFamily: 'AppFont-Regular' },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  modalSearchInputRow: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 44, borderRadius: 22 },
  textInput: { flex: 1, fontSize: 15, marginLeft: 8, paddingVertical: 0 },
  closeButton: { padding: 4 },
  cancelTextButton: { paddingVertical: 8 },
  modalPromptContainer: { alignItems: 'center', marginTop: 80, gap: 12 }
});

