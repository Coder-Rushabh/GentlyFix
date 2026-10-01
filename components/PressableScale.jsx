import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import { haptic } from '../lib/motion';

// Pressable that springs down slightly while held, with an optional haptic tick on press.
export default function PressableScale({ children, style, containerStyle, scaleTo = 0.96, hapticOnPress = false, onPress, ...rest }) {
  const scale = useRef(new Animated.Value(1)).current;
  const spring = (to) => Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  return (
    <Pressable
      style={containerStyle}
      onPressIn={() => spring(scaleTo)}
      onPressOut={() => spring(1)}
      onPress={(e) => { if (hapticOnPress) haptic.tap(); onPress?.(e); }}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
