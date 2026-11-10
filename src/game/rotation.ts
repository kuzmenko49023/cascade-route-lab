import { cloneBoard } from './board';
import { isRotatable } from './ports';
import type { Board, RotationDirection } from './types';

export interface RotationOutcome {
  /** the rig after the tap; the same object when the tap was refused */
  board: Board;
  /** rotations the tap actually cost — a refused tap costs nothing */
  spent: number;
  accepted: boolean;
}

/**
 * One tap on one rotor. Sealed rivets and pegs refuse the tap and spend
 * nothing; everything else turns a quarter in the configured direction.
 * Pure on purpose: the hook only stores what this returns.
 */
export function applyRotation(
  board: Board,
  row: number,
  col: number,
  direction: RotationDirection,
  movesLeft: number,
): RotationOutcome {
  const cell = board.cells[row][col];
  if (!isRotatable(cell) || movesLeft <= 0) {
    return { board, spent: 0, accepted: false };
  }
  const next = cloneBoard(board);
  next.cells[row][col].turns += direction === 'CW' ? 1 : -1;
  return { board: next, spent: 1, accepted: true };
}

/** The rig releases itself the moment the budget is exhausted. */
export function releasesItself(movesLeft: number): boolean {
  return movesLeft <= 0;
}

/** A probe is only affordable while the budget still covers its cost. */
export function canAfford(movesLeft: number, cost: number): boolean {
  return movesLeft >= cost;
}
