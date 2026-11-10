import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Menu as MenuIcon, RotateCw, Target } from 'lucide-react-native';
import { assets } from '../assets';
import { HudPanel } from '../components/HudPanel';
import { PrimaryButton } from '../components/PrimaryButton';
import { ResultBanner } from '../components/ResultBanner';
import { ScreenBackground } from '../components/ScreenBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { StatCard, visibleCardCount } from '../components/StatCard';
import { PERFECT_BONUS, TOTAL_LEVELS } from '../constants/config';
import { theme } from '../constants/theme';
import { routeInSector, sectorOf } from '../game/levels';
import type { Settings } from '../game/types';
import { formatScore } from '../utils/format';
import type { RoundResult } from './GameScreen';

interface Props {
  result: RoundResult;
  unlockedBlueprint: string | null;
  settings: Settings;
  onAgain: () => void;
  onNext: () => void;
  onMenu: () => void;
}

const COUNT_MS = 900;
const COUNT_STEPS = 18;

/** The mandatory round result, in the rig's own words. Never a dead end. */
export function ResultScreen({ result, unlockedBlueprint, settings, onAgain, onNext, onMenu }: Props) {
  const [shown, setShown] = useState(settings.reducedMotion ? result.score : 0);
  const targetRef = useRef(result.score);
  targetRef.current = result.score;

  useEffect(() => {
    if (settings.reducedMotion || result.score <= 0) {
      setShown(result.score);
      return;
    }
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      if (step >= COUNT_STEPS) {
        clearInterval(timer);
        setShown(targetRef.current);
        return;
      }
      setShown(Math.round((targetRef.current * step) / COUNT_STEPS));
    }, COUNT_MS / COUNT_STEPS);
    return () => clearInterval(timer);
  }, [result.score, settings.reducedMotion]);

  const overlay =
    result.outcome === 'win'
      ? theme.overlays.win
      : result.outcome === 'partial'
      ? theme.overlays.partial
      : theme.overlays.broken;

  const scoreValue = result.score > 0 ? formatScore(shown) : undefined;
  const sparkValue = result.sparkTotal > 0 ? result.sparks + '/' + result.sparkTotal : undefined;
  const moveValue = result.movesUsed + '/' + result.budget;
  const cardCount = visibleCardCount([scoreValue, sparkValue, moveValue]);

  const canAdvance =
    result.mode === 'campaign' && result.outcome === 'win' && result.level < TOTAL_LEVELS;

  const header =
    result.mode === 'daily'
      ? 'DAILY RIG'
      : 'SECTOR ' + sectorOf(result.level) + ' · ROUTE ' + routeInSector(result.level);

  return (
    <ScreenBackground overlay={overlay}>
      <ScreenHeader title={header} subtitle="BENCH REPORT" />

      <View style={styles.body}>
        <View style={styles.hero}>
          <Image
            source={assets.orb}
            style={[styles.orb, result.outcome === 'break' ? styles.orbDim : null]}
            resizeMode="contain"
          />
          <ResultBanner
            outcome={result.outcome}
            pocket={result.pocket}
            multiplier={result.multiplier}
            breakCell={result.breakCell}
            reducedMotion={settings.reducedMotion}
          />
        </View>

        {cardCount >= 2 ? (
          <View style={styles.cards}>
            <View style={styles.slot}>
              <StatCard value={scoreValue} label="SCORE" accent={theme.colors.secondary} />
            </View>
            <View style={styles.slot}>
              <StatCard value={sparkValue} label="SPARKS" accent={theme.colors.spark} />
            </View>
            <View style={styles.slot}>
              <StatCard value={moveValue} label="MOVES USED" accent={theme.colors.primary} />
            </View>
          </View>
        ) : null}

        {result.perfect ? (
          <HudPanel accent={theme.colors.spark} style={styles.perfect}>
            <Text style={styles.perfectText}>PERFECT ROUTE +{PERFECT_BONUS}</Text>
          </HudPanel>
        ) : null}

        {unlockedBlueprint ? (
          <HudPanel accent={theme.colors.secondary} style={styles.toast}>
            <Image source={assets.rotor} style={styles.toastSprite} resizeMode="contain" />
            <Text numberOfLines={1} style={styles.toastText}>
              BLUEPRINT UNLOCKED {'·'} {unlockedBlueprint}
            </Text>
          </HudPanel>
        ) : null}

        <View style={styles.spacer} />

        <Text style={styles.hint}>
          {result.outcome === 'win'
            ? 'CHANNEL HELD · THE NEXT RIG IS HOTTER'
            : 'TURN THE ROTORS, THEN COMMIT ONE DROP'}
        </Text>

        <View style={styles.actions}>
          <PrimaryButton label="DROP AGAIN" Icon={RotateCw} onPress={onAgain} />
          {canAdvance ? (
            <>
              <View style={styles.gap} />
              <SecondaryButton label="NEXT ROUTE" Icon={Target} onPress={onNext} />
            </>
          ) : null}
          <View style={styles.gap} />
          <SecondaryButton label="MENU" Icon={MenuIcon} onPress={onMenu} tone="plain" />
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 16, paddingBottom: 20 },
  hero: { alignItems: 'center', marginTop: 4 },
  orb: { width: 88, height: 88, marginBottom: 14 },
  orbDim: { opacity: 0.45 },
  cards: { flexDirection: 'row', gap: 10, marginTop: 20 },
  slot: { flex: 1 },
  perfect: { marginTop: 12, paddingVertical: 12, alignItems: 'center' },
  perfectText: { color: theme.colors.spark, fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  toast: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toastSprite: { width: 32, height: 32 },
  toastText: { color: theme.colors.secondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, flex: 1 },
  spacer: { flex: 1 },
  hint: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.6,
    textAlign: 'center',
    marginBottom: 14,
  },
  actions: { width: '100%' },
  gap: { height: 12 },
});
