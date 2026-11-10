import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar, Menu as MenuIcon, Zap } from 'lucide-react-native';
import { EmptyState } from '../components/EmptyState';
import { HudPanel } from '../components/HudPanel';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenBackground } from '../components/ScreenBackground';
import { HeaderPillButton, ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { StreakRibbon } from '../components/StreakRibbon';
import { theme } from '../constants/theme';
import { isRotatable } from '../game/ports';
import { outcomeTitle } from '../game/scoring';
import { useDailyBoard } from '../hooks/useDailyBoard';
import { useProgressStore } from '../hooks/useProgressStore';
import { formatScore } from '../utils/format';

interface Props {
  onMenu: () => void;
  onLaunch: (seed: number) => void;
}

/** One date-seeded rig per calendar day. Already run today still shows a way on. */
export function DailyModeScreen({ onMenu, onLaunch }: Props) {
  const { progress } = useProgressStore();
  const daily = useDailyBoard(progress);

  let rotors = 0;
  for (let r = 0; r < daily.board.cells.length; r += 1) {
    for (let c = 0; c < daily.board.cells[r].length; c += 1) {
      if (isRotatable(daily.board.cells[r][c])) {
        rotors += 1;
      }
    }
  }

  return (
    <ScreenBackground overlay={theme.overlays.panel}>
      <ScreenHeader
        title="DAILY MODE"
        subtitle={'RIG ' + daily.todayKey}
        leftSlot={<HeaderPillButton label="MENU" Icon={MenuIcon} onPress={onMenu} />}
      />

      <View style={styles.body}>
        <HudPanel style={styles.ribbon}>
          <StreakRibbon streak={progress.dailyStreak} days={daily.dots} />
        </HudPanel>

        <HudPanel style={styles.preview} accent={theme.colors.secondary}>
          <Text style={styles.previewTitle}>TODAY RIG</Text>
          <Text style={styles.previewLine}>
            ROTORS {rotors} {'·'} BUDGET {daily.board.budget} {'·'} SPARKS{' '}
            {daily.board.sparkTotal}
          </Text>
          <Text style={styles.previewHint}>
            THE SAME RIG IS CUT FOR EVERY BENCH TODAY. ONE ATTEMPT COUNTS.
          </Text>
        </HudPanel>

        <View style={styles.spacer}>
          {daily.playedToday ? (
            <HudPanel style={styles.summary} accent={theme.colors.spark}>
              <Text style={styles.summaryLabel}>RESULT</Text>
              <Text style={styles.summaryValue}>
                {daily.playedToday && progress.lastDailyOutcome
                  ? outcomeTitle(progress.lastDailyOutcome)
                  : 'LOGGED'}{' '}
                {'·'} {formatScore(progress.lastDailyScore)}
              </Text>
              <Text style={styles.summaryHint}>
                NEXT RIG IN {daily.countdown.hours}h {daily.countdown.minutes}m
              </Text>
            </HudPanel>
          ) : (
            <EmptyState
              title="RIG STILL SEALED"
              hint="ONE DROP PER CALENDAR DAY, SO PLAN BEFORE YOU COMMIT"
              Icon={Calendar}
            />
          )}
        </View>

        <View style={styles.actions}>
          {daily.playedToday ? (
            <SecondaryButton label="MENU" Icon={MenuIcon} onPress={onMenu} tone="plain" />
          ) : (
            <PrimaryButton label="START DAILY" Icon={Zap} onPress={() => onLaunch(daily.seed)} />
          )}
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 16, paddingBottom: 20 },
  ribbon: { padding: 14 },
  preview: { padding: 14, marginTop: 12 },
  previewTitle: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginLeft: 14,
  },
  previewLine: {
    color: theme.colors.secondary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  previewHint: {
    color: theme.colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 8,
  },
  spacer: { flex: 1, justifyContent: 'center' },
  summary: { padding: 16, alignItems: 'center' },
  summaryLabel: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  summaryValue: {
    color: theme.colors.spark,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 6,
  },
  summaryHint: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    marginTop: 8,
  },
  actions: { width: '100%' },
});
