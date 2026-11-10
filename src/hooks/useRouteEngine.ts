import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AUTO_DROP_WARNING_MS, TRACE_COST, TRACE_VISIBLE_MS } from '../constants/config';
import { generateBoard, generateDailyBoard } from '../game/board';
import { periodOf } from '../game/ports';
import { applyRotation, canAfford, releasesItself } from '../game/rotation';
import { walkRoute } from '../game/solver';
import type { Board, GameMode, RouteResult, Settings } from '../game/types';

export type EnginePhase = 'planning' | 'tracing' | 'dropping' | 'resolved';

export interface EngineArgs {
  mode: GameMode;
  level: number;
  dailySeed: number;
  settings: Settings;
  /** fired once the drop animation has finished walking the route */
  onResolved: (result: RouteResult, movesUsed: number) => void;
}

function keyOf(row: number, col: number): string {
  return row + ':' + col;
}

export function useRouteEngine(args: EngineArgs) {
  const { mode, level, dailySeed, settings, onResolved } = args;

  const [attempt, setAttempt] = useState(0);
  const [board, setBoard] = useState<Board>(() =>
    mode === 'daily' ? generateDailyBoard(dailySeed) : generateBoard(level, 0),
  );
  const [movesLeft, setMovesLeft] = useState(board.budget);
  const [phase, setPhase] = useState<EnginePhase>('planning');
  const [traceActive, setTraceActive] = useState(false);
  const [warning, setWarning] = useState(false);
  const [rejectTick, setRejectTick] = useState(0);
  const [touched, setTouched] = useState(false);

  // animation and timer callbacks always read live data from refs
  const phaseRef = useRef<EnginePhase>('planning');
  const boardRef = useRef(board);
  const movesRef = useRef(board.budget);
  const resolvedRef = useRef(onResolved);
  const traceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  phaseRef.current = phase;
  boardRef.current = board;
  movesRef.current = movesLeft;
  resolvedRef.current = onResolved;

  const clearTimers = useCallback(() => {
    if (traceTimer.current) {
      clearTimeout(traceTimer.current);
      traceTimer.current = null;
    }
    if (autoTimer.current) {
      clearTimeout(autoTimer.current);
      autoTimer.current = null;
    }
  }, []);

  // nothing of this round may keep running once the screen is gone
  useEffect(() => clearTimers, [clearTimers]);

  const loadBoard = useCallback(
    (nextAttempt: number) => {
      clearTimers();
      const next = mode === 'daily' ? generateDailyBoard(dailySeed) : generateBoard(level, nextAttempt);
      setBoard(next);
      setMovesLeft(next.budget);
      setPhase('planning');
      setTraceActive(false);
      setWarning(false);
      setTouched(false);
    },
    [clearTimers, dailySeed, level, mode],
  );

  const attemptRef = useRef(0);
  const restart = useCallback(() => {
    attemptRef.current += 1;
    setAttempt(attemptRef.current);
    loadBoard(attemptRef.current);
  }, [loadBoard]);

  /** The live route from the launch funnel with the rotors as they stand now. */
  const liveRoute: RouteResult = useMemo(() => walkRoute(board), [board]);

  const alwaysOn = settings.trace === 'ALWAYS_ON';
  const showRoute = alwaysOn || traceActive || phase === 'dropping';

  const litCells = useMemo(() => {
    const set = new Set<string>();
    if (!showRoute) {
      return set;
    }
    for (let i = 0; i < liveRoute.path.length; i += 1) {
      set.add(keyOf(liveRoute.path[i].row, liveRoute.path[i].col));
    }
    return set;
  }, [liveRoute, showRoute]);

  const movesUsed = board.budget - movesLeft;

  const commitDrop = useCallback(() => {
    if (phaseRef.current === 'dropping' || phaseRef.current === 'resolved') {
      return;
    }
    clearTimers();
    setTraceActive(false);
    setWarning(false);
    setPhase('dropping');
  }, [clearTimers]);

  /** Called by the drop animation when the orb has finished walking the rig. */
  const finishDrop = useCallback(() => {
    if (phaseRef.current !== 'dropping') {
      return;
    }
    setPhase('resolved');
    const result = walkRoute(boardRef.current);
    const used = boardRef.current.budget - movesRef.current;
    resolvedRef.current(result, used);
  }, []);

  const rotate = useCallback(
    (row: number, col: number) => {
      if (phaseRef.current === 'dropping' || phaseRef.current === 'resolved') {
        return;
      }
      const current = boardRef.current;
      const turn = applyRotation(current, row, col, settings.rotation, movesRef.current);
      if (!turn.accepted) {
        // sealed rivets and pegs refuse the tap and cost nothing
        setRejectTick(t => t + 1);
        return;
      }
      setBoard(turn.board);
      setTouched(true);

      const remaining = movesRef.current - turn.spent;
      movesRef.current = remaining;
      setMovesLeft(remaining);
      setPhase('planning');

      if (releasesItself(remaining)) {
        // out of rotations: the rig releases itself after a short warning pulse
        setWarning(true);
        autoTimer.current = setTimeout(() => {
          autoTimer.current = null;
          commitDrop();
        }, AUTO_DROP_WARNING_MS);
      }
    },
    [commitDrop, settings.rotation],
  );

  const canTrace =
    !alwaysOn && canAfford(movesLeft, TRACE_COST) && phase !== 'dropping' && phase !== 'resolved';

  const trace = useCallback(() => {
    if (alwaysOn) {
      return;
    }
    if (phaseRef.current === 'dropping' || phaseRef.current === 'resolved') {
      return;
    }
    if (!canAfford(movesRef.current, TRACE_COST)) {
      setRejectTick(t => t + 1);
      return;
    }
    const remaining = movesRef.current - TRACE_COST;
    movesRef.current = remaining;
    setMovesLeft(remaining);
    setTraceActive(true);
    setTouched(true);
    setPhase('tracing');
    if (traceTimer.current) {
      clearTimeout(traceTimer.current);
    }
    traceTimer.current = setTimeout(() => {
      traceTimer.current = null;
      setTraceActive(false);
      setPhase(p => (p === 'tracing' ? 'planning' : p));
    }, TRACE_VISIBLE_MS);

    if (releasesItself(remaining)) {
      setWarning(true);
      autoTimer.current = setTimeout(() => {
        autoTimer.current = null;
        commitDrop();
      }, AUTO_DROP_WARNING_MS);
    }
  }, [alwaysOn, commitDrop]);

  const canDrop = phase !== 'dropping' && phase !== 'resolved';

  return {
    board,
    attempt,
    phase,
    movesLeft,
    movesUsed,
    warning,
    litCells,
    liveRoute,
    rejectTick,
    hintVisible: !touched,
    canTrace,
    canDrop,
    alwaysOn,
    rotate,
    trace,
    drop: commitDrop,
    finishDrop,
    restart,
    periodOfCell: periodOf,
  };
}
