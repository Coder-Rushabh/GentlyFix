import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Public (anon) key only - safe in the app because tables are read-only via RLS.
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

const RADII_M = [10000, 30000, 100000];
const ENOUGH = 10;

// Nearby businesses in a category. With an explicit radius, searches only that far;
// otherwise widens the radius until there are enough results.
export async function fetchNearby(lat, lng, category, { radiusM = null, requirePhone = false } = {}) {
  const radii = radiusM ? [radiusM] : RADII_M;
  let rows = [];
  for (const radius of radii) {
    const { data, error } = await supabase.rpc('nearby_businesses', {
      p_lat: lat, p_lng: lng, p_category: category, p_radius_m: radius, p_limit: 50, p_require_phone: requirePhone,
    });
    if (error) throw error;
    rows = data;
    if (rows.length >= ENOUGH) break;
  }
  return rows;
}

// Typo-tolerant name search (pg_trgm), nearest first among equally good matches when coordinates are known.
export async function searchBusinesses(text, lat = null, lng = null) {
  const { data, error } = await supabase.rpc('search_businesses', {
    p_query: text.trim(), p_lat: lat, p_lng: lng, p_limit: 50,
  });
  if (error) throw error;
  return data;
}

const CITIES_KEY = 'cities:v1';
const CITIES_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function fetchCities() {
  try {
    const raw = await AsyncStorage.getItem(CITIES_KEY);
    if (raw) {
      const { t, data } = JSON.parse(raw);
      if (Date.now() - t < CITIES_TTL_MS) return data;
    }
  } catch {}
  const { data, error } = await supabase.rpc('list_cities');
  if (error) throw error;
  AsyncStorage.setItem(CITIES_KEY, JSON.stringify({ t: Date.now(), data })).catch(() => {});
  return data;
}

export async function submitReport({ businessId, kind, message, suggestedValue }) {
  const { error } = await supabase.from('business_reports').insert({
    business_id: businessId, kind, message: message || null, suggested_value: suggestedValue || null,
  });
  if (error) throw error;
}

export async function submitSuggestion({ name, category, phone, address, city, lat, lng }) {
  const { error } = await supabase.from('business_suggestions').insert({
    name, category, phone: phone || null, address: address || null, city: city || null, lat, lng,
  });
  if (error) throw error;
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id,name,icon,sort_order')
    .order('sort_order');
  if (error) throw error;
  return data;
}

// Public Storage URL for a category icon.
export const categoryIconUrl = (icon) =>
  icon ? `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-icons/${icon}` : null;
