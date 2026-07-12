// src/types/song.ts
export interface Song {
  id: string;
  uri: string;
  filename: string;
  duration: number;
  
  // Editable fields (user can edit these)
  title: string;
  artist: string;
  album: string;
  genre?: string;
  year?: string;
  artwork?: string | null; // base64 image data URL or color string
  lrcFilePath?: string;
  
  // System fields
  startTime: number;
  text: string;
  asset?: string;
  fileSize?: number;
  modifiedAt: number;
  addedToLibraryAt: number;
  isFavorite: boolean;
  playCount: number;
  lastPlayedAt?: number;
}