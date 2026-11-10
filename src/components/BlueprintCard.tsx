import React from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { assets } from '../assets';
import { theme } from '../constants/theme';
import type { Blueprint, Rarity } from '../game/blueprints';
import { usePressScale } from '../hooks/usePressScale';

interface Props {
  blueprint: Blueprint;
  unlocked: boolean;
  expanded: boolean;
  onPress: (id: string) => void;
}

const HIT = { top: 6, bottom: 6, left: 6, right: 6 };

const RARITY_COLOR: Record<Rarity, string> = {
  COMMON: theme.colors.secondary,
  RARE: theme.colors.primary,
  PROTOTYPE: theme.colors.spark,
};

/** Unlocked cards expand in place to show one line of in-world flavour. */
export function BlueprintCard({ blueprint, unlocked, expanded, onPress }: Props) {
  const press = usePressScale(0.94);
  const accent = RARITY_COLOR[blueprint.rarity];
  const handlePress = () => onPress(blueprint.id);

  return (
    <Pressable
      style={styles.press}
      onPress={handlePress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={unlocked ? blueprint.name : 'locked blueprint'}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.shell,
          unlocked ? { borderColor: accent + '66' } : styles.lockedShell,
          { transform: [{ scale: press.scale }] },
        ]}>
        {unlocked ? (
          <>
            <Image source={assets.rotor} style={[styles.sprite, { tintColor: accent }]} resizeMode="contain" />
            <Text numberOfLines={1} style={[styles.name, { color: accent }]}>
              {blueprint.name}
            </Text>
            <Text numberOfLines={2} style={styles.line}>
              {expanded ? blueprint.flavour : blueprint.rarity}
            </Text>
          </>
        ) : (
          <>
            <View style={styles.lockRing}>
              <Lock size={20} color={theme.colors.textMuted} />
            </View>
            <Text numberOfLines={2} style={styles.condition}>
              {blueprint.condition}
            </Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%', height: 108 },
  shell: {
    width: '100%',
    height: 108,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderCyan,
    backgroundColor: theme.colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  lockedShell: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)' },
  sprite: { width: 40, height: 40, marginBottom: 4 },
  lockRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  name: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, textAlign: 'center' },
  line: {
    color: theme.colors.textMuted,
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.6,
    textAlign: 'center',
    marginTop: 3,
  },
  condition: {
    color: theme.colors.textMuted,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});
