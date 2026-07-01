// app/(tabs)/settings.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAudio } from '../../src/context/AudioContext';
import { useAppTheme } from '../../src/context/ThemeContext';
import { themes } from '../../src/constants/colors';
import { MediaService } from '../../src/services/MediaService';
import { useLibrary } from '../../src/context/LibraryContext';

export default function SettingsScreen() {
  const { currentTheme: activeColors, setTheme } = useAppTheme();
  const { tracks, setTracks } = useAudio();
  const { scanForSongs, isLoading } = useLibrary();
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const vibeGroups: ('Clean' | 'Moody' | 'Vintage' | 'Cyber')[] = ['Clean', 'Moody', 'Vintage', 'Cyber'];

  const handleScanSongs = async () => {
    setIsScanning(true);
    try {
      await scanForSongs();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to scan for songs. Please check permissions.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* PROFILE SECTION */}
        <View style={[styles.profileCard, { backgroundColor: activeColors.cardBackground }]}>
          <View style={[styles.avatarMock, { backgroundColor: activeColors.surface }]}>
            <Ionicons name="person" size={28} color={activeColors.textSecondary} />
          </View>
          <View>
            <Text style={[styles.profileName, { color: activeColors.textPrimary }]}>Alex Mercer</Text>
            <Text style={[styles.profileStatus, { color: activeColors.textSecondary }]}>Premium Listener</Text>
          </View>
        </View>

        {/* LOCAL STORAGE SECTION */}
        <Text style={[styles.sectionTitle, { color: activeColors.textSecondary }]}>Local Storage</Text>
        <View style={[styles.settingGroup, { backgroundColor: activeColors.cardBackground }]}>
          <TouchableOpacity style={styles.rowItem} onPress={handleScanSongs} disabled={isScanning || isLoading}>
            <View style={styles.rowLeft}>
              <Ionicons name="folder-open-outline" size={20} color={activeColors.textPrimary} />
              <Text style={[styles.rowText, { color: activeColors.textPrimary }]}>Scan Storage for Songs</Text>
            </View>
            {(isScanning || isLoading) ? (
              <ActivityIndicator size="small" color={activeColors.accent} />
            ) : (
              <Text style={{ color: activeColors.accent, fontSize: 13, fontWeight: '600' }}>
                {tracks.length > 0 ? `${tracks.length} Songs Loaded` : 'Scan'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* SECTION: AUDIO EXPERIENCE */}
        <Text style={[styles.sectionTitle, { color: activeColors.textSecondary }]}>Audio Settings</Text>
        <View style={[styles.settingGroup, { backgroundColor: activeColors.cardBackground }]}>
          <TouchableOpacity style={[styles.rowItem, { borderBottomColor: activeColors.border }]}>
            <View style={styles.rowLeft}>
              <Ionicons name="options" size={20} color={activeColors.textPrimary} />
              <Text style={[styles.rowText, { color: activeColors.textPrimary }]}>Equalizer</Text>
            </View>
            <Text style={{ color: activeColors.textSecondary, fontSize: 13 }}>Dolby Atmos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Ionicons name="cloud-download" size={20} color={activeColors.textPrimary} />
              <Text style={[styles.rowText, { color: activeColors.textPrimary }]}>Streaming Quality</Text>
            </View>
            <Text style={{ color: activeColors.accent, fontSize: 13, fontWeight: '600' }}>Lossless</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION: GENERAL PREFERENCES */}
        <Text style={[styles.sectionTitle, { color: activeColors.textSecondary }]}>General</Text>
        <View style={[styles.settingGroup, { backgroundColor: activeColors.cardBackground, borderColor: activeColors.border }]}>
          <TouchableOpacity style={[styles.rowItem, { borderBottomColor: activeColors.border }]}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications" size={20} color={activeColors.textPrimary} />
              <Text style={[styles.rowText, { color: activeColors.textPrimary }]}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={activeColors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.rowItem}>
            <View style={styles.rowLeft}>
              <Ionicons name="shield-checkmark" size={20} color={activeColors.textPrimary} />
              <Text style={[styles.rowText, { color: activeColors.textPrimary }]}>Privacy & Safety</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={activeColors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* SECTION: APP VIBE PALETTES */}
        <Text style={[styles.sectionTitle, { color: activeColors.textSecondary }]}>App Vibe</Text>
        {vibeGroups.map((group) => (
          <View key={group} style={styles.vibeGroupWrapper}>
            <Text style={[styles.vibeCategoryLabel, { color: activeColors.textSecondary }]}>{group}</Text>
            <View style={styles.paletteGrid}>
              {Object.values(themes)
                .filter((t) => t.vibe === group)
                .map((themeItem) => {
                  const isSelected = activeColors.id === themeItem.id;
                  return (
                    <TouchableOpacity
                      key={themeItem.id}
                      onPress={() => setTheme(themeItem.id)}
                      style={[
                        styles.paletteCard,
                        { 
                          backgroundColor: themeItem.cardBackground, 
                          borderColor: isSelected ? themeItem.accent : themeItem.border,
                          borderWidth: isSelected ? 2 : 1,
                        }
                      ]}
                    >
                      <View style={styles.previewRow}>
                        <View style={[styles.previewBubble, { backgroundColor: themeItem.background }]} />
                        <View style={[styles.previewBubble, { backgroundColor: themeItem.accent }]} />
                      </View>
                      <Text style={[styles.themeLabel, { color: themeItem.textPrimary }]}>
                        {themeItem.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
          </View>
        ))}

        {/* LOGOUT BUTTON */}
        <TouchableOpacity style={[styles.logoutButton, { borderColor: '#EF4444' }]}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  profileCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 25 },
  avatarMock: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  profileName: { fontSize: 16, fontFamily: 'AppFont-SemiBold' },
  profileStatus: { fontSize: 12, fontFamily: 'AppFont-Regular', marginTop: 2 },
  sectionTitle: { fontSize: 11, fontFamily: 'AppFont-Medium', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, marginTop: 10 },
  settingGroup: { borderRadius: 20, marginBottom: 20 },
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16, borderBottomWidth: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { fontSize: 14, fontFamily: 'AppFont-Medium' },
  vibeGroupWrapper: { marginBottom: 16 },
  vibeCategoryLabel: { fontSize: 12, fontFamily: 'AppFont-Regular', marginBottom: 8, paddingLeft: 4 },
  paletteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  paletteCard: { width: '48.5%', padding: 12, borderRadius: 16, justifyContent: 'center', borderWidth: 1 },
  previewRow: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  previewBubble: { width: 14, height: 14, borderRadius: 7 },
  themeLabel: { fontSize: 13, fontFamily: 'AppFont-Medium' },
  logoutButton: { width: '100%', paddingVertical: 15, borderRadius: 20, alignItems: 'center', marginTop: 15, borderWidth: 2 },
  logoutText: { color: '#EF4444', fontSize: 14, fontFamily: 'AppFont-SemiBold' }
});