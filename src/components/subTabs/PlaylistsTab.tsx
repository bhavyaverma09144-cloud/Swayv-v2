import React, { useState, memo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Modal } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAudio } from '../../context/AudioContext';
import { useAppTheme } from '../../context/ThemeContext';

function PlaylistsTab() {
  const { currentTheme: activeColors } = useAppTheme();
  const { favoriteSongs = [] } = useAudio();
  
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

  return (
    <View style={styles.container}>
      <Pressable 
        style={[styles.createBtn, { backgroundColor: activeColors.accent }]} 
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={20} color="#FFF" />
        <Text style={styles.createBtnText}>Create New Playlist</Text>
      </Pressable>

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
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
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
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
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
