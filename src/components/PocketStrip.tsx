import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { BOARD_FRAME, COLS, POCKET_LETTERS } from '../constants/config';
import { theme } from '../constants/theme';
import { pocketMultiplier } from '../game/scoring';
import { formatMultiplier } from '../utils/format';

interface Props {
  targetCol: number;
  tile: number;
  width: number;
  highContrast: boolean;
  landedCol: number | null;
}

const CHUTE_H = 26;

/** The Plinko payout row: five chutes, letters and multipliers, target marked. */
export function PocketStrip({ targetCol, tile, width, highContrast, landedCol }: Props) {
  return (
    <View style={[styles.strip, { width }]}>
      {Array.from({ length: COLS }).map((_, col) => {
        const isTarget = col === targetCol;
        const isLanded = landedCol === col;
        const mult = pocketMultiplier(col, targetCol);
        const fill = isTarget ? 'rgba(255,0,110,0.35)' : 'rgba(255,255,255,0.05)';
        const edge = isTarget ? theme.colors.secondary : 'rgba(255,255,255,0.12)';
        return (
          <View key={'pocket-' + col} style={[styles.pocket, { width: tile }]}>
            <Svg width={tile} height={CHUTE_H}>
              <Polygon
                points={
                  '2,0 ' + (tile - 2) + ',0 ' + (tile - 10) + ',' + CHUTE_H + ' 10,' + CHUTE_H
                }
                fill={isLanded ? 'rgba(0,245,255,0.45)' : fill}
                stroke={edge}
                strokeWidth={isTarget && highContrast ? 3 : isTarget ? 2 : 1}
              />
            </Svg>
            <Text style={[styles.letter, isTarget ? styles.letterTarget : null]}>
              {POCKET_LETTERS[col]}
            </Text>
            <Text style={[styles.mult, isTarget ? styles.multTarget : null]}>
              x{formatMultiplier(mult)}
            </Text>
            {isTarget && highContrast ? <Text style={styles.tag}>TARGET</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    height: 58,
    flexDirection: 'row',
    paddingHorizontal: BOARD_FRAME,
    alignItems: 'flex-start',
  },
  pocket: { alignItems: 'center' },
  letter: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  letterTarget: { color: theme.colors.secondary },
  mult: {
    color: theme.colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  multTarget: { color: theme.colors.spark },
  tag: { color: theme.colors.secondary, fontSize: 7, fontWeight: '800', letterSpacing: 1 },
});
