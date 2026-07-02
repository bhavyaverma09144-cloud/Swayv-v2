import React, { createContext, useContext, useState, useEffect } from 'react';
import { Song } from '../types/song';
import { MediaService } from '../services/MediaService';
import { StorageService } from '../services/StorageService';

interface LibraryContextType {
  songs: Song[];
  isLoading: boolean;
  scanForSongs: () => Promise<void>;
  clearCacheAndRescan: () => Promise<void>; // New added action
  updateSong: (updatedSong: Song) => Promise<void>;
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
    try {
      console.log('[LibraryContext] Attempting to load cached songs from StorageService...');
      const cached = await StorageService.loadSongs();
      console.log(`[LibraryContext] Found ${cached?.length || 0} cached songs.`);
      if (cached && cached.length > 0) {
        setSongs(cached);
      }
    } catch (e) {
      console.error('[LibraryContext] Failed to load cached songs:', e);
    }
  };

  const scanForSongs = async () => {
    console.log('[LibraryContext] 🚀 Starting scanForSongs operation...');
    setIsLoading(true);
    try {
      const assets = await MediaService.scanAllSongs();
      console.log(`[LibraryContext] MediaLibrary found ${assets.length} raw audio assets on device.`);
      
      let existingSongs: Song[] = [];
      try {
        existingSongs = await StorageService.loadSongs();
      } catch (e) {
        console.log('[LibraryContext] Stored tracks empty or unreadable.');
      }
      
      console.log(`[LibraryContext] Comparing assets against ${existingSongs.length} existing stored items.`);
      const newSongs: Song[] = [];

      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        const existing = existingSongs.find(s => s.id === asset.id);
        
        if (existing) {
          console.log(`[LibraryContext] [${i + 1}/${assets.length}] Using cached storage details for: ${existing.title}`);
          newSongs.push(existing);
        } else {
          console.log(`[LibraryContext] [${i + 1}/${assets.length}] New track discovered! Processing metadata...`);
          const processedSong = await MediaService.getSongWithMetadata(asset);
          console.log(`[LibraryContext] Processed metadata successfully -> Title: "${processedSong.title}", Artist: "${processedSong.artist}"`);
          newSongs.push(processedSong);
        }
      }

      console.log(`[LibraryContext] Scan complete. Persisting ${newSongs.length} tracks into local storage...`);
      await StorageService.saveSongs(newSongs);
      setSongs(newSongs);
      console.log('[LibraryContext] State updated with fresh songs array.');
    } catch (error) {
      console.error('[LibraryContext] ❌ Scan process failed with error:', error);
    } finally {
      setIsLoading(false);
      console.log('[LibraryContext] Scan runner finished execution (loading indicator hidden).');
    }
  };

  // Explicitly forces clearing storage engines and re-runs standard scanner
  const clearCacheAndRescan = async () => {
    console.log('[LibraryContext] ⚠️ "Clear Cache and Rescan" triggered!');
    setIsLoading(true);
    try {
      // Clear out the state array immediately
      setSongs([]);
      
      // Wipe storage completely
      if (typeof StorageService.clearAll === 'function') {
        await StorageService.clearAll();
      } else {
        // Fallback if StorageService only has saveSongs: write an empty array
        await StorageService.saveSongs([]);
      }
      console.log('[LibraryContext] Local storage cleared successfully.');
      
      // Execute scanner from absolute scratch
      const assets = await MediaService.scanAllSongs();
      console.log(`[LibraryContext] [Fresh Scan] Found ${assets.length} raw audio assets.`);
      
      const newSongs: Song[] = [];
      for (let i = 0; i < assets.length; i++) {
        console.log(`[LibraryContext] [Fresh Scan] [${i + 1}/${assets.length}] Parsing fresh ID3 metadata tags...`);
        const processedSong = await MediaService.getSongWithMetadata(assets[i]);
        newSongs.push(processedSong);
      }

      await StorageService.saveSongs(newSongs);
      setSongs(newSongs);
      console.log('[LibraryContext] Fresh metadata population completed.');
    } catch (error) {
      console.error('[LibraryContext] ❌ Clear cache process failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSong = async (updatedSong: Song) => {
    try {
      console.log(`[LibraryContext] Updating single song record: ${updatedSong.id}`);
      await StorageService.updateSong(updatedSong);
      setSongs(prev => 
        prev.map(s => s.id === updatedSong.id ? updatedSong : s)
      );
    } catch (e) {
      console.error('[LibraryContext] Failed to update song:', e);
    }
  };

  const toggleFavorite = async (songId: string) => {
    try {
      console.log(`[LibraryContext] Toggling favorite status for: ${songId}`);
      await StorageService.toggleFavorite(songId);
      setSongs(prev =>
        prev.map(s => 
          s.id === songId ? { ...s, isFavorite: !s.isFavorite } : s
        )
      );
    } catch (e) {
      console.error('[LibraryContext] Failed to toggle favorite:', e);
    }
  };

  const getFavorites = () => songs.filter(s => s.isFavorite);
  
  const getRecentlyPlayed = () => {
    return [...songs]
      .filter((s: any) => s.lastPlayedAt)
      .sort((a: any, b: any) => (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0))
      .slice(0, 20);
  };

  return (
    <LibraryContext.Provider value={{
      songs,
      isLoading,
      scanForSongs,
      clearCacheAndRescan,
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
