import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { Eye, Zap } from 'lucide-react-native';
import { assets } from '../assets';
import { BallSprite } from '../components/BallSprite';
import { HintLine } from '../components/HintLine';
import { IconButton } from '../components/IconButton';
import { LaunchRail } from '../components/LaunchRail';
import { MoveMeter } from '../components/MoveMeter';
import { PauseOverlay } from '../components/PauseOverlay';
import { PocketStrip } from '../components/PocketStrip';
import { PrimaryButton } from '../components/PrimaryButton';
import { RouteBoard } from '../components/RouteBoard';
import { ScreenBackground } from '../components/ScreenBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { SparkCounter } from '../components/SparkCounter';
import {
  BOARD_FRAME,
  COLS,
  POCKET_LETTERS,
  RESULT_DELAY_MS,
  ROWS,
  TILE_MAX,
  TILE_MIN,
  TRACE_COST,
} from '../constants/config';
import { theme } from '../constants/theme';
import { routeInSector, sectorOf } from '../game/levels';
import { scoreRun } from '../game/scoring';
import type { CellRef, GameMode, RouteResult, Settings } from '../game/types';
import { useDropAnimation } from '../hooks/useDropAnimation';
import { useRouteEngine } from '../hooks/useRouteEngine';

export interface RoundResult {
  mode: GameMode;
  level: number;
  outcome: RouteResult['outcome'];
  pocket: number | null;
  multiplier: number;
  score: number;
  perfect: boolean;
  sparks: number;
  sparkTotal: number;
  movesUsed: number;
  budget: number;
  breakCell: CellRef | null;
}

interface Props {
  mode: GameMode;
  level: number;
  dailySeed: number;
  settings: Settings;
  onExit: () => void;
  onFinish: (result: RoundResult) => void;
}

const WINDOW = Dimensions.get('window');
const HEADER_H = 112;
const BOTTOM_H = 152;
const RAIL_H = 44;
const POCKET_H = 58;

function computeTile(): number {
  const arena = WINDOW.height - HEADER_H - BOTTOM_H;
  const maxW = Math.min(WINDOW.width - 32, 380);
  const maxH = arena - RAIL_H - POCKET_H - 16;
  const byWidth = (maxW - BOARD_FRAME * 2) / COLS;
  const byHeight = (maxH - BOARD_FRAME * 2) / ROWS;
  return Math.max(TILE_MIN, Math.min(TILE_MAX, Math.floor(Math.min(byWidth, byHeight))));
}

const TILE = computeTile();
const BOARD_W = TILE * COLS + BOARD_FRAME * 2;

const HINT_TEXT = 'TAP A ROTOR TO TURN IT · DROP WHEN THE CHANNEL CONNECTS';

/** The rig itself: plan the channel, pay for every turn, then commit one drop. */
export function GameScreen({ mode, level, dailySeed, settings, onExit, onFinish }: Props) {
  const [paused, setPaused] = useState(false);
  const [breakCell, setBreakCell] = useState<CellRef | null>(null);
  const [landedCol, setLandedCol] = useState<number | null>(null);

  const shake = useRef(new Animated.Value(0)).current;
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  const runShake = useCallback(
    (amplitude: number) => {
      if (settings.reducedMotion) {
        return;
      }
      Animated.sequence([
        Animated.timing(shake, { toValue: amplitude, duration: 55, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -amplitude, duration: 55, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shake, { toValue: amplitude, duration: 55, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -amplitude, duration: 55, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 55, easing: Easing.linear, useNativeDriver: true }),
      ]).start();
    },
    [settings.reducedMotion, shake],
  );

  const handleResolved = useCallback(
    (result: RouteResult, movesUsed: number) => {
      setBreakCell(result.breakCell);
      setLandedCol(result.pocket);
      if (result.outcome === 'break') {
        runShake(6);
      }
      const board = boardRef.current;
      const scored = scoreRun({
        outcome: result.outcome,
        sparks: result.sparks,
        sparkTotal: board.sparkTotal,
        pocket: result.pocket,
        targetCol: board.targetCol,
        bonusEnabled: settings.trace === 'MANUAL',
      });
      const payload: RoundResult = {
        mode,
        level,
        outcome: result.outcome,
        pocket: result.pocket,
        multiplier: scored.multiplier,
        score: scored.score,
        perfect: scored.perfect,
        sparks: result.sparks,
        sparkTotal: board.sparkTotal,
        movesUsed,
        budget: board.budget,
        breakCell: result.breakCell,
      };
      if (finishTimer.current) {
        clearTimeout(finishTimer.current);
      }
      finishTimer.current = setTimeout(() => {
        finishTimer.current = null;
        finishRef.current(payload);
      }, RESULT_DELAY_MS + (result.outcome === 'break' ? 300 : 0));
    },
    [level, mode, runShake, settings.trace],
  );

  const engine = useRouteEngine({ mode, level, dailySeed, settings, onResolved: handleResolved });
  const boardRef = useRef(engine.board);
  boardRef.current = engine.board;

  const drop = useDropAnimation({ tile: TILE, reducedMotion: settings.reducedMotion });
  const engineRef = useRef(engine);
  engineRef.current = engine;
  const dropRef = useRef(drop);
  dropRef.current = drop;

  useEffect(() => {
    return () => {
      if (finishTimer.current) {
        clearTimeout(finishTimer.current);
        finishTimer.current = null;
      }
    };
  }, []);

  // the orb walks the rig as soon as the round commits, then hands back control
  useEffect(() => {
    if (engine.phase !== 'dropping') {
      return;
    }
    const route = engineRef.current.liveRoute;
    dropRef.current.run(route.path, engineRef.current.board.launchCol, route.pocket !== null, () => {
      engineRef.current.finishDrop();
    });
  }, [engine.phase]);

  // a refused tap on a sealed rivet shakes the rig instead of spending a move
  const rejectRef = useRef(engine.rejectTick);
  useEffect(() => {
    if (engine.rejectTick !== rejectRef.current) {
      rejectRef.current = engine.rejectTick;
      runShake(4);
    }
  }, [engine.rejectTick, runShake]);

  const objective = useMemo(
    () => 'LOCK POCKET ' + POCKET_LETTERS[engine.board.targetCol],
    [engine.board.targetCol],
  );

  const title =
    mode === 'daily'
      ? 'DAILY RIG'
      : 'SECTOR ' + sectorOf(level) + ' · ROUTE ' + routeInSector(level);

  const busy = engine.phase === 'dropping' || engine.phase === 'resolved';

  return (
    <ScreenBackground overlay={theme.overlays.game}>
      <ScreenHeader
        title={title}
        subtitle={objective}
        leftSlot={<IconButton asset={assets.iconHome} onPress={onExit} a11yLabel="menu" />}
        rightSlot={
          <IconButton asset={assets.iconPause} onPress={() => setPaused(true)} a11yLabel="pause" />
        }
      />

      <View style={styles.arena}>
        <LaunchRail launchCol={engine.board.launchCol} tile={TILE} width={BOARD_W} />
        <RouteBoard
          board={engine.board}
          tile={TILE}
          litCells={engine.litCells}
          breakCell={breakCell}
          reducedMotion={settings.reducedMotion}
          shake={shake}
          onRotate={engine.rotate}>
          <BallSprite pos={drop.pos} opacity={drop.opacity} tile={TILE} />
        </RouteBoard>
        <PocketStrip
          targetCol={engine.board.targetCol}
          tile={TILE}
          width={BOARD_W}
          highContrast={settings.highContrast}
          landedCol={landedCol}
        />
      </View>

      <View style={styles.bottom}>
        <HintLine text={HINT_TEXT} visible={engine.hintVisible && !busy} />
        <View style={styles.bar}>
          <View style={styles.meterRow}>
            <MoveMeter left={engine.movesLeft} budget={engine.board.budget} warning={engine.warning} />
            <View style={styles.meterSpacer} />
            <SparkCounter collected={engine.liveRoute.sparks} total={engine.board.sparkTotal} />
          </View>
          <View style={styles.actionRow}>
            <View style={styles.traceSlot}>
              <SecondaryButton
                label="TRACE"
                Icon={Eye}
                onPress={engine.trace}
                disabled={!engine.canTrace}
                caption={engine.alwaysOn ? 'ALWAYS ON' : '-' + TRACE_COST + ' MOVES'}
              />
            </View>
            <View style={styles.dropSlot}>
              <PrimaryButton label="DROP" Icon={Zap} onPress={engine.drop} disabled={!engine.canDrop} />
            </View>
          </View>
        </View>
        {engine.warning ? <Text style={styles.warning}>NO ROTATIONS LEFT {'·'} RIG RELEASING</Text> : null}
      </View>

      {paused ? <PauseOverlay onResume={() => setPaused(false)} onMenu={onExit} /> : null}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  arena: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bottom: { paddingHorizontal: 16, paddingBottom: 20 },
  bar: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,245,255,0.20)',
    backgroundColor: 'rgba(14,14,26,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...theme.shadows.bar,
  },
  meterRow: { flexDirection: 'row', alignItems: 'center' },
  meterSpacer: { width: 12 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  traceSlot: { flex: 0.42 },
  dropSlot: { flex: 0.58 },
  warning: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    textAlign: 'center',
    marginTop: 8,
  },
});
