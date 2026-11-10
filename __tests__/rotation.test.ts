import { generateBoard } from '../src/game/board';
import { isRotatable, periodOf, portsOf, rotationOf } from '../src/game/ports';
import { applyRotation } from '../src/game/rotation';
import type { CellRef } from '../src/game/types';

/** The first rotor of a kind that the player is actually allowed to turn. */
function findCell(level: number, kind: string): CellRef {
  const board = generateBoard(level, 0);
  for (let r = 0; r < board.cells.length; r += 1) {
    for (let c = 0; c < board.cells[r].length; c += 1) {
      const cell = board.cells[r][c];
      if (cell.kind === kind && isRotatable(cell)) {
        return { row: r, col: c };
      }
    }
  }
  throw new Error('every rig carries at least one free ' + kind);
}

describe('rotating a rotor', () => {
  it('turns a rotatable cell one quarter clockwise and spends one move', () => {
    const board = generateBoard(3, 0);
    const ref = findCell(3, 'ELBOW');
    const before = rotationOf(board.cells[ref.row][ref.col]);
    const turn = applyRotation(board, ref.row, ref.col, 'CW', 10);

    expect(turn.accepted).toBe(true);
    expect(turn.spent).toBe(1);
    expect(rotationOf(turn.board.cells[ref.row][ref.col])).toBe((before + 1) % 4);
  });

  it('turns the other way when the bench is configured counter-clockwise', () => {
    const board = generateBoard(3, 0);
    const ref = findCell(3, 'ELBOW');
    const cw = applyRotation(board, ref.row, ref.col, 'CW', 10);
    const ccw = applyRotation(board, ref.row, ref.col, 'CCW', 10);

    expect(rotationOf(cw.board.cells[ref.row][ref.col])).not.toBe(
      rotationOf(ccw.board.cells[ref.row][ref.col]),
    );
  });

  it('leaves the original rig untouched — the tap returns a new board', () => {
    const board = generateBoard(5, 0);
    const ref = findCell(5, 'ELBOW');
    const before = board.cells[ref.row][ref.col].turns;
    applyRotation(board, ref.row, ref.col, 'CW', 10);

    expect(board.cells[ref.row][ref.col].turns).toBe(before);
  });

  it('moves the open ports with the artwork', () => {
    const board = generateBoard(2, 0);
    const ref = findCell(2, 'STRAIGHT');
    const before = portsOf(board.cells[ref.row][ref.col]).slice().sort();
    const turn = applyRotation(board, ref.row, ref.col, 'CW', 10);
    const after = portsOf(turn.board.cells[ref.row][ref.col]).slice().sort();

    expect(after).not.toEqual(before);
  });

  it('knows how many quarters each kind needs before it repeats', () => {
    expect(periodOf('STRAIGHT')).toBe(2);
    expect(periodOf('ELBOW')).toBe(4);
    expect(periodOf('CROSS')).toBe(1);
    expect(periodOf('PEG')).toBe(1);
  });

  it('refuses the tap when the budget is already spent', () => {
    const board = generateBoard(4, 0);
    const ref = findCell(4, 'ELBOW');
    const turn = applyRotation(board, ref.row, ref.col, 'CW', 0);

    expect(turn.accepted).toBe(false);
    expect(turn.spent).toBe(0);
    expect(turn.board).toBe(board);
  });

  it('never treats a peg as a rotor', () => {
    const board = generateBoard(20, 0);
    for (let r = 0; r < board.cells.length; r += 1) {
      for (let c = 0; c < board.cells[r].length; c += 1) {
        if (board.cells[r][c].kind === 'PEG') {
          expect(isRotatable(board.cells[r][c])).toBe(false);
        }
      }
    }
  });
});
