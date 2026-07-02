import React, { memo } from 'react';
import { FlatList, View, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useLibrary } from '../../context/LibraryContext';
import { useAppTheme } from '../../context/ThemeContext';

function ArtistsTab() {
  const { currentTheme: activeColors } = useAppTheme();
  const { songs = [] } = useLibrary(); // <-- Pulling from LibraryContext now

  // 1. Extract unique artist names, filtering out empty strings or defaults
  const validArtists = songs
    .map((song) => song.artist)
    .filter((artist) => artist && artist !== 'Unknown Artist');

  const uniqueArtists = Array.from(new Set(validArtists)).map((artistName, index) => ({
    id: `artist-${index}`,
    name: artistName,
  }));

  // 2. Add an "Unknown Artist" group at the end if any songs lack metadata
  const hasUnknownArtists = songs.some(s => !s.artist || s.artist === 'Unknown Artist');
  if (hasUnknownArtists) {
    uniqueArtists.push({ id: 'artist-unknown', name: 'Unknown Artist' });
  }

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
    <FlatList
      data={uniqueArtists}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <Pressable style={[styles.listItem, { borderBottomColor: activeColors.surface }]}>
          <Ionicons name="person-circle-outline" size={40} color={activeColors.accent} />
          <Text style={[styles.listText, { color: activeColors.textPrimary }]}>{item.name}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingVertical: 10, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, fontFamily: 'AppFont-Light' },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  listText: { fontSize: 15, marginLeft: 15, fontFamily: 'AppFont-Medium' },
});

export default memo(ArtistsTab);
