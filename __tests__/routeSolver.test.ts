import { ROWS } from '../src/constants/config';
import { generateBoard, makeFallbackBoard } from '../src/game/board';
import { walkRoute, walkSolution } from '../src/game/solver';

describe('walking the port graph', () => {
  it('locks the target pocket when every rotor sits at its designed rotation', () => {
    for (let level = 1; level <= 24; level += 1) {
      const board = generateBoard(level, 0);
      const solved = walkSolution(board);
      expect(solved.outcome).toBe('win');
      expect(solved.pocket).toBe(board.targetCol);
    }
  });

  it('enters the rig at the launch column, travelling down from the funnel', () => {
    const board = generateBoard(7, 0);
    const solved = walkSolution(board);
    expect(solved.path[0]).toEqual({ row: 0, col: board.launchCol });
  });

  it('never leaves the grid and never visits a cell twice', () => {
    const board = generateBoard(11, 0);
    const solved = walkSolution(board);
    const seen = new Set<string>();
    solved.path.forEach(ref => {
      expect(ref.row).toBeGreaterThanOrEqual(0);
      expect(ref.row).toBeLessThan(ROWS);
      const key = ref.row + ':' + ref.col;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    });
  });

  it('reports a break with the cell the channel dies in and no pocket', () => {
    const board = makeFallbackBoard(1, 0);
    // the fallback channel is scrambled a quarter turn out of true
    const broken = walkRoute(board);
    expect(broken.outcome).toBe('break');
    expect(broken.pocket).toBeNull();
    expect(broken.breakCell).not.toBeNull();
  });

  it('scores a landing outside the target pocket as off route, not as a break', () => {
    const board = makeFallbackBoard(1, 0);
    const shifted = {
      ...board,
      cells: board.cells.map(row => row.map(cell => ({ ...cell, turns: cell.solution }))),
      targetCol: 0,
    };
    const result = walkRoute(shifted);
    expect(result.outcome).toBe('partial');
    expect(result.pocket).not.toBeNull();
  });
});
