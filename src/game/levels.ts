import { LEVELS_PER_SECTOR, TOTAL_LEVELS } from '../constants/config';

export interface SectorParams {
  index: number;
  name: string;
  pegsMin: number;
  pegsMax: number;
  sealedMin: number;
  sealedMax: number;
  sparks: number;
  slack: number;
}

export const SECTORS: SectorParams[] = [
  {
    index: 1,
    name: 'SECTOR 1 CALIBRATION',
    pegsMin: 2,
    pegsMax: 4,
    sealedMin: 0,
    sealedMax: 1,
    sparks: 2,
    slack: 4,
  },
  {
    index: 2,
    name: 'SECTOR 2 TURBULENCE',
    pegsMin: 4,
    pegsMax: 6,
    sealedMin: 1,
    sealedMax: 2,
    sparks: 3,
    slack: 3,
  },
  {
    index: 3,
    name: 'SECTOR 3 DEEP CASCADE',
    pegsMin: 6,
    pegsMax: 8,
    sealedMin: 2,
    sealedMax: 3,
    sparks: 4,
    slack: 2,
  },
];

/** 1-based level index to 1-based sector index. */
export function sectorOf(level: number): number {
  const clamped = Math.max(1, Math.min(TOTAL_LEVELS, level));
  return Math.floor((clamped - 1) / LEVELS_PER_SECTOR) + 1;
}

export function paramsFor(level: number): SectorParams {
  return SECTORS[sectorOf(level) - 1];
}

/** Daily rigs always run on sector-2 turbulence parameters. */
export function dailyParams(): SectorParams {
  return SECTORS[1];
}

export function routeInSector(level: number): number {
  const clamped = Math.max(1, Math.min(TOTAL_LEVELS, level));
  return ((clamped - 1) % LEVELS_PER_SECTOR) + 1;
}

export function levelsOfSector(sector: number): number[] {
  const first = (sector - 1) * LEVELS_PER_SECTOR + 1;
  const out: number[] = [];
  for (let i = 0; i < LEVELS_PER_SECTOR; i += 1) {
    out.push(first + i);
  }
  return out;
}
