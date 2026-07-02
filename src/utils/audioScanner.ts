import { Directory, File, Paths } from 'expo-file-system';
import { extractMetadata } from './metadataExtractor'; // Change to wherever your file lives

export interface SongItem {
  id: string;
  uri: string;
  title: string;
  artist: string;
  album: string;
  artwork: string | null;
}

export async function scanLocalAudioFiles(): Promise<SongItem[]> {
  try {
    // Modify Paths.document or use Paths.cache depending on where your tracks are located
    const musicDir = new Directory(Paths.document, 'music');
    
    if (!musicDir.exists) {
      musicDir.create();
      return [];
    }

    const contents = musicDir.contents();
    const songs: SongItem[] = [];

    for (const item of contents) {
      if (item instanceof File && (item.uri.endsWith('.mp3') || item.uri.endsWith('.m4a'))) {
        const fileUri = item.uri;
        const fallbackTitle = item.name.replace(/\.[^/.]+$/, ""); // Strip file extension
        
        // Pass the absolute file layout string or clean item name as an identification key
        const metadata = await extractMetadata(fileUri, item.name);

        songs.push({
          id: item.name,
          uri: fileUri,
          title: metadata.title || fallbackTitle,
          artist: metadata.artist || 'Unknown Artist',
          album: metadata.album || 'Unknown Album',
          artwork: metadata.artwork,
        });
      }
    }

    return songs;
  } catch (error) {
    console.error('Failed to run audio file scanner pass:', error);
    return [];
  }
}
