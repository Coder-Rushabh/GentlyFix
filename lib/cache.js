import AsyncStorage from '@react-native-async-storage/async-storage';

const TTL_MS = 24 * 60 * 60 * 1000;
const key = (category, lat, lng) => `nearby:${category}:${lat.toFixed(2)}:${lng.toFixed(2)}`; // ~1 km grid

// Returns { data, fresh } or null. Stale entries are still returned so the UI can show them instantly.
export async function readCache(category, lat, lng) {
  try {
    const raw = await AsyncStorage.getItem(key(category, lat, lng));
    if (!raw) return null;
    const { t, data } = JSON.parse(raw);
    return { data, fresh: Date.now() - t < TTL_MS };
  } catch {
    return null;
  }
}

export async function writeCache(category, lat, lng, data) {
  try {
    await AsyncStorage.setItem(key(category, lat, lng), JSON.stringify({ t: Date.now(), data }));
  } catch {}
}
