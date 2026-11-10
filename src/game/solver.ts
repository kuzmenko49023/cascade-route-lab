import { COLS, ROWS, WALK_STEP_CAP } from '../constants/config';
import { hasPort, opposite, portsOf, stepFrom } from './ports';
import type { Board, Cell, CellRef, Dir, RouteResult } from './types';

function cellAt(board: Board, row: number, col: number): Cell | null {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
    return null;
  }
  return board.cells[row][col];
}

/**
 * Walks the port graph from the launch funnel. The orb enters (0, launchCol)
 * travelling S; a closed entry port, a sideways exit or an upward exit is a break.
 */
export function walkRoute(board: Board): RouteResult {
  const path: CellRef[] = [];
  const visited = new Set<string>();
  let sparks = 0;
  let row = 0;
  let col = board.launchCol;
  let travel: Dir = 'S';

  for (let step = 0; step < WALK_STEP_CAP; step += 1) {
    const cell = cellAt(board, row, col);
    if (!cell) {
      const last = path.length > 0 ? path[path.length - 1] : { row: 0, col: board.launchCol };
      return { path, sparks, outcome: 'break', breakCell: last, pocket: null };
    }

    const entry = opposite(travel);
    if (!hasPort(cell, entry)) {
      return { path, sparks, outcome: 'break', breakCell: { row, col }, pocket: null };
    }

    const key = row + ':' + col;
    if (visited.has(key)) {
      return { path, sparks, outcome: 'break', breakCell: { row, col }, pocket: null };
    }
    visited.add(key);
    path.push({ row, col });
    if (cell.spark) {
      sparks += 1;
    }

    let exit: Dir;
    if (cell.kind === 'CROSS') {
      exit = travel;
    } else {
      const other = portsOf(cell).filter(p => p !== entry);
      if (other.length === 0) {
        return { path, sparks, outcome: 'break', breakCell: { row, col }, pocket: null };
      }
      exit = other[0];
    }

    if (row === ROWS - 1 && exit === 'S') {
      const pocket = col;
      const outcome = pocket === board.targetCol ? 'win' : 'partial';
      return { path, sparks, outcome, breakCell: null, pocket };
    }

    const next = stepFrom(row, col, exit);
    if (next.row < 0 || next.row >= ROWS || next.col < 0 || next.col >= COLS) {
      return { path, sparks, outcome: 'break', breakCell: { row, col }, pocket: null };
    }

    row = next.row;
    col = next.col;
    travel = exit;
  }

  const last = path.length > 0 ? path[path.length - 1] : { row: 0, col: board.launchCol };
  return { path, sparks, outcome: 'break', breakCell: last, pocket: null };
}

/** Walks the rig as if every rotor sat at its designed rotation. */
export function walkSolution(board: Board): RouteResult {
  const solved: Board = {
    ...board,
    cells: board.cells.map(r => r.map(c => ({ ...c, turns: c.solution }))),
  };
  return walkRoute(solved);
}

export function isSolvable(board: Board): boolean {
  const res = walkSolution(board);
  return res.outcome === 'win' && res.pocket === board.targetCol;
}
