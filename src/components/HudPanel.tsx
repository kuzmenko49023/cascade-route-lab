import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '../constants/theme';

interface Props {
  tone?: 'glass' | 'deep';
  accent?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/** Instrument surface: flat fill plus a 1px glow outline instead of a drop shadow. */
export function HudPanel({ tone = 'glass', accent, style, children }: Props) {
  return (
    <View
      style={[
        styles.panel,
        tone === 'deep' ? styles.deep : styles.glass,
        accent ? { borderColor: accent } : null,
        style,
      ]}>
      <View pointerEvents="none" style={[styles.bracket, accent ? { borderColor: accent } : null]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderCyan,
    overflow: 'hidden',
  },
  glass: { backgroundColor: theme.colors.glass },
  deep: { backgroundColor: theme.colors.glassDeep },
  bracket: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 16,
    height: 16,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: theme.colors.borderCyanStrong,
  },
});
