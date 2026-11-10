import type { ProgressSnapshot } from './types';

export type Rarity = 'COMMON' | 'RARE' | 'PROTOTYPE';

export interface Blueprint {
  id: string;
  name: string;
  rarity: Rarity;
  condition: string;
  flavour: string;
  unlocked: (p: ProgressSnapshot) => boolean;
}

function clearedCount(p: ProgressSnapshot): number {
  return p.clearedLevels.length;
}

/** Twelve rig blueprints, unlocked by real progress, never by a timer. */
export const BLUEPRINTS: Blueprint[] = [
  {
    id: 'bp-01',
    name: 'FUNNEL MK I',
    rarity: 'COMMON',
    condition: 'CLEAR ROUTE 1',
    flavour: 'The first intake ever cut on the bench. Still the quietest one.',
    unlocked: p => clearedCount(p) >= 1,
  },
  {
    id: 'bp-02',
    name: 'ELBOW CORE',
    rarity: 'COMMON',
    condition: 'CLEAR 3 ROUTES',
    flavour: 'A quarter turn that costs nothing and changes everything.',
    unlocked: p => clearedCount(p) >= 3,
  },
  {
    id: 'bp-03',
    name: 'SPARK TAP',
    rarity: 'COMMON',
    condition: 'BANK 10 SPARKS',
    flavour: 'Taps charge off the orb as it passes. Harmless. Mostly.',
    unlocked: p => p.totalSparks >= 10,
  },
  {
    id: 'bp-04',
    name: 'RIVET PLATE',
    rarity: 'COMMON',
    condition: 'CLEAR 5 ROUTES',
    flavour: 'Sealed at the factory, because somebody kept turning it.',
    unlocked: p => clearedCount(p) >= 5,
  },
  {
    id: 'bp-05',
    name: 'PEG LATTICE',
    rarity: 'RARE',
    condition: 'CLEAR SECTOR 1',
    flavour: 'The old cascade wall. Beautiful, useless, still bolted on.',
    unlocked: p => clearedCount(p) >= 8,
  },
  {
    id: 'bp-06',
    name: 'TRACE PROBE',
    rarity: 'RARE',
    condition: 'BANK 40 SPARKS',
    flavour: 'Buys you a look down the channel. The budget pays for it.',
    unlocked: p => p.totalSparks >= 40,
  },
  {
    id: 'bp-07',
    name: 'CHROME ORB',
    rarity: 'RARE',
    condition: 'SCORE 400 IN ONE RUN',
    flavour: 'Machined to a tolerance nobody on this bench can measure.',
    unlocked: p => p.bestScore >= 400,
  },
  {
    id: 'bp-08',
    name: 'TURBULENCE VANE',
    rarity: 'RARE',
    condition: 'CLEAR 12 ROUTES',
    flavour: 'Sector 2 bends the fall. The vane bends it back.',
    unlocked: p => clearedCount(p) >= 12,
  },
  {
    id: 'bp-09',
    name: 'POCKET ARRAY',
    rarity: 'RARE',
    condition: 'CLEAR SECTOR 2',
    flavour: 'Five chutes, one of them worth three times the rest.',
    unlocked: p => clearedCount(p) >= 16,
  },
  {
    id: 'bp-10',
    name: 'PERFECT GASKET',
    rarity: 'PROTOTYPE',
    condition: 'LOCK 3 PERFECT ROUTES',
    flavour: 'Every spark collected, every port aligned. No leaks.',
    unlocked: p => p.perfectLevels.length >= 3,
  },
  {
    id: 'bp-11',
    name: 'DEEP CASCADE',
    rarity: 'PROTOTYPE',
    condition: 'CLEAR 20 ROUTES',
    flavour: 'The bench runs six storeys down. This is the schematic.',
    unlocked: p => clearedCount(p) >= 20,
  },
  {
    id: 'bp-12',
    name: 'LAB MASTER KEY',
    rarity: 'PROTOTYPE',
    condition: 'CLEAR ALL 24 ROUTES',
    flavour: 'It opens the bench. Nobody told you what is under it.',
    unlocked: p => clearedCount(p) >= 24,
  },
];

export function unlockedBlueprints(p: ProgressSnapshot): Blueprint[] {
  return BLUEPRINTS.filter(b => b.unlocked(p));
}

export function unlockedCount(p: ProgressSnapshot): number {
  return unlockedBlueprints(p).length;
}

/** Blueprints that flipped from locked to unlocked between two snapshots. */
export function newlyUnlocked(before: ProgressSnapshot, after: ProgressSnapshot): Blueprint[] {
  return BLUEPRINTS.filter(b => !b.unlocked(before) && b.unlocked(after));
}
