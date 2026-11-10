import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

interface Props {
  streak: number;
  days: boolean[];
}

const LABELS = ['6D', '5D', '4D', '3D', '2D', '1D', 'NOW'];

/** Seven calendar days ending today. The star marks today, not a decoration. */
export function StreakRibbon({ streak, days }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.head}>
        <Text style={styles.label}>CURRENT STREAK</Text>
        <Text style={styles.value}>{streak}</Text>
      </View>
      <View style={styles.dots}>
        {days.map((filled, i) => {
          const today = i === days.length - 1;
          return (
            <View key={'day-' + i} style={styles.dayCol}>
              <View
                style={[
                  styles.dot,
                  filled ? styles.dotFilled : styles.dotEmpty,
                  today ? styles.dotToday : null,
                ]}>
                {today ? <Text style={styles.star}>{'★'}</Text> : null}
              </View>
              <Text style={styles.dayLabel}>{LABELS[i]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  value: {
    color: theme.colors.spark,
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  dots: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  dayCol: { alignItems: 'center' },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dotEmpty: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)' },
  dotFilled: { backgroundColor: 'rgba(0,245,255,0.18)', borderColor: theme.colors.secondary },
  dotToday: { borderColor: theme.colors.spark },
  star: { color: theme.colors.spark, fontSize: 11 },
  dayLabel: { color: theme.colors.textMuted, fontSize: 8, fontWeight: '700', marginTop: 5 },
});
