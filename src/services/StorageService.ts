// src/services/StorageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types/song';

const SONGS_KEY = '@swayv_songs';
const FAVORITES_KEY = '@swayv_favorites';
const RECENTLY_PLAYED_KEY = '@swayv_recently_played';

export class StorageService {
  // Save all songs to cache
  static async saveSongs(songs: Song[]): Promise<void> {
    await AsyncStorage.setItem(SONGS_KEY, JSON.stringify(songs));
  }

  // Load all songs from cache
  static async loadSongs(): Promise<Song[]> {
    const data = await AsyncStorage.getItem(SONGS_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Update a single song (user edited metadata)
  static async updateSong(updatedSong: Song): Promise<void> {
    const songs = await this.loadSongs();
    const index = songs.findIndex(s => s.id === updatedSong.id);
    if (index !== -1) {
      songs[index] = updatedSong;
      await this.saveSongs(songs);
    }
  }

  // Toggle favorite
  static async toggleFavorite(songId: string): Promise<void> {
    const songs = await this.loadSongs();
    const song = songs.find(s => s.id === songId);
    if (song) {
      song.isFavorite = !song.isFavorite;
      await this.saveSongs(songs);
    }
  }

  // Get favorite songs
  static async getFavorites(): Promise<Song[]> {
    const songs = await this.loadSongs();
    return songs.filter(s => s.isFavorite);
  }

  // Add to recently played
  static async addRecentlyPlayed(songId: string): Promise<void> {
    const songs = await this.loadSongs();
    const song = songs.find(s => s.id === songId);
    if (song) {
      song.playCount = (song.playCount || 0) + 1;
      song.lastPlayedAt = Date.now();
      await this.saveSongs(songs);
    }
  }

  // Get recently played (last 20)
  static async getRecentlyPlayed(): Promise<Song[]> {
    const songs = await this.loadSongs();
    return songs
      .filter(s => s.lastPlayedAt)
      .sort((a, b) => (b.lastPlayedAt || 0) - (a.lastPlayedAt || 0))
      .slice(0, 20);
  }
}