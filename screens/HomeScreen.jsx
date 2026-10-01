import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, StyleSheet, useWindowDimensions, Keyboard, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, spacing, radius } from '../theme';
import PressableScale from '../components/PressableScale';
import FadeInView from '../components/FadeInView';
import { useCategories } from '../lib/categories';
import { categoryIconUrl } from '../lib/supabase';
import { useUserLocation } from '../lib/location';


const COLUMNS = 4;
const GAP = spacing.sm;
const TILE_HEIGHT = 104;

const CategoryTile = React.memo(function CategoryTile({ item, width, onPress, index }) {
  const { colors } = useTheme();
  return (
    <FadeInView index={index}>
    <PressableScale
      onPress={() => onPress(item.name)}
      hapticOnPress
      style={[styles.tile, { width, backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.tint }]}>
        <Image source={{ uri: categoryIconUrl(item.icon) }} style={styles.icon} contentFit="contain" cachePolicy="disk" transition={150} />
      </View>
      <Text style={[styles.tileLabel, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
    </PressableScale>
    </FadeInView>
  );
});

export default function HomeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { label, status, mode, retry: retryLocation } = useUserLocation();
  const { categories, loading: catLoading, refreshing, error: catError, reload, refresh } = useCategories();
  const { width: screenWidth } = useWindowDimensions();
  const [searchText, setSearchText] = useState('');

  const tileWidth = Math.floor((screenWidth - spacing.lg * 2 - GAP * (COLUMNS - 1)) / COLUMNS);
  const query = searchText.trim().toLowerCase();
  const data = useMemo(
    () => (query ? categories.filter((c) => c.name.toLowerCase().includes(query)) : categories),
    [query, categories]
  );

  const openCategory = useCallback((name) => {
    Keyboard.dismiss();
    navigation.navigate('Category', { category: name });
  }, [navigation]);

  const searchByName = () => {
    Keyboard.dismiss();
    navigation.navigate('Category', { category: searchText.trim(), searchText: searchText.trim() });
  };

  const handleSubmit = () => {
    if (!query) return;
    if (data.length === 1) openCategory(data[0].name);
    else if (data.length === 0) searchByName();
  };

  // Pull-down: reload services, and retry the GPS fix if it had failed.
  const onRefresh = useCallback(async () => {
    if (mode === 'gps' && status !== 'ok') retryLocation();
    await refresh();
  }, [mode, status, retryLocation, refresh]);

  const renderItem = useCallback(
    ({ item, index }) => <CategoryTile item={item} width={tileWidth} onPress={openCategory} index={index} />,
    [tileWidth, openCategory]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.brand, { color: colors.text }]}>
            Gently<Text style={{ color: colors.primary }}>Fix</Text>
          </Text>
          <Pressable onPress={() => navigation.navigate('Saved')} hitSlop={10} accessibilityLabel="Saved businesses">
            <Ionicons name="heart-outline" size={26} color={colors.text} />
          </Pressable>
        </View>
        <Pressable onPress={() => navigation.navigate('ChooseCity')} style={styles.locChip}>
          <Ionicons name="location" size={14} color={colors.primary} />
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>
            {status === 'denied' && label === 'Near me' ? 'Choose a location' : label}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          placeholder="Search a service or business"
          placeholderTextColor={colors.textMuted}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          style={[styles.searchInput, { color: colors.text }]}
        />
        {!!searchText && (
          <Pressable onPress={() => setSearchText('')} hitSlop={10}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        numColumns={COLUMNS}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshing={refreshing}
        onRefresh={onRefresh}
        initialNumToRender={16}
        windowSize={5}
        ListFooterComponent={
          <Pressable style={[styles.nameSearch, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.navigate('AddBusiness')}>
            <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
            <Text style={{ color: colors.text, flex: 1 }}>Can’t find a business? Add it</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        }
        ListHeaderComponent={!query ? <Text style={[styles.section, { color: colors.text }]}>Browse services</Text> : null}
        ListEmptyComponent={
          catLoading ? (
            <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
          ) : catError ? (
            <Pressable style={[styles.nameSearch, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={reload}>
              <Ionicons name="cloud-offline-outline" size={22} color={colors.primary} />
              <Text style={{ color: colors.text, flex: 1 }}>Could not load services. Tap to retry.</Text>
            </Pressable>
          ) : !query ? (
            <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: spacing.xl }}>No services available yet.</Text>
            ) : (
            <Pressable style={[styles.nameSearch, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={searchByName}>
              <Ionicons name="business-outline" size={22} color={colors.primary} />
              <Text style={{ color: colors.text, flex: 1 }}>Search businesses named “{searchText.trim()}”</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
  brand: { fontSize: 34, fontFamily: 'serif', fontWeight: '600', letterSpacing: -0.5 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  locChip: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: 4 },
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.lg, paddingHorizontal: spacing.md, height: 48, borderRadius: radius.pill, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  grid: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  section: { fontSize: 18, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.md },
  tile: { height: TILE_HEIGHT, marginBottom: GAP, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', paddingTop: spacing.sm, paddingHorizontal: 4, overflow: 'hidden' },
  iconWrap: { width: 52, height: 52, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 34, height: 34, resizeMode: 'contain' },
  tileLabel: { fontSize: 11.5, fontWeight: '500', textAlign: 'center', marginTop: 6 },
  nameSearch: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, marginTop: spacing.lg },
});
