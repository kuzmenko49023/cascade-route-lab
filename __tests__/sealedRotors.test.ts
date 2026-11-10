import { generateBoard } from '../src/game/board';
import { cwDistance, isRotatable, rotationOf } from '../src/game/ports';
import { applyRotation } from '../src/game/rotation';
import { isSolvable } from '../src/game/solver';
import type { Board, CellRef } from '../src/game/types';

function sealedCells(board: Board): CellRef[] {
  const out: CellRef[] = [];
  for (let r = 0; r < board.cells.length; r += 1) {
    for (let c = 0; c < board.cells[r].length; c += 1) {
      if (board.cells[r][c].sealed) {
        out.push({ row: r, col: c });
      }
    }
  }
  return out;
}

describe('sealed rotors', () => {
  it('freezes every rivet at its solution rotation, so the rig stays solvable', () => {
    for (let level = 9; level <= 24; level += 1) {
      const board = generateBoard(level, 0);
      sealedCells(board).forEach(ref => {
        const cell = board.cells[ref.row][ref.col];
        const period = cell.kind === 'STRAIGHT' ? 2 : 4;
        expect(cell.turns).toBe(cell.solution);
        expect(rotationOf(cell)).toBe(((cell.solution % period) + period) % period);
        expect(cwDistance(cell)).toBe(0);
      });
      expect(isSolvable(board)).toBe(true);
    }
  });

  it('seals only cells on the designed channel', () => {
    for (let level = 9; level <= 24; level += 1) {
      const board = generateBoard(level, 0);
      sealedCells(board).forEach(ref => {
        expect(board.cells[ref.row][ref.col].onPath).toBe(true);
      });
    }
  });

  it('refuses a tap on a rivet and spends nothing', () => {
    const board = generateBoard(18, 0);
    const sealed = sealedCells(board);
    expect(sealed.length).toBeGreaterThan(0);

    const ref = sealed[0];
    const before = board.cells[ref.row][ref.col].turns;
    const turn = applyRotation(board, ref.row, ref.col, 'CW', 12);

    expect(turn.accepted).toBe(false);
    expect(turn.spent).toBe(0);
    expect(turn.board.cells[ref.row][ref.col].turns).toBe(before);
    expect(isRotatable(board.cells[ref.row][ref.col])).toBe(false);
  });

  it('seals more of the channel the deeper the sector runs', () => {
    const shallow = sealedCells(generateBoard(1, 0)).length;
    const deep = sealedCells(generateBoard(24, 0)).length;
    expect(deep).toBeGreaterThanOrEqual(shallow);
  });

  it('never seals a rivet the budget would have to pay for', () => {
    for (let level = 1; level <= 24; level += 1) {
      const board = generateBoard(level, 0);
      sealedCells(board).forEach(ref => {
        expect(cwDistance(board.cells[ref.row][ref.col])).toBe(0);
      });
    }
  });
});
