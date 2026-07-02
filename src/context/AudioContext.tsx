// src/context/AudioContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSharedValue, SharedValue } from 'react-native-reanimated';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types/song'; // Import shared type

interface AudioContextType {
  isPlaying: boolean;
  isLooping: boolean;
  showOverlay: boolean;
  handleNext: () => void;
  handlePrevious: () => void;
  toggleShuffle: () => void;
  isShuffled: boolean;
  toggleLike: () => void;
  isLiked: boolean;
  favoriteSongs: Song[];
  recentlyPlayed: Song[];
  progressWidth: SharedValue<number>;
  position: number;
  duration: number;
  currentSong: Song | null;
  handlePlayPause: (song?: Song) => void;
  toggleRepeat: () => void;
  seekTo: (millis: number) => void;
  tracks: Song[];
  setTracks: (songs: Song[]) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const FAVORITES_KEY = '@swayv_favorites';
const RECENTLY_PLAYED_KEY = '@swayv_recently_played';

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [showOverlay] = useState<boolean>(true);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(1);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [favoriteSongs, setFavoriteSongs] = useState<Song[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [tracks, setTracks] = useState<Song[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get the asset URI for the player
  const getAssetUri = (song: Song | null): string | null => {
    if (!song) return null;
    // Use uri or asset property
    return song.uri || song.asset || null;
  };

  const player = useAudioPlayer(getAssetUri(currentSong));
  const status = useAudioPlayerStatus(player);
  const progressWidth = useSharedValue(0);

  const isLiked = currentSong ? favoriteSongs.some(song => song.id === currentSong.id) : false;

  // Load favorites and recently played from storage on mount
  useEffect(() => {
    async function loadData() {
      try {
        const favoritesData = await AsyncStorage.getItem(FAVORITES_KEY);
        if (favoritesData) {
          setFavoriteSongs(JSON.parse(favoritesData));
        }

        const recentData = await AsyncStorage.getItem(RECENTLY_PLAYED_KEY);
        if (recentData) {
          setRecentlyPlayed(JSON.parse(recentData));
        }
      } catch (error) {
        console.error('Failed to load audio data:', error);
      } finally {
        setIsInitialized(true);
      }
    }
    loadData();
  }, []);

  // Save favorites to storage whenever they change
  useEffect(() => {
    if (isInitialized) {
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteSongs)).catch(console.error);
    }
  }, [favoriteSongs, isInitialized]);

  // Save recently played to storage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      AsyncStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(recentlyPlayed)).catch(console.error);
    }
  }, [recentlyPlayed, isInitialized]);

  // Configure audio mode
  useEffect(() => {
    async function configureAudio() {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'doNotMix',
        });
      } catch (error) {
        console.error("Failed to set audio mode", error);
      }
    }
    configureAudio();
  }, []);

  // Lock screen controls
  useEffect(() => {
    if (player && currentSong) {
      player.setActiveForLockScreen(true, {
        title: currentSong.title,
        artist: currentSong.artist || "Swayv",
      });

      // @ts-ignore - event listeners for lock screen controls
      const nextSubscription = player.addListener('playNextTrack', () => {
        handleNext();
      });

      // @ts-ignore
      const prevSubscription = player.addListener('playPreviousTrack', () => {
        handlePrevious();
      });

      return () => {
        nextSubscription.remove();
        prevSubscription.remove();
      };
    }
  }, [currentSong, player, status.playing]);

  // Update progress
  useEffect(() => {
    const currentPosMs = (status.currentTime || 0) * 1000;
    const totalDurationMs = status.duration > 0 ? status.duration * 1000 : 1;

    setPosition(currentPosMs);
    setDuration(totalDurationMs);

    progressWidth.value = status.duration > 0 ? status.currentTime / status.duration : 0;
  }, [status.currentTime, status.duration, progressWidth]);

  // Add to recently played when song starts playing
  useEffect(() => {
    if (currentSong && status.playing) {
      addToRecentlyPlayed(currentSong);
    }
  }, [currentSong?.id, status.playing]);

  const addToRecentlyPlayed = (song: Song) => {
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [song, ...filtered].slice(0, 5);
    });
  };

  const handlePlayPause = (song?: Song) => {
    const targetSong = song || currentSong || tracks[0];
    if (!targetSong) return;

    const assetUri = getAssetUri(targetSong);
    if (!assetUri) {
      console.error('No asset URI for song:', targetSong.title);
      return;
    }

    if (targetSong.id !== currentSong?.id) {
      setCurrentSong(targetSong);
      addToRecentlyPlayed(targetSong);
      player.replace(assetUri);
      player.play();
      return;
    }

    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const toggleRepeat = () => {
    player.loop = !player.loop;
  };

  const seekTo = (millis: number) => {
    const targetSeconds = Math.floor(millis / 1000);
    player.seekTo(targetSeconds);
    setPosition(millis);
  };

  const handleNext = () => {
    if (tracks.length === 0 || !currentSong) return;
    const currentIndex = tracks.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    handlePlayPause(tracks[nextIndex]);
  };

  const handlePrevious = () => {
    if (tracks.length === 0 || !currentSong) return;
    const currentIndex = tracks.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    handlePlayPause(tracks[prevIndex]);
  };

  const toggleShuffle = () => setIsShuffled(!isShuffled);

  const toggleLike = () => {
    if (!currentSong) return;
    setFavoriteSongs((prevFavorites) => {
      const isAlreadyFavorited = prevFavorites.some(song => song.id === currentSong.id);
      if (isAlreadyFavorited) {
        return prevFavorites.filter(song => song.id !== currentSong.id);
      } else {
        return [...prevFavorites, { ...currentSong, isFavorite: true }];
      }
    });
  };

  return (
    <AudioContext.Provider value={{
      isPlaying: status.playing,
      isLooping: player.loop,
      showOverlay,
      progressWidth,
      position,
      duration,
      currentSong,
      handlePlayPause,
      toggleRepeat,
      seekTo,
      handleNext,
      handlePrevious,
      toggleShuffle,
      isShuffled,
      toggleLike,
      isLiked,
      favoriteSongs,
      recentlyPlayed,
      tracks,
      setTracks
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
};

export default AudioProvider;