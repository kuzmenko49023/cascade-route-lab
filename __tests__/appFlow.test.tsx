import React from 'react';
import renderer, { act } from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-linear-gradient', () => 'LinearGradient');
// react-test-renderer has no native view tree, so the native driver cannot
// attach: swap RN's animation drivers for its own no-op mock, keep its components.
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const real = jest.requireActual('react-native/Libraries/Animated/Animated');
  const mock = jest.requireActual('react-native/Libraries/Animated/AnimatedMock');
  const realApi = real.default || real;
  const mockApi = mock.default || mock;
  return { __esModule: true, default: { ...realApi, ...mockApi } };
});

function texts(tree: renderer.ReactTestRenderer): string[] {
  const out: string[] = [];
  const walk = (n: any) => {
    if (typeof n === 'string') { out.push(n); return; }
    if (!n || !n.children) {
      return;
    }
    n.children.forEach(walk);
  };
  const json = tree.toJSON();
  if (json) { (Array.isArray(json) ? json : [json]).forEach(walk); }
  return out;
}

it('walks loader to menu and into every hub screen without crashing', () => {
  jest.useFakeTimers();
  let tree!: renderer.ReactTestRenderer;
  act(() => { tree = renderer.create(<App />); });
  expect(texts(tree).join(' ')).toContain('LOADING');

  act(() => { jest.advanceTimersByTime(8100); });
  const menu = texts(tree).join(' ');
  expect(menu).toContain('PLAY');
  expect(menu).toContain('SETTINGS');

  const tiles = ['CHALLENGE', 'DAILY MODE', 'PROGRESS', 'COLLECTION', 'SETTINGS'];
  tiles.forEach(caption => {
    const tile = tree.root.findAll(
      n => n.props && n.props.accessibilityLabel === caption && typeof n.props.onPress === 'function',
    )[0];
    act(() => { tile.props.onPress(); });
    act(() => { jest.advanceTimersByTime(400); });
    const back = tree.root.findAll(
      n => n.props && n.props.accessibilityLabel === 'MENU' && typeof n.props.onPress === 'function',
    )[0];
    expect(back).toBeDefined();
    act(() => { back.props.onPress(); });
    act(() => { jest.advanceTimersByTime(400); });
  });
  jest.useRealTimers();
});

it('plays a round through to the result screen and back to the menu', () => {
  jest.useFakeTimers();
  let tree!: renderer.ReactTestRenderer;
  act(() => { tree = renderer.create(<App />); });
  act(() => { jest.advanceTimersByTime(8100); });

  const play = tree.root.findAll(
    n => n.props && n.props.accessibilityLabel === 'PLAY' && typeof n.props.onPress === 'function',
  )[0];
  act(() => { play.props.onPress(); });
  act(() => { jest.advanceTimersByTime(400); });
  expect(texts(tree).join(' ')).toContain('ROTATIONS');

  // a tap on a rotor must change the board state
  const rotor = tree.root.findAll(
    n => n.props && typeof n.props.accessibilityLabel === 'string' &&
         n.props.accessibilityLabel.indexOf('rotor') === 0 && typeof n.props.onPress === 'function',
  );
  expect(rotor.length).toBeGreaterThan(10);
  const before = texts(tree).join(' ');
  act(() => { rotor[7].props.onPress(); });
  act(() => { jest.advanceTimersByTime(300); });
  expect(texts(tree).join(' ')).not.toBe(before);

  const drop = tree.root.findAll(
    n => n.props && n.props.accessibilityLabel === 'DROP' && typeof n.props.onPress === 'function',
  )[0];
  act(() => { drop.props.onPress(); });
  act(() => { jest.advanceTimersByTime(4000); });

  const result = texts(tree).join(' ');
  expect(result).toContain('DROP AGAIN');
  expect(/ROUTE LOCKED|OFF ROUTE|ROUTE BROKEN/.test(result)).toBe(true);

  const menu = tree.root.findAll(
    n => n.props && n.props.accessibilityLabel === 'MENU' && typeof n.props.onPress === 'function',
  )[0];
  act(() => { menu.props.onPress(); });
  act(() => { jest.advanceTimersByTime(400); });
  expect(texts(tree).join(' ')).toContain('PLAY');
  jest.useRealTimers();
});
