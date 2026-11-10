import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { POCKET_LETTERS } from '../constants/config';
import { theme } from '../constants/theme';
import { outcomeTitle } from '../game/scoring';
import type { CellRef, Outcome } from '../game/types';
import { formatMultiplier } from '../utils/format';

interface Props {
  outcome: Outcome;
  pocket: number | null;
  multiplier: number;
  breakCell: CellRef | null;
  reducedMotion: boolean;
}

function accentFor(outcome: Outcome): string {
  if (outcome === 'win') {
    return theme.colors.secondary;
  }
  if (outcome === 'partial') {
    return theme.colors.spark;
  }
  return theme.colors.primary;
}

/**
 * The outcome in the rig's own words. The bracket frame is drawn outside the
 * text box so no rule ever crosses a letter.
 */
export function ResultBanner({ outcome, pocket, multiplier, breakCell, reducedMotion }: Props) {
  const rise = useRef(new Animated.Value(reducedMotion ? 0 : 26)).current;
  const fade = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const accent = accentFor(outcome);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(rise, {
        toValue: 0,
        tension: theme.spring.panel.tension,
        friction: theme.spring.panel.friction,
        useNativeDriver: true,
      }),
      Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [fade, rise]);

  const subline =
    outcome === 'break' && breakCell
      ? 'CHANNEL BROKE AT R' + (breakCell.row + 1) + 'C' + (breakCell.col + 1)
      : 'POCKET ' + (pocket !== null ? POCKET_LETTERS[pocket] : '-') + ' · x' + formatMultiplier(multiplier);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.root, { opacity: fade, transform: [{ translateY: rise }] }]}>
      <View style={[styles.frame, { borderColor: accent + '66' }]}>
        <Text style={[styles.title, { color: accent }]}>{outcomeTitle(outcome)}</Text>
      </View>
      <Text style={styles.subline}>{subline}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center' },
  frame: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: 22,
    paddingVertical: 12,
    backgroundColor: 'rgba(10,10,15,0.45)',
  },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: 3, textAlign: 'center' },
  subline: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 10,
    textAlign: 'center',
  },
});
