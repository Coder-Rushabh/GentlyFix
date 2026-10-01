import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { useTheme, spacing, radius } from '../theme';
import { CARD_HEIGHT } from './BusinessCard';

// Pulsing placeholder list shown while businesses load.
export default function SkeletonList({ count = 6 }) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <View>
      {Array.from({ length: count }, (_, i) => (
        <Animated.View key={i} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity }]}>
          <View style={[styles.circle, { backgroundColor: colors.border }]} />
          <View style={{ flex: 1 }}>
            <View style={[styles.line, { width: '60%', backgroundColor: colors.border }]} />
            <View style={[styles.line, { width: '85%', backgroundColor: colors.border, height: 10 }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  card: { height: CARD_HEIGHT, flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.sm },
  circle: { width: 48, height: 48, borderRadius: radius.pill, marginRight: spacing.md },
  line: { height: 14, borderRadius: 6, marginBottom: 8 },
});
