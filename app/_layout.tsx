// app/_layout.tsx
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AudioProvider } from '../src/context/AudioContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { LibraryProvider } from '../src/context/LibraryContext'; // ← Make sure this path is correct

export default function RootLayout() {
  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AudioProvider>
            <LibraryProvider>
              <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
              </Stack>
            </LibraryProvider>
          </AudioProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
  );
}
