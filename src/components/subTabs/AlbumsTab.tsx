import React, { memo } from 'react';
import { FlatList, View, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAudio } from '../../context/AudioContext';
import { useAppTheme } from '../../context/ThemeContext';

function AlbumsTab() {
  const { currentTheme: activeColors } = useAppTheme();
  const { allSongs = [] } = useAudio();

  // Extract unique albums
  const uniqueAlbums = allSongs.reduce((acc: any[], current: any) => {
    if (current.album && !acc.some(item => item.title === current.album)) {
      acc.push({
        id: `album-${current.id}`,
        title: current.album,
        artist: current.artist,
      });
    }
    return acc;
  }, []);

  if (uniqueAlbums.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.emptyText, { color: activeColors.textSecondary }]}>No albums found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={uniqueAlbums}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <Pressable style={[styles.listItem, { borderBottomColor: activeColors.surface }]}>
          <Ionicons name="disc-outline" size={35} color={activeColors.accent || activeColors.iconDefault} />
          <View style={styles.textContainer}>
            <Text style={[styles.listText, { color: activeColors.textPrimary }]}>{item.title}</Text>
            <Text style={[styles.subListText, { color: activeColors.textSecondary }]}>{item.artist}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingVertical: 10 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 14, fontFamily: 'AppFont-Light' },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  textContainer: {
    flexDirection: 'column',
    marginLeft: 15,
  },
  listText: {
    fontSize: 15,
    fontFamily: 'AppFont-Medium',
  },
  subListText: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default memo(AlbumsTab);
