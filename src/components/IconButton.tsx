import React from 'react';
import { Animated, Image, Pressable, StyleSheet, type ImageSourcePropType } from 'react-native';
import { assets } from '../assets';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

interface Props {
  asset: ImageSourcePropType;
  onPress: () => void;
  a11yLabel: string;
  disabled?: boolean;
}

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/** 44x44 round header control: the plate asset behind a 24 glyph image. */
export function IconButton({ asset, onPress, a11yLabel, disabled = false }: Props) {
  const press = usePressScale(0.92);
  return (
    <Pressable
      style={styles.press}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      disabled={disabled}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.shell, { transform: [{ scale: press.scale }] }, disabled ? styles.off : null]}>
        <Image source={assets.buttonRound} style={styles.plate} resizeMode="cover" />
        <Image source={asset} style={styles.glyph} resizeMode="contain" />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: 44, height: 44 },
  shell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderCyan,
    backgroundColor: 'rgba(18,18,31,0.72)',
    overflow: 'hidden',
  },
  plate: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined, opacity: 0.45 },
  glyph: { width: 24, height: 24 },
  off: { opacity: 0.4 },
});
