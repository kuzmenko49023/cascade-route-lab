import { useMemo } from 'react';
import { generateDailyBoard } from '../game/board';
import { dateKey, seedForDate, timeUntilNextRig, weekDots } from '../game/dailySeed';
import type { ProgressSnapshot } from '../game/types';

/** Today's date-seeded rig plus everything the Daily screen shows about it. */
export function useDailyBoard(progress: ProgressSnapshot) {
  const todayKey = useMemo(() => dateKey(), []);
  const seed = useMemo(() => seedForDate(todayKey), [todayKey]);
  const board = useMemo(() => generateDailyBoard(seed), [seed]);
  const dots = useMemo(() => weekDots(progress.dailyHistory, todayKey), [progress.dailyHistory, todayKey]);
  const countdown = useMemo(() => timeUntilNextRig(), []);
  const playedToday = progress.lastDailyKey === todayKey;

  return { todayKey, seed, board, dots, countdown, playedToday };
}
