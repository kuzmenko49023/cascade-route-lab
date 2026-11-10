import { AUTO_DROP_WARNING_MS } from '../src/constants/config';
import { generateBoard } from '../src/game/board';
import { cwDistance } from '../src/game/ports';
import { paramsFor } from '../src/game/levels';
import { applyRotation, releasesItself } from '../src/game/rotation';

function minimumTurns(level: number): { needed: number; budget: number } {
  const board = generateBoard(level, 0);
  let needed = 0;
  for (let r = 0; r < board.cells.length; r += 1) {
    for (let c = 0; c < board.cells[r].length; c += 1) {
      if (board.cells[r][c].onPath) {
        needed += cwDistance(board.cells[r][c]);
      }
    }
  }
  return { needed, budget: board.budget };
}

describe('the rotation budget', () => {
  it('always covers the designed channel plus the sector slack', () => {
    for (let level = 1; level <= 24; level += 1) {
      const { needed, budget } = minimumTurns(level);
      expect(budget).toBeGreaterThanOrEqual(needed);
      expect(budget - needed).toBeLessThanOrEqual(paramsFor(level).slack);
    }
  });

  it('tightens the slack sector by sector', () => {
    expect(paramsFor(1).slack).toBeGreaterThan(paramsFor(9).slack);
    expect(paramsFor(9).slack).toBeGreaterThan(paramsFor(17).slack);
  });

  it('releases the rig the moment the last rotation is spent', () => {
    expect(releasesItself(1)).toBe(false);
    expect(releasesItself(0)).toBe(true);
  });

  it('resolves the attempt within about three seconds of the last rotation', () => {
    expect(AUTO_DROP_WARNING_MS).toBeLessThanOrEqual(1500);
  });

  it('refuses every further tap once the budget is empty', () => {
    const board = generateBoard(6, 0);
    let ref = { row: 0, col: 0 };
    for (let r = 0; r < board.cells.length; r += 1) {
      for (let c = 0; c < board.cells[r].length; c += 1) {
        if (board.cells[r][c].kind === 'ELBOW' && !board.cells[r][c].sealed) {
          ref = { row: r, col: c };
        }
      }
    }
    expect(applyRotation(board, ref.row, ref.col, 'CW', 0).accepted).toBe(false);
  });
});
