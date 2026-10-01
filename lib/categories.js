import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { fetchCategories, categoryIconUrl } from './supabase';

const KEY = 'categories:v2';
const TTL_MS = 24 * 60 * 60 * 1000;
let memory = null; // { t, data } - survives screen changes within a session

// Categories come from the Supabase `categories` table (icons from Storage).
// A copy is cached on the device: fresh copies skip the network, stale ones show instantly and refresh behind.
// Icons are prefetched into expo-image's disk cache so the grid renders offline.
export function useCategories() {
  const [items, setItems] = useState(memory?.data ?? []);
  const [loading, setLoading] = useState(!memory);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async ({ force = false } = {}) => {
    setError(false);
    if (!memory) {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) { memory = JSON.parse(raw); setItems(memory.data); setLoading(false); }
      } catch {}
    }
    if (!force && memory && Date.now() - memory.t < TTL_MS) { setLoading(false); return; }
    try {
      const fresh = await fetchCategories();
      if (fresh.length) {
        memory = { t: Date.now(), data: fresh };
        setItems(fresh);
        AsyncStorage.setItem(KEY, JSON.stringify(memory)).catch(() => {});
        Image.prefetch(fresh.map((c) => categoryIconUrl(c.icon)).filter(Boolean), 'disk').catch(() => {});
      }
    } catch {
      if (!memory) setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load({ force: true });
    setRefreshing(false);
  }, [load]);

  useEffect(() => { load(); }, [load]);
  return { categories: items, loading, refreshing, error, reload: load, refresh };
}
