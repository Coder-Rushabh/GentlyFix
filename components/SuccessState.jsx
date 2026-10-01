import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animation from './Animation';
import { useTheme, spacing, radius } from '../theme';

const CHECK = require('../assets/animations/success.json');

// Full-screen "it worked" state: animated check, message, and a Done button.
export default function SuccessState({ title, message, onDone }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
      <Animation source={CHECK} size={200} loop={false} />
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
      <Pressable onPress={onDone} style={[styles.button, { backgroundColor: colors.primary }]}>
        <Text style={{ color: colors.onPrimary, fontWeight: '700', fontSize: 16 }}>Done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  message: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  button: { marginTop: spacing.lg, paddingHorizontal: spacing.xl * 2, height: 50, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
