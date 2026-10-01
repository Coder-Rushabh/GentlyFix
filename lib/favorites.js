import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'favorites:v1';
const Ctx = createContext(null);

// Saved businesses live on the device (no account needed yet). Whole records are stored so the list works offline.
export function FavoritesProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => { if (raw) setItems(JSON.parse(raw)); }).catch(() => {});
  }, []);

  const toggle = useCallback((business) => {
    setItems((prev) => {
      const next = prev.some((b) => b.id === business.id)
        ? prev.filter((b) => b.id !== business.id)
        : [{ ...business, distance_m: undefined }, ...prev];
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(() => ({ items, toggle, isFav: (id) => items.some((b) => b.id === id) }), [items, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useFavorites = () => useContext(Ctx);
