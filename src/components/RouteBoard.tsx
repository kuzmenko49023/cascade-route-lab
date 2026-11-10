import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { BOARD_FRAME, COLS, ROWS } from '../constants/config';
import { theme } from '../constants/theme';
import type { Board, CellRef } from '../game/types';
import { HudFrame } from './HudFrame';
import { RotorCell } from './RotorCell';

interface Props {
  board: Board;
  tile: number;
  litCells: Set<string>;
  breakCell: CellRef | null;
  reducedMotion: boolean;
  shake: Animated.Value;
  onRotate: (row: number, col: number) => void;
  children?: React.ReactNode;
}

const SCANLINE_STEP = 10;

/** The rig: a fixed grid of rotors inside a bracketed HUD frame. */
export function RouteBoard({
  board,
  tile,
  litCells,
  breakCell,
  reducedMotion,
  shake,
  onRotate,
  children,
}: Props) {
  const width = tile * COLS + BOARD_FRAME * 2;
  const height = tile * ROWS + BOARD_FRAME * 2;
  const scanCount = Math.floor(height / SCANLINE_STEP);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.frame, { width, height, transform: [{ translateX: shake }] }]}>
      <HudFrame color={theme.colors.borderMagenta} inset={6} arm={20} />
      <View style={styles.grid}>
        {board.cells.map((rowCells, row) => (
          <View key={'row-' + row} style={styles.row}>
            {rowCells.map((cell, col) => (
              <RotorCell
                key={'cell-' + row + '-' + col}
                cell={cell}
                row={row}
                col={col}
                size={tile}
                lit={litCells.has(row + ':' + col)}
                broken={breakCell !== null && breakCell.row === row && breakCell.col === col}
                reducedMotion={reducedMotion}
                onPress={onRotate}
              />
            ))}
          </View>
        ))}
      </View>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {Array.from({ length: scanCount }).map((_, i) => (
          <View key={'scan-' + i} style={[styles.scan, { top: i * SCANLINE_STEP }]} />
        ))}
      </View>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(0,245,255,0.22)',
    backgroundColor: theme.colors.glassDeep,
    padding: BOARD_FRAME - 2,
  },
  grid: { overflow: 'visible' },
  row: { flexDirection: 'row' },
  scan: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.03)' },
});
