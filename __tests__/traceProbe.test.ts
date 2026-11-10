import { TRACE_COST, TRACE_VISIBLE_MS } from '../src/constants/config';
import { generateBoard } from '../src/game/board';
import { canAfford } from '../src/game/rotation';
import { isPerfectRoute } from '../src/game/scoring';
import { walkRoute } from '../src/game/solver';

describe('the TRACE probe', () => {
  it('costs rotations, so information is bought with the budget', () => {
    expect(TRACE_COST).toBeGreaterThan(0);
    expect(canAfford(TRACE_COST, TRACE_COST)).toBe(true);
    expect(canAfford(TRACE_COST - 1, TRACE_COST)).toBe(false);
    expect(canAfford(0, TRACE_COST)).toBe(false);
  });

  it('stays on screen long enough to read before it fades', () => {
    expect(TRACE_VISIBLE_MS).toBeGreaterThanOrEqual(1500);
  });

  it('draws the live route from the rotors as they stand, not the solution', () => {
    const board = generateBoard(6, 0);
    const live = walkRoute(board);
    expect(live.path.length).toBeGreaterThan(0);
    expect(live.path[0]).toEqual({ row: 0, col: board.launchCol });
  });

  it('ends the drawn route at the break cell when the channel is still open', () => {
    const board = generateBoard(14, 0);
    const live = walkRoute(board);
    if (live.outcome === 'break') {
      expect(live.breakCell).not.toBeNull();
      expect(live.pocket).toBeNull();
    } else {
      expect(live.pocket).not.toBeNull();
    }
  });

  it('is free but bonus-disabling once Route Trace runs always on', () => {
    const input = {
      outcome: 'win' as const,
      sparks: 2,
      sparkTotal: 2,
      pocket: 3,
      targetCol: 3,
    };
    expect(isPerfectRoute({ ...input, bonusEnabled: true })).toBe(true);
    expect(isPerfectRoute({ ...input, bonusEnabled: false })).toBe(false);
  });
});
