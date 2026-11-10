import { TOTAL_BLUEPRINTS } from '../src/constants/config';
import { BLUEPRINTS, newlyUnlocked, unlockedCount } from '../src/game/blueprints';
import { INITIAL_PROGRESS } from '../src/game/storage';
import type { ProgressSnapshot } from '../src/game/types';

function snapshot(patch: Partial<ProgressSnapshot>): ProgressSnapshot {
  return { ...INITIAL_PROGRESS, ...patch };
}

describe('the blueprint collection', () => {
  it('ships exactly twelve plates, each with a name and an unlock condition', () => {
    expect(BLUEPRINTS).toHaveLength(TOTAL_BLUEPRINTS);
    BLUEPRINTS.forEach(bp => {
      expect(bp.name.length).toBeGreaterThan(0);
      expect(bp.condition.length).toBeGreaterThan(0);
      expect(bp.flavour.length).toBeGreaterThan(0);
    });
  });

  it('gives every plate a unique id and name', () => {
    const ids = new Set(BLUEPRINTS.map(b => b.id));
    const names = new Set(BLUEPRINTS.map(b => b.name));
    expect(ids.size).toBe(TOTAL_BLUEPRINTS);
    expect(names.size).toBe(TOTAL_BLUEPRINTS);
  });

  it('locks everything on a fresh bench', () => {
    expect(unlockedCount(INITIAL_PROGRESS)).toBe(0);
  });

  it('unlocks on real progress, not on a timer', () => {
    const first = snapshot({ clearedLevels: [1] });
    expect(unlockedCount(first)).toBeGreaterThanOrEqual(1);

    const sparky = snapshot({ totalSparks: 10 });
    expect(unlockedCount(sparky)).toBeGreaterThanOrEqual(1);

    const everything = snapshot({
      clearedLevels: Array.from({ length: 24 }, (_, i) => i + 1),
      perfectLevels: [1, 2, 3],
      totalSparks: 200,
      bestScore: 900,
    });
    expect(unlockedCount(everything)).toBe(TOTAL_BLUEPRINTS);
  });

  it('reports exactly the plates that flipped between two snapshots', () => {
    const before = snapshot({ clearedLevels: [] });
    const after = snapshot({ clearedLevels: [1] });
    const fresh = newlyUnlocked(before, after);

    expect(fresh.length).toBeGreaterThan(0);
    expect(fresh[0].unlocked(after)).toBe(true);
    expect(fresh[0].unlocked(before)).toBe(false);
    expect(newlyUnlocked(after, after)).toHaveLength(0);
  });
});
