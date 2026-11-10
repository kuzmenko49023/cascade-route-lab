import type { Cell, CellKind, Dir } from './types';

export const DIR_ORDER: Dir[] = ['N', 'E', 'S', 'W'];

const BASE_PORTS: Record<CellKind, Dir[]> = {
  STRAIGHT: ['N', 'S'],
  ELBOW: ['N', 'E'],
  CROSS: ['N', 'E', 'S', 'W'],
  PEG: [],
};

/** Quarter turns before a kind repeats itself. */
export function periodOf(kind: CellKind): number {
  if (kind === 'STRAIGHT') {
    return 2;
  }
  if (kind === 'ELBOW') {
    return 4;
  }
  return 1;
}

export function isRotatable(cell: Cell): boolean {
  if (cell.sealed) {
    return false;
  }
  return cell.kind === 'STRAIGHT' || cell.kind === 'ELBOW';
}

export function rotateDir(dir: Dir, quarterTurns: number): Dir {
  const i = DIR_ORDER.indexOf(dir);
  const n = ((i + quarterTurns) % 4 + 4) % 4;
  return DIR_ORDER[n];
}

export function opposite(dir: Dir): Dir {
  return rotateDir(dir, 2);
}

export function rotationOf(cell: Cell): number {
  const p = periodOf(cell.kind);
  return ((cell.turns % p) + p) % p;
}

/** The open ports of a cell at its current rotation. */
export function portsOf(cell: Cell): Dir[] {
  const base = BASE_PORTS[cell.kind];
  const r = rotationOf(cell);
  return base.map(d => rotateDir(d, r));
}

export function hasPort(cell: Cell, dir: Dir): boolean {
  return portsOf(cell).indexOf(dir) >= 0;
}

/** Degrees the cell artwork is drawn at — one quarter turn per tap, always 90deg. */
export function degreesOf(cell: Cell): number {
  return cell.turns * 90;
}

/** CW quarter turns needed to get from the live rotation to the solution. */
export function cwDistance(cell: Cell): number {
  const p = periodOf(cell.kind);
  if (p <= 1 || cell.sealed) {
    return 0;
  }
  const from = ((cell.turns % p) + p) % p;
  const to = ((cell.solution % p) + p) % p;
  return (to - from + p) % p;
}

/** The smallest kind + turns that connects two ports of a cell. */
export function kindForPorts(a: Dir, b: Dir): { kind: CellKind; turns: number } {
  if (a === b) {
    return { kind: 'CROSS', turns: 0 };
  }
  if (opposite(a) === b) {
    // straight: base N,S -> one quarter turn maps it to E,W
    const vertical = a === 'N' || a === 'S';
    return { kind: 'STRAIGHT', turns: vertical ? 0 : 1 };
  }
  for (let t = 0; t < 4; t += 1) {
    const p0 = rotateDir('N', t);
    const p1 = rotateDir('E', t);
    const matches = (p0 === a && p1 === b) || (p0 === b && p1 === a);
    if (matches) {
      return { kind: 'ELBOW', turns: t };
    }
  }
  return { kind: 'ELBOW', turns: 0 };
}

export function stepFrom(row: number, col: number, dir: Dir): { row: number; col: number } {
  if (dir === 'N') {
    return { row: row - 1, col };
  }
  if (dir === 'S') {
    return { row: row + 1, col };
  }
  if (dir === 'E') {
    return { row, col: col + 1 };
  }
  return { row, col: col - 1 };
}
