// app/(tabs)/library.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, FlatList, Image } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useLibrary } from '../../src/context/LibraryContext';
import { useAppTheme } from '../../src/context/ThemeContext';
import { useAudio } from '../../src/context/AudioContext';
import { song as SongType } from '../types/song'; // Aliasing to distinguish from item naming if lowercase

interface RenderItemProps {
  item: typeof SongType;
}

export default function LibraryScreen() {
  const { clearCacheAndRescan, songs, isLoading } = useLibrary();
  const { handlePlayPause } = useAudio();
  const { currentTheme: activeColors } = useAppTheme();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'list' ? 'grid' : 'list'));
  };

  // Wrapped in useCallback to preserve component instance memory states across state flips
  const renderGridItem = useCallback(({ item: song }: RenderItemProps) => {
    const isHslArtwork = song.artwork && song.artwork.startsWith('hsl');
    const artworkBg = isHslArtwork ? activeColors.border : (song.artwork || activeColors.border);

    return (
      <Pressable
        style={[styles.songCard, { backgroundColor: activeColors.surface }]}
        onPress={() => handlePlayPause(song)}
      >
        <View style={[styles.artworkPlaceholder, { backgroundColor: artworkBg }]}>
          {song.artwork && !isHslArtwork ? (
            <Image source={{ uri: song.artwork }} style={styles.artworkImage} />
          ) : (
            <Ionicons name="musical-note" size={24} color="#FFFFFF" />
          )}
        </View>
        <Text style={[styles.songTitle, { color: activeColors.textPrimary }]} numberOfLines={1}>
          {song.title}
        </Text>
        {song.artist && song.artist !== 'Unknown Artist' && (
          <Text style={[styles.songArtist, { color: activeColors.textSecondary }]} numberOfLines={1}>
            {song.artist}
          </Text>
        )}
      </Pressable>
    );
  }, [activeColors, handlePlayPause]);

  const renderListItem = useCallback(({ item: song }: RenderItemProps) => {
    const isHslArtwork = song.artwork && song.artwork.startsWith('hsl');
    const artworkBg = isHslArtwork ? activeColors.border : (song.artwork || activeColors.border);

    return (
      <Pressable
        style={[styles.listItem, { backgroundColor: activeColors.surface, borderColor: activeColors.border }]}
        onPress={() => handlePlayPause(song)}
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
        <Pressable onPress={() => handlePlayPause(song)} style={styles.listPlayButton}>
          <Ionicons name="play-circle" size={28} color={activeColors.accent} />
        </Pressable>
      </Pressable>
    );
  }, [activeColors, handlePlayPause]);

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: activeColors.background }]}>
        <ActivityIndicator size="large" color={activeColors.accent} />
        <Text style={[styles.loadingText, { color: activeColors.textSecondary }]}>Scanning for songs...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: activeColors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: activeColors.textPrimary }]}>Your Library</Text>
        <View style={styles.headerRight}>
          <Pressable onPress={toggleViewMode} style={styles.viewToggle}>
            <Ionicons 
              name={viewMode === 'grid' ? 'grid-outline' : 'list-outline'} 
              size={24} 
              color={activeColors.textPrimary} 
            />
          </Pressable>
          <Pressable onPress={clearCacheAndRescan} style={[styles.scanButton, { backgroundColor: activeColors.accent }]}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.scanButtonText}>Scan</Text>
          </Pressable>
        </View>
      </View>

      {songs.length === 0 ? (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes-outline" size={64} color={activeColors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: activeColors.textPrimary }]}>No Songs Found</Text>
            <Text style={[styles.emptySubtext, { color: activeColors.textSecondary }]}>
              Tap the scan button to search your device for music
            </Text>
          </View>
        </ScrollView>
      ) : viewMode === 'grid' ? (
        <FlatList
          key="grid"
          data={songs}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.gridRow}
        />
      ) : (
        <FlatList
          key="list"
          data={songs}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// ... styles object remains unchanged ...
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 23,
    fontFamily: 'Sora-Bold',
    letterSpacing: 0.2,
  },
  viewToggle: {
    padding: 6,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'AppFont-Medium',
  },
  gridContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  songCard: {
    width: '47%',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  artworkPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  songTitle: {
    fontSize: 14,
    fontFamily: 'AppFont-Medium',
    textAlign: 'center',
  },
  songArtist: {
    fontSize: 12,
    fontFamily: 'AppFont-Regular',
    textAlign: 'center',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  listArtwork: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  listArtworkImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  listTextContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 15,
    fontFamily: 'AppFont-Medium',
  },
  listArtist: {
    fontSize: 13,
    fontFamily: 'AppFont-Regular',
    marginTop: 2,
  },
  listPlayButton: {
    padding: 6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'AppFont-Regular',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'AppFont-Bold',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'AppFont-Regular',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
