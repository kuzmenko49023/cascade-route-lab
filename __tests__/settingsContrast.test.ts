import { POCKET_LETTERS } from '../src/constants/config';
import { generateBoard } from '../src/game/board';
import { INITIAL_SETTINGS, MemoryBackend, ProgressStore } from '../src/game/storage';

describe('setting: high-contrast pockets', () => {
  it('is off by default', () => {
    expect(INITIAL_SETTINGS.highContrast).toBe(false);
  });

  it('persists the toggle through the store', () => {
    const store = new ProgressStore(new MemoryBackend());
    store.updateSettings({ highContrast: true });
    expect(store.getSettings().highContrast).toBe(true);
    store.updateSettings({ highContrast: false });
    expect(store.getSettings().highContrast).toBe(false);
  });

  it('gives every pocket a letter tag, so the target is never colour alone', () => {
    expect(POCKET_LETTERS).toHaveLength(5);
    expect(new Set(POCKET_LETTERS).size).toBe(5);
    POCKET_LETTERS.forEach(letter => {
      expect(letter).toMatch(/^[A-E]$/);
    });
  });

  it('always has a target pocket inside the strip to tag', () => {
    for (let level = 1; level <= 24; level += 1) {
      const board = generateBoard(level, 0);
      expect(board.targetCol).toBeGreaterThanOrEqual(0);
      expect(board.targetCol).toBeLessThan(POCKET_LETTERS.length);
      expect(POCKET_LETTERS[board.targetCol]).toBeDefined();
    }
  });
});
