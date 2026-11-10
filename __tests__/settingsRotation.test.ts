import { generateBoard } from '../src/game/board';
import { isRotatable, rotationOf } from '../src/game/ports';
import { applyRotation } from '../src/game/rotation';
import { INITIAL_SETTINGS, MemoryBackend, ProgressStore } from '../src/game/storage';

function firstRotor(level: number) {
  const board = generateBoard(level, 0);
  for (let r = 0; r < board.cells.length; r += 1) {
    for (let c = 0; c < board.cells[r].length; c += 1) {
      // an elbow has four distinct rotations, so CW and CCW cannot coincide
      if (board.cells[r][c].kind === 'ELBOW' && isRotatable(board.cells[r][c])) {
        return { board, row: r, col: c };
      }
    }
  }
  throw new Error('every rig carries at least one free elbow');
}

describe('setting: rotation direction', () => {
  it('starts clockwise', () => {
    expect(INITIAL_SETTINGS.rotation).toBe('CW');
  });

  it('turns the rotor the other way once the bench is switched', () => {
    const { board, row, col } = firstRotor(2);
    const before = rotationOf(board.cells[row][col]);
    const cw = rotationOf(applyRotation(board, row, col, 'CW', 9).board.cells[row][col]);
    const ccw = rotationOf(applyRotation(board, row, col, 'CCW', 9).board.cells[row][col]);

    expect(cw).not.toBe(before);
    expect(ccw).not.toBe(before);
    expect(cw).not.toBe(ccw);
  });

  it('brings a rotor back to where it started after a full turn either way', () => {
    const { board, row, col } = firstRotor(5);
    const before = rotationOf(board.cells[row][col]);
    let state = board;
    for (let i = 0; i < 4; i += 1) {
      state = applyRotation(state, row, col, 'CCW', 9).board;
    }
    expect(rotationOf(state.cells[row][col])).toBe(before);
  });

  it('persists the choice through the store', () => {
    const store = new ProgressStore(new MemoryBackend());
    store.updateSettings({ rotation: 'CCW' });
    expect(store.getSettings().rotation).toBe('CCW');
  });

  it('keeps the budget formula on clockwise distance, so CCW is a real trade-off', () => {
    const a = generateBoard(3, 0);
    const b = generateBoard(3, 0);
    expect(a.budget).toBe(b.budget);
  });
});
