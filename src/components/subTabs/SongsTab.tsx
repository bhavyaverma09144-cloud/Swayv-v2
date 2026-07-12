// src/components/subTabs/SongsTab.tsx
import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useLibrary } from '../../context/LibraryContext';
import { useAudio } from '../../context/AudioContext';
import { useAppTheme } from '../../context/ThemeContext';
import { Song } from '../../types/song'; // Double check this path matches your structure

interface SongsTabProps {
  searchQuery: string;
}

export default function SongsTab({ searchQuery }: SongsTabProps) {
  const { songs } = useLibrary();
  const { handlePlayPause } = useAudio();
  const { currentTheme: activeColors } = useAppTheme();

  // Filter songs array dynamically based on the input query
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;

    const query = searchQuery.toLowerCase().trim();
    return songs.filter(
      (song) =>
        song.title?.toLowerCase().includes(query) ||
        song.artist?.toLowerCase().includes(query)
    );
  }, [songs, searchQuery]);

  const renderItem = useCallback(({ item: song }: { item: Song }) => {
    const isHslArtwork = song.artwork && song.artwork.startsWith('hsl');
    const artworkBg = isHslArtwork ? activeColors.border : (song.artwork || activeColors.border);

    return (
      <Pressable
        key={song.id}
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

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={activeColors.textSecondary} />
            <Text style={[styles.emptyText, { color: activeColors.textSecondary }]}>
              No songs found matching "{searchQuery}"
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 40 },
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
  listTextContainer: { flex: 1 },
  listTitle: { fontSize: 15, fontFamily: 'AppFont-Medium' },
  listArtist: { fontSize: 13, fontFamily: 'AppFont-Regular', marginTop: 2 },
  listPlayButton: { padding: 6 },
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: 'AppFont-Regular', textAlign: 'center' },
});
