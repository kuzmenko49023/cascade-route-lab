import React from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { assets } from '../assets';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

/** Every icon in the app comes from the one production icon library. */
export type IconComponent = LucideIcon;

interface Props {
  label: string;
  Icon?: IconComponent;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'magenta' | 'cyan';
}

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/**
 * h56 CTA. Pressable is the parent and the animated shell is its child, so the
 * animation can never eat the tap. Icon is a fixed 24 and the label lineHeight
 * matches it exactly, with a 10 gap, on every button in the app.
 */
export function PrimaryButton({ label, Icon, onPress, disabled = false, tone = 'magenta' }: Props) {
  const press = usePressScale(0.95);
  const colors = tone === 'magenta' ? theme.gradients.magenta : theme.gradients.cyan;

  return (
    <Pressable
      style={styles.press}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      disabled={disabled}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.shell,
          theme.shadows.cta,
          { transform: [{ scale: press.scale }] },
          disabled ? styles.disabled : null,
        ]}>
        <LinearGradient
          colors={[colors[0], colors[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Image source={assets.buttonRect} style={styles.plate} resizeMode="cover" />
        <View style={styles.row}>
          {Icon ? <Icon size={theme.iconSize} color="#FFFFFF" /> : null}
          <Text style={styles.label}>{label}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%', height: 56 },
  shell: {
    width: '100%',
    height: 56,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plate: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined, opacity: 0.2 },
  disabled: { opacity: 0.4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.iconGap },
  label: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: 2.5,
  },
});
