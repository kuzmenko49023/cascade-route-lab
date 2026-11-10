import { backTargetOf, isHubScreen, screenForRoute } from '../src/game/navigation';

describe('hub navigation', () => {
  it('maps every bento tile of the hub to its screen', () => {
    expect(screenForRoute('game')).toBe('game');
    expect(screenForRoute('challenge')).toBe('challenge');
    expect(screenForRoute('progress')).toBe('progress');
    expect(screenForRoute('collection')).toBe('collection');
    expect(screenForRoute('daily')).toBe('daily');
    expect(screenForRoute('settings')).toBe('settings');
  });

  it('returns every secondary screen to the hub on Back', () => {
    expect(backTargetOf('settings', 'menu')).toBe('menu');
    expect(backTargetOf('collection', 'menu')).toBe('menu');
    expect(backTargetOf('progress', 'menu')).toBe('menu');
  });

  it('returns a round to the screen that started it', () => {
    expect(backTargetOf('game', 'challenge')).toBe('challenge');
    expect(backTargetOf('result', 'daily')).toBe('daily');
    expect(backTargetOf('game', 'menu')).toBe('menu');
  });

  it('closes the app on Back from the hub and never returns to the splash', () => {
    expect(backTargetOf('menu', 'menu')).toBeNull();
    expect(backTargetOf('loader', 'menu')).toBeNull();
  });

  it('knows which screens can own a round', () => {
    expect(isHubScreen('menu')).toBe(true);
    expect(isHubScreen('challenge')).toBe(true);
    expect(isHubScreen('daily')).toBe(true);
    expect(isHubScreen('result')).toBe(false);
  });
});
