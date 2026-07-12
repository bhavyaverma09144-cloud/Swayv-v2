import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolateColor,
  interpolate,
  Extrapolate,
  useDerivedValue,
  useAnimatedRef,
  scrollTo,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const AUTOSCROLL_RESUME_DELAY = 4000;

// Smooth cinematic easing – now also used for the line index transition
const CINEMATIC_BEZIER = Easing.bezier(0.22, 1, 0.36, 1);
const ANIMATION_DURATION = 800; // reduced for snappier feel, still buttery

interface KaraokeModalProps {
  visible: boolean;
  onClose: () => void;
  currentSong: any;
  lyricsData: any[];
  isLoadingLyrics: boolean;
  position: number;
  progressWidth: Animated.SharedValue<number>;
  activeColors: any;
  isPlaying: boolean;
  handlePlayPause: (song?: any) => void;
  handleNext: () => void;
  handlePrevious: () => void;
}

/* -------------------------------------------------------
   Lyric Line – all animations driven by a single
   shared value passed from the parent.
------------------------------------------------------- */
const AnimatedLyricLine = React.memo(
  ({
    line,
    index,
    currentLineIndex,
    animatedLineIndex,
    activeColors,
    onLayout,
  }: {
    line: any;
    index: number;
    currentLineIndex: number;
    animatedLineIndex: Animated.SharedValue<number>;
    activeColors: any;
    onLayout: (event: any) => void;
  }) => {
    const animatedStyle = useAnimatedStyle(() => {
      'worklet';
      const distance = animatedLineIndex.value - index;
      const isPast = index < currentLineIndex;

      // Past lines stay dimmed, no animation
      const opacity = isPast
        ? 0.35
        : interpolate(distance, [-1, 0, 1], [0.7, 1, 0.7], Extrapolate.CLAMP);

      const color = isPast
        ? activeColors.textSecondary
        : interpolateColor(
            distance,
            [-1, 0, 1],
            [
              activeColors.textPrimary,
              activeColors.accent,
              activeColors.textPrimary,
            ],
          );

      return { opacity, color };
    });

    return (
      <Animated.Text
        onLayout={onLayout}
        style={[
          styles.lyricLine,
          animatedStyle,
          { fontFamily: 'AppFont-Light' },
        ]}
      >
        {line.text}
      </Animated.Text>
    );
  },
);

/* -------------------------------------------------------
   Main Karaoke Modal
------------------------------------------------------- */
export default function KaraokeModal({
  visible,
  onClose,
  currentSong,
  lyricsData,
  isLoadingLyrics,
  position,
  progressWidth,
  activeColors,
  isPlaying,
  handlePlayPause,
  handleNext,
  handlePrevious,
}: KaraokeModalProps) {
  const animatedScrollRef = useAnimatedRef<Animated.ScrollView>();

  const isUserScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [scrollViewHeight, setScrollViewHeight] = useState<number>(
    SCREEN_HEIGHT * 0.6,
  );

  const lyricLayouts = useRef<{
    [key: number]: { y: number; height: number };
  }>({});

  const hasValidImage =
    currentSong?.artwork && !currentSong.artwork.startsWith('hsl');
  const lyricsAvailable = lyricsData.length > 0;

  // Current line based on song position
  const currentLineIndex = useMemo(() => {
    return lyricsData.findIndex((line, index) => {
      const nextLine = lyricsData[index + 1];
      return (
        position >= line.startTime &&
        (!nextLine || position < nextLine.startTime)
      );
    });
  }, [position, lyricsData]);

  // ---- Single animated index that glides smoothly between lines ----
  const animatedLineIndex = useSharedValue(0);

  useEffect(() => {
    if (currentLineIndex !== -1) {
      animatedLineIndex.value = withTiming(currentLineIndex, {
        duration: ANIMATION_DURATION,
        easing: CINEMATIC_BEZIER,
      });
    }
  }, [currentLineIndex]); // only when real index changes

  // ---- Smooth auto‑scroll ----
  const targetScrollY = useSharedValue(0);

  const smoothScrollY = useDerivedValue(() => {
    return withTiming(targetScrollY.value, {
      duration: ANIMATION_DURATION,
      easing: CINEMATIC_BEZIER,
    });
  });

  useAnimatedReaction(
    () => smoothScrollY.value,
    (currentSmoothY) => {
      if (!isUserScrollingRef.current) {
        scrollTo(animatedScrollRef, 0, currentSmoothY, false);
      }
    },
    [animatedScrollRef],
  );

  // Trigger scroll centering when the line index changes
  useEffect(() => {
    if (visible && currentLineIndex !== -1 && !isUserScrollingRef.current) {
      const layout = lyricLayouts.current[currentLineIndex];
      if (layout) {
        const centerTargetY =
          layout.y + layout.height / 2 - scrollViewHeight / 2;
        targetScrollY.value = Math.max(0, centerTargetY);
      }
    }
  }, [currentLineIndex, visible, scrollViewHeight]);

  const onLineLayout = (index: number, event: any) => {
    const { y, height } = event.nativeEvent.layout;
    lyricLayouts.current[index] = { y, height };
  };

  const onScrollContainerLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) setScrollViewHeight(height);
  };

  const handleScrollBeginDrag = () => {
    isUserScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
  };

  const resetScrollTimeout = () => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
      const layout = lyricLayouts.current[currentLineIndex];
      if (layout) {
        const centerTargetY =
          layout.y + layout.height / 2 - scrollViewHeight / 2;
        targetScrollY.value = Math.max(0, centerTargetY);
      }
    }, AUTOSCROLL_RESUME_DELAY);
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: activeColors.background }]}>
        {/* ---- Header ---- */}
        <View style={styles.header}>
          <View style={styles.metaRow}>
            <View style={[styles.artMock, { backgroundColor: activeColors.surface }]}>
              {hasValidImage ? (
                <Image source={{ uri: currentSong.artwork }} style={styles.artImage} />
              ) : (
                <Ionicons
                  name="musical-notes"
                  size={24}
                  color={activeColors.textSecondary}
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.titleText, { color: activeColors.textPrimary }]}
                numberOfLines={1}
              >
                {currentSong?.title || 'No Track Selected'}
              </Text>
              <Text
                style={[styles.artistText, { color: activeColors.textSecondary }]}
                numberOfLines={1}
              >
                {currentSong?.artist || 'Unknown Artist'}
              </Text>
            </View>
          </View>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={26} color={activeColors.textPrimary} />
          </Pressable>
        </View>

        {/* ---- Progress bar ---- */}
        <View style={[styles.topProgressBarBase, { backgroundColor: activeColors.border }]}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { backgroundColor: activeColors.accent },
              animatedProgressStyle,
            ]}
          />
        </View>

        {/* ---- Lyric Scroll Area ---- */}
        {lyricsAvailable ? (
          <Animated.ScrollView
            ref={animatedScrollRef}
            onLayout={onScrollContainerLayout}
            contentContainerStyle={[
              styles.scrollContainer,
              { paddingVertical: scrollViewHeight / 2 - 20 },
            ]}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScrollBeginDrag={handleScrollBeginDrag}
            onScrollEndDrag={resetScrollTimeout}
            onMomentumScrollEnd={resetScrollTimeout}
          >
            {lyricsData.map((line, index) => (
              <AnimatedLyricLine
                key={index}
                line={line}
                index={index}
                currentLineIndex={currentLineIndex}
                animatedLineIndex={animatedLineIndex}
                activeColors={activeColors}
                onLayout={(event) => onLineLayout(index, event)}
              />
            ))}
          </Animated.ScrollView>
        ) : (
          <View style={styles.noLyrics}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={activeColors.textSecondary}
            />
            <Text
              style={[styles.noLyricsText, { color: activeColors.textPrimary }]}
            >
              {isLoadingLyrics
                ? 'Loading lyric content...'
                : 'No Lyrics available for karaoke.'}
            </Text>
          </View>
        )}

        {/* ---- Bottom Controls ---- */}
        <SafeAreaView
          edges={['bottom']}
          style={[
            styles.bottomControlBar,
            {
              backgroundColor: activeColors.cardBackground || activeColors.surface,
              borderTopColor: activeColors.border,
            },
          ]}
        >
          <View style={styles.controlRowInner}>
            <Pressable style={styles.bottomBarButton} onPress={handlePrevious}>
              <Ionicons
                name="play-skip-back"
                size={28}
                color={activeColors.textPrimary}
              />
            </Pressable>

            <Pressable
              style={[styles.bottomBarPlayCircle, { backgroundColor: activeColors.accent }]}
              onPress={() => handlePlayPause(currentSong)}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={26}
                color="#FFFFFF"
              />
            </Pressable>

            <Pressable style={styles.bottomBarButton} onPress={handleNext}>
              <Ionicons
                name="play-skip-forward"
                size={28}
                color={activeColors.textPrimary}
              />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  artMock: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  titleText: { fontSize: 16, fontWeight: 'bold' },
  artistText: { fontSize: 13, marginTop: 2 },
  closeButton: { padding: 6 },
  topProgressBarBase: { width: '100%', height: 3 },
  progressBarFill: { height: '100%' },
  scrollContainer: { paddingHorizontal: 28 },
  lyricLine: {
    textAlign: 'center',
    paddingVertical: 18,
    lineHeight: 32,
    fontSize: 20,
  },
  noLyrics: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noLyricsText: { fontSize: 15, marginTop: 12, textAlign: 'center', opacity: 0.6 },
  bottomControlBar: {
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 10,
  },
  controlRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 44,
    paddingVertical: 20,
  },
  bottomBarButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBarPlayCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
});