// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes, ThemePalette } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@swayv_theme';

interface ThemeContextType {
  currentTheme: ThemePalette;
  isDark: boolean;
  setTheme: (themeId: string) => void;
  toggleTheme: () => void;
  availableThemes: ThemePalette[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentThemeId, setCurrentThemeId] = useState<string>('silkLight');
  const availableThemes = Object.values(themes);

  // Load saved theme on mount
  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme && themes[savedTheme]) {
          setCurrentThemeId(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    }
    loadTheme();
  }, []);

  // Save theme when it changes
  useEffect(() => {
    AsyncStorage.setItem(THEME_KEY, currentThemeId).catch(console.error);
  }, [currentThemeId]);

  const currentTheme = themes[currentThemeId];
  const isDark = currentTheme?.isDark || false;

  const setTheme = (themeId: string) => {
    if (themes[themeId]) {
      setCurrentThemeId(themeId);
    }
  };

  const toggleTheme = () => {
    // Find next theme with opposite isDark
    const darkThemes = availableThemes.filter(t => t.isDark !== isDark);
    if (darkThemes.length > 0) {
      setCurrentThemeId(darkThemes[0].id);
    }
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      isDark,
      setTheme,
      toggleTheme,
      availableThemes,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};