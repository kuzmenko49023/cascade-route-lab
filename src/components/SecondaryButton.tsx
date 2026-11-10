import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';
import type { IconComponent } from './PrimaryButton';

interface Props {
  label: string;
  Icon?: IconComponent;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'cyan' | 'plain';
  caption?: string;
}

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/** h48 companion to PrimaryButton. Same icon size, same lineHeight, same gap. */
export function SecondaryButton({
  label,
  Icon,
  onPress,
  disabled = false,
  tone = 'cyan',
  caption,
}: Props) {
  const press = usePressScale(0.96);
  const colour = tone === 'cyan' ? theme.colors.secondary : theme.colors.text;

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
          tone === 'cyan' ? styles.cyan : styles.plain,
          { transform: [{ scale: press.scale }] },
          disabled ? styles.disabled : null,
        ]}>
        <View style={styles.row}>
          {Icon ? <Icon size={theme.iconSize} color={colour} /> : null}
          <Text style={[styles.label, { color: colour }]}>{label}</Text>
        </View>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%', height: 48 },
  shell: {
    width: '100%',
    height: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cyan: { backgroundColor: 'rgba(0,245,255,0.10)', borderColor: theme.colors.borderCyanStrong },
  plain: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: theme.colors.hairline },
  disabled: { opacity: 0.35 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.iconGap },
  label: { fontSize: 14, lineHeight: 24, fontWeight: '700', letterSpacing: 2 },
  caption: {
    color: theme.colors.textMuted,
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '600',
    marginTop: 1,
  },
});
