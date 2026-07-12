{// app/(tabs)/library.tsx
//import React, { useState, useCallback, useMemo } from 'react';
//import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image } from 'react-native';
//import Ionicons from '@react-native-vector-icons/ionicons';
//import { useLibrary } from '../../src/context/LibraryContext';
//import { useAppTheme } from '../../src/context/ThemeContext';
//import { useAudio } from '../../src/context/AudioContext';
//import { Song } from '../types/song'; 
//
//interface RenderItemProps {
//  item: Song;
//}
//
//export default function LibraryScreen() {
//  const { clearCacheAndRescan, songs, isLoading } = useLibrary();
//  const { handlePlayPause } = useAudio();
//  const { currentTheme: activeColors } = useAppTheme();
//  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
//
//  const toggleViewMode = () => {
//    setViewMode(prev => (prev === 'list' ? 'grid' : 'list'));
//  };
//
//  const sections = useMemo(() => {
//    const groups: { [key: string]: Song[] } = {};
//
//    songs.forEach((song) => {
//      let folderName = (song as any).folder;
//      
//      if (!folderName && song.uri) {
//        const parts = song.uri.split('/');
//        if (parts.length > 1) {
//          
//          try {
//            folderName = decodeURIComponent(parts[parts.length - 2]);
//          } catch (e) {
//            folderName = parts[parts.length - 2]; 
//          }
//        }
//      }
//      
//      folderName = folderName || 'Internal Storage';
//
//      if (!groups[folderName]) {
//        groups[folderName] = [];
//      }
//      groups[folderName].push(song);
//    });
//
//    return Object.keys(groups).map(folder => ({
//      folderName: folder,
//      data: groups[folder],
//    }));
//  }, [songs]);
//
//  const renderGridItem = useCallback((song: Song) => {
//    const isHslArtwork = song.artwork && song.artwork.startsWith('hsl');
//    const artworkBg = isHslArtwork ? activeColors.border : (song.artwork || activeColors.border);
//
//    return (
//      <Pressable
//        key={song.id}
//        style={[styles.songCard, { backgroundColor: activeColors.surface }]}
//        onPress={() => handlePlayPause(song)}
//      >
//        <View style={[styles.artworkPlaceholder, { backgroundColor: artworkBg }]}>
//          {song.artwork && !isHslArtwork ? (
//            <Image source={{ uri: song.artwork }} style={styles.artworkImage} />
//          ) : (
//            <Ionicons name="musical-note" size={24} color="#FFFFFF" />
//          )}
//        </View>
//        <Text style={[styles.songTitle, { color: activeColors.textPrimary }]} numberOfLines={1}>
//          {song.title}
//        </Text>
//        {song.artist && song.artist !== 'Unknown Artist' && (
//          <Text style={[styles.songArtist, { color: activeColors.textSecondary }]} numberOfLines={1}>
//            {song.artist}
//          </Text>
//        )}
//      </Pressable>
//    );
//  }, [activeColors, handlePlayPause]);
//
//  const renderListItem = useCallback((song: Song) => {
//    const isHslArtwork = song.artwork && song.artwork.startsWith('hsl');
//    const artworkBg = isHslArtwork ? activeColors.border : (song.artwork || activeColors.border);
//
//    return (
//      <Pressable
//        key={song.id}
//        style={[styles.listItem, { backgroundColor: activeColors.surface, borderColor: activeColors.border }]}
//        onPress={() => handlePlayPause(song)}
//      >
//        <View style={[styles.listArtwork, { backgroundColor: artworkBg }]}>
//          {song.artwork && !isHslArtwork ? (
//            <Image source={{ uri: song.artwork }} style={styles.listArtworkImage} />
//          ) : (
//            <Ionicons name="musical-note" size={20} color="#FFFFFF" />
//          )}
//        </View>
//        <View style={styles.listTextContainer}>
//          <Text style={[styles.listTitle, { color: activeColors.textPrimary }]} numberOfLines={1}>
//            {song.title}
//          </Text>
//          {song.artist && song.artist !== 'Unknown Artist' && (
//            <Text style={[styles.listArtist, { color: activeColors.textSecondary }]} numberOfLines={1}>
//              {song.artist}
//            </Text>
//          )}
//        </View>
//        <Pressable onPress={() => handlePlayPause(song)} style={styles.listPlayButton}>
//          <Ionicons name="play-circle" size={28} color={activeColors.accent} />
//        </Pressable>
//      </Pressable>
//    );
//  }, [activeColors, handlePlayPause]);
//
//  const chunkArray = (arr: Song[], size: number) => {
//    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
//      arr.slice(i * size, i * size + size)
//    );
//  };
//
//  if (isLoading) {
//    return (
//      <View style={[styles.centerContainer, { backgroundColor: activeColors.background }]}>
//        <ActivityIndicator size="large" color={activeColors.accent} />
//        <Text style={[styles.loadingText, { color: activeColors.textSecondary }]}>Scanning for songs...</Text>
//      </View>
//    );
//  }
//
//  return (
//    <View style={[styles.container, { backgroundColor: activeColors.background }]}>
//      <View style={styles.header}>
//        <View style={styles.headerRight}>
//          <Pressable onPress={toggleViewMode} style={styles.viewToggle}>
//            <Ionicons 
//              name={viewMode === 'grid' ? 'grid-outline' : 'list-outline'} 
//              size={24} 
//              color={activeColors.textPrimary} 
//            />
//          </Pressable>
//          <Pressable onPress={clearCacheAndRescan} style={[styles.scanButton, { backgroundColor: activeColors.accent }]}>
//            <Ionicons name="refresh" size={20} color="#FFFFFF" />
//            <Text style={styles.scanButtonText}>Scan</Text>
//          </Pressable>
//        </View>
//      </View>
//
//      {songs.length === 0 ? (
//        <ScrollView 
//          showsVerticalScrollIndicator={false}
//          contentContainerStyle={styles.scrollContent}
//        >
//          <View style={styles.emptyContainer}>
//            <Ionicons name="musical-notes-outline" size={64} color={activeColors.textSecondary} />
//            <Text style={[styles.emptyTitle, { color: activeColors.textPrimary }]}>No Songs Found</Text>
//            <Text style={[styles.emptySubtext, { color: activeColors.textSecondary }]}>
//              Tap the scan button to search your device for music
//            </Text>
//          </View>
//        </ScrollView>
//      ) : (
//        <ScrollView 
//          showsVerticalScrollIndicator={false}
//          contentContainerStyle={viewMode === 'grid' ? styles.gridContent : styles.listContent}
//        >
//          {sections.map((section) => (
//            <View key={section.folderName} style={styles.folderSection}>
//              {/* Folder Header */}
//              <View style={styles.folderHeader}>
//                <Ionicons name="folder-open" size={18} color={activeColors.accent} />
//                <Text style={[styles.folderTitle, { color: activeColors.textPrimary }]}>
//                  {section.folderName}
//                </Text>
//                <Text style={[styles.folderCount, { color: activeColors.textSecondary }]}>
//                  ({section.data.length})
//                </Text>
//              </View>
//
//              {/* Render items inside folder based on Grid vs List layout */}
//              {viewMode === 'grid' ? (
//                <View style={styles.gridWrapper}>
//                  {chunkArray(section.data, 2).map((row, rowIndex) => (
//                    <View key={rowIndex} style={styles.gridRow}>
//                      {row.map((song) => renderGridItem(song))}
//                      {row.length === 1 && <View style={styles.songCardFiller} />}
//                    </View>
//                  ))}
//                </View>
//              ) : (
//                <View>
//                  {section.data.map((song) => renderListItem(song))}
//                </View>
//              )}
//            </View>
//          ))}
//        </ScrollView>
//      )}
//    </View>
//  );
//}
//
//const styles = StyleSheet.create({
//  container: { flex: 1 },
//  header: {
//    flexDirection: 'row',
//    justifyContent: 'space-between',
//    alignItems: 'center',
//    paddingHorizontal: 20,
//    
//    paddingBottom: 20,
//  },
//  headerRight: {
//    flexDirection: 'row',
//    alignItems: 'center',
//    gap: 12,
//  },
//  title: {
//    fontSize: 23,
//    fontFamily: 'Sora-Bold',
//    letterSpacing: 0.2,
//  },
//  viewToggle: {
//    padding: 6,
//  },
//  scanButton: {
//    flexDirection: 'row',
//    alignItems: 'center',
//    gap: 6,
//    paddingHorizontal: 16,
//    paddingVertical: 10,
//    borderRadius: 20,
//  },
//  scanButtonText: {
//    color: '#FFFFFF',
//    fontSize: 14,
//    fontFamily: 'AppFont-Medium',
//  },
//  folderSection: {
//    marginBottom: 24,
//  },
//  folderHeader: {
//    flexDirection: 'row',
//    alignItems: 'center',
//    gap: 8,
//    marginBottom: 12,
//    paddingBottom: 4,
//  },
//  folderTitle: {
//    fontSize: 16,
//    fontFamily: 'AppFont-Bold',
//  },
//  folderCount: {
//    fontSize: 13,
//    fontFamily: 'AppFont-Regular',
//  },
//  gridContent: {
//    paddingHorizontal: 20,
//    paddingBottom: 100,
//  },
//  gridWrapper: {
//    flexDirection: 'column',
//  },
//  gridRow: {
//    flexDirection: 'row',
//    justifyContent: 'space-between',
//    marginBottom: 16,
//  },
//  songCard: {
//    width: '47%',
//    padding: 12,
//    borderRadius: 16,
//    alignItems: 'center',
//  },
//  songCardFiller: {
//    width: '47%',
//    backgroundColor: 'transparent',
//  },
//  artworkPlaceholder: {
//    width: '100%',
//    aspectRatio: 1,
//    borderRadius: 12,
//    justifyContent: 'center',
//    alignItems: 'center',
//    marginBottom: 8,
//    overflow: 'hidden',
//  },
//  artworkImage: {
//    width: '100%',
//    height: '100%',
//    resizeMode: 'cover',
//  },
//  songTitle: {
//    fontSize: 14,
//    fontFamily: 'AppFont-Medium',
//    textAlign: 'center',
//  },
//  songArtist: {
//    fontSize: 12,
//    fontFamily: 'AppFont-Regular',
//    textAlign: 'center',
//    marginTop: 2,
//  },
//  listContent: {
//    paddingHorizontal: 20,
//    paddingBottom: 100,
//  },
//  listItem: {
//    flexDirection: 'row',
//    alignItems: 'center',
//    padding: 12,
//    borderRadius: 12,
//    marginBottom: 10,
//    borderWidth: 1,
//  },
//  listArtwork: {
//    width: 48,
//    height: 48,
//    borderRadius: 8,
//    justifyContent: 'center',
//    alignItems: 'center',
//    marginRight: 12,
//    overflow: 'hidden',
//  },
//  listArtworkImage: {
//    width: '100%',
//    height: '100%',
//    resizeMode: 'cover',
//  },
//  listTextContainer: {
//    flex: 1,
//  },
//  listTitle: {
//    fontSize: 15,
//    fontFamily: 'AppFont-Medium',
//  },
//  listArtist: {
//    fontSize: 13,
//    fontFamily: 'AppFont-Regular',
//    marginTop: 2,
//  },
//  listPlayButton: {
//    padding: 6,
//  },
//  centerContainer: {
//    flex: 1,
//    justifyContent: 'center',
//    alignItems: 'center',
//    gap: 16,
//  },
//  loadingText: {
//    fontSize: 14,
//    fontFamily: 'AppFont-Regular',
//  },
//  scrollContent: {
//    flexGrow: 1,
//    justifyContent: 'center',
//    alignItems: 'center',
//    paddingHorizontal: 20,
//  },
//  emptyContainer: {
//    alignItems: 'center',
//    gap: 16,
//  },
//  emptyTitle: {
//    fontSize: 20,
//    fontFamily: 'AppFont-Bold',
//  },
//  emptySubtext: {
//    fontSize: 14,
//    fontFamily: 'AppFont-Regular',
//    textAlign: 'center',
//    paddingHorizontal: 40,
//  },
//});
//
}

import React, { memo, useState } from 'react';
import { FlatList, View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useLibrary } from '../../src/context/LibraryContext';
import { useAppTheme } from '../../src/context/ThemeContext';
import { useAudio } from '../../src/context/AudioContext';
import AnimatedButton from '../../src/components/AnimatedButton';

function ArtistsTab() {
  const { currentTheme: activeColors } = useAppTheme();
  const { songs = [] } = useLibrary();
  const { handlePlayPause } = useAudio();
  
  const [selectedArtist, setSelectedArtist] = useState<{
    name: string;
    songs: typeof songs;
  } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Count songs per artist
  const artistCounts: Record<string, number> = {};
  const artistSongs: Record<string, typeof songs> = {};
  
  songs.forEach(song => {
    const artist = song.artist || 'Unknown Artist';
    artistCounts[artist] = (artistCounts[artist] || 0) + 1;
    if (!artistSongs[artist]) {
      artistSongs[artist] = [];
    }
    artistSongs[artist].push(song);
  });

  // Build artist list with counts
  const validArtists = songs
    .map((song) => song.artist)
    .filter((artist) => artist && artist !== 'Unknown Artist');

  const uniqueArtists = Array.from(new Set(validArtists)).map((artistName) => ({
    id: `artist-${artistName}`,
    name: artistName,
    songCount: artistCounts[artistName] || 0,
  }));

  // Add Unknown Artist group
  const hasUnknownArtists = songs.some(s => !s.artist || s.artist === 'Unknown Artist');
  if (hasUnknownArtists) {
    uniqueArtists.push({
      id: 'artist-unknown',
      name: 'Unknown Artist',
      songCount: artistCounts['Unknown Artist'] || 0,
    });
  }

  // Sort artists alphabetically
  uniqueArtists.sort((a, b) => a.name.localeCompare(b.name));

  const handleArtistPress = (artistName: string) => {
    const artistSongsList = artistSongs[artistName] || [];
    setSelectedArtist({
      name: artistName,
      songs: artistSongsList,
    });
    setModalVisible(true);
  };

  const handleSongPress = (song: any) => {
    handlePlayPause(song);
    setModalVisible(false);
  };

  if (uniqueArtists.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="people-outline" size={48} color={activeColors.textSecondary} />
        <Text style={[styles.emptyText, { color: activeColors.textSecondary }]}>
          No artist data found. Try scanning your library.
        </Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={uniqueArtists}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { backgroundColor: activeColors.background }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable 
            style={[styles.listItem, { borderBottomColor: activeColors.surface }]}
            onPress={() => handleArtistPress(item.name)}
          >
            <Ionicons name="person-circle-outline" size={40} color={activeColors.accent} />
            <View style={styles.textContainer}>
              <Text style={[styles.listText, { color: activeColors.textPrimary }]}>
                {item.name}
              </Text>
              <Text style={[styles.subListText, { color: activeColors.textSecondary }]}>
                {item.songCount} song{item.songCount !== 1 ? 's' : ''}
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward-outline" 
              size={20} 
              color={activeColors.textSecondary} 
              style={styles.chevron}
            />
          </Pressable>
        )}
      />

      {/* Artist Songs Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: activeColors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: activeColors.surface }]}>
            <Pressable 
              onPress={() => setModalVisible(false)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={activeColors.textPrimary} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: activeColors.textPrimary }]}>
              {selectedArtist?.name}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Songs List */}
          <FlatList
            data={selectedArtist?.songs || []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.songsList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable 
                style={[styles.songItem, { borderBottomColor: activeColors.surface }]}
                onPress={() => handleSongPress(item)}
              >
                <Ionicons name="musical-note-outline" size={24} color={activeColors.accent} />
                <View style={styles.songTextContainer}>
                  <Text style={[styles.songTitle, { color: activeColors.textPrimary }]}>
                    {item.title}
                  </Text>
                  {item.album && (
                    <Text style={[styles.songSubtitle, { color: activeColors.textSecondary }]}>
                      {item.album}
                    </Text>
                  )}
                </View>
                <Ionicons 
                  name="play-circle-outline" 
                  size={24} 
                  color={activeColors.accent} 
                />
              </Pressable>
            )}
            ListEmptyComponent={() => (
              <View style={styles.centerContainer}>
                <Text style={[styles.emptyText, { color: activeColors.textSecondary }]}>
                  No songs found for this artist.
                </Text>
              </View>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  listContent: { 
    paddingVertical: 10, 
    paddingBottom: 100
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 12,
    paddingHorizontal: 20,
  },
  emptyText: { 
    fontSize: 14, 
    fontFamily: 'AppFont-Light',
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  listText: { 
    fontSize: 16, 
    fontFamily: 'AppFont-Medium',
  },
  subListText: {
    fontSize: 13,
    fontFamily: 'AppFont-Regular',
    marginTop: 2,
  },
  chevron: {
    marginLeft: 'auto',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'AppFont-Bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  songsList: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  songTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    fontSize: 16,
    fontFamily: 'AppFont-Medium',
  },
  songSubtitle: {
    fontSize: 13,
    fontFamily: 'AppFont-Regular',
    marginTop: 2,
  },
});

export default memo(ArtistsTab);