import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { submitReport } from '../lib/supabase';
import SuccessState from '../components/SuccessState';
import { haptic } from '../lib/motion';
import { useTheme, spacing, radius } from '../theme';

const KINDS = [
  { key: 'wrong_phone', label: 'Wrong phone number', ask: 'Correct phone number' },
  { key: 'wrong_address', label: 'Wrong address', ask: 'Correct address' },
  { key: 'wrong_location', label: 'Wrong location on map' },
  { key: 'closed', label: 'Closed or no longer exists' },
  { key: 'wrong_category', label: 'Wrong service type', ask: 'What do they actually do?' },
  { key: 'other', label: 'Something else' },
];

export default function ReportScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { business } = useRoute().params;
  const [kind, setKind] = useState(null);
  const [suggested, setSuggested] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const selected = KINDS.find((k) => k.key === kind);

  const send = async () => {
    setSending(true);
    try {
      await submitReport({ businessId: business.id, kind, message: message.trim(), suggestedValue: suggested.trim() });
      haptic.success();
      setDone(true);
    } catch {
      Alert.alert('Could not send', 'Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return <SuccessState title="Thank you!" message="Your report helps keep GentlyFix accurate." onDone={() => navigation.goBack()} />;
  }

  const input = [styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }];

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={[styles.title, { color: colors.text }]}>{business.name}</Text>
      <Text style={[styles.label, { color: colors.textMuted }]}>What’s wrong?</Text>
      <View style={styles.kinds}>
        {KINDS.map((k) => (
          <Pressable
            key={k.key}
            onPress={() => setKind(k.key)}
            style={[styles.kind, { backgroundColor: kind === k.key ? colors.primary : colors.surface, borderColor: kind === k.key ? colors.primary : colors.border }]}
          >
            <Text style={{ color: kind === k.key ? colors.onPrimary : colors.text, fontWeight: '600' }}>{k.label}</Text>
          </Pressable>
        ))}
      </View>

      {!!selected?.ask && (
        <>
          <Text style={[styles.label, { color: colors.textMuted }]}>{selected.ask}</Text>
          <TextInput value={suggested} onChangeText={setSuggested} maxLength={300} style={input} placeholderTextColor={colors.textMuted} />
        </>
      )}

      <Text style={[styles.label, { color: colors.textMuted }]}>Details (optional)</Text>
      <TextInput value={message} onChangeText={setMessage} maxLength={1000} multiline style={[...input, { height: 100, textAlignVertical: 'top' }]} placeholderTextColor={colors.textMuted} />

      <Pressable
        disabled={!kind || sending}
        onPress={send}
        style={[styles.submit, { backgroundColor: kind ? colors.primary : colors.border }]}
      >
        {sending ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={{ color: kind ? colors.onPrimary : colors.textMuted, fontWeight: '700', fontSize: 16 }}>Send report</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.sm },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  kind: { paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15 },
  submit: { height: 50, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl },
});
