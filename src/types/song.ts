// src/types/song.ts
export interface Song {
  id: string;
  uri: string;              // File URI (for playback)
  filename: string;         // Original filename
  duration: number;         // In seconds
  
  // Editable fields (user can change these)
  title: string;            // Default: filename without extension
  artist: string;           // Default: "Unknown Artist"
  album: string;            // Default: "Unknown Album"
  artwork?: string;         // Base64 or path (user can add)
  
  // System fields
  asset?: string;           // Legacy support for require() assets
  fileSize?: number;
  modifiedAt: number;
  addedToLibraryAt: number;
  isFavorite: boolean;
  playCount: number;
  lastPlayedAt?: number;
}