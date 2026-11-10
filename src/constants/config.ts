/**
 * Cascade Route Lab — tunables.
 * Every magic number of the rig lives here, never inline in a screen.
 */

/** Splash hold. Fixed product contract: exactly 8000 ms, timer driven, no early exit. */
export const LOADER_DURATION_MS = 8000;

/** Rig geometry. */
export const COLS = 5;
export const ROWS = 6;
export const BOARD_PAD = 6;
export const BOARD_BORDER = 2;
export const BOARD_FRAME = BOARD_PAD + BOARD_BORDER; // 8
export const TILE_MIN = 40;
export const TILE_MAX = 72;

/** Campaign shape. */
export const TOTAL_LEVELS = 24;
export const LEVELS_PER_SECTOR = 8;
export const TOTAL_BLUEPRINTS = 12;

/** Economy (fictional lab metrics — no currency, no betting, no real money). */
export const BASE_SCORE = 10;
export const SPARK_VALUE = 15;
export const PERFECT_BONUS = 50;
export const TRACE_COST = 2;

/** Pocket payout strip. */
export const MULT_TARGET = 3.0;
export const MULT_ADJACENT = 1.5;
export const MULT_FAR = 1.0;
export const MULT_BREAK = 0;
export const POCKET_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

/** Timings (ms). */
export const DROP_STEP_MS = 110;
export const DROP_STEP_MS_REDUCED = 60;
export const DROP_TOTAL_CAP_MS = 1600;
export const TRACE_VISIBLE_MS = 2500;
export const ROTATE_MS = 180;
export const FADE_MS = 320;
export const FADE_MS_REDUCED = 140;
export const AUTO_DROP_WARNING_MS = 900;
export const RESULT_DELAY_MS = 420;

/** Board generation. */
export const MAX_GENERATION_ATTEMPTS = 20;
export const WALK_STEP_CAP = ROWS * COLS * 4;
