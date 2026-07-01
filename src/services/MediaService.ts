// src/services/MediaService.ts
import * as MediaLibrary from 'expo-media-library';
import { Song } from '../types/song';

export class MediaService {
  static async requestPermissions(): Promise<boolean> {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  }

  static async scanAllSongs(): Promise<any[]> {
    const permission = await this.requestPermissions();
    if (!permission) throw new Error('Storage permission denied');

    const assets = await MediaLibrary.getAssetsAsync({
      mediaType: 'audio',
      first: 5000,
      sortBy: 'modificationTime',
    });

    return assets.assets;
  }

  static async getSongUri(assetId: string): Promise<string> {
    const asset = await MediaLibrary.getAssetInfoAsync(assetId);
    return asset.localUri || asset.uri;
  }

  static async getSongWithMetadata(asset: any): Promise<Song> {
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
  }
}