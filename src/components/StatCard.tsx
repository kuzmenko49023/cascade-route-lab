import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Zap } from 'lucide-react-native';
import { theme } from '../constants/theme';

interface Props {
  /** undefined means there is nothing to show: the card renders null */
  value?: string;
  label: string;
  accent: string;
}

/**
 * One shape, one icon, three colours. Every pill in a row is the same width,
 * height, padding and radius, so covering the icons leaves them identical.
 * A card with no value renders nothing at all rather than an empty box.
 */
export function StatCard({ value, label, accent }: Props) {
  if (value === undefined || value === '') {
    return null;
  }
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: accent + '22', borderColor: accent + '55' }]}>
        <Zap size={24} color={accent} />
      </View>
      <Text numberOfLines={1} style={[styles.value, { color: accent }]}>
        {value}
      </Text>
      <Text numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

/** Keeps the "fewer than two visible cards means no row" rule in one place. */
export function visibleCardCount(values: Array<string | undefined>): number {
  return values.filter(v => v !== undefined && v !== '').length;
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderCyan,
    backgroundColor: theme.colors.glass,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontVariant: ['tabular-nums'],
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.4,
    marginTop: 4,
    textAlign: 'center',
  },
});
