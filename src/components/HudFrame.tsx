import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../constants/theme';

interface Props {
  color?: string;
  inset?: number;
  arm?: number;
}

/**
 * The style signature: four corner brackets drawn with plain Views.
 * Never a text glyph, so nothing can fall back to tofu.
 */
export function HudFrame({ color = theme.colors.borderCyanStrong, inset = 10, arm = 24 }: Props) {
  const line = { borderColor: color, width: arm, height: arm };
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { margin: inset }]}>
      <View style={[styles.corner, styles.tl, line]} />
      <View style={[styles.corner, styles.tr, line]} />
      <View style={[styles.corner, styles.bl, line]} />
      <View style={[styles.corner, styles.br, line]} />
    </View>
  );
}

const styles = StyleSheet.create({
  corner: { position: 'absolute' },
  tl: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2 },
  tr: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  br: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2 },
});
