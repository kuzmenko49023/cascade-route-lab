import { LEVELS_PER_SECTOR } from '../src/constants/config';
import { levelsOfSector } from '../src/game/levels';
import { MemoryBackend, ProgressStore } from '../src/game/storage';
import { percent } from '../src/utils/format';

function win(store: ProgressStore, level: number, score: number) {
  store.recordRun({
    level,
    outcome: 'win',
    score,
    sparks: 2,
    movesUsed: 5,
    budget: 12,
    perfect: level % 2 === 0,
    daily: false,
  });
}

describe('the bench log', () => {
  it('starts empty, so the Progress screen shows its themed empty state', () => {
    const store = new ProgressStore(new MemoryBackend());
    const p = store.getProgress();
    expect(p.runLog).toHaveLength(0);
    expect(p.totalScore).toBe(0);
    expect(p.bestScore).toBe(0);
  });

  it('tracks routes cleared, perfect routes, best score and the total', () => {
    const store = new ProgressStore(new MemoryBackend());
    win(store, 1, 100);
    win(store, 2, 350);
    const p = store.getProgress();

    expect(p.clearedLevels).toEqual([1, 2]);
    expect(p.perfectLevels).toEqual([2]);
    expect(p.bestScore).toBe(350);
    expect(p.totalScore).toBe(450);
    expect(p.totalSparks).toBe(4);
  });

  it('keeps only the last five runs, newest first', () => {
    const store = new ProgressStore(new MemoryBackend());
    for (let i = 1; i <= 7; i += 1) {
      win(store, i, i * 10);
    }
    const log = store.getProgress().runLog;
    expect(log).toHaveLength(5);
    expect(log[0].level).toBe(7);
    expect(log[4].level).toBe(3);
  });

  it('reports sector mastery as a whole percentage of its eight routes', () => {
    const store = new ProgressStore(new MemoryBackend());
    levelsOfSector(1)
      .slice(0, 4)
      .forEach(level => win(store, level, 50));
    const done = levelsOfSector(1).filter(
      l => store.getProgress().clearedLevels.indexOf(l) >= 0,
    ).length;

    expect(percent(done, LEVELS_PER_SECTOR)).toBe(50);
    expect(percent(0, LEVELS_PER_SECTOR)).toBe(0);
  });

  it('never counts the same cleared route twice', () => {
    const store = new ProgressStore(new MemoryBackend());
    win(store, 1, 100);
    win(store, 1, 100);
    expect(store.getProgress().clearedLevels).toEqual([1]);
  });
});
