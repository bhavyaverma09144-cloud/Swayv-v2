// src/constants/colors.ts

export interface ThemePalette {
  id: string;
  name: string;
  vibe: 'Clean' | 'Moody' | 'Vintage' | 'Cyber'; // Vibe groupings
  isDark: boolean;
  background: string;
  cardBackground: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  accent: string;
  surface: string;
  iconDefault: string;
}

export const themes: Record<string, ThemePalette> = {
  // --- THE "CLEAN" VIBES ---
  silkLight: {
    id: 'silkLight',
    name: 'Silk Light',
    vibe: 'Clean',
    isDark: false,
    background: '#F3F4F6',
    cardBackground: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    accent: '#6366F1', // Indigo
    surface: '#EAECEF',
    iconDefault: '#4B5563',
  },
  obsidianVelvet: {
    id: 'obsidianVelvet',
    name: 'Obsidian Velvet',
    vibe: 'Clean',
    isDark: true,
    background: '#0B0D14',
    cardBackground: '#131622',
    textPrimary: '#FAFAFA',
    textSecondary: '#9CA3AF',
    border: '#222533',
    accent: '#818CF8',
    surface: '#1A1D2E',
    iconDefault: '#A1A1AA',
  },

  // --- THE "MOODY" VIBES ---
  forestMelancholy: {
    id: 'forestMelancholy',
    name: 'Deep Forest',
    vibe: 'Moody',
    isDark: true,
    background: '#0A0F0D', // Deep evergreen black
    cardBackground: '#121A16',
    textPrimary: '#E8EFEA',
    textSecondary: '#8A9A90',
    border: '#1B2922',
    accent: '#10B981', // Emerald pop
    surface: '#1A2620',
    iconDefault: '#8A9A90',
  },

  // --- THE "VINTAGE" VIBES ---
  vinylVinyl: {
    id: 'vinylVinyl',
    name: '70s Vinyl',
    vibe: 'Vintage',
    isDark: false,
    background: '#F4EFEA', // Warm sepia parchment
    cardBackground: '#FAF7F2',
    textPrimary: '#2B221A', // Espresso ink
    textSecondary: '#78685A',
    border: '#E6DDD4',
    accent: '#D97706', // Warm amber
    surface: '#EDE3D9',
    iconDefault: '#78685A',
  },

  // --- THE "CYBER" VIBES ---
  tokyoNeon: {
    id: 'tokyoNeon',
    name: 'Tokyo Neon',
    vibe: 'Cyber',
    isDark: true,
    background: '#0D0814', // Deep midnight purple
    cardBackground: '#160F24',
    textPrimary: '#FDF8FF',
    textSecondary: '#A799B5',
    border: '#2A1B3D',
    accent: '#F43F5E', // Hot pink rose
    surface: '#221531',
    iconDefault: '#A799B5',
  },
};
