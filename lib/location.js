import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MANUAL_KEY = 'location:manual';
const Ctx = createContext(null);

// Holds the location used for searches: either the device GPS ("Near me") or a city the user picked.
export function LocationProvider({ children }) {
  const [manual, setManual] = useState(null);
  const [gps, setGps] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ok | denied | error

  const resolveGps = useCallback(async () => {
    setStatus('loading');
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== 'granted') return setStatus('denied');
      // Last known fix is instant; fall back to a fresh balanced-accuracy fix.
      const pos =
        (await Location.getLastKnownPositionAsync()) ??
        (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
      setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    (async () => {
      let saved = null;
      try {
        const raw = await AsyncStorage.getItem(MANUAL_KEY);
        if (raw) saved = JSON.parse(raw);
      } catch {}
      if (saved) {
        setManual(saved);
        setStatus('ok');
      } else {
        resolveGps();
      }
    })();
  }, [resolveGps]);

  const chooseCity = useCallback(async (city) => {
    const m = { name: city.city, lat: city.lat, lng: city.lng };
    setManual(m);
    setStatus('ok');
    try { await AsyncStorage.setItem(MANUAL_KEY, JSON.stringify(m)); } catch {}
  }, []);

  const switchToGps = useCallback(async () => {
    setManual(null);
    try { await AsyncStorage.removeItem(MANUAL_KEY); } catch {}
    await resolveGps();
  }, [resolveGps]);

  const value = useMemo(() => ({
    mode: manual ? 'manual' : 'gps',
    label: manual ? manual.name : 'Near me',
    coords: manual ? { lat: manual.lat, lng: manual.lng } : gps,
    status: manual ? 'ok' : status,
    chooseCity,
    switchToGps,
    retry: resolveGps,
  }), [manual, gps, status, chooseCity, switchToGps, resolveGps]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useUserLocation = () => useContext(Ctx);
