/** Compass port of a rotor cell. The orb travels between ports. */
export type Dir = 'N' | 'E' | 'S' | 'W';

/**
 * Rotor kinds. `sealed` and `spark` are flags on top of a kind, not kinds of
 * their own, so a sealed elbow still resolves its ports the normal way.
 */
export type CellKind = 'STRAIGHT' | 'ELBOW' | 'CROSS' | 'PEG';

export interface Cell {
  kind: CellKind;
  /** cumulative quarter turns; the live rotation is turns % period */
  turns: number;
  /** turns value that completes the designed channel */
  solution: number;
  /** riveted at its solution rotation — taps are refused and cost nothing */
  sealed: boolean;
  /** carries a spark node, collected when the orb traverses the cell */
  spark: boolean;
  /** part of the designed route (used by the generator, not shown to the player) */
  onPath: boolean;
}

export interface Board {
  cells: Cell[][];
  launchCol: number;
  targetCol: number;
  /** rotation budget = minimum CW turns + sector slack */
  budget: number;
  sparkTotal: number;
  seed: number;
  level: number;
}

export type Outcome = 'win' | 'partial' | 'break';

export interface CellRef {
  row: number;
  col: number;
}

export interface RouteResult {
  /** cells the orb visits, in order */
  path: CellRef[];
  /** spark cells actually traversed */
  sparks: number;
  outcome: Outcome;
  /** the cell the channel dies in, when the outcome is a break */
  breakCell: CellRef | null;
  /** landing pocket column, null on a break */
  pocket: number | null;
}

export type RotationDirection = 'CW' | 'CCW';
export type TraceMode = 'MANUAL' | 'ALWAYS_ON';

export interface Settings {
  rotation: RotationDirection;
  trace: TraceMode;
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface RunLogEntry {
  level: number;
  outcome: Outcome;
  score: number;
  sparks: number;
  movesUsed: number;
  budget: number;
  daily: boolean;
}

export interface ProgressSnapshot {
  clearedLevels: number[];
  perfectLevels: number[];
  totalScore: number;
  bestScore: number;
  totalSparks: number;
  longestStreak: number;
  dailyStreak: number;
  /** YYYYMMDD of the last finished daily attempt, 0 when never played */
  lastDailyKey: number;
  lastDailyScore: number;
  lastDailyOutcome: Outcome | null;
  /** last 7 calendar keys that were played, newest last */
  dailyHistory: number[];
  runLog: RunLogEntry[];
}

export type GameMode = 'campaign' | 'daily';
