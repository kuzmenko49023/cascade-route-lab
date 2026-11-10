import { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { DROP_STEP_MS, DROP_STEP_MS_REDUCED, DROP_TOTAL_CAP_MS } from '../constants/config';
import type { CellRef } from '../game/types';

export interface DropArgs {
  tile: number;
  reducedMotion: boolean;
}

/**
 * Walks the orb cell by cell with a plain Animated sequence on transform only,
 * so the native driver stays legal. The busy flag is always cleared inside the
 * completion callback, never on a later render.
 */
export function useDropAnimation(args: DropArgs) {
  const { tile, reducedMotion } = args;
  const pos = useRef(new Animated.ValueXY({ x: 0, y: -tile })).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const runningRef = useRef(false);
  const seqRef = useRef<Animated.CompositeAnimation | null>(null);
  const doneRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (seqRef.current) {
        seqRef.current.stop();
        seqRef.current = null;
      }
      runningRef.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    if (seqRef.current) {
      seqRef.current.stop();
      seqRef.current = null;
    }
    runningRef.current = false;
    opacity.setValue(0);
    pos.setValue({ x: 0, y: -tile });
  }, [opacity, pos, tile]);

  const run = useCallback(
    (path: CellRef[], launchCol: number, landed: boolean, onDone: () => void) => {
      if (runningRef.current) {
        return;
      }
      runningRef.current = true;
      doneRef.current = onDone;

      const stepBase = reducedMotion ? DROP_STEP_MS_REDUCED : DROP_STEP_MS;
      const stepCount = Math.max(1, path.length + 1);
      const step = Math.max(40, Math.min(stepBase, Math.floor(DROP_TOTAL_CAP_MS / stepCount)));

      pos.setValue({ x: launchCol * tile, y: -tile });
      opacity.setValue(1);

      const moves: Animated.CompositeAnimation[] = [];
      const push = (x: number, y: number, duration: number) => {
        moves.push(
          Animated.timing(pos, {
            toValue: { x, y },
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        );
      };

      // drop out of the funnel into the top row
      push(launchCol * tile, 0, step);
      for (let i = 0; i < path.length; i += 1) {
        push(path[i].col * tile, path[i].row * tile, i === 0 ? 1 : step);
      }
      if (landed && path.length > 0) {
        const last = path[path.length - 1];
        push(last.col * tile, last.row * tile + tile, step);
      }

      const seq = Animated.sequence(moves);
      seqRef.current = seq;
      seq.start(() => {
        seqRef.current = null;
        runningRef.current = false;
        const cb = doneRef.current;
        doneRef.current = null;
        if (cb) {
          cb();
        }
      });
    },
    [opacity, pos, reducedMotion, tile],
  );

  return { pos, opacity, run, reset };
}
