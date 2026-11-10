import {
  BASE_SCORE,
  MULT_ADJACENT,
  MULT_BREAK,
  MULT_FAR,
  MULT_TARGET,
  PERFECT_BONUS,
  SPARK_VALUE,
} from '../constants/config';
import type { Outcome } from './types';

/** The Plinko payout strip: target pocket pays most, neighbours still pay. */
export function pocketMultiplier(landed: number | null, target: number): number {
  if (landed === null) {
    return MULT_BREAK;
  }
  const distance = Math.abs(landed - target);
  if (distance === 0) {
    return MULT_TARGET;
  }
  if (distance === 1) {
    return MULT_ADJACENT;
  }
  return MULT_FAR;
}

export interface RunInput {
  outcome: Outcome;
  sparks: number;
  sparkTotal: number;
  pocket: number | null;
  targetCol: number;
  /** the perfect bonus is disabled while Route Trace runs in ALWAYS ON */
  bonusEnabled: boolean;
}

export interface RunScore {
  score: number;
  multiplier: number;
  perfect: boolean;
}

export function isPerfectRoute(input: RunInput): boolean {
  if (!input.bonusEnabled) {
    return false;
  }
  if (input.outcome !== 'win') {
    return false;
  }
  return input.sparkTotal > 0 && input.sparks >= input.sparkTotal;
}

export function scoreRun(input: RunInput): RunScore {
  const multiplier = pocketMultiplier(input.pocket, input.targetCol);
  if (input.outcome === 'break') {
    return { score: 0, multiplier: MULT_BREAK, perfect: false };
  }
  const perfect = isPerfectRoute(input);
  const base = (BASE_SCORE + input.sparks * SPARK_VALUE) * multiplier;
  const score = Math.round(base) + (perfect ? PERFECT_BONUS : 0);
  return { score, multiplier, perfect };
}

export function perfectBonus(): number {
  return PERFECT_BONUS;
}

/** Outcome titles are in the rig's own words, never "You win" / "Game over". */
export function outcomeTitle(outcome: Outcome): string {
  if (outcome === 'win') {
    return 'ROUTE LOCKED';
  }
  if (outcome === 'partial') {
    return 'OFF ROUTE';
  }
  return 'ROUTE BROKEN';
}
