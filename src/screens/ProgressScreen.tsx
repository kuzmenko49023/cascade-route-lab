import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Activity, Menu as MenuIcon } from 'lucide-react-native';
import { EmptyState } from '../components/EmptyState';
import { HudPanel } from '../components/HudPanel';
import { ScreenBackground } from '../components/ScreenBackground';
import { HeaderPillButton, ScreenHeader } from '../components/ScreenHeader';
import { StatCard, visibleCardCount } from '../components/StatCard';
import { LEVELS_PER_SECTOR, TOTAL_LEVELS } from '../constants/config';
import { theme } from '../constants/theme';
import { SECTORS, levelsOfSector } from '../game/levels';
import { outcomeTitle } from '../game/scoring';
import { useProgressStore } from '../hooks/useProgressStore';
import { formatScore, percent } from '../utils/format';

interface Props {
  onMenu: () => void;
}

function outcomeColor(outcome: string): string {
  if (outcome === 'win') {
    return theme.colors.secondary;
  }
  if (outcome === 'partial') {
    return theme.colors.spark;
  }
  return theme.colors.primary;
}

/** The lab log: totals, sector mastery and the last five runs. */
export function ProgressScreen({ onMenu }: Props) {
  const { progress } = useProgressStore();
  const cleared = progress.clearedLevels.length;

  const clearedValue = cleared > 0 ? cleared + '/' + TOTAL_LEVELS : undefined;
  const perfectValue = progress.perfectLevels.length > 0 ? String(progress.perfectLevels.length) : undefined;
  const bestValue = progress.bestScore > 0 ? formatScore(progress.bestScore) : undefined;
  const streakValue = progress.longestStreak > 0 ? String(progress.longestStreak) : undefined;
  const topRow = visibleCardCount([clearedValue, perfectValue]);
  const bottomRow = visibleCardCount([bestValue, streakValue]);

  return (
    <ScreenBackground overlay={theme.overlays.panel}>
      <ScreenHeader
        title="PROGRESS"
        subtitle="BENCH LOG"
        leftSlot={<HeaderPillButton label="MENU" Icon={MenuIcon} onPress={onMenu} />}
      />

      <View style={styles.body}>
        <HudPanel style={styles.hero}>
          <Text style={styles.heroLabel}>TOTAL SCORE</Text>
          <Text style={styles.heroValue}>{formatScore(progress.totalScore)}</Text>
          <Text style={styles.heroHint}>
            {formatScore(progress.totalSparks)} SPARKS BANKED ACROSS EVERY DROP
          </Text>
        </HudPanel>

        {topRow >= 2 ? (
          <View style={styles.row}>
            <View style={styles.slot}>
              <StatCard value={clearedValue} label="ROUTES CLEARED" accent={theme.colors.secondary} />
            </View>
            <View style={styles.slot}>
              <StatCard value={perfectValue} label="PERFECT ROUTES" accent={theme.colors.spark} />
            </View>
          </View>
        ) : null}

        {bottomRow >= 2 ? (
          <View style={styles.row}>
            <View style={styles.slot}>
              <StatCard value={bestValue} label="BEST SINGLE RUN" accent={theme.colors.success} />
            </View>
            <View style={styles.slot}>
              <StatCard value={streakValue} label="LONGEST STREAK" accent={theme.colors.primary} />
            </View>
          </View>
        ) : null}

        <HudPanel style={styles.mastery}>
          <Text style={styles.sectionTitle}>SECTOR MASTERY</Text>
          {SECTORS.map(sector => {
            const levels = levelsOfSector(sector.index);
            const done = levels.filter(l => progress.clearedLevels.indexOf(l) >= 0).length;
            const pct = percent(done, LEVELS_PER_SECTOR);
            return (
              <View key={'mastery-' + sector.index} style={styles.masteryRow}>
                <Text style={styles.masteryName}>{sector.name}</Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { flex: pct }]} />
                  <View style={{ flex: 100 - pct }} />
                </View>
                <Text style={styles.masteryPct}>{pct}%</Text>
              </View>
            );
          })}
        </HudPanel>

        <HudPanel style={styles.log}>
          <Text style={styles.sectionTitle}>LAST 5 RUNS</Text>
          {progress.runLog.length === 0 ? (
            <EmptyState
              title="NO RUNS LOGGED YET"
              hint="PLAY A ROUTE TO FILL THE LOG"
              Icon={Activity}
            />
          ) : (
            progress.runLog.map((run, i) => (
              <View key={'run-' + i} style={styles.logRow}>
                <View style={[styles.dot, { backgroundColor: outcomeColor(run.outcome) }]} />
                <Text style={styles.logId}>
                  {run.daily ? 'DAILY' : 'ROUTE ' + run.level}
                </Text>
                <Text numberOfLines={1} style={styles.logOutcome}>
                  {outcomeTitle(run.outcome)}
                </Text>
                <Text style={styles.logScore}>{formatScore(run.score)}</Text>
                <Text style={styles.logMoves}>
                  {run.movesUsed}/{run.budget}
                </Text>
              </View>
            ))
          )}
        </HudPanel>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 16, paddingBottom: 20 },
  hero: { paddingVertical: 16, paddingHorizontal: 16, alignItems: 'center' },
  heroLabel: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  heroValue: {
    color: theme.colors.secondary,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },
  heroHint: { color: theme.colors.textMuted, fontSize: 9, fontWeight: '600', letterSpacing: 1.2, marginTop: 4 },
  row: { flexDirection: 'row', gap: 10, marginTop: 10 },
  slot: { flex: 1 },
  mastery: { padding: 14, marginTop: 10 },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
    marginLeft: 14,
  },
  masteryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  masteryName: { color: theme.colors.textMuted, fontSize: 9, fontWeight: '700', width: 112 },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  fill: { height: 6, borderRadius: 3, backgroundColor: theme.colors.secondary },
  masteryPct: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    width: 34,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  log: { padding: 14, marginTop: 10 },
  logRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  logId: { color: theme.colors.text, fontSize: 10, fontWeight: '700', width: 64 },
  logOutcome: { color: theme.colors.textMuted, fontSize: 9, fontWeight: '600', flex: 1 },
  logScore: {
    color: theme.colors.spark,
    fontSize: 11,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    width: 44,
    textAlign: 'right',
  },
  logMoves: {
    color: theme.colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    width: 36,
    textAlign: 'right',
  },
});
