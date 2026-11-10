import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

export type LevelStatus = 'locked' | 'current' | 'cleared' | 'perfect';

interface Props {
  index: number;
  status: LevelStatus;
  selected: boolean;
  onPress: (index: number) => void;
}

const HIT = { top: 6, bottom: 6, left: 6, right: 6 };

/** One campaign route chip. Locked chips are inert and say so on tap. */
export function LevelCard({ index, status, selected, onPress }: Props) {
  const press = usePressScale(0.92);
  const handlePress = () => onPress(index);

  const shellStyle =
    status === 'perfect'
      ? styles.perfect
      : status === 'cleared'
      ? styles.cleared
      : status === 'current'
      ? styles.current
      : styles.locked;

  const textStyle =
    status === 'perfect'
      ? styles.textPerfect
      : status === 'locked'
      ? styles.textLocked
      : styles.textOn;

  return (
    <Pressable
      style={styles.press}
      onPress={handlePress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={'route ' + index}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.shell,
          shellStyle,
          selected ? styles.selected : null,
          { transform: [{ scale: press.scale }] },
        ]}>
        <Text style={[styles.number, textStyle]}>{index}</Text>
        {status === 'cleared' || status === 'perfect' ? (
          <Text style={[styles.star, textStyle]}>{'★'}</Text>
        ) : null}
        {status === 'locked' ? <View pointerEvents="none" style={styles.bracket} /> : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: 48, height: 48 },
  shell: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locked: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.10)' },
  current: { backgroundColor: 'rgba(255,0,110,0.18)', borderColor: theme.colors.primary },
  cleared: { backgroundColor: 'rgba(0,245,255,0.10)', borderColor: theme.colors.borderCyanStrong },
  perfect: { backgroundColor: 'rgba(255,200,87,0.20)', borderColor: theme.colors.spark },
  selected: { borderWidth: 2 },
  number: { fontSize: 15, fontWeight: '800', fontVariant: ['tabular-nums'] },
  textOn: { color: theme.colors.text },
  textPerfect: { color: theme.colors.spark },
  textLocked: { color: theme.colors.textMuted },
  star: { fontSize: 9, marginTop: 1 },
  bracket: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 10,
    height: 10,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
});
