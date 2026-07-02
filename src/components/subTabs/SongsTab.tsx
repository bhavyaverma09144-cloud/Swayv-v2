import React, { memo } from 'react';
import { FlatList, View, Text, StyleSheet, Pressable } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAudio } from '../../context/AudioContext';
import { useAppTheme } from '../../context/ThemeContext';

function SongsTab() {
  const { currentTheme: activeColors } = useAppTheme();
  const { allSongs = [], currentSong, isPlaying, handlePlayPause } = useAudio();

  if (allSongs.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.emptyText, { color: activeColors.textSecondary }]}>No songs found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={allSongs}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const isCurrentTrack = currentSong?.id === item.id;
        const showPauseIcon = isCurrentTrack && isPlaying;

        return (
          <Pressable 
            style={[styles.listItem, { borderBottomColor: activeColors.surface }]}
            onPress={() => handlePlayPause(item)}
          >
            <Ionicons 
              name={showPauseIcon ? "pause-circle" : "play-circle"} 
              size={32} 
              color={isCurrentTrack ? activeColors.accent : activeColors.textSecondary} 
            />
            <View style={styles.textContainer}>
              <Text style={[
                styles.listText, 
                { color: isCurrentTrack ? activeColors.accent : activeColors.textPrimary }
              ]}>
                {item.title}
              </Text>
              <Text style={[styles.subListText, { color: activeColors.textSecondary }]}>
                {item.artist}
              </Text>
            </View>
          </Pressable>
        );
      }}
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
    flex: 1,
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

export default memo(SongsTab);
