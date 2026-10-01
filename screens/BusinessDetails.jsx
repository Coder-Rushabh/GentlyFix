import React, { useLayoutEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Linking, ScrollView, Alert, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { avatarColor, initials, formatDistance } from '../components/BusinessCard';
import PressableScale from '../components/PressableScale';
import FadeInView from '../components/FadeInView';
import Animation from '../components/Animation';
import { useFavorites } from '../lib/favorites';
import { haptic } from '../lib/motion';
import { useTheme, spacing, radius } from '../theme';

const HEART_BURST = require('../assets/animations/heart.json');

function InfoRow({ icon, text, onPress, colors, link }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: colors.tint }]}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={[styles.infoText, { color: link ? colors.primary : colors.text }]} selectable={!onPress}>{text}</Text>
    </Pressable>
  );
}

export default function BusinessDetails({ route }) {
  const { business } = route.params;
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { isFav, toggle } = useFavorites();
  const saved = isFav(business.id);
  const heartScale = useRef(new Animated.Value(1)).current;
  const [burst, setBurst] = useState(0); // >0 while the floating-heart animation plays

  const onToggleSave = () => {
    haptic.light();
    if (!saved) {
      setBurst((n) => n + 1);
      Animated.sequence([
        Animated.timing(heartScale, { toValue: 1.4, duration: 110, useNativeDriver: true }),
        Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 12 }),
      ]).start();
    }
    toggle(business);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={onToggleSave} hitSlop={10} accessibilityLabel={saved ? 'Remove from saved' : 'Save business'}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons name={saved ? 'heart' : 'heart-outline'} size={26} color={saved ? colors.danger : colors.text} />
          </Animated.View>
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, saved, business, colors]);

  const phone = (business.phone ?? '').replace(/[^0-9+]/g, '');
  const rated = business.rating_count > 0;
  const dist = formatDistance(business.distance_m);

  const open = (url, failMsg) => Linking.openURL(url).catch(() => Alert.alert('Unable to open', failMsg));
  const directionsUrl = Platform.select({
    ios: `http://maps.apple.com/?daddr=${business.lat},${business.lng}`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`,
  });
  const website = business.website
    ? (/^https?:\/\//i.test(business.website) ? business.website : `http://${business.website}`)
    : null;
  const address = [business.address, business.city].filter(Boolean).join(', ');

  return (
    <SafeAreaView edges={['bottom']} style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInView index={0}>
          <View style={styles.top}>
            <View style={[styles.avatar, { backgroundColor: avatarColor(business.name) }]}>
              <Text style={styles.avatarText}>{initials(business.name)}</Text>
            </View>
            <Text style={[styles.name, { color: colors.text }]}>{business.name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name={rated ? 'star' : 'star-outline'} size={16} color={rated ? colors.star : colors.textMuted} />
              <Text style={{ color: colors.textMuted }}>
                {rated ? `${business.rating_avg.toFixed(1)} · ${business.rating_count} reviews` : 'No ratings yet'}
                {dist ? `  ·  ${dist} away` : ''}
              </Text>
            </View>
            {business.status === 'unclaimed' && (
              <View style={[styles.badge, { backgroundColor: colors.tint }]}>
                <Ionicons name="information-circle-outline" size={14} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Listing not yet claimed by the owner</Text>
              </View>
            )}
          </View>
        </FadeInView>

        <FadeInView index={1}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {!!address && <InfoRow icon="location-outline" text={address} colors={colors} />}
            {!!business.phone && <InfoRow icon="call-outline" text={business.phone} colors={colors} />}
            {!!website && (
              <InfoRow icon="globe-outline" text={business.website} link colors={colors} onPress={() => open(website, 'Could not open the website.')} />
            )}
            <InfoRow icon="navigate-outline" text="Get directions" link colors={colors} onPress={() => open(directionsUrl, 'Could not open maps.')} />
            <InfoRow icon="flag-outline" text="Report a problem with this listing" link colors={colors} onPress={() => navigation.navigate('Report', { business })} />
          </View>
        </FadeInView>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.bg, borderTopColor: colors.border }]}>
        <PressableScale
          disabled={!phone}
          hapticOnPress
          containerStyle={styles.flex}
          onPress={() => open(`tel:${phone}`, 'Could not start the call.')}
          style={[styles.button, { backgroundColor: phone ? colors.primary : colors.border }]}
        >
          <Ionicons name="call" size={18} color={phone ? colors.onPrimary : colors.textMuted} />
          <Text style={[styles.buttonText, { color: phone ? colors.onPrimary : colors.textMuted }]}>Call</Text>
        </PressableScale>
        <PressableScale
          disabled={!phone}
          hapticOnPress
          containerStyle={styles.flex}
          onPress={() => open(`sms:${phone}`, 'Could not open messages.')}
          style={[styles.button, styles.outline, { borderColor: phone ? colors.primary : colors.border }]}
        >
          <Ionicons name="chatbubble-outline" size={18} color={phone ? colors.primary : colors.textMuted} />
          <Text style={[styles.buttonText, { color: phone ? colors.primary : colors.textMuted }]}>Message</Text>
        </PressableScale>
      </View>

      {burst > 0 && (
        <View pointerEvents="none" style={styles.burst}>
          <Animation key={burst} source={HEART_BURST} size={220} loop={false} onFinish={() => setBurst(0)} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: spacing.lg },
  top: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: { width: 88, height: 88, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.pill },
  card: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md, gap: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoIcon: { width: 36, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  infoText: { flex: 1, fontSize: 15 },
  footer: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth },
  button: { height: 50, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  outline: { borderWidth: 1.5, backgroundColor: 'transparent' },
  buttonText: { fontSize: 16, fontWeight: '700' },
  burst: { position: 'absolute', top: 0, right: -40, width: 220, height: 220 },
});
