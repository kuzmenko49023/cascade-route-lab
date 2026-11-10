import { BASE_SCORE, SPARK_VALUE } from '../src/constants/config';
import { generateBoard } from '../src/game/board';
import { paramsFor } from '../src/game/levels';
import { scoreRun } from '../src/game/scoring';
import { walkSolution } from '../src/game/solver';

describe('spark nodes', () => {
  it('places the sector quota of sparks, always on the designed channel', () => {
    for (let level = 1; level <= 24; level += 1) {
      const board = generateBoard(level, 0);
      let sparks = 0;
      for (let r = 0; r < board.cells.length; r += 1) {
        for (let c = 0; c < board.cells[r].length; c += 1) {
          if (board.cells[r][c].spark) {
            sparks += 1;
            expect(board.cells[r][c].onPath).toBe(true);
          }
        }
      }
      expect(sparks).toBe(board.sparkTotal);
      expect(sparks).toBeLessThanOrEqual(paramsFor(level).sparks);
    }
  });

  it('never seats a spark on the launch cell, so none is free', () => {
    for (let level = 1; level <= 24; level += 1) {
      const board = generateBoard(level, 0);
      expect(board.cells[0][board.launchCol].spark).toBe(false);
    }
  });

  it('collects every spark the designed channel passes through', () => {
    for (let level = 1; level <= 24; level += 1) {
      const board = generateBoard(level, 0);
      const solved = walkSolution(board);
      expect(solved.sparks).toBe(board.sparkTotal);
    }
  });

  it('pays each collected spark into the run score', () => {
    const none = scoreRun({
      outcome: 'win',
      sparks: 0,
      sparkTotal: 0,
      pocket: 1,
      targetCol: 1,
      bonusEnabled: true,
    });
    const two = scoreRun({
      outcome: 'win',
      sparks: 2,
      sparkTotal: 4,
      pocket: 1,
      targetCol: 1,
      bonusEnabled: true,
    });

    expect(none.score).toBe(BASE_SCORE * 3);
    expect(two.score - none.score).toBe(SPARK_VALUE * 2 * 3);
  });

  it('banks the sparks of an off-route drop too, so a miss is never nothing', () => {
    const miss = scoreRun({
      outcome: 'partial',
      sparks: 3,
      sparkTotal: 3,
      pocket: 4,
      targetCol: 0,
      bonusEnabled: true,
    });
    expect(miss.score).toBeGreaterThan(0);
    expect(miss.perfect).toBe(false);
  });
});
