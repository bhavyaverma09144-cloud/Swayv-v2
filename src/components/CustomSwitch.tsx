import React, { useEffect } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolateColor 
} from 'react-native-reanimated';

interface CustomSwitchProps {
  value: boolean;
  onValueChange: () => void;
  activeColor: string;
}

export default function CustomSwitch({ value, onValueChange, activeColor }: CustomSwitchProps) {
  // Shared value tracks toggle progress (0 = off, 1 = on)
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, {
      mass: 1,
      damping: 20,     // Lower damping = more bounce/elasticity
      stiffness: 500,   // Controls speed
      overshootClamping: false, // Allows the thumb to slightly overshoot the bounds for that "elastic" look
    });
  }, [value, progress]);

  // Dynamic track background animation
  const animatedTrackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['#767577', activeColor]
    );
    return { backgroundColor };
  });

  // Dynamic thumb position and stretch animation
  const animatedThumbStyle = useAnimatedStyle(() => {
    // Moves the thumb horizontally inside the 54px track
    const translateX = progress.value * 24; 

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <Pressable onPress={onValueChange}>
      <Animated.View style={[styles.track, animatedTrackStyle]}>
        <Animated.View style={[styles.thumb, animatedThumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 54,
    height: 30,
    borderRadius: 15,
    padding: 3,
    justifyContent: 'center',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 4,
  },
});
