import { COLS, MAX_GENERATION_ATTEMPTS, ROWS } from '../constants/config';
import { cwDistance, kindForPorts, opposite, periodOf, stepFrom } from './ports';
import { mulberry32, randInt, seedFor, shuffle } from './rng';
import { isSolvable } from './solver';
import { dailyParams, paramsFor, type SectorParams } from './levels';
import type { Board, Cell, CellRef, Dir } from './types';

function blankCell(): Cell {
  return { kind: 'PEG', turns: 0, solution: 0, sealed: false, spark: false, onPath: false };
}

function emptyGrid(): Cell[][] {
  const grid: Cell[][] = [];
  for (let r = 0; r < ROWS; r += 1) {
    const row: Cell[] = [];
    for (let c = 0; c < COLS; c += 1) {
      row.push(blankCell());
    }
    grid.push(row);
  }
  return grid;
}

/** Non-revisiting descent: one contiguous horizontal run per row, then a step down. */
function carvePath(rand: () => number, launchCol: number, targetCol: number): CellRef[] {
  const path: CellRef[] = [];
  let col = launchCol;
  for (let row = 0; row < ROWS; row += 1) {
    const dest = row === ROWS - 1 ? targetCol : randInt(rand, 0, COLS - 1);
    path.push({ row, col });
    const dir = dest > col ? 1 : -1;
    while (col !== dest) {
      col += dir;
      path.push({ row, col });
    }
  }
  return path;
}

function travelDirs(path: CellRef[]): { entry: Dir[]; exit: Dir[] } {
  const entry: Dir[] = [];
  const exit: Dir[] = [];
  for (let i = 0; i < path.length; i += 1) {
    const cur = path[i];
    const next = i + 1 < path.length ? path[i + 1] : null;
    let out: Dir;
    if (!next) {
      out = 'S';
    } else if (next.row > cur.row) {
      out = 'S';
    } else if (next.col > cur.col) {
      out = 'E';
    } else {
      out = 'W';
    }
    exit.push(out);
    entry.push(i === 0 ? 'S' : exit[i - 1]);
  }
  return { entry, exit };
}

function buildBoard(level: number, seed: number, params: SectorParams): Board {
  const rand = mulberry32(seed);
  const launchCol = randInt(rand, 0, COLS - 1);
  const targetCol = randInt(rand, 0, COLS - 1);
  const path = carvePath(rand, launchCol, targetCol);
  const dirs = travelDirs(path);
  const cells = emptyGrid();

  // 1. the designed channel
  for (let i = 0; i < path.length; i += 1) {
    const ref = path[i];
    const entryPort = opposite(dirs.entry[i]);
    const exitPort = dirs.exit[i];
    const shape = kindForPorts(entryPort, exitPort);
    const cell = cells[ref.row][ref.col];
    cell.kind = shape.kind;
    cell.solution = shape.turns;
    cell.turns = shape.turns;
    cell.onPath = true;
    // a few straight runs become fixed crossings: free to pass, but one choice fewer
    if (shape.kind === 'STRAIGHT' && rand() < 0.12) {
      cell.kind = 'CROSS';
      cell.solution = 0;
      cell.turns = 0;
    }
  }

  // 2. decoy rotors and plinko pegs on everything the channel does not use
  const free: CellRef[] = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      if (!cells[r][c].onPath) {
        free.push({ row: r, col: c });
      }
    }
  }
  const spare = shuffle(rand, free);
  const pegCount = Math.min(spare.length, randInt(rand, params.pegsMin, params.pegsMax));
  for (let i = 0; i < spare.length; i += 1) {
    const ref = spare[i];
    const cell = cells[ref.row][ref.col];
    if (i < pegCount) {
      cell.kind = 'PEG';
      cell.turns = 0;
      cell.solution = 0;
    } else {
      cell.kind = rand() < 0.45 ? 'STRAIGHT' : 'ELBOW';
      cell.turns = randInt(rand, 0, periodOf(cell.kind) - 1);
      cell.solution = cell.turns;
    }
  }

  // 3. spark nodes on the channel, never on the launch cell
  const sparkCandidates = shuffle(rand, path.slice(1));
  const sparkCount = Math.min(sparkCandidates.length, params.sparks);
  for (let i = 0; i < sparkCount; i += 1) {
    const ref = sparkCandidates[i];
    cells[ref.row][ref.col].spark = true;
  }

  // 4. sealed rotors, frozen AT their solution rotation so the rig stays solvable
  const sealable = shuffle(rand, path.slice(1, Math.max(1, path.length - 1))).filter(ref => {
    const k = cells[ref.row][ref.col].kind;
    return k === 'STRAIGHT' || k === 'ELBOW';
  });
  const sealCount = Math.min(sealable.length, randInt(rand, params.sealedMin, params.sealedMax));
  for (let i = 0; i < sealCount; i += 1) {
    const ref = sealable[i];
    const cell = cells[ref.row][ref.col];
    cell.sealed = true;
    cell.turns = cell.solution;
  }

  // 5. scramble every rotor the player is allowed to turn
  for (let i = 0; i < path.length; i += 1) {
    const ref = path[i];
    const cell = cells[ref.row][ref.col];
    const p = periodOf(cell.kind);
    if (cell.sealed || p <= 1) {
      continue;
    }
    cell.turns = cell.solution + randInt(rand, 1, p - 1);
  }

  // 6. budget = minimum CW turns + sector slack
  let minTurns = 0;
  for (let i = 0; i < path.length; i += 1) {
    const ref = path[i];
    minTurns += cwDistance(cells[ref.row][ref.col]);
  }

  return {
    cells,
    launchCol,
    targetCol,
    budget: minTurns + params.slack,
    sparkTotal: sparkCount,
    seed,
    level,
  };
}

/**
 * A guaranteed rig: one vertical channel down the middle column. It exists so a
 * pathological seed can never leave the player without a solvable board. It is
 * a safety net, not the game.
 */
export function makeFallbackBoard(level: number, seed: number): Board {
  const cells = emptyGrid();
  const col = Math.floor(COLS / 2);
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      const cell = cells[r][c];
      if (c === col) {
        cell.kind = 'STRAIGHT';
        cell.solution = 0;
        cell.turns = 1;
        cell.onPath = true;
        cell.spark = r === 2 || r === 4;
      } else {
        cell.kind = (r + c) % 3 === 0 ? 'PEG' : 'ELBOW';
        cell.turns = (r + c) % 4;
        cell.solution = cell.turns;
      }
    }
  }
  return {
    cells,
    launchCol: col,
    targetCol: col,
    budget: ROWS + 2,
    sparkTotal: 2,
    seed,
    level,
  };
}

export const FALLBACK_BOARD: Board = makeFallbackBoard(1, 0);

function generateWithParams(
  level: number,
  attempt: number,
  params: SectorParams,
  baseSeed?: number,
): Board {
  for (let i = 0; i < MAX_GENERATION_ATTEMPTS; i += 1) {
    const seed =
      baseSeed === undefined
        ? seedFor(level, attempt + i)
        : (baseSeed ^ (i * 2654435761)) >>> 0;
    const board = buildBoard(level, seed, params);
    if (isSolvable(board)) {
      return board;
    }
  }
  return makeFallbackBoard(level, baseSeed === undefined ? seedFor(level, attempt) : baseSeed);
}

/** Campaign rig for a level and attempt number. */
export function generateBoard(level: number, attempt: number): Board {
  return generateWithParams(level, attempt, paramsFor(level));
}

/** Date-seeded rig: the same calendar day always rebuilds the same board. */
export function generateDailyBoard(dateSeed: number): Board {
  return generateWithParams(0, 0, dailyParams(), dateSeed);
}

export function cloneBoard(board: Board): Board {
  return { ...board, cells: board.cells.map(row => row.map(cell => ({ ...cell }))) };
}

export function neighbourOf(row: number, col: number, dir: Dir): CellRef {
  return stepFrom(row, col, dir);
}
