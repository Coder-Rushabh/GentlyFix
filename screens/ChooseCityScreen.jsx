import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fetchCities } from '../lib/supabase';
import { useUserLocation } from '../lib/location';
import { useTheme, spacing, radius } from '../theme';

export default function ChooseCityScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { mode, label, chooseCity, switchToGps } = useUserLocation();
  const [cities, setCities] = useState(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchCities().then(setCities).catch(() => setError(true));
  }, []);

  const filtered = useMemo(() => {
    if (!cities) return [];
    const q = query.trim().toLowerCase();
    return q ? cities.filter((c) => c.city.toLowerCase().includes(q) || (c.state ?? '').toLowerCase().includes(q)) : cities;
  }, [cities, query]);

  const pick = async (city) => { await chooseCity(city); navigation.goBack(); };
  const useGps = async () => { navigation.goBack(); await switchToGps(); };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Pressable onPress={useGps} style={[styles.row, { backgroundColor: colors.surface, borderColor: mode === 'gps' ? colors.primary : colors.border }]}>
        <Ionicons name="locate" size={22} color={colors.primary} />
        <Text style={[styles.rowText, { color: colors.text }]}>Use my current location</Text>
        {mode === 'gps' && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
      </Pressable>

      <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          placeholder="Search a city"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          style={[styles.input, { color: colors.text }]}
        />
      </View>

      {!cities && !error && <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />}
      {error && <Text style={[styles.note, { color: colors.textMuted }]}>Could not load cities. Check your connection.</Text>}

      <FlatList
        data={filtered}
        keyExtractor={(c) => `${c.city}|${c.state}`}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable onPress={() => pick(item)} style={[styles.city, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cityName, { color: colors.text }]}>{item.city}</Text>
              {!!item.state && <Text style={{ color: colors.textMuted, fontSize: 13 }}>{item.state}</Text>}
            </View>
            {mode === 'manual' && label === item.city && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>{item.n} listings</Text>
          </Pressable>
        )}
        ListEmptyComponent={cities ? <Text style={[styles.note, { color: colors.textMuted }]}>No cities match “{query}”.</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.md, borderWidth: 1.5, marginBottom: spacing.md },
  rowText: { flex: 1, fontSize: 16, fontWeight: '600' },
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, height: 44, borderRadius: radius.pill, borderWidth: 1, marginBottom: spacing.sm },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  city: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  cityName: { fontSize: 16, fontWeight: '500' },
  note: { textAlign: 'center', marginTop: spacing.xl },
});
