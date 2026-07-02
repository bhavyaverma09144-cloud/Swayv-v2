// src/components/SuggestedTab.tsx
import React, { memo } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from 'expo-router';
import { useAudio } from '../../context/AudioContext';
import { useAppTheme } from '../../context/ThemeContext';
import AnimatedButton from '../../components/AnimatedButton';

function SuggestedTab() {
  const { 
    isPlaying, 
    currentSong, 
    handlePlayPause, 
    favoriteSongs,
    recentlyPlayed  // ← Add this from useAudio
  } = useAudio();
  const { currentTheme: activeColors } = useAppTheme();
  const navigation = useNavigation<any>();

  // Use real data from audio context
  const recentSongs = recentlyPlayed || [];

  return (
    <ScrollView 
      contentContainerStyle={[styles.mainScroll, { backgroundColor: activeColors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: activeColors.textPrimary }]}>Recently Played</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.horizontalScrollContent}
      >
        {recentSongs.length > 0 ? (
          recentSongs.map((song) => {
            const isCurrentTrack = currentSong?.id === song.id;
            const showPauseIcon = isCurrentTrack && isPlaying;

            return (
              <Pressable 
                key={song.id}
                style={[styles.playableItem, { backgroundColor: activeColors.surface }]} 
                onPress={() => handlePlayPause(song)}
              >
                <Ionicons 
                  name={showPauseIcon ? "pause-circle" : "play-circle"} 
                  size={40} 
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
            <Text style={[styles.emptyText, { color: activeColors.textSecondary }]}>
              No recently played songs
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.sectionTitleCont}>
        <Text style={[styles.sectionTitle, { color: activeColors.textPrimary }]}>Favorite Songs</Text>
        <AnimatedButton 
          onPress={() => navigation.navigate('favorite')} 
        >
          <Ionicons 
            name="chevron-up" 
            size={24}
            color={activeColors.textPrimary}
          />
        </AnimatedButton>
      </View>

      <View style={styles.gridRow}>
        {favoriteSongs.length > 0 ? (
          favoriteSongs.slice(0, 2).map((song) => {
            const isCurrentTrack = currentSong?.id === song.id;
            const showPauseIcon = isCurrentTrack && isPlaying;

            return (
              <Pressable 
                key={`fav-preview-${song.id}`}
                style={[styles.playableItem, { backgroundColor: activeColors.surface }]} 
                onPress={() => handlePlayPause(song)}
              >
                <Ionicons 
                  name={showPauseIcon ? "pause-circle" : "play-circle"} 
                  size={40} 
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
            <Text style={[styles.emptyText, { color: activeColors.textSecondary }]}>
              No favorite songs added yet.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  mainScroll: { 
    paddingTop: 16,
    paddingHorizontal: 16, 
    paddingBottom: 40, 
  },
  sectionTitleCont: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    marginTop: 24,
    marginBottom: 14,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontFamily: 'AppFont-Regular', 
    letterSpacing: 1,
  },
  chevronIcon: {
    marginTop: 4, 
  },
  gridRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 16,
  },
  horizontalScrollContent: {
    flexDirection: 'row',
    gap: 20,
    paddingRight: 16, 
    paddingTop: 35, 
  },
  playableItem: { 
    width: 140, 
    height: 140, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 12,
  },
  itemText: { 
    marginTop: 8, 
    fontSize: 10, 
    fontFamily: 'AppFont-Regular',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  nowPlayingIndicator: {
    fontSize: 7,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'AppFont-Light',
  }
});

export default memo(SuggestedTab);