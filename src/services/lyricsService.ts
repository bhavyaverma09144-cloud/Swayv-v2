// src/services/lyricsService.ts
import * as FileSystem from 'expo-file-system/legacy';
import { LyricLine } from '../types/song';

// Parse LRC file content
export const parseLRC = (lrcContent: string): LyricLine[] => {
  const lines = lrcContent.split('\n');
  const lyrics: LyricLine[] = [];
  
  // FIXED: Added the global 'g' flag so matchAll doesn't throw a TypeError runtime exception
  const timestampRegex = /\[(\d{2}):(\d{2})(?:[:.](\d{2}))?\]/g;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Find all timestamps in the line
    const matches = trimmedLine.matchAll(timestampRegex);
    const timestamps = Array.from(matches);
    
    if (timestamps.length > 0) {
      // FIXED: Safely clean out all timestamps to isolate text, even if multiple tags exist
      const text = trimmedLine.replace(timestampRegex, '').trim();
      
      // Parse each timestamp found on this line
      for (const match of timestamps) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const centiseconds = match[3] ? parseInt(match[3], 10) : 0;
        
        const timeInMs = (minutes * 60 + seconds) * 1000 + centiseconds * 10;
        
        // FIXED: Removed the 'if (text)' guard so empty lines pass through.
        // This clears active lyrics on-screen during instrumental segments.
        lyrics.push({
          startTime: timeInMs,
          text: text || '', 
        });
      }
    }
  }
  
  // Sort by start time
  lyrics.sort((a, b) => a.startTime - b.startTime);
  
  return lyrics;
};

// Find and read LRC file for a song
export const findAndReadLRC = async (songUri: string): Promise<LyricLine[] | null> => {
  try {
    if (!songUri) return null;
    
    const decodedUri = decodeURIComponent(songUri);
    const uriParts = decodedUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    
    // Avoid crashing if a path happens to lack an extension dot
    const lastDotIndex = fileName.lastIndexOf('.');
    const fileNameWithoutExt = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
    const directory = uriParts.slice(0, -1).join('/');
    
    const possibleLrcNames = [
      `${fileNameWithoutExt}.lrc`,
      `${fileNameWithoutExt}.LRC`,
      `${fileName}.lrc`,
      `${fileName}.LRC`,
    ];
    
    for (const lrcName of possibleLrcNames) {
      const lrcPath = `${directory}/${lrcName}`;
      const fileInfo = await FileSystem.getInfoAsync(lrcPath);
      
      if (fileInfo.exists) {
        const lrcContent = await FileSystem.readAsStringAsync(lrcPath);
        const lyrics = parseLRC(lrcContent);
        if (lyrics.length > 0) return lyrics;
      }
    }
    
    try {
      const directoryContents = await FileSystem.readDirectoryAsync(directory);
      const matchingLrcFile = directoryContents.find(
        file => file.toLowerCase().includes(fileNameWithoutExt.toLowerCase()) && 
                file.toLowerCase().endsWith('.lrc')
      );
      
      if (matchingLrcFile) {
        const lrcPath = `${directory}/${matchingLrcFile}`;
        const lrcContent = await FileSystem.readAsStringAsync(lrcPath);
        const lyrics = parseLRC(lrcContent);
        if (lyrics.length > 0) return lyrics;
      }
    } catch (error) {
      console.log('Could not read directory:', error);
    }
    
    return null;
  } catch (error) {
    console.error('Error reading LRC file:', error);
    return null;
  }
};

// Alternative: Read LRC from asset (if bundled)
export const readLRCAsset = async (assetModule: any): Promise<LyricLine[] | null> => {
  try {
    const { Asset } = require('expo-asset');
    const asset = Asset.fromModule(assetModule);
    await asset.downloadAsync();
    
    if (asset.localUri) {
      const lrcContent = await FileSystem.readAsStringAsync(asset.localUri);
      return parseLRC(lrcContent);
    }
    return null;
  } catch (error) {
    console.error('Error reading LRC asset:', error);
    return null;
  }
};

export const getFileExtension = (filename: string): string => {
  const dotIndex = filename.lastIndexOf('.');
  return dotIndex !== -1 ? filename.substring(dotIndex + 1).toLowerCase() : '';
};

export const isLRCFile = (filename: string): boolean => {
  return getFileExtension(filename) === 'lrc';
};
