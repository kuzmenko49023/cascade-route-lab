/** YYYYMMDD for a calendar day, used both as the daily seed and as its key. */
export function dateKey(date: Date = new Date()): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return y * 10000 + m * 100 + d;
}

export function seedForDate(key: number): number {
  return (key * 7919) >>> 0;
}

/** Calendar days between two YYYYMMDD keys (0 when either is missing). */
export function daysBetween(fromKey: number, toKey: number): number {
  if (!fromKey || !toKey) {
    return 0;
  }
  const a = keyToDate(fromKey).getTime();
  const b = keyToDate(toKey).getTime();
  return Math.round((b - a) / 86400000);
}

export function keyToDate(key: number): Date {
  const y = Math.floor(key / 10000);
  const m = Math.floor((key % 10000) / 100);
  const d = key % 100;
  return new Date(y, m - 1, d);
}

export function shiftKey(key: number, deltaDays: number): number {
  const date = keyToDate(key);
  date.setDate(date.getDate() + deltaDays);
  return dateKey(date);
}

/** Streak rule: next calendar day keeps the streak, a gap resets it to 1. */
export function nextStreak(previousStreak: number, lastKey: number, todayKey: number): number {
  if (!lastKey) {
    return 1;
  }
  const gap = daysBetween(lastKey, todayKey);
  if (gap === 0) {
    return Math.max(1, previousStreak);
  }
  if (gap === 1) {
    return previousStreak + 1;
  }
  return 1;
}

/** Hours and minutes left until the next rig is cut, for the "NEXT RIG IN" line. */
export function timeUntilNextRig(now: Date = new Date()): { hours: number; minutes: number } {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  const ms = Math.max(0, next.getTime() - now.getTime());
  return { hours: Math.floor(ms / 3600000), minutes: Math.floor((ms % 3600000) / 60000) };
}

/** Seven calendar days ending today, flagged with whether the rig was run. */
export function weekDots(history: number[], todayKey: number): boolean[] {
  const out: boolean[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const key = shiftKey(todayKey, -i);
    out.push(history.indexOf(key) >= 0);
  }
  return out;
}
