// src/context/LibraryContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { Song } from '../types/song';
import { MediaService } from '../services/MediaService';
import { StorageService } from '../services/StorageService';

interface LibraryContextType {
  songs: Song[];
  isLoading: boolean;
  scanForSongs: () => Promise<void>;
  updateSong: (song: Song) => Promise<void>;
  toggleFavorite: (songId: string) => Promise<void>;
  getFavorites: () => Song[];
  getRecentlyPlayed: () => Song[];
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCachedSongs();
  }, []);

  const loadCachedSongs = async () => {
    const cached = await StorageService.loadSongs();
    if (cached.length > 0) {
      setSongs(cached);
    }
  };

  const scanForSongs = async () => {
    setIsLoading(true);
    try {
      const assets = await MediaService.scanAllSongs();
      
      const newSongs: Song[] = await Promise.all(
        assets.map(async (asset) => {
          const info = await MediaLibrary.getAssetInfoAsync(asset.id);
          return {
            id: asset.id,
            uri: info.localUri || info.uri,
            filename: asset.filename || 'Unknown',
            duration: asset.duration || 0,
            title: asset.filename ? asset.filename.replace(/\.[^/.]+$/, '') : 'Unknown Track',
            artist: 'Unknown Artist',
            album: 'Unknown Album',
            modifiedAt: await asset.getModificationTime() || Date.now(),
            addedToLibraryAt: Date.now(),
            isFavorite: false,
            playCount: 0,
          };
        })
      );

      const existingSongs = await StorageService.loadSongs();
      const mergedSongs = newSongs.map(newSong => {
        const existing = existingSongs.find(s => s.id === newSong.id);
        return existing || newSong;
      });

      await StorageService.saveSongs(mergedSongs);
      setSongs(mergedSongs);
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSong = async (updatedSong: Song) => {
    await StorageService.updateSong(updatedSong);
    setSongs(prev => 
      prev.map(s => s.id === updatedSong.id ? updatedSong : s)
    );
  };

  const toggleFavorite = async (songId: string) => {
    await StorageService.toggleFavorite(songId);
    setSongs(prev =>
      prev.map(s => 
        s.id === songId ? { ...s, isFavorite: !s.isFavorite } : s
      )
    );
  };

  const getFavorites = () => songs.filter(s => s.isFavorite);
  const getRecentlyPlayed = () => 
    songs
      .filter(s => s.lastPlayedAt)
      .sort((a, b) => (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0))
      .slice(0, 20);

  return (
    <LibraryContext.Provider value={{
      songs,
      isLoading,
      scanForSongs,
      updateSong,
      toggleFavorite,
      getFavorites,
      getRecentlyPlayed,
    }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within LibraryProvider');
  }
  return context;
}