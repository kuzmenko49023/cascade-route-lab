import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { assets } from '../assets';
import { ROTATE_MS } from '../constants/config';
import { theme } from '../constants/theme';
import type { Cell, Dir } from '../game/types';

interface Props {
  cell: Cell;
  size: number;
  lit: boolean;
  broken: boolean;
  reducedMotion: boolean;
  onPress: (row: number, col: number) => void;
  row: number;
  col: number;
}

const HIT = { top: 4, bottom: 4, left: 4, right: 4 };

/** Ports of each kind at rotation 0; the artwork is spun, not re-drawn. */
const BASE: Record<Cell['kind'], Dir[]> = {
  STRAIGHT: ['N', 'S'],
  ELBOW: ['N', 'E'],
  CROSS: ['N', 'E', 'S', 'W'],
  PEG: [],
};

function armFor(dir: Dir, size: number, inset: number) {
  const half = size / 2;
  if (dir === 'N') {
    return { x1: half, y1: inset, x2: half, y2: half };
  }
  if (dir === 'S') {
    return { x1: half, y1: half, x2: half, y2: size - inset };
  }
  if (dir === 'E') {
    return { x1: half, y1: half, x2: size - inset, y2: half };
  }
  return { x1: inset, y1: half, x2: half, y2: half };
}

function RotorCellBase({ cell, size, lit, broken, reducedMotion, onPress, row, col }: Props) {
  const spin = useRef(new Animated.Value(cell.turns * 90)).current;
  useEffect(() => {
    Animated.timing(spin, {
      toValue: cell.turns * 90,
      duration: reducedMotion ? 90 : ROTATE_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [cell.turns, reducedMotion, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const arms = BASE[cell.kind];
  const inset = Math.max(3, Math.round(size * 0.06));
  const channel = lit ? theme.colors.secondary : theme.colors.channel;
  const stroke = Math.max(5, Math.round(size * 0.1));

  const handlePress = () => onPress(row, col);

  return (
    <Pressable
      style={[styles.press, { width: size, height: size }]}
      onPress={handlePress}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={'rotor ' + (row + 1) + ' ' + (col + 1)}>
      <View
        style={[
          styles.tile,
          { width: size - 4, height: size - 4 },
          lit ? styles.tileLit : null,
          broken ? styles.tileBroken : null,
        ]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.spinner, { width: size - 4, height: size - 4, transform: [{ rotate }] }]}>
          <Svg width={size - 4} height={size - 4}>
            {cell.kind === 'PEG' ? (
              <>
                <Circle
                  cx={(size - 4) / 2}
                  cy={(size - 4) / 2}
                  r={Math.max(6, size * 0.12)}
                  fill={theme.colors.peg}
                />
                <Circle
                  cx={(size - 4) / 2}
                  cy={(size - 4) / 2}
                  r={Math.max(6, size * 0.12)}
                  fill="none"
                  stroke={theme.colors.primary}
                  strokeWidth={1.5}
                />
              </>
            ) : null}
            {arms.map(dir => {
              const a = armFor(dir, size - 4, inset);
              return (
                <Line
                  key={'base-' + dir}
                  x1={a.x1}
                  y1={a.y1}
                  x2={a.x2}
                  y2={a.y2}
                  stroke={channel}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                />
              );
            })}
            {arms.map(dir => {
              const a = armFor(dir, size - 4, inset);
              return (
                <Line
                  key={'inner-' + dir}
                  x1={a.x1}
                  y1={a.y1}
                  x2={a.x2}
                  y2={a.y2}
                  stroke={lit ? '#FFFFFF' : 'rgba(0,245,255,0.25)'}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              );
            })}
          </Svg>
        </Animated.View>

        {cell.sealed ? (
          <Image
            source={assets.rivet}
            style={[styles.overlay, styles.rivet]}
            resizeMode="contain"
          />
        ) : null}
        {cell.spark ? (
          <Image
            source={assets.sparkCrystal}
            style={[styles.overlay, styles.spark]}
            resizeMode="contain"
          />
        ) : null}
      </View>
    </Pressable>
  );
}

export const RotorCell = memo(RotorCellBase, (a, b) => {
  return (
    a.cell.turns === b.cell.turns &&
    a.cell.kind === b.cell.kind &&
    a.cell.sealed === b.cell.sealed &&
    a.cell.spark === b.cell.spark &&
    a.lit === b.lit &&
    a.broken === b.broken &&
    a.size === b.size &&
    a.reducedMotion === b.reducedMotion
  );
});

const styles = StyleSheet.create({
  press: { alignItems: 'center', justifyContent: 'center' },
  tile: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  tileLit: { borderColor: 'rgba(0,245,255,0.45)', backgroundColor: 'rgba(0,245,255,0.07)' },
  tileBroken: { borderColor: theme.colors.primary, borderWidth: 2, backgroundColor: 'rgba(255,0,110,0.16)' },
  spinner: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  overlay: { position: 'absolute', opacity: 0.92, pointerEvents: 'none' },
  rivet: { width: 22, height: 22 },
  spark: { width: 20, height: 20 },
});
