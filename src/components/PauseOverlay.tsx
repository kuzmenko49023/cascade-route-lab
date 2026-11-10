import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Menu as MenuIcon, Play } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { HudFrame } from './HudFrame';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';

interface Props {
  onResume: () => void;
  onMenu: () => void;
}

/** Captioned by meaning, no close cross, no dead end. */
export function PauseOverlay({ onResume, onMenu }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.panel}>
        <HudFrame color={theme.colors.borderCyanStrong} inset={8} arm={20} />
        <Text style={styles.title}>PAUSED</Text>
        <Text style={styles.hint}>THE RIG HOLDS ITS ROTORS WHILE YOU THINK</Text>
        <View style={styles.actions}>
          <PrimaryButton label="RESUME" Icon={Play} onPress={onResume} />
          <View style={styles.gap} />
          <SecondaryButton label="MENU" Icon={MenuIcon} onPress={onMenu} tone="plain" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,15,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  panel: {
    width: 300,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderCyan,
    backgroundColor: theme.colors.glass,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '800', letterSpacing: 4 },
  hint: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    marginTop: 8,
    textAlign: 'center',
  },
  actions: { width: '100%', marginTop: 20 },
  gap: { height: 12 },
});
