import React, { memo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Image, Modal } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import Animated, { useAnimatedStyle, withSpring, interpolate, SharedValue, Extrapolation } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useAudio } from '../../context/AudioContext';
import AnimatedButton from '../AnimatedButton';
import { useAppTheme } from '../../context/ThemeContext';
import { findAndReadLRC } from '../../services/lyricsService';

import MainProgressBar from './MainProgressBar';
import KaraokeModal from './KaraokeModal';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const OVERLAY_HEIGHT = 72;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.90;
const panelSpringConfig = { damping: 22, stiffness: 250, mass: 0.8 };

interface PlayerProps {
  expansionProgress: SharedValue<number>;
}

const getTitleFontSize = (title: string): number => {
  if (title.length <= 15) return 24;
  if (title.length <= 25) return 20;
  if (title.length <= 35) return 17;
  return 15;
};

export default memo(function AudioPlayerOverlay({ expansionProgress }: PlayerProps) {
  const {
    isPlaying, showOverlay, progressWidth, currentSong,
    handlePlayPause, handleNext = () => {}, handlePrevious = () => {},
    toggleShuffle = () => {}, isShuffled = false, toggleLike = () => {},
    isLiked = false, position = 0, duration = 1, seekTo,
  } = useAudio();

  const { currentTheme: activeColors } = useAppTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isKaraokeOpen, setIsKaraokeOpen] = useState(false);
  const [lyricsData, setLyricsData] = useState<any[]>([]);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);

  useEffect(() => {
    if (currentSong) loadLyrics();
  }, [currentSong?.id]);

  const loadLyrics = async () => {
    if (!currentSong) return;
    if (currentSong.lyrics && currentSong.lyrics.length > 0) {
      setLyricsData(currentSong.lyrics);
      return;
    }
    setIsLoadingLyrics(true);
    try {
      const sourcePath = currentSong.uri || currentSong.asset;
      if (sourcePath) {
        const lyrics = await findAndReadLRC(sourcePath);
        if (lyrics?.length > 0) {
          setLyricsData(lyrics);
          currentSong.lyrics = lyrics;
        } else {
          setLyricsData([]);
        }
      }
    } catch (error) {
      setLyricsData([]);
    } finally {
      setIsLoadingLyrics(false);
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const isExpanded = expansionProgress.value > 0.5;
      const delta = event.translationY / EXPANDED_HEIGHT;
      expansionProgress.value = Math.max(0, Math.min(1, isExpanded ? 1 - delta : -delta));
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        expansionProgress.value = withSpring(0, panelSpringConfig);
      } else if (event.translationY < -100 || event.velocityY < -500) {
        expansionProgress.value = withSpring(1, panelSpringConfig);
      } else {
        expansionProgress.value = withSpring(expansionProgress.value > 0.5 ? 1 : 0, panelSpringConfig);
      }
    })
    .failOffsetX([-30, 30])
    .activeOffsetY(15);

  const animatedPanelContainer = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(expansionProgress.value, [0, 1], [EXPANDED_HEIGHT - OVERLAY_HEIGHT, 0]) }],
    borderRadius: interpolate(expansionProgress.value, [0, 1], [0, 32], Extrapolation.CLAMP),
  }));

  const animatedExpandedContent = useAnimatedStyle(() => ({
    opacity: interpolate(expansionProgress.value, [0.5, 0.9], [0, 1], Extrapolation.CLAMP),
    zIndex: expansionProgress.value > 0.5 ? 2 : -1,
  }));

  const animatedMiniContent = useAnimatedStyle(() => ({
    opacity: interpolate(expansionProgress.value, [0, 0.4], [1, 0], Extrapolation.CLAMP),
    zIndex: expansionProgress.value < 0.5 ? 2 : -1,
  }));

  const animatedMiniProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  if (!showOverlay) return null;

  const activeTitle = currentSong ? currentSong.title : "No Track Selected";
  const activeArtist = currentSong ? currentSong.artist : "Unknown Artist";
  const hasValidImage = currentSong?.artwork && !currentSong.artwork.startsWith('hsl');

  return (
    <>
      <Animated.View style={[styles.shadowContainer, { backgroundColor: activeColors.cardBackground }, animatedPanelContainer]}>
        <View style={styles.clipContainer}>
          
          {/* EXPANDED UI TRACK LAYER */}
          <Animated.View style={[styles.expandedContentWrapper, animatedExpandedContent]}>
            <GestureDetector gesture={panGesture}>
              <View style={styles.dragHandleZone}>
                <View style={[styles.dragHandleIndicator, { backgroundColor: activeColors.border }]} />
              </View>
            </GestureDetector>

            <View style={styles.expandedLayout}>
              <View style={[styles.largeArtMock, { backgroundColor: currentSong?.artwork?.startsWith('hsl') ? activeColors.surface : (currentSong?.artwork || activeColors.surface) }]}>
                {hasValidImage ? <Image source={{ uri: currentSong.artwork }} style={styles.largeArtImage} /> : <Ionicons name="musical-notes" size={92} color={activeColors.textSecondary} />}
              </View>

              <Text style={[styles.expandedTrackTitle, { color: activeColors.textPrimary, fontSize: getTitleFontSize(activeTitle) }]} numberOfLines={1}>
                {activeTitle}
              </Text>
              <Text style={[styles.expandedArtistTitle, { color: activeColors.textSecondary }]} numberOfLines={1}>
                {activeArtist}
              </Text>

              <MainProgressBar progressWidth={progressWidth} position={position} duration={duration} seekTo={seekTo} activeColors={activeColors} />

              <View style={styles.firstControlRow}>
                <AnimatedButton style={styles.controlButtonLarge} onPress={handlePrevious}>
                  <Ionicons name="play-skip-back" size={32} color={activeColors.textPrimary} />
                </AnimatedButton>
                <AnimatedButton style={[styles.expandedPlayCircle, { backgroundColor: activeColors.accent }]} onPress={() => handlePlayPause()}>
                  <Ionicons name={isPlaying ? 'pause' : 'play'} size={34} color="#FFFFFF" />
                </AnimatedButton>
                <AnimatedButton style={styles.controlButtonLarge} onPress={handleNext}>
                  <Ionicons name="play-skip-forward" size={32} color={activeColors.textPrimary} />
                </AnimatedButton>
              </View>

              <View style={styles.secondControlRow}>
                <AnimatedButton style={styles.secondaryControlButton} onPress={toggleLike}>
                  <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={26} color={isLiked ? '#EF4444' : activeColors.textSecondary} />
                </AnimatedButton>
                <AnimatedButton style={styles.secondaryControlButton} onPress={() => {}}>
                  <Ionicons name="list-outline" size={26} color={activeColors.textSecondary} />
                </AnimatedButton>
                <AnimatedButton style={styles.secondaryControlButton} onPress={toggleShuffle}>
                  <Ionicons name={isShuffled ? 'shuffle' : 'shuffle-outline'} size={26} color={isShuffled ? activeColors.accent : activeColors.textSecondary} />
                </AnimatedButton>
                <AnimatedButton style={styles.secondaryControlButton} onPress={() => setIsMenuOpen(true)}>
                  <Ionicons name="ellipsis-horizontal" size={26} color={activeColors.textSecondary} />
                </AnimatedButton>
              </View>
            </View>
          </Animated.View>

          {/* MINI CONTROLLER INTERACTION VIEW */}
          <Animated.View style={[styles.miniContentWrapper, animatedMiniContent]}>
            <Pressable style={{ flex: 1 }} onPress={() => { expansionProgress.value = withSpring(1, panelSpringConfig); }}>
              <View style={[styles.progressBarTrack, { backgroundColor: activeColors.border }]}>
                <Animated.View style={[styles.progressBarFill, { backgroundColor: activeColors.accent }, animatedMiniProgressStyle]} />
              </View>
              <View style={styles.overlayMainRow}>
                <View style={styles.songMetadata}>
                  <View style={[styles.miniArtMock, { backgroundColor: currentSong?.artwork?.startsWith('hsl') ? activeColors.surface : (currentSong?.artwork || activeColors.surface) }]}>
                    {hasValidImage ? <Image source={{ uri: currentSong.artwork }} style={styles.miniArtImage} /> : <Ionicons name="musical-notes" size={22} color={activeColors.textSecondary} />}
                  </View>
                  <View style={styles.textStack}>
                    <Text style={[styles.overlayTrackTitle, { color: activeColors.textPrimary }]} numberOfLines={1}>{activeTitle}</Text>
                    <Text style={[styles.overlayArtistTitle, { color: activeColors.textSecondary }]} numberOfLines={1}>{activeArtist}</Text>
                  </View>
                </View>
                <View style={styles.overlayControls}>
                  <AnimatedButton style={styles.controlButton} onPress={handlePrevious}>
                    <Ionicons name="play-skip-back" size={22} color={activeColors.textPrimary} />
                  </AnimatedButton>
                  <AnimatedButton style={[styles.playPauseOverlayButton, { backgroundColor: activeColors.accent }]} onPress={() => handlePlayPause()}>
                    <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#FFFFFF" />
                  </AnimatedButton>
                  <AnimatedButton style={styles.controlButton} onPress={handleNext}>
                    <Ionicons name="play-skip-forward" size={22} color={activeColors.textPrimary} />
                  </AnimatedButton>
                </View>
              </View>
            </Pressable>
          </Animated.View>

        </View>
      </Animated.View>

      {/* OPTIONS POPUP WINDOW SHEET */}
      <Modal visible={isMenuOpen} transparent={true} animationType="fade" onRequestClose={() => setIsMenuOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setIsMenuOpen(false)}>
          <View style={[styles.menuModalContent, { backgroundColor: activeColors.cardBackground }]}>
            <Text style={[styles.menuTitle, { color: activeColors.textPrimary }]}>Options</Text>
            <Pressable style={styles.menuItem} onPress={() => { setIsMenuOpen(false); setIsKaraokeOpen(true); }}>
              <Ionicons name="musical-notes-outline" size={22} color={activeColors.textPrimary} style={{ marginRight: 12 }} />
              <Text style={[styles.menuItemText, { color: activeColors.textPrimary }]}>Lyrics (Karaoke Mode)</Text>
            </Pressable>
            <Pressable style={styles.menuItem} onPress={() => setIsMenuOpen(false)}>
              <Ionicons name="share-social-outline" size={22} color={activeColors.textPrimary} style={{ marginRight: 12 }} />
              <Text style={[styles.menuItemText, { color: activeColors.textPrimary }]}>Share Track</Text>
            </Pressable>
            <Pressable style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => setIsMenuOpen(false)}>
              <Ionicons name="close-outline" size={22} color="#EF4444" style={{ marginRight: 12 }} />
              <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* DETACHED ISOLATED KARAOKE COMPONENT VIEW */}
      <KaraokeModal
        visible={isKaraokeOpen}
        onClose={() => setIsKaraokeOpen(false)}
        currentSong={currentSong}
        lyricsData={lyricsData}
        isLoadingLyrics={isLoadingLyrics}
        position={position}
        progressWidth={progressWidth}
        activeColors={activeColors}
        isPlaying={isPlaying}
        handlePlayPause={handlePlayPause}
        handleNext={handleNext}
        handlePrevious={handlePrevious}
      />
    </>
  );
});

const styles = StyleSheet.create({
  shadowContainer: { 
    position: 'absolute', 
    height: EXPANDED_HEIGHT, 
    bottom: 105,
    left: 0, 
    right: 0, 
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  clipContainer: { flex: 1, overflow: 'hidden' },
  miniContentWrapper: { height: OVERLAY_HEIGHT, position: 'absolute', top: 0, left: 0, right: 0 },
  expandedContentWrapper: { ...StyleSheet.absoluteFill },
  progressBarTrack: { width: '100%', height: 3 },
  progressBarFill: { height: '100%' },
  overlayMainRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 69 },
  songMetadata: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  miniArtMock: { width: 44, height: 44, borderRadius: 11, marginRight: 13, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  miniArtImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  textStack: { flex: 1, justifyContent: 'center' },
  overlayTrackTitle: { fontSize: 13, fontFamily: 'AppFont-Medium' },
  overlayArtistTitle: { fontSize: 12, fontFamily: 'AppFont-Regular', marginTop: 2 },
  overlayControls: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  controlButton: { padding: 9 },
  playPauseOverlayButton: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  dragHandleZone: { width: '100%', height: 36, alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10 },
  dragHandleIndicator: { width: 44, height: 4.5, borderRadius: 3 },
  expandedLayout: { alignItems: 'center', paddingHorizontal: 26, paddingTop: 6, flex: 1, justifyContent: 'center', paddingBottom: 40 },
  largeArtMock: { width: 260, height: 260, borderRadius: 30, marginBottom: 26, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  largeArtImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  expandedTrackTitle: { fontFamily: "AppFont-Medium", textAlign: 'center', letterSpacing: 0.2, maxWidth: SCREEN_WIDTH * 0.85 },
  expandedArtistTitle: { fontSize: 14, fontFamily: 'AppFont-Regular', marginTop: 7, marginBottom: 20, textAlign: 'center', maxWidth: SCREEN_WIDTH * 0.85 },
  firstControlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 24, marginBottom: 24 },
  controlButtonLarge: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 22 },
  expandedPlayCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  secondControlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', paddingHorizontal: 20 },
  secondaryControlButton: { padding: 12, borderRadius: 22 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  menuModalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  menuTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  menuItemText: { fontSize: 16, fontWeight: '500' },
});
