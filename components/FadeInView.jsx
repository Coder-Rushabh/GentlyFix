import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useReduceMotion } from '../lib/motion';

const MAX_STAGGER = 10; // only the first screenful animates, so scrolling stays calm

// Fades and slides children in. `index` staggers siblings; `from` is the starting y offset.
export default function FadeInView({ index = 0, from = 14, duration = 320, style, children }) {
  const reduce = useReduceMotion();
  const progress = useRef(new Animated.Value(index >= MAX_STAGGER ? 1 : 0)).current;
  useEffect(() => {
    if (index >= MAX_STAGGER) return;
    Animated.timing(progress, { toValue: 1, duration: reduce ? 0 : duration, delay: reduce ? 0 : index * 35, useNativeDriver: true }).start();
  }, [index, duration, reduce, progress]);
  return (
    <Animated.View
      style={[style, { opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }] }]}
    >
      {children}
    </Animated.View>
  );
}
