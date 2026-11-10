import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, StatusBar, StyleSheet, View } from 'react-native';
import { FADE_MS, FADE_MS_REDUCED } from './src/constants/config';
import { theme } from './src/constants/theme';
import { newlyUnlocked } from './src/game/blueprints';
import { dateKey, seedForDate } from './src/game/dailySeed';
import { backTargetOf, screenForRoute, type Screen } from './src/game/navigation';
import { progressStore } from './src/game/storage';
import type { GameMode } from './src/game/types';
import { useProgressStore } from './src/hooks/useProgressStore';
import { ChallengeScreen } from './src/screens/ChallengeScreen';
import { CollectionScreen } from './src/screens/CollectionScreen';
import { DailyModeScreen } from './src/screens/DailyModeScreen';
import { GameScreen, type RoundResult } from './src/screens/GameScreen';
import { LoaderScreen } from './src/screens/LoaderScreen';
import { MenuScreen, type MenuRoute } from './src/screens/MenuScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

/**
 * Cross-fade between screens. box-none so the animated wrapper can never
 * swallow a tap meant for the button underneath it.
 */
function Fader({ duration, children }: { duration: number; children: React.ReactNode }) {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(fade, { toValue: 1, duration, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [duration, fade]);

  return (
    <Animated.View pointerEvents="box-none" style={[styles.fill, { opacity: fade }]}>
      {children}
    </Animated.View>
  );
}

/**
 * The state machine of the app: one owner of the current screen, no navigation
 * library, every screen reachable in one tap from the hub and every screen with
 * a way back to it.
 */
function App(): React.JSX.Element {
  const { settings, recordRun, nextLevel } = useProgressStore();

  const [screen, setScreen] = useState<Screen>('loader');
  /** the hub screen a round was started from, so MENU and Back come home right */
  const [origin, setOrigin] = useState<Screen>('menu');
  const [mode, setMode] = useState<GameMode>('campaign');
  const [level, setLevel] = useState(1);
  const [dailySeed, setDailySeed] = useState(() => seedForDate(dateKey()));
  /** bumped on every fresh attempt so the rig remounts with a new board */
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<RoundResult | null>(null);
  const [unlockedBlueprint, setUnlockedBlueprint] = useState<string | null>(null);

  const fadeMs = settings.reducedMotion ? FADE_MS_REDUCED : FADE_MS;

  const screenRef = useRef(screen);
  screenRef.current = screen;
  const originRef = useRef(origin);
  originRef.current = origin;

  const goMenu = useCallback(() => {
    setScreen('menu');
    setOrigin('menu');
  }, []);

  // system Back walks the stack back; Back on the hub closes the app
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const target = backTargetOf(screenRef.current, originRef.current);
      if (!target) {
        return false;
      }
      setScreen(target);
      return true;
    });
    return () => sub.remove();
  }, []);

  const startCampaign = useCallback((levelIndex: number, from: Screen) => {
    setMode('campaign');
    setLevel(levelIndex);
    setOrigin(from);
    setRound(r => r + 1);
    setResult(null);
    setUnlockedBlueprint(null);
    setScreen('game');
  }, []);

  const startDaily = useCallback((seed: number) => {
    setMode('daily');
    setDailySeed(seed);
    setOrigin('daily');
    setRound(r => r + 1);
    setResult(null);
    setUnlockedBlueprint(null);
    setScreen('game');
  }, []);

  const handleNavigate = useCallback(
    (route: MenuRoute) => {
      if (route === 'game') {
        startCampaign(nextLevel, 'menu');
        return;
      }
      setScreen(screenForRoute(route));
    },
    [nextLevel, startCampaign],
  );

  const handleFinish = useCallback(
    (finished: RoundResult) => {
      const before = progressStore.getProgress();
      // only the first daily run of the day counts as THE daily attempt
      const countsAsDaily = finished.mode === 'daily' && !progressStore.dailyPlayedToday();
      const after = recordRun({
        level: finished.level,
        outcome: finished.outcome,
        score: finished.score,
        sparks: finished.sparks,
        movesUsed: finished.movesUsed,
        budget: finished.budget,
        perfect: finished.perfect,
        daily: countsAsDaily,
      });
      const fresh = newlyUnlocked(before, after);
      setUnlockedBlueprint(fresh.length > 0 ? fresh[0].name : null);
      setResult(finished);
      setScreen('result');
    },
    [recordRun],
  );

  const handleAgain = useCallback(() => {
    setRound(r => r + 1);
    setResult(null);
    setUnlockedBlueprint(null);
    setScreen('game');
  }, []);

  const handleNext = useCallback(() => {
    const current = result ? result.level : level;
    const from = originRef.current === 'challenge' ? 'challenge' : 'menu';
    startCampaign(current + 1, from);
  }, [level, result, startCampaign]);

  const handleExitRound = useCallback(() => {
    const home = origin === 'challenge' || origin === 'daily' ? origin : 'menu';
    setScreen(home);
    setOrigin(home);
  }, [origin]);

  const handleLaunchLevel = useCallback(
    (levelIndex: number) => startCampaign(levelIndex, 'challenge'),
    [startCampaign],
  );

  let body: React.ReactNode = null;
  if (screen === 'loader') {
    body = <LoaderScreen onDone={goMenu} />;
  } else if (screen === 'game') {
    body = (
      <GameScreen
        key={'round-' + round}
        mode={mode}
        level={level}
        dailySeed={dailySeed}
        settings={settings}
        onExit={handleExitRound}
        onFinish={handleFinish}
      />
    );
  } else if (screen === 'result' && result) {
    body = (
      <ResultScreen
        result={result}
        unlockedBlueprint={unlockedBlueprint}
        settings={settings}
        onAgain={handleAgain}
        onNext={handleNext}
        onMenu={handleExitRound}
      />
    );
  } else if (screen === 'challenge') {
    body = <ChallengeScreen onMenu={goMenu} onLaunch={handleLaunchLevel} />;
  } else if (screen === 'progress') {
    body = <ProgressScreen onMenu={goMenu} />;
  } else if (screen === 'collection') {
    body = <CollectionScreen onMenu={goMenu} />;
  } else if (screen === 'daily') {
    body = <DailyModeScreen onMenu={goMenu} onLaunch={startDaily} />;
  } else if (screen === 'settings') {
    body = <SettingsScreen onMenu={goMenu} />;
  } else {
    body = <MenuScreen onNavigate={handleNavigate} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Fader key={screen + ':' + round} duration={fadeMs}>
        {body}
      </Fader>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  fill: { flex: 1 },
});

export default App;
