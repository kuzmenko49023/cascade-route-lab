import { INITIAL_PROGRESS, MemoryBackend, ProgressStore } from '../src/game/storage';

function busyBench(): ProgressStore {
  const store = new ProgressStore(new MemoryBackend());
  store.recordRun({
    level: 1,
    outcome: 'win',
    score: 300,
    sparks: 4,
    movesUsed: 7,
    budget: 12,
    perfect: true,
    daily: false,
  });
  store.recordRun({
    level: 0,
    outcome: 'partial',
    score: 90,
    sparks: 2,
    movesUsed: 9,
    budget: 11,
    perfect: false,
    daily: true,
  });
  return store;
}

describe('resetting the bench', () => {
  it('wipes routes, sparks, streak and the run log back to the initial snapshot', () => {
    const store = busyBench();
    expect(store.getProgress().runLog.length).toBeGreaterThan(0);

    store.reset();
    const p = store.getProgress();

    expect(p.clearedLevels).toEqual([]);
    expect(p.perfectLevels).toEqual([]);
    expect(p.totalScore).toBe(0);
    expect(p.bestScore).toBe(0);
    expect(p.totalSparks).toBe(0);
    expect(p.dailyStreak).toBe(0);
    expect(p.lastDailyKey).toBe(0);
    expect(p.runLog).toEqual([]);
    expect(p).toEqual(INITIAL_PROGRESS);
  });

  it('locks the campaign back to route one', () => {
    const store = busyBench();
    expect(store.nextLevel()).toBe(2);
    store.reset();
    expect(store.nextLevel()).toBe(1);
    expect(store.isUnlocked(2)).toBe(false);
  });

  it('leaves the bench configuration alone — only progress is destroyed', () => {
    const store = busyBench();
    store.updateSettings({ rotation: 'CCW', reducedMotion: true });
    store.reset();

    expect(store.getSettings().rotation).toBe('CCW');
    expect(store.getSettings().reducedMotion).toBe(true);
  });

  it('survives as the stored snapshot, not only in memory', () => {
    const backend = new MemoryBackend();
    const store = new ProgressStore(backend);
    store.recordRun({
      level: 1,
      outcome: 'win',
      score: 10,
      sparks: 0,
      movesUsed: 1,
      budget: 9,
      perfect: false,
      daily: false,
    });
    store.reset();

    const reopened = new ProgressStore(backend);
    expect(reopened.getProgress().clearedLevels).toEqual([]);
  });
});
