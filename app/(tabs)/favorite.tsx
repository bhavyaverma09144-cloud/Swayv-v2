// app/(tabs)/favorite.tsx
import React, { memo } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAudio } from '../../src/context/AudioContext';
import { useAppTheme } from '../../src/context/ThemeContext';

function FavoritesTab() {
  const { isPlaying, currentSong, handlePlayPause, favoriteSongs } = useAudio();
  const { currentTheme: activeColors } = useAppTheme();

  return (
    <ScrollView 
      contentContainerStyle={[styles.mainScroll, { backgroundColor: activeColors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: activeColors.textPrimary }]}>Your Favorites</Text>
      
      <View style={styles.gridRow}>
        {favoriteSongs.length > 0 ? (
          favoriteSongs.map((song) => {
            const isCurrentTrack = currentSong?.id === song.id;
            const showPauseIcon = isCurrentTrack && isPlaying;

            return (
              <Pressable 
                key={`fav-screen-${song.id}`}
                style={[styles.playableItem, { backgroundColor: activeColors.surface }]} 
                onPress={() => handlePlayPause(song)}
              >
                <Ionicons 
                  name={showPauseIcon ? "pause-circle" : "play-circle"} 
                  size={52} 
                  color={activeColors.iconDefault}
                />
                <Text style={[styles.itemText, { color: activeColors.textSecondary }]} numberOfLines={1}>
                  {song.title}
                </Text>
                {isCurrentTrack && (
                  <Text style={[styles.nowPlayingIndicator, { color: activeColors.iconDefault }]}>
                    {isPlaying ? "Playing" : "Paused"}
                  </Text>
                )}
              </Pressable>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-dislike-outline" size={48} color={activeColors.textSecondary} />
            <Text style={[styles.emptyText, { color: activeColors.textSecondary }]}>
              You haven't favorited any tracks yet!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainScroll: { 
    paddingTop: 60,
    paddingHorizontal: 20, 
    paddingBottom: 40, 
    flexGrow: 1,
  },
  sectionTitle: { 
    fontSize: 23, 
    fontFamily: 'Sora-Bold', 
    letterSpacing: 0.2,
    marginBottom: 24,
  },
  gridRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 16,
  },
  playableItem: { 
    width: '47%', 
    height: 140, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 12,
  },
  itemText: { 
    marginTop: 8, 
    fontSize: 13, 
    fontFamily: 'AppFont-Medium',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  nowPlayingIndicator: {
    fontSize: 10,
    fontFamily: 'AppFont-Bold',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 275,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'AppFont-Bold',
  }
});

export default memo(FavoritesTab);