import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, runOnJS } from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

interface ProgressBarProps {
  progressWidth: Animated.SharedValue<number>;
  position: number;
  duration: number;
  seekTo: (millis: number) => void;
  activeColors: any;
}

const formatTime = (millis: number) => {
  if (isNaN(millis) || millis < 0) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

export default function MainProgressBar({ progressWidth, position, duration, seekTo, activeColors }: ProgressBarProps) {
  const totalBarWidth = useSharedValue(0);

  const animatedTimelineStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progressWidth.value * totalBarWidth.value }],
  }));

  const onBarLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0) totalBarWidth.value = width;
  };

  const updateProgressFromLocalX = (localX: number) => {
    'worklet';
    if (totalBarWidth.value > 0) {
      const pct = Math.max(0, Math.min(1, localX / totalBarWidth.value));
      progressWidth.value = pct;
    }
  };

  const gesture = Gesture.Pan()
    .manualActivation(false)
    .onBegin((event) => {
      updateProgressFromLocalX(event.x);
    })
    .onUpdate((event) => {
      updateProgressFromLocalX(event.x);
    })
    .onEnd(() => {
      const targetMillis = progressWidth.value * duration;
      runOnJS(seekTo)(targetMillis);
    });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <View style={styles.trackWrapper} onLayout={onBarLayout} collapsable={false}>
          <View style={[styles.trackBase, { backgroundColor: activeColors.border }]}>
            <Animated.View style={[styles.trackFill, { backgroundColor: activeColors.accent }, animatedTimelineStyle]} />
            <Animated.View style={[styles.thumb, { backgroundColor: activeColors.accent }, animatedThumbStyle]} />
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

const styles = StyleSheet.create({
  container: { width: '100%', paddingHorizontal: 4, marginBottom: 26 },
  trackWrapper: { width: '100%', paddingVertical: 10, justifyContent: 'center' },
  trackBase: { width: '100%', height: 4, borderRadius: 2, position: 'relative' },
  trackFill: { height: '100%', borderRadius: 2, position: 'absolute' },
  thumb: { width: 12, height: 12, borderRadius: 6, position: 'absolute', top: -4, left: -6 },
  timestampRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 0 },
  timeText: { fontSize: 9, fontFamily: 'Sora' },
});
