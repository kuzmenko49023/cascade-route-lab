import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Menu as MenuIcon } from 'lucide-react-native';
import { BlueprintCard } from '../components/BlueprintCard';
import { HudPanel } from '../components/HudPanel';
import { ScreenBackground } from '../components/ScreenBackground';
import { HeaderPillButton, ScreenHeader } from '../components/ScreenHeader';
import { TOTAL_BLUEPRINTS } from '../constants/config';
import { theme } from '../constants/theme';
import { BLUEPRINTS } from '../game/blueprints';
import { useProgressStore } from '../hooks/useProgressStore';
import { percent } from '../utils/format';

interface Props {
  onMenu: () => void;
}

/** Twelve rig blueprints. Unlocked cards expand in place, no modal, no navigation. */
export function CollectionScreen({ onMenu }: Props) {
  const { progress } = useProgressStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  const unlocked = BLUEPRINTS.filter(b => b.unlocked(progress)).length;
  const pct = percent(unlocked, TOTAL_BLUEPRINTS);

  const handlePress = (id: string) => {
    setExpanded(current => (current === id ? null : id));
  };

  return (
    <ScreenBackground overlay={theme.overlays.panel}>
      <ScreenHeader
        title="COLLECTION"
        subtitle="RIG BLUEPRINTS"
        leftSlot={<HeaderPillButton label="MENU" Icon={MenuIcon} onPress={onMenu} />}
      />

      <View style={styles.body}>
        <HudPanel style={styles.summary}>
          <Text style={styles.count}>
            {unlocked}/{TOTAL_BLUEPRINTS} BLUEPRINTS
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { flex: pct }]} />
            <View style={{ flex: 100 - pct }} />
          </View>
          <Text style={styles.hint}>
            {unlocked === 0
              ? 'CLEAR ROUTES AND BANK SPARKS TO CUT THE FIRST PLATE'
              : 'TAP AN UNLOCKED PLATE TO READ ITS BENCH NOTE'}
          </Text>
        </HudPanel>

        <View style={styles.grid}>
          {BLUEPRINTS.map(bp => (
            <View key={bp.id} style={styles.slot}>
              <BlueprintCard
                blueprint={bp}
                unlocked={bp.unlocked(progress)}
                expanded={expanded === bp.id}
                onPress={handlePress}
              />
            </View>
          ))}
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 16, paddingBottom: 20 },
  summary: { padding: 14, marginBottom: 12 },
  count: {
    color: theme.colors.spark,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginLeft: 14,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 10,
  },
  fill: { height: 6, borderRadius: 3, backgroundColor: theme.colors.spark },
  hint: {
    color: theme.colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 8,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slot: { width: '31%' },
});
