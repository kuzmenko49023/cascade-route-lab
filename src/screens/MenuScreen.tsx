import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import {
  Activity,
  Calendar,
  LayoutGrid,
  Play,
  Settings as SettingsIcon,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import { assets } from '../assets';
import { BentoTile } from '../components/BentoTile';
import { ScreenBackground } from '../components/ScreenBackground';
import { HeaderBadge, ScreenHeader } from '../components/ScreenHeader';
import { TOTAL_BLUEPRINTS, TOTAL_LEVELS } from '../constants/config';
import { theme } from '../constants/theme';
import { unlockedCount } from '../game/blueprints';
import { routeInSector, sectorOf } from '../game/levels';
import { useProgressStore } from '../hooks/useProgressStore';
import { formatScore } from '../utils/format';

export type MenuRoute = 'game' | 'challenge' | 'progress' | 'collection' | 'daily' | 'settings';

interface Props {
  onNavigate: (route: MenuRoute) => void;
}

/** Entry animation wrapper. box-none so the tile below always receives the tap. */
function Stagger({ index, children }: { index: number; children: React.ReactNode }) {
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 280, delay: index * 60, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 280, delay: index * 60, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [fade, index, rise]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={{ opacity: fade, transform: [{ translateY: rise }] }}>
      {children}
    </Animated.View>
  );
}

/** M3 bento hub. Every screen of the app is one tap away from here. */
export function MenuScreen({ onNavigate }: Props) {
  const { progress, nextLevel } = useProgressStore();
  const cleared = progress.clearedLevels.length;
  const blueprints = unlockedCount(progress);

  return (
    <ScreenBackground overlay={theme.overlays.menu}>
      <ScreenHeader
        title="CASCADE ROUTE LAB"
        leftSlot={<Image source={assets.logo} style={styles.logo} resizeMode="contain" />}
        rightSlot={
          progress.totalSparks > 0 ? (
            <HeaderBadge
              Icon={Sparkles}
              value={formatScore(progress.totalSparks)}
              accent={theme.colors.spark}
            />
          ) : null
        }
      />

      <View style={styles.body}>
        <Text style={styles.tagline}>ROUTE THE ORB {'·'} LOCK THE POCKET</Text>

        <Stagger index={0}>
          <BentoTile
            size="lg"
            caption="PLAY"
            overline={'SECTOR ' + sectorOf(nextLevel) + ' · ROUTE ' + routeInSector(nextLevel)}
            metric={'ROTATE THE RIG, THEN DROP'}
            Icon={Play}
            accent={theme.colors.primary}
            onPress={() => onNavigate('game')}
          />
        </Stagger>

        <View style={styles.grid}>
          <View style={styles.gridRow}>
            <View style={styles.gridSlot}>
              <Stagger index={1}>
                <BentoTile
                  size="sm"
                  caption="CHALLENGE"
                  metric={cleared + '/' + TOTAL_LEVELS + ' ROUTES'}
                  Icon={Zap}
                  accent={theme.colors.primary}
                  onPress={() => onNavigate('challenge')}
                />
              </Stagger>
            </View>
            <View style={styles.gridSlot}>
              <Stagger index={2}>
                <BentoTile
                  size="sm"
                  caption="DAILY MODE"
                  metric={progress.dailyStreak > 0 ? 'STREAK ' + progress.dailyStreak : 'NOT RUN TODAY'}
                  Icon={Calendar}
                  accent={theme.colors.secondary}
                  onPress={() => onNavigate('daily')}
                />
              </Stagger>
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.gridSlot}>
              <Stagger index={3}>
                <BentoTile
                  size="sm"
                  caption="PROGRESS"
                  metric={'BEST ' + formatScore(progress.bestScore)}
                  Icon={Activity}
                  accent={theme.colors.success}
                  onPress={() => onNavigate('progress')}
                />
              </Stagger>
            </View>
            <View style={styles.gridSlot}>
              <Stagger index={4}>
                <BentoTile
                  size="sm"
                  caption="COLLECTION"
                  metric={blueprints + '/' + TOTAL_BLUEPRINTS + ' BLUEPRINTS'}
                  Icon={LayoutGrid}
                  accent={theme.colors.spark}
                  onPress={() => onNavigate('collection')}
                />
              </Stagger>
            </View>
          </View>
        </View>

        <View style={styles.settingsSlot}>
          <Stagger index={5}>
            <BentoTile
              size="strip"
              caption="SETTINGS"
              Icon={SettingsIcon}
              accent={theme.colors.textSecondary}
              onPress={() => onNavigate('settings')}
            />
          </Stagger>
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  logo: { width: 40, height: 40 },
  body: { flex: 1, paddingHorizontal: 16, paddingBottom: 20 },
  tagline: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 14,
  },
  grid: { marginTop: 12, gap: 12 },
  gridRow: { flexDirection: 'row', gap: 12 },
  gridSlot: { flex: 1 },
  settingsSlot: { marginTop: 12 },
});
