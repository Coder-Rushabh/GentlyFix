import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animation from './Animation';
import { useTheme, spacing, radius } from '../theme';

// Animated illustration + message (+ optional action buttons as children).
export default function EmptyState({ animation, title, message, children, size = 150 }) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <Animation source={animation} size={size} />
      {!!title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
      {!!message && <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: spacing.xl, gap: spacing.sm },
  title: { marginTop: spacing.sm, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  message: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
