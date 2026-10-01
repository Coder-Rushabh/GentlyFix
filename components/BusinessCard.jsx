import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import FadeInView from './FadeInView';
import { useTheme, spacing, radius } from '../theme';

const AVATAR_HUES = [190, 160, 210, 260, 20, 340, 40];
export const avatarColor = (name = '') => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return `hsl(${AVATAR_HUES[Math.abs(h) % AVATAR_HUES.length]}, 55%, 42%)`;
};
export const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?';

export const formatDistance = (m) => (m == null ? null : m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`);

function BusinessCard({ item, onPress, index = 99 }) {
  const { colors } = useTheme();
  const dist = formatDistance(item.distance_m);
  const rated = item.rating_count > 0;
  return (
    <FadeInView index={index}>
    <PressableScale
      onPress={() => onPress(item)}
      scaleTo={0.97}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor(item.name) }]}>
        <Text style={styles.avatarText}>{initials(item.name)}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        {!!item.address && <Text style={[styles.sub, { color: colors.textMuted }]} numberOfLines={1}>{item.address}</Text>}
        <View style={styles.metaRow}>
          <Ionicons name={rated ? 'star' : 'star-outline'} size={13} color={rated ? colors.star : colors.textMuted} />
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {rated ? `${item.rating_avg.toFixed(1)} (${item.rating_count})` : 'No ratings yet'}
          </Text>
          {!!dist && <><Text style={[styles.meta, { color: colors.textMuted }]}>·</Text>
            <Ionicons name="navigate-outline" size={13} color={colors.textMuted} />
            <Text style={[styles.meta, { color: colors.textMuted }]}>{dist}</Text></>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </PressableScale>
    </FadeInView>
  );
}

export default memo(BusinessCard);

export const CARD_HEIGHT = 76;
const styles = StyleSheet.create({
  card: { height: CARD_HEIGHT, flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.sm, overflow: 'hidden' },
  avatar: { width: 48, height: 48, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  body: { flex: 1, marginRight: spacing.sm },
  name: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 13, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  meta: { fontSize: 12 },
});
