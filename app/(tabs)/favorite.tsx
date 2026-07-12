//// app/(tabs)/favorite.tsx//
//import React, { memo } from 'react';//
//import { ScrollView, View, Text, Pressable, Styl//eSheet } from 'react-native';
//import Ionicons from '@react-native-vector-icons///ionicons';
//import { useAudio } from '../../src/context/Audi//oContext';
//import { useAppTheme } from '../../src/context/T//hemeContext';
//
//function FavoritesTab() {//
//  const { isPlaying, currentSong, handlePlayPaus//e, favoriteSongs } = useAudio();
//  const { currentTheme: activeColors } = useAppT//heme();
//
//  return (//
//    <ScrollView //
//      contentContainerStyle={[styles.mainScroll,// { backgroundColor: activeColors.background }]}
//      showsVerticalScrollIndicator={false}//
//    >//
//      <Text style={[styles.sectionTitle, { color//: activeColors.textPrimary }]}>Your Favorites</Text>
//      //
//      <View style={styles.gridRow}>//
//        {favoriteSongs.length > 0 ? (//
//          favoriteSongs.map((song) => {//
//            const isCurrentTrack = currentSong?.//id === song.id;
//            const showPauseIcon = isCurrentTrack// && isPlaying;
//
//            return (//
//              <Pressable //
//                key={`fav-screen-${song.id}`}//
//                style={[styles.playableItem, { b//ackgroundColor: activeColors.surface }]} 
//                onPress={() => handlePlayPause(s//ong)}
//              >//
//                <Ionicons //
//                  name={showPauseIcon ? "pause-c//ircle" : "play-circle"} 
//                  size={52} //
//                  color={activeColors.iconDefaul//t}
//                />//
//                <Text style={[styles.itemText, {// color: activeColors.textSecondary }]} numberOfLines={1}>
//                  {song.title}//
//                </Text>//
//                {isCurrentTrack && (//
//                  <Text style={[styles.nowPlayin//gIndicator, { color: activeColors.iconDefault }]}>
//                    {isPlaying ? "Playing" : "Pa//used"}
//                  </Text>//
//                )}//
//              </Pressable>//
//            );//
//          })//
//        ) : (//
//          <View style={styles.emptyContainer}>//
//            <Ionicons name="heart-dislike-outlin//e" size={48} color={activeColors.textSecondary} />
//            <Text style={[styles.emptyText, { co//lor: activeColors.textSecondary }]}>
//              You haven't favorited any tracks y//et!
//            </Text>//
//          </View>//
//        )}//
//      </View>//
//    </ScrollView>//
//  );//
//}//
//
//const styles = StyleSheet.create({//
//  mainScroll: { //
//    paddingTop: 10,//
//    paddingHorizontal: 20, //
//    paddingBottom: 40, //
//    flexGrow: 1,//
//  },//
//  sectionTitle: { //
//    fontSize: 23, //
//    fontFamily: 'Sora-Bold', //
//    letterSpacing: 0.2,
//    marginBottom: 24,
//  },
//  gridRow: { 
//    flexDirection: 'row', 
//    flexWrap: 'wrap', 
//    gap: 16,
//  },
//  playableItem: { 
//    width: '47%', 
//    height: 140, 
//    borderRadius: 25, 
//    justifyContent: 'center', 
//    alignItems: 'center', 
//    padding: 12,
//  },
//  itemText: { 
//    marginTop: 8, 
//    fontSize: 13, 
//    fontFamily: 'AppFont-Medium',
//    letterSpacing: 0.1,
//    textAlign: 'center',
//  },
//  nowPlayingIndicator: {
//    fontSize: 10,
//    fontFamily: 'AppFont-Bold',
//    textTransform: 'uppercase',
//    marginTop: 2,
//  },
//  emptyContainer: {
//    flex: 1,
//    paddingTop: 275,
//    alignItems: 'center',
//    justifyContent: 'center',
//    width: '100%',
//    gap: 12,
//  },
//  emptyText: {
//    fontSize: 12,
//    textAlign: 'center',
//    fontFamily: 'AppFont-Bold',
//  }
//});
//
//export default memo(FavoritesTab);
//
// app/(tabs)/library.tsx
import React, { memo, useState } from 'react';
import { FlatList, View, Text, StyleSheet, Pressable, Modal, Image } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useLibrary } from '../../src/context/LibraryContext';
import { useAppTheme } from '../../src/context/ThemeContext';
import { useAudio } from '../../src/context/AudioContext';

function AlbumsTab() {
  const { currentTheme: activeColors } = useAppTheme();
  const { songs = [] } = useLibrary();
  const { handlePlayPause } = useAudio();
  const { clearCacheAndRescan, isLoading } = useLibrary();
  
  const [selectedAlbum, setSelectedAlbum] = useState<{
    name: string;
    songs: typeof songs;
    artwork?: string;
  } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Group songs by album
  const albumGroups: Record<string, typeof songs> = {};
  const albumArtwork: Record<string, string | undefined> = {};
  
  songs.forEach(song => {
    const album = song.album || 'Unknown Album';
    if (!albumGroups[album]) {
      albumGroups[album] = [];
      albumArtwork[album] = song.artwork; // Store first song's artwork
    }
    albumGroups[album].push(song);
  });

  // Build album list with counts
  const albums = Object.keys(albumGroups).map((albumName) => ({
    id: `album-${albumName}`,
    name: albumName,
    songCount: albumGroups[albumName].length,
    artwork: albumArtwork[albumName],
  }));

  // Sort albums alphabetically (Unknown Album at the end)
  albums.sort((a, b) => {
    if (a.name === 'Unknown Album') return 1;
    if (b.name === 'Unknown Album') return -1;
    return a.name.localeCompare(b.name);
  });

  const handleAlbumPress = (albumName: string) => {
    const albumSongsList = albumGroups[albumName] || [];
    setSelectedAlbum({
      name: albumName,
      songs: albumSongsList,
      artwork: albumArtwork[albumName],
    });
    setModalVisible(true);
  };

  const handleSongPress = (song: any) => {
    handlePlayPause(song);
    setModalVisible(false);
  };

  const getArtworkBackground = (artwork?: string) => {
    if (!artwork || artwork.startsWith('hsl')) {
      return activeColors.border;
    }
    return artwork;
  };

  if (albums.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="albums-outline" size={48} color={activeColors.textSecondary} />
        <Text style={[styles.emptyText, { color: activeColors.textSecondary }]}>
          No albums found. Try scanning your library.
        </Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { backgroundColor: activeColors.background }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isUnknown = item.name === 'Unknown Album';
          const artworkBg = getArtworkBackground(item.artwork);
          const isHslArtwork = item.artwork && item.artwork.startsWith('hsl');

          return (
            <Pressable 
              style={[styles.listItem, { borderBottomColor: activeColors.surface }]}
              onPress={() => handleAlbumPress(item.name)}
            >
             {/* <Pressable onPress={clearCacheAndRescan} style={{ backgroundColor: activeColors.accent }}>
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.scanButtonText}>Scan</Text>
              </Pressable> */}
              <View style={[styles.artworkContainer, { backgroundColor: artworkBg }]}>
                {item.artwork && !isHslArtwork ? (
                  <Image source={{ uri: item.artwork }} style={styles.artworkImage} />
                ) : (
                  <Ionicons 
                    name={isUnknown ? "folder-outline" : "musical-note"} 
                    size={24} 
                    color="#FFFFFF" 
                  />
                )}
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.listText, { color: activeColors.textPrimary }]}>
                  {item.name}
                </Text>
                <Text style={[styles.subListText, { color: activeColors.textSecondary }]}>
                  {item.songCount} song{item.songCount !== 1 ? 's' : ''}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward-outline" 
                size={20} 
                color={activeColors.textSecondary} 
                style={styles.chevron}
              />
            </Pressable>
          );
        }}
      />

      {/* Album Songs Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: activeColors.background }]}>
          {/* Header with Album Artwork */}
          <View style={[styles.modalHeader, { borderBottomColor: activeColors.surface }]}>
            <Pressable 
              onPress={() => setModalVisible(false)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={activeColors.textPrimary} />
            </Pressable>
            
            {selectedAlbum?.artwork && !selectedAlbum.artwork.startsWith('hsl') ? (
              <Image 
                source={{ uri: selectedAlbum.artwork }} 
                style={styles.modalArtwork} 
              />
            ) : (
              <View style={[styles.modalArtworkPlaceholder, { backgroundColor: activeColors.border }]}>
                <Ionicons name="musical-note" size={20} color="#FFFFFF" />
              </View>
            )}
            
            <View style={styles.modalHeaderText}>
              <Text style={[styles.modalTitle, { color: activeColors.textPrimary }]} numberOfLines={1}>
                {selectedAlbum?.name}
              </Text>
              <Text style={[styles.modalSubtitle, { color: activeColors.textSecondary }]}>
                {selectedAlbum?.songs.length} songs
              </Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          {/* Songs List */}
          <FlatList
            data={selectedAlbum?.songs || []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.songsList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable 
                style={[styles.songItem, { borderBottomColor: activeColors.surface }]}
                onPress={() => handleSongPress(item)}
              >
                <Ionicons name="musical-note-outline" size={24} color={activeColors.accent} />
                <View style={styles.songTextContainer}>
                  <Text style={[styles.songTitle, { color: activeColors.textPrimary }]}>
                    {item.title}
                  </Text>
                  {item.artist && item.artist !== 'Unknown Artist' && (
                    <Text style={[styles.songSubtitle, { color: activeColors.textSecondary }]}>
                      {item.artist}
                    </Text>
                  )}
                </View>
                <Ionicons 
                  name="play-circle-outline" 
                  size={24} 
                  color={activeColors.accent} 
                />
              </Pressable>
            )}
            ListEmptyComponent={() => (
              <View style={styles.centerContainer}>
                <Text style={[styles.emptyText, { color: activeColors.textSecondary }]}>
                  No songs found for this album.
                </Text>
              </View>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  listContent: { 
    paddingVertical: 10, 
    paddingBottom: 40 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 12,
    paddingHorizontal: 20,
  },
  emptyText: { 
    fontSize: 14, 
    fontFamily: 'AppFont-Light',
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  artworkContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  listText: { 
    fontSize: 16, 
    fontFamily: 'AppFont-Medium',
  },
  subListText: {
    fontSize: 13,
    fontFamily: 'AppFont-Regular',
    marginTop: 2,
  },
  chevron: {
    marginLeft: 'auto',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  modalArtwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  modalArtworkPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'AppFont-Bold',
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: 'AppFont-Regular',
    marginTop: 2,
  },
  headerSpacer: {
    width: 4,
  },
  songsList: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  songTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    fontSize: 16,
    fontFamily: 'AppFont-Medium',
  },
  songSubtitle: {
    fontSize: 13,
    fontFamily: 'AppFont-Regular',
    marginTop: 2,
  },
});

export default memo(AlbumsTab);