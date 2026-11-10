import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

interface Props {
  left: number;
  budget: number;
  warning: boolean;
}

const LOW_WATER = 3;

/** Segmented rotation budget. Below three remaining the bar turns magenta. */
export function MoveMeter({ left, budget, warning }: Props) {
  const low = left <= LOW_WATER;
  const segments = Math.max(1, budget);
  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <Text style={styles.label}>ROTATIONS</Text>
        <Text style={[styles.counter, low ? styles.counterLow : null]}>
          {left}/{budget}
        </Text>
      </View>
      <View style={styles.bar}>
        {Array.from({ length: segments }).map((_, i) => {
          const spent = i >= left;
          return (
            <View
              key={'seg-' + i}
              style={[
                styles.segment,
                spent ? styles.segmentSpent : low || warning ? styles.segmentLow : styles.segmentOk,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: theme.colors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 2 },
  counter: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  counterLow: { color: theme.colors.primary },
  bar: { flexDirection: 'row', gap: 3, marginTop: 6 },
  segment: { flex: 1, height: 5, borderRadius: 2 },
  segmentSpent: { backgroundColor: 'rgba(255,255,255,0.10)' },
  segmentOk: { backgroundColor: theme.colors.secondary },
  segmentLow: { backgroundColor: theme.colors.primary },
});
