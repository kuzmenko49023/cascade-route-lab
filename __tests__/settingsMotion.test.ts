import {
  DROP_STEP_MS,
  DROP_STEP_MS_REDUCED,
  DROP_TOTAL_CAP_MS,
  FADE_MS,
  FADE_MS_REDUCED,
} from '../src/constants/config';
import { INITIAL_SETTINGS, MemoryBackend, ProgressStore } from '../src/game/storage';

describe('setting: reduced motion', () => {
  it('is off by default', () => {
    expect(INITIAL_SETTINGS.reducedMotion).toBe(false);
  });

  it('shortens the drop step and the screen transition', () => {
    expect(DROP_STEP_MS_REDUCED).toBeLessThan(DROP_STEP_MS);
    expect(FADE_MS_REDUCED).toBeLessThan(FADE_MS);
  });

  it('keeps the whole drop inside its cap in both modes', () => {
    const cells = 30;
    expect(Math.min(DROP_STEP_MS, DROP_TOTAL_CAP_MS / cells) * cells).toBeLessThanOrEqual(
      DROP_TOTAL_CAP_MS,
    );
    expect(DROP_STEP_MS_REDUCED * cells).toBeGreaterThan(0);
  });

  it('persists the toggle through the store', () => {
    const store = new ProgressStore(new MemoryBackend());
    store.updateSettings({ reducedMotion: true });
    expect(store.getSettings().reducedMotion).toBe(true);
    store.updateSettings({ reducedMotion: false });
    expect(store.getSettings().reducedMotion).toBe(false);
  });

  it('leaves every other setting alone when only motion changes', () => {
    const store = new ProgressStore(new MemoryBackend());
    store.updateSettings({ rotation: 'CCW', highContrast: true });
    store.updateSettings({ reducedMotion: true });
    const s = store.getSettings();

    expect(s.rotation).toBe('CCW');
    expect(s.highContrast).toBe(true);
    expect(s.reducedMotion).toBe(true);
  });
});
