//// app/(tabs)/settings.tsx
//import React, { useState } from 'react';
//import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
//import { SafeAreaView } from 'react-native-safe-area-context';
//import Ionicons from '@react-native-vector-icons/ionicons';
//import { useAudio } from '../../src/context/AudioContext';
//import { useAppTheme } from '../../src/context/ThemeContext';
//import { themes } from '../../src/constants/colors';
//import { MediaService } from '../../src/services/MediaService';
//import { useLibrary } from '../../src/context/LibraryContext';
//
//export default function SettingsScreen() {
//  const { currentTheme: activeColors, setTheme } = useAppTheme();
//  const { tracks, setTracks } = useAudio();
//  const { scanForSongs, isLoading } = useLibrary();
//  const [isScanning, setIsScanning] = useState<boolean>(false);
//
//  const vibeGroups: ('Clean' | 'Moody' | 'Vintage' | 'Cyber')[] = ['Clean', 'Moody', 'Vintage', 'Cyber'];
//
//  const handleScanSongs = async () => {
//    setIsScanning(true);
//    try {
//      await scanForSongs();
//    } catch (err) {
//      console.error(err);
//      Alert.alert("Error", "Failed to scan for songs. Please check permissions.");
//    } finally {
//      setIsScanning(false);
//    }
//  };
//
//  return (
//    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]}>
//      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
//        
//        {/* PROFILE SECTION */}
//        <View style={[styles.profileCard, { backgroundColor: activeColors.cardBackground }]}>
//          <View style={[styles.avatarMock, { backgroundColor: activeColors.surface }]}>
//            <Ionicons name="person" size={28} color={activeColors.textSecondary} />
//          </View>
//          <View>
//            <Text style={[styles.profileName, { color: activeColors.textPrimary }]}>Bhavya Verma</Text>
//            <Text style={[styles.profileStatus, { color: activeColors.textSecondary }]}>Premium Listener</Text>
//          </View>
//        </View>
//
//        {/* LOCAL STORAGE SECTION */}
//        <Text style={[styles.sectionTitle, { color: activeColors.textSecondary }]}>Local Storage</Text>
//        <View style={[styles.settingGroup, { backgroundColor: activeColors.cardBackground }]}>
//          <TouchableOpacity style={styles.rowItem} onPress={handleScanSongs} disabled={isScanning || isLoading}>
//            <View style={styles.rowLeft}>
//              <Ionicons name="folder-open-outline" size={20} color={activeColors.textPrimary} />
//              <Text style={[styles.rowText, { color: activeColors.textPrimary }]}>Scan Storage for Songs</Text>
//            </View>
//            {(isScanning || isLoading) ? (
//              <ActivityIndicator size="small" color={activeColors.accent} />
//            ) : (
//              <Text style={{ color: activeColors.accent, fontSize: 13, fontWeight: '600' }}>
//                {tracks.length > 0 ? `${tracks.length} Songs Loaded` : 'Scan'}
//              </Text>
//            )}
//          </TouchableOpacity>
//        </View>
//
//        {/* SECTION: AUDIO EXPERIENCE */}
//        <Text style={[styles.sectionTitle, { color: activeColors.textSecondary }]}>Audio Settings</Text>
//        <View style={[styles.settingGroup, { backgroundColor: activeColors.cardBackground }]}>
//          <TouchableOpacity style={[styles.rowItem, { borderBottomColor: activeColors.border }]}>
//            <View style={styles.rowLeft}>
//              <Ionicons name="options" size={20} color={activeColors.textPrimary} />
//              <Text style={[styles.rowText, { color: activeColors.textPrimary }]}>Equalizer</Text>
//            </View>
//            <Text style={{ color: activeColors.textSecondary, fontSize: 13 }}>Dolby Atmos</Text>
//          </TouchableOpacity>
//
//          <TouchableOpacity style={styles.rowItem}>
//            <View style={styles.rowLeft}>
//              <Ionicons name="cloud-download" size={20} color={activeColors.textPrimary} />
//              <Text style={[styles.rowText, { color: activeColors.textPrimary }]}>Streaming Quality</Text>
//            </View>
//            <Text style={{ color: activeColors.accent, fontSize: 13, fontWeight: '600' }}>Lossless</Text>
//          </TouchableOpacity>
//        </View>
//
//        {/* SECTION: GENERAL PREFERENCES */}
//        <Text style={[styles.sectionTitle, { color: activeColors.textSecondary }]}>General</Text>
//        <View style={[styles.settingGroup, { backgroundColor: activeColors.cardBackground, borderColor: activeColors.border }]}>
//          <TouchableOpacity style={[styles.rowItem, { borderBottomColor: activeColors.border }]}>
//            <View style={styles.rowLeft}>
//              <Ionicons name="notifications" size={20} color={activeColors.textPrimary} />
//              <Text style={[styles.rowText, { color: activeColors.textPrimary }]}>Notifications</Text>
//            </View>
//            <Ionicons name="chevron-forward" size={16} color={activeColors.textSecondary} />
//          </TouchableOpacity>
//
//          <TouchableOpacity style={styles.rowItem}>
//            <View style={styles.rowLeft}>
//              <Ionicons name="shield-checkmark" size={20} color={activeColors.textPrimary} />
//              <Text style={[styles.rowText, { color: activeColors.textPrimary }]}>Privacy & Safety</Text>
//            </View>
//            <Ionicons name="chevron-forward" size={16} color={activeColors.textSecondary} />
//          </TouchableOpacity>
//        </View>
//
//        {/* SECTION: APP VIBE PALETTES */}
//        <Text style={[styles.sectionTitle, { color: activeColors.textSecondary }]}>App Vibe</Text>
//        {vibeGroups.map((group) => (
//          <View key={group} style={styles.vibeGroupWrapper}>
//            <Text style={[styles.vibeCategoryLabel, { color: activeColors.textSecondary }]}>{group}</Text>
//            <View style={styles.paletteGrid}>
//              {Object.values(themes)
//                .filter((t) => t.vibe === group)
//                .map((themeItem) => {
//                  const isSelected = activeColors.id === themeItem.id;
//                  return (
//                    <TouchableOpacity
//                      key={themeItem.id}
//                      onPress={() => setTheme(themeItem.id)}
//                      style={[
//                        styles.paletteCard,
//                        { 
//                          backgroundColor: themeItem.cardBackground, 
//                          borderColor: isSelected ? themeItem.accent : themeItem.border,
//                          borderWidth: isSelected ? 2 : 1,
//                        }
//                      ]}
//                    >
//                      <View style={styles.previewRow}>
//                        <View style={[styles.previewBubble, { backgroundColor: themeItem.background }]} />
//                        <View style={[styles.previewBubble, { backgroundColor: themeItem.accent }]} />
//                      </View>
//                      <Text style={[styles.themeLabel, { color: themeItem.textPrimary }]}>
//                        {themeItem.name}
//                      </Text>
//                    </TouchableOpacity>
//                  );
//                })}
//            </View>
//          </View>
//        ))}
//
//        {/* LOGOUT BUTTON */}
//        <TouchableOpacity style={[styles.logoutButton, { borderColor: '#EF4444' }]}>
//          <Text style={styles.logoutText}>Sign Out</Text>
//        </TouchableOpacity>
//
//      </ScrollView>
//    </SafeAreaView>
//  );
//}
//
//const styles = StyleSheet.create({
//  container: { flex: 1 },
//  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
//  profileCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 25 },
//  avatarMock: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
//  profileName: { fontSize: 16, fontFamily: 'AppFont-SemiBold' },
//  profileStatus: { fontSize: 12, fontFamily: 'AppFont-Regular', marginTop: 2 },
//  sectionTitle: { fontSize: 11, fontFamily: 'AppFont-Medium', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, marginTop: 10 },
//  settingGroup: { borderRadius: 20, marginBottom: 20 },
//  rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16, borderBottomWidth: 1 },
//  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//  rowText: { fontSize: 14, fontFamily: 'AppFont-Medium' },
//  vibeGroupWrapper: { marginBottom: 16 },
//  vibeCategoryLabel: { fontSize: 12, fontFamily: 'AppFont-Regular', marginBottom: 8, paddingLeft: 4 },
//  paletteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
//  paletteCard: { width: '48.5%', padding: 12, borderRadius: 16, justifyContent: 'center', borderWidth: 1 },
//  previewRow: { flexDirection: 'row', gap: 4, marginBottom: 6 },
//  previewBubble: { width: 14, height: 14, borderRadius: 7 },
//  themeLabel: { fontSize: 13, fontFamily: 'AppFont-Medium' },
//  logoutButton: { width: '100%', paddingVertical: 15, borderRadius: 20, alignItems: 'center', marginTop: 15, borderWidth: 2 },
//  logoutText: { color: '#EF4444', fontSize: 14, fontFamily: 'AppFont-SemiBold' }
//});

import React, { useState, memo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Modal } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAudio } from '../../src/context/AudioContext';
import { useAppTheme } from '../../src/context/ThemeContext';
import AnimatedButton from '../../src/components/AnimatedButton';

function PlaylistsTab() {
  const { currentTheme: activeColors } = useAppTheme();
  const { favoriteSongs = [], getArtistSongCount, tracks, currentSong } = useAudio();
  
  // Local state initialized with the premade "Favorites" folder
  const [playlists, setPlaylists] = useState([
    { id: 'favorites', name: 'Favorites', isSystem: true }
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim() === '') return;
    const newPlaylist = {
      id: Date.now().toString(),
      name: newPlaylistName,
      isSystem: false
    };
    setPlaylists([...playlists, newPlaylist]);
    setNewPlaylistName('');
    setModalVisible(false);
  };

  const artistSongCount = currentSong ? getArtistSongCount(currentSong.artist) : 0;

  return (
    <View style={[styles.container, { backgroundColor: activeColors.background } ]}>
      <View style={styles.buttonContainer}>
      
      <Pressable 
        style={[styles.createBtn, { backgroundColor: activeColors.accent }]} 
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={20} color="#FFF" />
        <Text style={styles.createBtnText}>Create New Playlist</Text>
      </Pressable>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isFavorites = item.id === 'favorites';
          const trackCount = isFavorites ? favoriteSongs.length : 0;

          return (
            <Pressable style={[styles.listItem, { borderBottomColor: activeColors.surface }]}>
              <Ionicons 
                name={isFavorites ? "heart" : "folder-open-outline"} 
                size={35} 
                color={isFavorites ? "#E91E63" : activeColors.accent} 
              />
              <View style={styles.textContainer}>
                <Text style={[
                  styles.listText, 
                  { color: activeColors.textPrimary, fontWeight: isFavorites ? 'bold' : 'normal' }
                ]}>
                  {item.name}
                </Text>
                <Text style={[styles.subListText, { color: activeColors.textSecondary }]}>
                  {trackCount} tracks
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      {/* Creation Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: activeColors.surface }]}>
            <Text style={[styles.modalTitle, { color: activeColors.textPrimary }]}>New Playlist</Text>
            <TextInput
              style={[styles.input, { color: activeColors.textPrimary, borderColor: activeColors.accent }]}
              placeholder="Playlist name..."
              placeholderTextColor={activeColors.textSecondary}
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalBtn} onPress={() => setModalVisible(false)}>
                <Text style={{ color: activeColors.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.modalBtnConfirm]} onPress={handleCreatePlaylist}>
                <Text style={{ color: activeColors.accent, fontWeight: 'bold' }}>Create</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  textContainer: {
    flexDirection: 'column',
    marginLeft: 15,
  },
  listText: {
    fontSize: 15,
    fontFamily: 'AppFont-Medium',
  },
  subListText: {
    fontSize: 12,
    marginTop: 2,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    width: 300,
    borderRadius: 25,
    marginVertical: 10,
  },
  createBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 25,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalBtn: {
    padding: 10,
    marginLeft: 10,
  },
  modalBtnConfirm: {
    marginLeft: 15,
  },
});

export default memo(PlaylistsTab);
