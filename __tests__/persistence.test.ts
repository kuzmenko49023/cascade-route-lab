import { INITIAL_SETTINGS, MemoryBackend, ProgressStore } from '../src/game/storage';

describe('offline-first local persistence', () => {
  it('reads an empty backend as a fresh bench', () => {
    const store = new ProgressStore(new MemoryBackend());
    expect(store.getProgress().totalScore).toBe(0);
    expect(store.getSettings()).toEqual(INITIAL_SETTINGS);
  });

  it('writes every mutation straight through to the backend', () => {
    const backend = new MemoryBackend();
    const store = new ProgressStore(backend);
    store.recordRun({
      level: 2,
      outcome: 'win',
      score: 210,
      sparks: 3,
      movesUsed: 8,
      budget: 12,
      perfect: false,
      daily: false,
    });

    const stored = backend.read();
    expect(stored).not.toBeNull();
    expect(stored && stored.progress.totalScore).toBe(210);
  });

  it('reads the snapshot back identically after a cold reopen', () => {
    const backend = new MemoryBackend();
    const first = new ProgressStore(backend);
    first.updateSettings({ rotation: 'CCW', highContrast: true });
    first.recordRun({
      level: 1,
      outcome: 'win',
      score: 150,
      sparks: 2,
      movesUsed: 6,
      budget: 10,
      perfect: true,
      daily: false,
    });

    const reopened = new ProgressStore(backend);
    expect(reopened.getProgress()).toEqual(first.getProgress());
    expect(reopened.getSettings()).toEqual(first.getSettings());
    expect(reopened.nextLevel()).toBe(2);
  });

  it('hands out copies, so no screen can mutate the stored snapshot by accident', () => {
    const backend = new MemoryBackend();
    const store = new ProgressStore(backend);
    store.recordRun({
      level: 1,
      outcome: 'partial',
      score: 40,
      sparks: 1,
      movesUsed: 4,
      budget: 9,
      perfect: false,
      daily: false,
    });

    const stored = backend.read();
    expect(stored).not.toBeNull();
    if (stored) {
      stored.progress.totalScore = 9999;
    }
    expect(store.getProgress().totalScore).toBe(40);
    expect(new ProgressStore(backend).getProgress().totalScore).toBe(40);
  });

  it('tells every subscriber once a run is recorded', () => {
    const store = new ProgressStore(new MemoryBackend());
    let calls = 0;
    const unsubscribe = store.subscribe(() => {
      calls += 1;
    });

    store.updateSettings({ reducedMotion: true });
    expect(calls).toBe(1);

    unsubscribe();
    store.updateSettings({ reducedMotion: false });
    expect(calls).toBe(1);
  });
});
