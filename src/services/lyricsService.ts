// src/services/lyricsService.ts
import * as FileSystem from 'expo-file-system/legacy';
import { LyricLine } from '../types/song';

/**
 * Parses LRC file content into an array of timed lyric lines.
 */
export const parseLRC = (lrcContent: string): LyricLine[] => {
  const lines = lrcContent.split('\n');
  const lyrics: LyricLine[] = [];
  
  // FIXED: Minutes can be 3 digits (e.g., [100:39]). Decimals can be 2 or 3 digits.
  const timestampRegex = /\[(\d{2,}):(\d{2})(?:[:.](\d{2,3}))?\]/g;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    const matches = Array.from(trimmedLine.matchAll(timestampRegex));
    
    if (matches.length > 0) {
      // Clean out timestamps to isolate the lyric text
      const text = trimmedLine.replace(timestampRegex, '').trim();
      
      for (const match of matches) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        
        // Handle varying decimal precision (2 digits = centiseconds, 3 digits = milliseconds)
        let milliseconds = 0;
        if (match[3]) {
          milliseconds = match[3].length === 2 
            ? parseInt(match[3], 10) * 10 
            : parseInt(match[3], 10);
        }
        
        const timeInMs = (minutes * 60 + seconds) * 1000 + milliseconds;
        
        lyrics.push({
          startTime: timeInMs,
          text: text || '', // Empty lines are preserved for instrumental breaks
        });
      }
    }
  }
  
  // Ensure chronologically sorted lyrics
  lyrics.sort((a, b) => a.startTime - b.startTime);
  
  return lyrics;
};

/**
 * Derives the LRC file path from the audio URI and attempts to read it.
 */
export const findAndReadLRC = async (songUri: string): Promise<LyricLine[] | null> => {
  try {
    if (!songUri) return null;
    
    const decodedUri = decodeURIComponent(songUri);
    
    // Strip the existing extension (e.g., .mp3, .m4a) from the URI
    const basePath = decodedUri.replace(/\.[^/.]+$/, "");
    
    // Test for standard extensions
    const possibleLrcUris = [
      `${basePath}.lrc`,
      `${basePath}.LRC`
    ];
    
    for (const lrcUri of possibleLrcUris) {
      const fileInfo = await FileSystem.getInfoAsync(lrcUri);
      
      if (fileInfo.exists) {
        const lrcContent = await FileSystem.readAsStringAsync(lrcUri);
        const lyrics = parseLRC(lrcContent);
        if (lyrics.length > 0) return lyrics;
      }
    }
    
    // If not found, attempt directory fallback mapping (useful if names are slightly mismatched)
    const directory = decodedUri.substring(0, decodedUri.lastIndexOf('/'));
    const fileName = decodedUri.substring(decodedUri.lastIndexOf('/') + 1);
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    
    try {
      const directoryContents = await FileSystem.readDirectoryAsync(directory);
      const matchingLrcFile = directoryContents.find(
        file => file.toLowerCase().startsWith(fileNameWithoutExt.toLowerCase()) && 
                file.toLowerCase().endsWith('.lrc')
      );
      
      if (matchingLrcFile) {
        const fallbackLrcPath = `${directory}/${matchingLrcFile}`;
        const lrcContent = await FileSystem.readAsStringAsync(fallbackLrcPath);
        const lyrics = parseLRC(lrcContent);
        if (lyrics.length > 0) return lyrics;
      }
    } catch (dirError) {
      console.warn('Could not read directory for fallback LRC mapping:', dirError);
    }
    
    return null;
  } catch (error) {
    console.error('Error reading LRC file:', error);
    return null;
  }
};
          
