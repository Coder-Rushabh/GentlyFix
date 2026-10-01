import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCategories } from '../lib/categories';
import { submitSuggestion } from '../lib/supabase';
import { useUserLocation } from '../lib/location';
import SuccessState from '../components/SuccessState';
import { haptic } from '../lib/motion';
import { useTheme, spacing, radius } from '../theme';

export default function AddBusinessScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { coords, label } = useUserLocation();
  const { categories } = useCategories();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(null);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const phoneDigits = phone.replace(/\D/g, '');
  const phoneOk = !phone || (phoneDigits.length >= 7 && phoneDigits.length <= 15);
  const valid = name.trim().length >= 2 && category && phoneOk && coords;

  const send = async () => {
    setSending(true);
    try {
      await submitSuggestion({
        name: name.trim(), category, phone: phone.trim(), address: address.trim(),
        city: label === 'Near me' ? null : label, lat: coords.lat, lng: coords.lng,
      });
      haptic.success();
      setDone(true);
    } catch {
      Alert.alert('Could not send', 'Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return <SuccessState title="Thanks for adding it!" message="We’ll review this business and add it soon." onDone={() => navigation.goBack()} />;
  }

  const input = [styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }];

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={[styles.label, { color: colors.textMuted }]}>Business name</Text>
      <TextInput value={name} onChangeText={setName} maxLength={120} style={input} placeholderTextColor={colors.textMuted} />

      <Text style={[styles.label, { color: colors.textMuted }]}>Service type</Text>
      <View style={styles.chips}>
        {categories.map((c) => (
          <Pressable
            key={String(c.id)}
            onPress={() => setCategory(c.name)}
            style={[styles.chip, { backgroundColor: category === c.name ? colors.primary : colors.surface, borderColor: category === c.name ? colors.primary : colors.border }]}
          >
            <Text style={{ color: category === c.name ? colors.onPrimary : colors.text, fontSize: 13, fontWeight: '600' }}>{c.name}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.textMuted }]}>Phone (optional)</Text>
      <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={20} style={[...input, !phoneOk && { borderColor: colors.danger }]} placeholderTextColor={colors.textMuted} />

      <Text style={[styles.label, { color: colors.textMuted }]}>Address (optional)</Text>
      <TextInput value={address} onChangeText={setAddress} maxLength={300} style={input} placeholderTextColor={colors.textMuted} />

      <Text style={[styles.hint, { color: colors.textMuted }]}>
        {coords ? `The business will be placed at your selected location (${label}).` : 'Choose a city or allow location access first, so we know where this business is.'}
      </Text>

      <Pressable disabled={!valid || sending} onPress={send} style={[styles.submit, { backgroundColor: valid ? colors.primary : colors.border }]}>
        {sending ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={{ color: valid ? colors.onPrimary : colors.textMuted, fontWeight: '700', fontSize: 16 }}>Submit business</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  label: { fontSize: 13, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.sm },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1 },
  hint: { fontSize: 12, marginTop: spacing.lg, lineHeight: 18 },
  submit: { height: 50, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl },
});
