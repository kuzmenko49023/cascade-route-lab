import { generateDailyBoard } from '../src/game/board';
import {
  dateKey,
  daysBetween,
  nextStreak,
  seedForDate,
  shiftKey,
  timeUntilNextRig,
  weekDots,
} from '../src/game/dailySeed';

describe('the daily rig', () => {
  it('keys a calendar day as YYYYMMDD', () => {
    expect(dateKey(new Date(2026, 10, 10))).toBe(20261110);
    expect(dateKey(new Date(2027, 0, 1))).toBe(20270101);
  });

  it('cuts the same rig for the same day and a different one tomorrow', () => {
    const today = seedForDate(20261110);
    const tomorrow = seedForDate(20261111);
    const a = generateDailyBoard(today);
    const b = generateDailyBoard(today);
    const c = generateDailyBoard(tomorrow);

    expect(b.targetCol).toBe(a.targetCol);
    expect(b.launchCol).toBe(a.launchCol);
    expect(b.budget).toBe(a.budget);
    expect(today).not.toBe(tomorrow);
    expect(JSON.stringify(c.cells)).not.toBe(JSON.stringify(a.cells));
  });

  it('counts calendar days between two keys across a month boundary', () => {
    expect(daysBetween(20261130, 20261201)).toBe(1);
    expect(daysBetween(20261110, 20261110)).toBe(0);
    expect(daysBetween(0, 20261110)).toBe(0);
  });

  it('keeps the streak on the next day and resets it after a gap', () => {
    expect(nextStreak(0, 0, 20261110)).toBe(1);
    expect(nextStreak(4, 20261109, 20261110)).toBe(5);
    expect(nextStreak(4, 20261110, 20261110)).toBe(4);
    expect(nextStreak(4, 20261101, 20261110)).toBe(1);
  });

  it('builds a seven day ribbon that ends on today', () => {
    const today = 20261110;
    const dots = weekDots([shiftKey(today, -1), today], today);
    expect(dots).toHaveLength(7);
    expect(dots[6]).toBe(true);
    expect(dots[5]).toBe(true);
    expect(dots[0]).toBe(false);
  });

  it('counts down to midnight, never below zero', () => {
    const left = timeUntilNextRig(new Date(2026, 10, 10, 22, 30, 0));
    expect(left.hours).toBe(1);
    expect(left.minutes).toBe(30);
  });
});
