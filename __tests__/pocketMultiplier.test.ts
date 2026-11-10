import {
  BASE_SCORE,
  MULT_ADJACENT,
  MULT_BREAK,
  MULT_FAR,
  MULT_TARGET,
  SPARK_VALUE,
} from '../src/constants/config';
import { pocketMultiplier, scoreRun } from '../src/game/scoring';
import { formatMultiplier } from '../src/utils/format';

describe('the pocket payout strip', () => {
  it('pays most for the target pocket and still pays its neighbours', () => {
    expect(pocketMultiplier(2, 2)).toBe(MULT_TARGET);
    expect(pocketMultiplier(1, 2)).toBe(MULT_ADJACENT);
    expect(pocketMultiplier(3, 2)).toBe(MULT_ADJACENT);
    expect(pocketMultiplier(4, 2)).toBe(MULT_FAR);
    expect(pocketMultiplier(0, 2)).toBe(MULT_FAR);
  });

  it('pays nothing for a channel that never reaches the bottom', () => {
    expect(pocketMultiplier(null, 2)).toBe(MULT_BREAK);
    const broken = scoreRun({
      outcome: 'break',
      sparks: 3,
      sparkTotal: 3,
      pocket: null,
      targetCol: 2,
      bonusEnabled: true,
    });
    expect(broken.score).toBe(0);
    expect(broken.multiplier).toBe(MULT_BREAK);
  });

  it('multiplies the banked sparks by where the orb actually landed', () => {
    const banked = BASE_SCORE + 2 * SPARK_VALUE;
    const adjacent = scoreRun({
      outcome: 'partial',
      sparks: 2,
      sparkTotal: 3,
      pocket: 1,
      targetCol: 2,
      bonusEnabled: true,
    });
    const far = scoreRun({
      outcome: 'partial',
      sparks: 2,
      sparkTotal: 3,
      pocket: 4,
      targetCol: 2,
      bonusEnabled: true,
    });

    expect(adjacent.score).toBe(Math.round(banked * MULT_ADJACENT));
    expect(far.score).toBe(Math.round(banked * MULT_FAR));
    expect(adjacent.score).toBeGreaterThan(far.score);
  });

  it('never clears the route on an off-route drop, but never leaves it empty either', () => {
    const off = scoreRun({
      outcome: 'partial',
      sparks: 1,
      sparkTotal: 3,
      pocket: 0,
      targetCol: 4,
      bonusEnabled: true,
    });
    expect(off.perfect).toBe(false);
    expect(off.score).toBeGreaterThan(0);
  });

  it('prints every multiplier with one decimal', () => {
    expect(formatMultiplier(MULT_TARGET)).toBe('3.0');
    expect(formatMultiplier(MULT_ADJACENT)).toBe('1.5');
    expect(formatMultiplier(MULT_FAR)).toBe('1.0');
  });
});
