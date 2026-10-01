import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fetchNearby, searchBusinesses } from '../lib/supabase';
import { readCache, writeCache } from '../lib/cache';
import { useUserLocation } from '../lib/location';
import { haptic } from '../lib/motion';
import BusinessCard, { CARD_HEIGHT } from '../components/BusinessCard';
import SkeletonList from '../components/Skeleton';
import FilterBar from '../components/FilterBar';
import BusinessMap from '../components/BusinessMap';
import EmptyState from '../components/EmptyState';
import Animation from '../components/Animation';
import FadeInView from '../components/FadeInView';
import { useTheme, spacing, radius } from '../theme';

const ROW = CARD_HEIGHT + spacing.sm;
const NO_FILTERS = { requirePhone: false, radiusM: null };
const ANIM = {
  loading: require('../assets/animations/loading.json'),
  empty: require('../assets/animations/empty.json'),
  offline: require('../assets/animations/offline.json'),
  location: require('../assets/animations/location.json'),
};

export default function CategoryScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { category, searchText } = useRoute().params;
  const { coords, status: locStatus, label, retry: retryLocation } = useUserLocation();
  const lat = coords?.lat;
  const lng = coords?.lng;

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null); // { kind: 'location' | 'network', message }
  const [filters, setFilters] = useState(NO_FILTERS);
  const [view, setView] = useState('list');
  const [selectedId, setSelectedId] = useState(null);
  const nearMe = !searchText;
  const requestId = useRef(0);
  const filtered = filters.requirePhone || filters.radiusM;

  const load = useCallback(async ({ pull = false } = {}) => {
    if (locStatus === 'loading') return; // wait for the location to resolve
    const id = ++requestId.current;
    const live = () => id === requestId.current;
    if (pull) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      if (searchText) {
        const rows = await searchBusinesses(searchText, lat, lng);
        if (live()) setBusinesses(rows);
        return;
      }
      if (lat == null) {
        if (live()) setError(locStatus === 'denied'
          ? { kind: 'location', message: 'Location permission is off. Choose a city instead, or enable location in Settings.' }
          : { kind: 'location', message: 'We could not determine your location. Choose a city or try again.' });
        return;
      }
      // Cache only the default (unfiltered) view; filtered views are cheap and should always be live.
      const cached = pull || filtered ? null : await readCache(category, lat, lng);
      if (cached && live()) {
        setBusinesses(cached.data);
        setLoading(false);
        if (cached.fresh) return;
      }
      const rows = await fetchNearby(lat, lng, category, filters);
      if (!live()) return;
      setBusinesses(rows);
      if (!filtered) writeCache(category, lat, lng, rows);
    } catch {
      if (live()) setError({ kind: 'network', message: 'Could not load businesses. Check your connection and try again.' });
    } finally {
      if (live()) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [category, searchText, lat, lng, locStatus, filters, filtered]);

  useEffect(() => { load(); }, [load]);

  useLayoutEffect(() => {
    if (!nearMe || !businesses.length) { navigation.setOptions({ headerRight: undefined }); return; }
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => { haptic.tap(); setSelectedId(null); setView((v) => (v === 'list' ? 'map' : 'list')); }} hitSlop={10} accessibilityLabel="Toggle map">
          <Ionicons name={view === 'list' ? 'map-outline' : 'list-outline'} size={24} color={colors.text} />
        </Pressable>
      ),
    });
  }, [navigation, nearMe, businesses.length, view, colors.text]);

  const openBusiness = useCallback((business) => navigation.navigate('BusinessDetails', { business }), [navigation]);
  const renderItem = useCallback(({ item, index }) => <BusinessCard item={item} onPress={openBusiness} index={index} />, [openBusiness]);
  const selected = businesses.find((b) => b.id === selectedId);

  const header = (
    <View style={styles.headerBlock}>
      <Text style={[styles.title, { color: colors.text }]}>
        {searchText ? `Results for “${searchText}”` : `${category} near you`}
      </Text>
      {nearMe && (
        <Pressable onPress={() => navigation.navigate('ChooseCity')} style={styles.locRow}>
          <Ionicons name="location" size={14} color={colors.primary} />
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{label} · Change</Text>
        </Pressable>
      )}
      {!loading && !error && businesses.length > 0 && (
        <Text style={[styles.count, { color: colors.textMuted }]}>{businesses.length} found</Text>
      )}
      {nearMe && <View style={{ height: spacing.md }} />}
      {nearMe && <FilterBar filters={filters} onChange={(f) => { haptic.tap(); setFilters(f); }} />}
    </View>
  );

  // Waiting for GPS / city: friendly "locating" animation.
  if (loading && locStatus === 'loading' && nearMe) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bg }]}>
        <Animation source={ANIM.loading} size={220} />
        <Text style={[styles.locating, { color: colors.textMuted }]}>Finding {category.toLowerCase()} near you…</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        {header}
        <SkeletonList />
      </View>
    );
  }

  if (view === 'map' && businesses.length && coords) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
          <FilterBar filters={filters} onChange={(f) => { haptic.tap(); setFilters(f); }} />
        </View>
        <BusinessMap businesses={businesses} center={coords} onSelect={(id) => { haptic.light(); setSelectedId(id); }} />
        {!!selected && (
          <FadeInView key={selected.id} from={40} duration={260} style={styles.mapCard}>
            <BusinessCard item={selected} onPress={openBusiness} />
          </FadeInView>
        )}
      </View>
    );
  }

  const emptyBlock = error ? (
    <EmptyState
      animation={error.kind === 'location' ? ANIM.location : ANIM.offline}
      title={error.kind === 'location' ? 'Where are you?' : 'You seem to be offline'}
      message={error.message}
    >
      <View style={styles.actions}>
        {nearMe && error.kind === 'location' && (
          <Pressable style={[styles.retry, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('ChooseCity')}>
            <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>Choose a city</Text>
          </Pressable>
        )}
        <Pressable style={[styles.retry, { borderWidth: 1.5, borderColor: colors.primary }]} onPress={() => (locStatus === 'ok' ? load() : retryLocation())}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Try again</Text>
        </Pressable>
      </View>
    </EmptyState>
  ) : (
    <EmptyState
      animation={ANIM.empty}
      title="Nothing here yet"
      message={nearMe
        ? (filtered ? 'No businesses match these filters. Try widening the distance.' : 'No businesses found within 100 km yet. We’re adding more every day.')
        : 'No businesses match that search.'}
    />
  );

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.container}
      data={businesses}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      getItemLayout={(_, index) => ({ length: ROW, offset: ROW * index, index })}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={7}
      removeClippedSubviews
      refreshing={refreshing}
      onRefresh={() => load({ pull: true })}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={header}
      ListEmptyComponent={<View style={styles.empty}>{emptyBlock}</View>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  locating: { fontSize: 15, marginTop: spacing.sm },
  headerBlock: { paddingTop: spacing.md },
  title: { fontSize: 22, fontWeight: '700' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, alignSelf: 'flex-start' },
  count: { fontSize: 13, marginTop: 2 },
  empty: { marginTop: spacing.xl },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  retry: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.pill },
  mapCard: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
});
