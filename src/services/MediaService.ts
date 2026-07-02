// src/services/MediaService.ts
import * as MediaLibrary from 'expo-media-library';
import { Song } from '../types/song';
import { extractMetadata, generateArtworkFromTitle } from '../utils/metadata';

export class MediaService {
  static async requestPermissions(): Promise<boolean> {
    console.log('[MediaService] Checking storage permissions...');
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  }

  static async scanAllSongs(): Promise<MediaLibrary.Asset[]> {
    const permission = await this.requestPermissions();
    if (!permission) throw new Error('Storage permission denied');

    console.log('[MediaService] Querying modern MediaLibrary records across native engine...');
    const assets = await new MediaLibrary.Query()
      .eq(MediaLibrary.AssetField.MEDIA_TYPE, MediaLibrary.MediaType.AUDIO)
      .orderBy({ key: MediaLibrary.AssetField.CREATION_TIME, ascending: false })
      .limit(1000)
      .exe();

    return assets;
  }

  static async getSongWithMetadata(asset: MediaLibrary.Asset): Promise<Song> {
    let filename = 'Unknown';
    let duration = 0;
    let modificationTime = Date.now();
    let uri = '';

    try {
      filename = await asset.getFilename();
      duration = await asset.getDuration();
      modificationTime = await asset.getModificationTime();
      uri = await asset.getUri();
    } catch (e) {
      console.error(`[MediaService] Failed to read asset metadata fields for ${asset.id}:`, e);
    }

    let title = filename ? filename.replace(/\.[^/.]+$/, '') : 'Unknown Track';
    let artist = 'Unknown Artist';
    let album = 'Unknown Album';
    let genre = 'Unknown';
    let year = '';
    let artwork: string | null = null;

    if (uri) {
      try {
        // Pass asset.id through to name individual image file nodes explicitly
        const metadataPromise = extractMetadata(uri, asset.id);
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 3000));
        
        const metadata = await Promise.race([metadataPromise, timeoutPromise]) as any;
        
        if (metadata) {
          if (metadata.title) title = metadata.title;
          if (metadata.artist) artist = metadata.artist;
          if (metadata.album) album = metadata.album;
          if (metadata.genre) genre = metadata.genre;
          if (metadata.year) year = metadata.year;
          if (metadata.artwork) artwork = metadata.artwork; 
        }
      } catch (error) {
        console.error(`[MediaService] Failed to parse ID3 tags for: ${filename}`, error);
      }
    }

    if (!artwork) {
      artwork = generateArtworkFromTitle(title);
    }

    return {
      id: asset.id,
      uri: uri,
      filename: filename || 'Unknown',
      duration: duration || 0,
      title: title,
      artist: artist,
      album: album,
      genre: genre,
      year: year,
      artwork: artwork,
      modifiedAt: modificationTime || Date.now(),
      addedToLibraryAt: Date.now(),
      isFavorite: false,
      playCount: 0,
    };
  }
}
