import { useCallback, useEffect, useState } from 'react';
import { progressStore, type RunOutcomeInput } from '../game/storage';
import type { ProgressSnapshot, Settings } from '../game/types';

/**
 * The only reader and writer of ProgressStore in the whole app.
 * Screens pull the individual values they need from here, never the raw store.
 */
export function useProgressStore() {
  const [progress, setProgress] = useState<ProgressSnapshot>(() => progressStore.getProgress());
  const [settings, setSettings] = useState<Settings>(() => progressStore.getSettings());

  useEffect(() => {
    const unsubscribe = progressStore.subscribe(() => {
      setProgress(progressStore.getProgress());
      setSettings(progressStore.getSettings());
    });
    return unsubscribe;
  }, []);

  const recordRun = useCallback((input: RunOutcomeInput) => progressStore.recordRun(input), []);
  const updateSettings = useCallback(
    (patch: Partial<Settings>) => progressStore.updateSettings(patch),
    [],
  );
  const resetProgress = useCallback(() => progressStore.reset(), []);

  return {
    progress,
    settings,
    recordRun,
    updateSettings,
    resetProgress,
    nextLevel: progressStore.nextLevel(),
    dailyPlayedToday: progressStore.dailyPlayedToday(),
    isUnlocked: (level: number) => progressStore.isUnlocked(level),
  };
}
