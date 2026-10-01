import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BusinessCard from '../components/BusinessCard';
import EmptyState from '../components/EmptyState';
import { useFavorites } from '../lib/favorites';
import { useTheme, spacing } from '../theme';

const EMPTY = require('../assets/animations/empty-saved.json');

export default function SavedScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { items } = useFavorites();
  const open = useCallback((business) => navigation.navigate('BusinessDetails', { business }), [navigation]);

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.container}
      data={items}
      keyExtractor={(b) => b.id}
      renderItem={({ item, index }) => <BusinessCard item={item} onPress={open} index={index} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <EmptyState
            animation={EMPTY}
            size={190}
            title="Nothing saved yet"
            message="Tap the heart on a business to keep it here, even offline."
          />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg },
  empty: { marginTop: spacing.xl * 2 },
});
