import { TOTAL_LEVELS } from '../constants/config';
import { dateKey, nextStreak } from './dailySeed';
import type { Outcome, ProgressSnapshot, RunLogEntry, Settings } from './types';

/**
 * Persistence sits behind this interface on purpose. The app ships with the
 * in-process backend; swapping in a disk backend is a drop-in replacement and
 * touches no screen, because no UI code ever reads or writes it directly.
 */
export interface StorageBackend {
  read(): { progress: ProgressSnapshot; settings: Settings } | null;
  write(value: { progress: ProgressSnapshot; settings: Settings }): void;
}

export const INITIAL_PROGRESS: ProgressSnapshot = {
  clearedLevels: [],
  perfectLevels: [],
  totalScore: 0,
  bestScore: 0,
  totalSparks: 0,
  longestStreak: 0,
  dailyStreak: 0,
  lastDailyKey: 0,
  lastDailyScore: 0,
  lastDailyOutcome: null,
  dailyHistory: [],
  runLog: [],
};

export const INITIAL_SETTINGS: Settings = {
  rotation: 'CW',
  trace: 'MANUAL',
  highContrast: false,
  reducedMotion: false,
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Module-scope singleton: survives every in-app navigation and round restart. */
export class MemoryBackend implements StorageBackend {
  private value: { progress: ProgressSnapshot; settings: Settings } | null = null;

  read(): { progress: ProgressSnapshot; settings: Settings } | null {
    return this.value ? clone(this.value) : null;
  }

  write(value: { progress: ProgressSnapshot; settings: Settings }): void {
    this.value = clone(value);
  }
}

export interface RunOutcomeInput {
  level: number;
  outcome: Outcome;
  score: number;
  sparks: number;
  movesUsed: number;
  budget: number;
  perfect: boolean;
  daily: boolean;
}

type Listener = () => void;

export class ProgressStore {
  private backend: StorageBackend;
  private progress: ProgressSnapshot;
  private settings: Settings;
  private listeners: Listener[] = [];

  constructor(backend: StorageBackend) {
    this.backend = backend;
    const restored = backend.read();
    this.progress = restored ? restored.progress : clone(INITIAL_PROGRESS);
    this.settings = restored ? restored.settings : clone(INITIAL_SETTINGS);
  }

  getProgress(): ProgressSnapshot {
    return this.progress;
  }

  getSettings(): Settings {
    return this.settings;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private commit(): void {
    this.backend.write({ progress: this.progress, settings: this.settings });
    const current = this.listeners.slice();
    for (let i = 0; i < current.length; i += 1) {
      current[i]();
    }
  }

  /** Highest unlocked campaign route: cleared count + 1, capped at the campaign length. */
  nextLevel(): number {
    return Math.min(TOTAL_LEVELS, this.progress.clearedLevels.length + 1);
  }

  isUnlocked(level: number): boolean {
    return level <= this.nextLevel();
  }

  updateSettings(patch: Partial<Settings>): void {
    this.settings = { ...this.settings, ...patch };
    this.commit();
  }

  recordRun(input: RunOutcomeInput): ProgressSnapshot {
    const p = clone(this.progress);

    if (!input.daily && input.outcome === 'win' && p.clearedLevels.indexOf(input.level) < 0) {
      p.clearedLevels = p.clearedLevels.concat(input.level).sort((a, b) => a - b);
    }
    if (!input.daily && input.perfect && p.perfectLevels.indexOf(input.level) < 0) {
      p.perfectLevels = p.perfectLevels.concat(input.level).sort((a, b) => a - b);
    }

    p.totalScore += input.score;
    p.bestScore = Math.max(p.bestScore, input.score);
    // an off-route drop still banks its sparks, so a run never ends with nothing
    p.totalSparks += input.sparks;

    if (input.daily) {
      const today = dateKey();
      p.dailyStreak =
        input.outcome === 'break' ? Math.max(1, p.dailyStreak) : nextStreak(p.dailyStreak, p.lastDailyKey, today);
      p.lastDailyKey = today;
      p.lastDailyScore = input.score;
      p.lastDailyOutcome = input.outcome;
      if (p.dailyHistory.indexOf(today) < 0) {
        p.dailyHistory = p.dailyHistory.concat(today).slice(-14);
      }
      p.longestStreak = Math.max(p.longestStreak, p.dailyStreak);
    }

    const entry: RunLogEntry = {
      level: input.level,
      outcome: input.outcome,
      score: input.score,
      sparks: input.sparks,
      movesUsed: input.movesUsed,
      budget: input.budget,
      daily: input.daily,
    };
    p.runLog = [entry].concat(p.runLog).slice(0, 5);

    this.progress = p;
    this.commit();
    return p;
  }

  dailyPlayedToday(): boolean {
    return this.progress.lastDailyKey === dateKey();
  }

  reset(): void {
    this.progress = clone(INITIAL_PROGRESS);
    this.commit();
  }
}

/** The one store instance of the app. */
export const progressStore = new ProgressStore(new MemoryBackend());
