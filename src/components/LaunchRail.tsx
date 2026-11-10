import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { assets } from '../assets';
import { BOARD_FRAME } from '../constants/config';
import { theme } from '../constants/theme';

interface Props {
  launchCol: number;
  tile: number;
  width: number;
}

const DASHES = 3;

/** The funnel mouth sitting over the launch column, with a dashed guide into the rig. */
export function LaunchRail({ launchCol, tile, width }: Props) {
  const centre = BOARD_FRAME + launchCol * tile + tile / 2;
  return (
    <View style={[styles.rail, { width }]}>
      <Text style={styles.label}>LAUNCH</Text>
      <View style={[styles.funnelWrap, { left: centre - 20 }]}>
        <Image source={assets.funnel} style={styles.funnel} resizeMode="contain" />
      </View>
      <View style={[styles.guide, { left: centre - 1 }]}>
        {Array.from({ length: DASHES }).map((_, i) => (
          <View key={'dash-' + i} style={styles.dash} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { height: 44, justifyContent: 'center' },
  label: {
    color: theme.colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    marginLeft: 4,
  },
  funnelWrap: { position: 'absolute', top: 0, width: 40, height: 40 },
  funnel: { width: 40, height: 40 },
  guide: { position: 'absolute', bottom: 0, width: 2, height: 14, justifyContent: 'space-between' },
  dash: { width: 2, height: 3, backgroundColor: theme.colors.secondary, opacity: 0.6 },
});
