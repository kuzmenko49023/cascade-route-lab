import { LEVELS_PER_SECTOR, TOTAL_LEVELS } from '../src/constants/config';
import { generateBoard } from '../src/game/board';
import { SECTORS, levelsOfSector, paramsFor, routeInSector, sectorOf } from '../src/game/levels';
import { MemoryBackend, ProgressStore } from '../src/game/storage';

function store(): ProgressStore {
  return new ProgressStore(new MemoryBackend());
}

describe('challenge sessions', () => {
  it('splits 24 routes into three named sectors of eight', () => {
    expect(TOTAL_LEVELS).toBe(SECTORS.length * LEVELS_PER_SECTOR);
    SECTORS.forEach(sector => {
      expect(levelsOfSector(sector.index)).toHaveLength(LEVELS_PER_SECTOR);
      expect(sector.name.length).toBeGreaterThan(0);
    });
  });

  it('maps a route to its sector and its position inside it', () => {
    expect(sectorOf(1)).toBe(1);
    expect(sectorOf(8)).toBe(1);
    expect(sectorOf(9)).toBe(2);
    expect(sectorOf(24)).toBe(3);
    expect(routeInSector(9)).toBe(1);
    expect(routeInSector(24)).toBe(8);
  });

  it('unlocks only the next route, so locked chips stay inert', () => {
    const s = store();
    expect(s.nextLevel()).toBe(1);
    expect(s.isUnlocked(1)).toBe(true);
    expect(s.isUnlocked(2)).toBe(false);

    s.recordRun({
      level: 1,
      outcome: 'win',
      score: 120,
      sparks: 2,
      movesUsed: 6,
      budget: 10,
      perfect: false,
      daily: false,
    });
    expect(s.nextLevel()).toBe(2);
    expect(s.isUnlocked(2)).toBe(true);
    expect(s.isUnlocked(3)).toBe(false);
  });

  it('loads the seeded rig of the picked route with its own goal and budget', () => {
    const a = generateBoard(4, 0);
    const b = generateBoard(4, 0);
    expect(b.targetCol).toBe(a.targetCol);
    expect(b.budget).toBe(a.budget);
    expect(a.level).toBe(4);
  });

  it('gives deeper sectors more pegs and tighter slack', () => {
    expect(paramsFor(20).pegsMin).toBeGreaterThan(paramsFor(4).pegsMin);
    expect(paramsFor(20).slack).toBeLessThan(paramsFor(4).slack);
  });
});
