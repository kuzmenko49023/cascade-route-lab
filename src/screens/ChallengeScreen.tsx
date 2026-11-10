import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Menu as MenuIcon, Zap } from 'lucide-react-native';
import { HudPanel } from '../components/HudPanel';
import { LevelCard, type LevelStatus } from '../components/LevelCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenBackground } from '../components/ScreenBackground';
import { HeaderPillButton, ScreenHeader } from '../components/ScreenHeader';
import { theme } from '../constants/theme';
import { generateBoard } from '../game/board';
import { SECTORS, levelsOfSector } from '../game/levels';
import { isRotatable } from '../game/ports';
import { useProgressStore } from '../hooks/useProgressStore';

interface Props {
  onMenu: () => void;
  onLaunch: (level: number) => void;
}

/** Session picker for the 24 campaign routes. Locked chips are inert. */
export function ChallengeScreen({ onMenu, onLaunch }: Props) {
  const { progress, nextLevel } = useProgressStore();
  const [selected, setSelected] = useState<number | null>(null);
  const [lockedNote, setLockedNote] = useState<string | null>(null);

  const statusOf = (level: number): LevelStatus => {
    if (progress.perfectLevels.indexOf(level) >= 0) {
      return 'perfect';
    }
    if (progress.clearedLevels.indexOf(level) >= 0) {
      return 'cleared';
    }
    if (level === nextLevel) {
      return 'current';
    }
    return level < nextLevel ? 'cleared' : 'locked';
  };

  const handlePick = (level: number) => {
    if (level > nextLevel) {
      setSelected(null);
      setLockedNote('CLEAR ROUTE ' + nextLevel + ' FIRST');
      return;
    }
    setLockedNote(null);
    setSelected(level);
  };

  const brief = useMemo(() => {
    if (lockedNote) {
      return lockedNote;
    }
    if (selected === null) {
      return 'NO SESSION SELECTED';
    }
    const board = generateBoard(selected, 0);
    let rotors = 0;
    for (let r = 0; r < board.cells.length; r += 1) {
      for (let c = 0; c < board.cells[r].length; c += 1) {
        if (isRotatable(board.cells[r][c])) {
          rotors += 1;
        }
      }
    }
    return (
      'ROTORS ' + rotors + ' · BUDGET ' + board.budget + ' · SPARKS ' + board.sparkTotal
    );
  }, [lockedNote, selected]);

  return (
    <ScreenBackground overlay={theme.overlays.panel}>
      <ScreenHeader
        title="CHALLENGE SESSIONS"
        subtitle={progress.clearedLevels.length + ' ROUTES LOCKED IN'}
        leftSlot={<HeaderPillButton label="MENU" Icon={MenuIcon} onPress={onMenu} />}
      />

      <View style={styles.body}>
        {SECTORS.map(sector => (
          <HudPanel key={'sector-' + sector.index} style={styles.panel}>
            <Text style={styles.sectorName}>{sector.name}</Text>
            <View style={styles.grid}>
              {levelsOfSector(sector.index).map(level => (
                <LevelCard
                  key={'level-' + level}
                  index={level}
                  status={statusOf(level)}
                  selected={selected === level}
                  onPress={handlePick}
                />
              ))}
            </View>
          </HudPanel>
        ))}

        <View style={styles.spacer} />
        <Text style={styles.brief}>{brief}</Text>
        <PrimaryButton
          label="START SESSION"
          Icon={Zap}
          onPress={() => (selected !== null ? onLaunch(selected) : undefined)}
          disabled={selected === null}
        />
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 16, paddingBottom: 20 },
  panel: { padding: 12, marginBottom: 10 },
  sectorName: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
    marginLeft: 14,
  },
  // 4 chips of 48 with three 8 gaps: a fixed width keeps the grid exactly 4x2
  grid: { width: 216, alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  spacer: { flex: 1, minHeight: 8 },
  brief: {
    color: theme.colors.secondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    textAlign: 'center',
    marginBottom: 14,
  },
});
