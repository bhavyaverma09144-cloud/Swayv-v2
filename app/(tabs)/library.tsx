// app/(tabs)/library.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useLibrary } from '../../src/context/LibraryContext';
import { useAppTheme } from '../../src/context/ThemeContext';
import { useAudio } from '../../src/context/AudioContext';

export default function LibraryScreen() {
  const { songs, isLoading, scanForSongs } = useLibrary();
  const { handlePlayPause } = useAudio();
  const { currentTheme: activeColors } = useAppTheme();

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
        <Pressable onPress={scanForSongs} style={[styles.scanButton, { backgroundColor: activeColors.accent }]}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.scanButtonText}>Scan</Text>
        </Pressable>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {songs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes-outline" size={64} color={activeColors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: activeColors.textPrimary }]}>No Songs Found</Text>
            <Text style={[styles.emptySubtext, { color: activeColors.textSecondary }]}>
              Tap the scan button to search your device for music
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {songs.map((song) => (
              <Pressable
                key={song.id}
                style={[styles.songCard, { backgroundColor: activeColors.surface }]}
                onPress={() => handlePlayPause(song)}
              >
                <View style={[styles.artworkPlaceholder, { backgroundColor: activeColors.border }]}>
                  <Ionicons name="musical-note" size={24} color={activeColors.textSecondary} />
                </View>
                <Text style={[styles.songTitle, { color: activeColors.textPrimary }]} numberOfLines={1}>
                  {song.title}
                </Text>
                <Text style={[styles.songArtist, { color: activeColors.textSecondary }]} numberOfLines={1}>
                  {song.artist}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

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
  title: {
    fontSize: 23,
    fontFamily: 'Sora-Bold',
    letterSpacing: 0.2,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
  emptyContainer: {
    paddingTop: 100,
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