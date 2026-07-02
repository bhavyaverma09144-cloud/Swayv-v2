// src/components/AudioPlayerOverlay.tsx
import React, { useRef, memo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, Image } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  useSharedValue,
  SharedValue,
  Extrapolation,
  runOnJS
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useAudio } from '../context/AudioContext';
import AnimatedButton from './AnimatedButton';
import { useAppTheme } from '../context/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const OVERLAY_HEIGHT = 72;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.90;

const panelSpringConfig = { damping: 22, stiffness: 250, mass: 0.8 };

interface PlayerProps {
  expansionProgress: SharedValue<number>;
}

const formatTime = (millis: number) => {
  if (isNaN(millis) || millis < 0) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// COMPONENT: TOUCH-DRAGGABLE INTERACTIVE TIMELINE SLIDER
function MainProgressBar({ progressWidth, position, duration, seekTo, activeColors }: any) {
  const progressBarRef = useRef<View>(null);
  const totalBarWidth = useSharedValue(0);
  const barAbsoluteLeft = useSharedValue(0);

  const animatedTimelineStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const animatedThumbStyle = useAnimatedStyle(() => ({
    left: `${progressWidth.value * 100}%`,
  }));

  const onBarLayout = () => {
    progressBarRef.current?.measure((x, y, width, height, pageX) => {
      if (width > 0) {
        totalBarWidth.value = width;
        barAbsoluteLeft.value = pageX;
      }
    });
  };

  const updateProgressFromAbsoluteX = (absoluteX: number) => {
    'worklet';
    if (totalBarWidth.value > 0) {
      const relativeX = absoluteX - barAbsoluteLeft.value;
      const pct = Math.max(0, Math.min(1, relativeX / totalBarWidth.value));
      progressWidth.value = pct;
    }
  };

  const gesture = Gesture.Pan()
    .manualActivation(false)
    .onBegin((event) => {
      updateProgressFromAbsoluteX(event.absoluteX);
    })
    .onUpdate((event) => {
      updateProgressFromAbsoluteX(event.absoluteX);
    })
    .onEnd(() => {
      const targetMillis = progressWidth.value * duration;
      runOnJS(seekTo)(targetMillis);
    });

  return (
    <View style={styles.timelineMainContainer}>
      <GestureDetector gesture={gesture}>
        <View 
          ref={progressBarRef} 
          style={styles.scrubTrackWrapper} 
          onLayout={onBarLayout}
          collapsable={false}
        >
          <View style={[styles.expandedTrackBase, { backgroundColor: activeColors.border }]}>
            <Animated.View style={[styles.expandedTrackFill, { backgroundColor: activeColors.accent }, animatedTimelineStyle]} />
            <Animated.View style={[styles.timelineThumb, { backgroundColor: activeColors.accent }, animatedThumbStyle]} />
          </View>
        </View>
      </GestureDetector>

      <View style={styles.timestampRow}>
        <Text style={[styles.timeText, { color: activeColors.textSecondary }]}>{formatTime(position)}</Text>
        <Text style={[styles.timeText, { color: activeColors.textSecondary }]}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
}

export default memo(function AudioPlayerOverlay({ expansionProgress }: PlayerProps) {
  const {
    isPlaying,
    showOverlay,
    progressWidth,
    currentSong,
    handlePlayPause,
    handleNext = () => {},
    handlePrevious = () => {},
    toggleShuffle = () => {},
    isShuffled = false,
    toggleLike = () => {},
    isLiked = false,
    position = 0,
    duration = 1,
    seekTo,
  } = useAudio();

  const { currentTheme: activeColors } = useAppTheme();

  if (!showOverlay) return null;

  const expandPanel = () => { expansionProgress.value = withSpring(1, panelSpringConfig); };

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
    bottom: 0, left: 0, right: 0,
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

  const activeTitle = currentSong ? currentSong.title : "No Track Selected";
  const activeArtist = currentSong ? currentSong.artist : "Unknown Artist";

  // Check if track has a raw image path saved down on disk or remote network endpoint
  const hasValidImage = currentSong?.artwork && !currentSong.artwork.startsWith('hsl');

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.shadowContainer, { backgroundColor: activeColors.cardBackground }, animatedPanelContainer]}>
        <View style={styles.clipContainer}>
          
          {/* EXPANDED VIEW */}
          <Animated.View style={[styles.expandedContentWrapper, animatedExpandedContent]}>
            <View style={styles.dragHandleZone}>
              <View style={[styles.dragHandleIndicator, { backgroundColor: activeColors.border }]} />
            </View>

            <ScrollView
              contentContainerStyle={styles.expandedLayout}
              bounces={false}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              <View style={[styles.largeArtMock, { backgroundColor: currentSong?.artwork && currentSong.artwork.startsWith('hsl') ? activeColors.surface : (currentSong?.artwork || activeColors.surface) }]}>
                {hasValidImage ? (
                  <Image source={{ uri: currentSong.artwork }} style={styles.largeArtImage} />
                ) : (
                  <Ionicons name="musical-notes" size={92} color={currentSong?.artwork?.startsWith('hsl') ? "#FFFFFF" : activeColors.textSecondary} />
                )}
              </View>

              <Text style={[styles.expandedTrackTitle, { color: activeColors.textPrimary }]}>{activeTitle}</Text>
              <Text style={[styles.expandedArtistTitle, { color: activeColors.textSecondary }]}>{activeArtist}</Text>

              <MainProgressBar 
                progressWidth={progressWidth}
                position={position}
                duration={duration}
                seekTo={seekTo}
                activeColors={activeColors}
              />

              {/* CONTROLS ROW */}
              <View style={styles.expandedControlsRow}>
                <AnimatedButton style={styles.expandedIconButton} onPress={toggleLike}>
                  <Ionicons 
                    name={isLiked ? 'heart' : 'heart-outline'} 
                    size={26} 
                    color={isLiked ? '#EF4444' : activeColors.textSecondary} 
                  />
                </AnimatedButton>

                <AnimatedButton style={styles.expandedIconButton} onPress={handlePrevious}>
                  <Ionicons name="play-skip-back" size={30} color={activeColors.textPrimary} />
                </AnimatedButton>

                <AnimatedButton 
                  style={{
                    ...styles.expandedPlayCircle,
                    backgroundColor: activeColors.accent
                  }} 
                  onPress={() => handlePlayPause()}
                >
                  <Ionicons name={isPlaying ? 'pause' : 'play'} size={30} color="#FFFFFF" />
                </AnimatedButton>

                <AnimatedButton style={styles.expandedIconButton} onPress={handleNext}>
                  <Ionicons name="play-skip-forward" size={30} color={activeColors.textPrimary} />
                </AnimatedButton>
                
                <AnimatedButton style={styles.expandedIconButton} onPress={toggleShuffle}>
                  <Ionicons 
                    name={isShuffled ? 'shuffle' : 'shuffle-outline'} 
                    size={24} 
                    color={isShuffled ? activeColors.accent : activeColors.textSecondary} 
                  />
                </AnimatedButton>
              </View>
              
            </ScrollView>
          </Animated.View>

          {/* MINI PLAYER VIEW */}
          <Animated.View style={[styles.miniContentWrapper, animatedMiniContent]}>
            <Pressable style={{ flex: 1 }} onPress={expandPanel}>
              <View style={[styles.progressBarTrack, { backgroundColor: activeColors.border }]}>
                <Animated.View style={[styles.progressBarFill, { backgroundColor: activeColors.accent }, animatedMiniProgressStyle]} />
              </View>
              <View style={styles.overlayMainRow}>
                <View style={styles.songMetadata}>
                  <View style={[styles.miniArtMock, { backgroundColor: currentSong?.artwork && currentSong.artwork.startsWith('hsl') ? activeColors.surface : (currentSong?.artwork || activeColors.surface) }]}>
                    {hasValidImage ? (
                      <Image source={{ uri: currentSong.artwork }} style={styles.miniArtImage} />
                    ) : (
                      <Ionicons name="musical-notes" size={22} color={currentSong?.artwork?.startsWith('hsl') ? "#FFFFFF" : activeColors.textSecondary} />
                    )}
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
                  <AnimatedButton 
                    style={{
                      ...styles.playPauseOverlayButton,
                      backgroundColor: activeColors.accent
                    }} 
                    onPress={() => handlePlayPause()}
                  >
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
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  shadowContainer: { 
    position: 'absolute', 
    height: EXPANDED_HEIGHT, 
    bottom: 0, 
    left: 0, 
    right: 0, 
    elevation: 1,
  },
  clipContainer: { flex: 1, overflow: 'hidden' },
  miniContentWrapper: { height: OVERLAY_HEIGHT, position: 'absolute', top: 0, left: 0, right: 0 },
  expandedContentWrapper: { ...StyleSheet.absoluteFill },
  progressBarTrack: { width: '100%', height: 3 },
  progressBarFill: { height: '100%' },
  overlayMainRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 69 },
  songMetadata: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  miniArtMock: { 
    width: 44, 
    height: 44, 
    borderRadius: 11, 
    marginRight: 13,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  miniArtImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  textStack: { flex: 1, justifyContent: 'center' },
  overlayTrackTitle: { fontSize: 13, fontFamily: 'AppFont-Medium' },
  overlayArtistTitle: { fontSize: 12, fontFamily: 'AppFont-Regular', marginTop: 2 },
  overlayControls: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  controlButton: { padding: 9 },
  playPauseOverlayButton: { 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  dragHandleZone: { 
    width: '100%', 
    height: 36, 
    alignItems: 'center', 
    justifyContent: 'center',
    position: 'relative',
  },
  dragHandleIndicator: { 
    width: 44, 
    height: 4.5, 
    borderRadius: 3, 
  },
  expandedLayout: { 
    alignItems: 'center', 
    paddingHorizontal: 26, 
    paddingTop: 6, 
    paddingBottom: 65 
  },
  largeArtMock: { 
    width: 252, 
    height: 252, 
    borderRadius: 30, 
    marginTop: 10, 
    marginBottom: 26,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  largeArtImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  expandedTrackTitle: { 
    fontSize: 23, 
    fontFamily: "AppFont-Medium",
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  expandedArtistTitle: { 
    fontSize: 14, 
    fontFamily: 'AppFont-Regular',
    marginTop: 7, 
    marginBottom: 24, 
    textAlign: 'center' 
  },
  expandedControlsRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    width: '100%', 
    paddingHorizontal: 4,
    marginTop: 2,
  },
  expandedPlayCircle: { 
    width: 72, 
    height: 72, 
    borderRadius: 36, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  expandedIconButton: { 
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 22,
  },

  timelineMainContainer: { width: '100%', paddingHorizontal: 4, marginBottom: 26 },
  scrubTrackWrapper: { width: '100%', paddingVertical: 10, justifyContent: 'center' },
  expandedTrackBase: { width: '100%', height: 4, borderRadius: 2, position: 'relative' },
  expandedTrackFill: { height: '100%', borderRadius: 2, position: 'absolute' },
  timelineThumb: { width: 12, height: 12, borderRadius: 6, position: 'absolute', top: -4, marginLeft: -6 },
  timestampRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 0 },
  timeText: { fontSize: 9, fontFamily: 'Sora' },
});
