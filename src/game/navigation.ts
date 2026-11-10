import type { MenuRoute } from '../screens/MenuScreen';

/** The whole app in one union. There is no navigation library anywhere. */
export type Screen =
  | 'loader'
  | 'menu'
  | 'game'
  | 'result'
  | 'challenge'
  | 'progress'
  | 'collection'
  | 'daily'
  | 'settings';

/** Where a bento tile of the hub leads. */
export function screenForRoute(route: MenuRoute): Screen {
  return route as Screen;
}

/**
 * System Back: forward navigation pushes, Back returns to the screen that
 * opened the current one, and Back on the hub closes the app. The splash is
 * never on the stack, so it can never be returned to.
 */
export function backTargetOf(screen: Screen, origin: Screen): Screen | null {
  if (screen === 'menu' || screen === 'loader') {
    return null;
  }
  if (screen === 'game' || screen === 'result') {
    return origin === 'game' ? 'menu' : origin;
  }
  return 'menu';
}

/** Screens that own the back stack entry a round was started from. */
export function isHubScreen(screen: Screen): boolean {
  return screen === 'menu' || screen === 'challenge' || screen === 'daily';
}
