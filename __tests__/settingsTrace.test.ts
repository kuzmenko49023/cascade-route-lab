import { PERFECT_BONUS } from '../src/constants/config';
import { isPerfectRoute, scoreRun } from '../src/game/scoring';
import { INITIAL_SETTINGS, MemoryBackend, ProgressStore } from '../src/game/storage';

const base = {
  outcome: 'win' as const,
  sparks: 3,
  sparkTotal: 3,
  pocket: 2,
  targetCol: 2,
};

describe('setting: route trace mode', () => {
  it('starts on manual, so the perfect bonus is available', () => {
    expect(INITIAL_SETTINGS.trace).toBe('MANUAL');
  });

  it('awards the perfect bonus while the probe is paid for by hand', () => {
    const manual = scoreRun({ ...base, bonusEnabled: true });
    expect(manual.perfect).toBe(true);
    expect(isPerfectRoute({ ...base, bonusEnabled: true })).toBe(true);
  });

  it('drops the perfect bonus when the route is drawn for free', () => {
    const always = scoreRun({ ...base, bonusEnabled: false });
    const manual = scoreRun({ ...base, bonusEnabled: true });

    expect(always.perfect).toBe(false);
    expect(manual.score - always.score).toBe(PERFECT_BONUS);
  });

  it('persists the choice through the store', () => {
    const store = new ProgressStore(new MemoryBackend());
    store.updateSettings({ trace: 'ALWAYS_ON' });
    expect(store.getSettings().trace).toBe('ALWAYS_ON');
    store.updateSettings({ trace: 'MANUAL' });
    expect(store.getSettings().trace).toBe('MANUAL');
  });

  it('never calls a missed pocket or a half-collected run perfect', () => {
    expect(isPerfectRoute({ ...base, outcome: 'partial', bonusEnabled: true })).toBe(false);
    expect(isPerfectRoute({ ...base, sparks: 1, bonusEnabled: true })).toBe(false);
    expect(isPerfectRoute({ ...base, sparkTotal: 0, sparks: 0, bonusEnabled: true })).toBe(false);
  });
});
