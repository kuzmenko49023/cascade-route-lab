import { COLS, MAX_GENERATION_ATTEMPTS, ROWS } from '../src/constants/config';
import { FALLBACK_BOARD, generateBoard, makeFallbackBoard } from '../src/game/board';
import { mulberry32, seedFor } from '../src/game/rng';
import { isSolvable } from '../src/game/solver';

describe('seeded rig generation', () => {
  it('builds a full grid for every campaign route', () => {
    for (let level = 1; level <= 24; level += 1) {
      const board = generateBoard(level, 0);
      expect(board.cells).toHaveLength(ROWS);
      board.cells.forEach(row => expect(row).toHaveLength(COLS));
      expect(board.launchCol).toBeGreaterThanOrEqual(0);
      expect(board.launchCol).toBeLessThan(COLS);
    }
  });

  it('verifies every rig solvable before it is shown', () => {
    for (let level = 1; level <= 24; level += 1) {
      expect(isSolvable(generateBoard(level, 0))).toBe(true);
    }
    expect(isSolvable(FALLBACK_BOARD)).toBe(true);
    expect(isSolvable(makeFallbackBoard(9, 123))).toBe(true);
  });

  it('rebuilds exactly the same rig from the same seed', () => {
    const a = generateBoard(12, 3);
    const b = generateBoard(12, 3);
    expect(JSON.stringify(b.cells)).toBe(JSON.stringify(a.cells));
    expect(b.seed).toBe(a.seed);
  });

  it('makes two consecutive attempts differ in placement, not only in a number', () => {
    let different = 0;
    for (let level = 1; level <= 24; level += 1) {
      const first = generateBoard(level, 0);
      const second = generateBoard(level, 1);
      if (JSON.stringify(first.cells) !== JSON.stringify(second.cells)) {
        different += 1;
      }
    }
    expect(different).toBe(24);
  });

  it('derives one seed per attempt and never touches the global RNG', () => {
    expect(seedFor(1, 0)).not.toBe(seedFor(1, 1));
    expect(seedFor(1, 0)).toBe(seedFor(1, 0));

    const rand = mulberry32(42);
    const first = [rand(), rand(), rand()];
    const again = mulberry32(42);
    expect([again(), again(), again()]).toEqual(first);
    first.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
  });

  it('keeps a bounded number of regeneration attempts before the safety net', () => {
    expect(MAX_GENERATION_ATTEMPTS).toBeGreaterThan(0);
    expect(MAX_GENERATION_ATTEMPTS).toBeLessThanOrEqual(20);
  });
});
