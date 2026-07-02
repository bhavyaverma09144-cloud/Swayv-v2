import { File, Directory, Paths } from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';

export interface ID3Metadata {
  title: string;
  artist: string;
  album: string;
  genre: string;
  year: string;
  artwork: string | null; 
}

const b64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function base64ToUint8Array(base64: string): Uint8Array {
  const str = base64.replace(/=+$/, '');
  const len = str.length;
  const bufferLength = Math.floor((len * 3) / 4);
  const bytes = new Uint8Array(bufferLength);

  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const c1 = b64Chars.indexOf(str[i]);
    const c2 = b64Chars.indexOf(str[i + 1] || 'A');
    const c3 = b64Chars.indexOf(str[i + 2] || 'A');
    const c4 = b64Chars.indexOf(str[i + 3] || 'A');

    const byte1 = (c1 << 2) | (c2 >> 4);
    const byte2 = ((c2 & 15) << 4) | (c3 >> 2);
    const byte3 = ((c3 & 3) << 6) | c4;

    if (p < bufferLength) bytes[p++] = byte1;
    if (p < bufferLength && str[i + 2]) bytes[p++] = byte2;
    if (p < bufferLength && str[i + 3]) bytes[p++] = byte3;
  }

  return bytes;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let result = '';
  const len = bytes.length;
  
  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : NaN;
    const b3 = i + 2 < len ? bytes[i + 2] : NaN;

    const c1 = b1 >> 2;
    const c2 = ((b1 & 3) << 4) | (isNaN(b2) ? 0 : b2 >> 4);
    const c3 = isNaN(b2) ? 64 : ((b2 & 15) << 2) | (isNaN(b3) ? 0 : b3 >> 6);
    const c4 = isNaN(b3) ? 64 : b3 & 63;

    result += b64Chars[c1] + b64Chars[c2] + 
              (c3 === 64 ? '=' : b64Chars[c3]) + 
              (c4 === 64 ? '=' : b64Chars[c4]);
  }
  
  return result;
}

export async function extractMetadata(uri: string, songId: string): Promise<Partial<ID3Metadata>> {
  try {
    const file = new File(uri);
    
    if (!file.exists) {
      console.error('File does not exist:', uri);
      return {};
    }

    const base64Data = await file.base64();
    const basicHeaderChunk = base64Data.slice(0, 135000); 
    const bytes = base64ToUint8Array(basicHeaderChunk);
    
    if (bytes.length < 10 || String.fromCharCode(bytes[0], bytes[1], bytes[2]) !== 'ID3') {
      return {};
    }

    const tagSize = ((bytes[6] & 0x7f) << 21) | 
                    ((bytes[7] & 0x7f) << 14) | 
                    ((bytes[8] & 0x7f) << 7) | 
                    (bytes[9] & 0x7f);
    
    let offset = 10;
    const maxOffset = Math.min(tagSize, bytes.length - 10);
    const frames: Record<string, any> = {};

    while (offset < maxOffset) {
      if (offset + 10 > bytes.length) break;

      const frameId = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
      if (!frameId || frameId.trim() === '' || bytes[offset] === 0) break;

      const frameSize = (bytes[offset + 4] << 24) | (bytes[offset + 5] << 16) | 
                        (bytes[offset + 6] << 8) | bytes[offset + 7];
      
      if (frameSize <= 0 || (offset + 10 + frameSize) > bytes.length) break;

      const dataStart = offset + 10;
      const dataEnd = dataStart + frameSize;

      if (frameId === 'TIT2') {
        frames.title = extractTextFrame(bytes, dataStart, dataEnd);
      } else if (frameId === 'TPE1') {
        frames.artist = extractTextFrame(bytes, dataStart, dataEnd);
      } else if (frameId === 'TALB') {
        frames.album = extractTextFrame(bytes, dataStart, dataEnd);
      } else if (frameId === 'TCON') {
        frames.genre = extractTextFrame(bytes, dataStart, dataEnd);
      } else if (frameId === 'TYER' || frameId === 'TDRC') {
        frames.year = extractTextFrame(bytes, dataStart, dataEnd);
      } else if (frameId === 'APIC') {
        frames.artwork = await saveArtworkToFileSystem(bytes, dataStart, dataEnd, songId);
      }

      offset += 10 + frameSize;
    }

    return {
      title: frames.title || '',
      artist: frames.artist || '',
      album: frames.album || '',
      genre: frames.genre || '',
      year: frames.year || '',
      artwork: frames.artwork || null,
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {};
  }
}

function extractTextFrame(bytes: Uint8Array, start: number, end: number): string {
  try {
    if (start >= end) return '';
    const encoding = bytes[start];
    const textBytes = bytes.slice(start + 1, end);
    
    let text = '';
    if (encoding === 1 || encoding === 2) {
      const bomOffset = (textBytes[0] === 0xFE && textBytes[1] === 0xFF) || (textBytes[0] === 0xFF && textBytes[1] === 0xFE) ? 2 : 0;
      for (let i = bomOffset; i < textBytes.length - 1; i += 2) {
        const charCode = (textBytes[i] << 8) | textBytes[i + 1];
        if (charCode !== 0) text += String.fromCharCode(charCode);
      }
    } else {
      for (let i = 0; i < textBytes.length; i++) {
        if (textBytes[i] !== 0) text += String.fromCharCode(textBytes[i]);
      }
    }
    return text.trim();
  } catch {
    return '';
  }
}

async function saveArtworkToFileSystem(bytes: Uint8Array, start: number, end: number, songId: string): Promise<string | null> {
  try {
    let offset = start + 1;
    let mimeType = '';
    while (offset < end && bytes[offset] !== 0) {
      mimeType += String.fromCharCode(bytes[offset]);
      offset++;
    }
    offset++; 
    offset++; 
    
    while (offset < end && bytes[offset] !== 0) {
      offset++;
    }
    offset++; 

    const imageBytes = bytes.slice(offset, end);
    if (imageBytes.length === 0) return null;

    const ext = mimeType.includes('png') ? 'png' : 'jpg';
    
    // 1. Ensure directory layout exists safely
    const artworksDir = new Directory(Paths.document, 'artworks');
    if (!artworksDir.exists) {
      artworksDir.create();
    }

    // FIX: Clean up the songId so it doesn't contain content://, slashes, or symbols
    const cleanId = songId.replace(/[^a-zA-Z0-9]/g, '_');

    // 2. Generate target destination string with safe clean ID
    const targetFileUri = `${artworksDir.uri}/${cleanId}.${ext}`;
    const base64ImageString = uint8ArrayToBase64(imageBytes);

    // 3. Write raw data down directly as a clean image file
    await FileSystemLegacy.writeAsStringAsync(targetFileUri, base64ImageString, {
      encoding: FileSystemLegacy.EncodingType.Base64,
    });
    
    return targetFileUri; 
  } catch (err) {
    console.error('[Metadata] Failed to write image artwork data to user file system:', err);
    return null;
  }
}

export function generateArtworkFromTitle(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 45%)`;
}
