import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, radius } from '../theme';

export const DISTANCES = [
  { label: 'Any distance', value: null },
  { label: '≤ 5 km', value: 5000 },
  { label: '≤ 10 km', value: 10000 },
  { label: '≤ 25 km', value: 25000 },
];

function Chip({ label, active, onPress, icon }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { backgroundColor: active ? colors.primary : colors.surface, borderColor: active ? colors.primary : colors.border }]}
    >
      {!!icon && <Ionicons name={icon} size={14} color={active ? colors.onPrimary : colors.textMuted} />}
      <Text style={{ color: active ? colors.onPrimary : colors.text, fontSize: 13, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export default function FilterBar({ filters, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Chip
        icon="call-outline"
        label="Has phone"
        active={filters.requirePhone}
        onPress={() => onChange({ ...filters, requirePhone: !filters.requirePhone })}
      />
      {DISTANCES.map((d) => (
        <Chip key={d.label} label={d.label} active={filters.radiusM === d.value} onPress={() => onChange({ ...filters, radiusM: d.value })} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingBottom: spacing.md },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.md, height: 34, borderRadius: radius.pill, borderWidth: 1 },
});
