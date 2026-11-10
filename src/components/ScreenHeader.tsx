import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';
import type { IconComponent } from './PrimaryButton';

interface HeaderProps {
  title: string;
  subtitle?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

/**
 * The one header of the app. Every screen renders this same component and only
 * swaps its slots, so padding, type scale and badge style can never drift apart.
 */
export function ScreenHeader({ title, subtitle, leftSlot, rightSlot }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>{leftSlot}</View>
      <View style={styles.middle}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[styles.side, styles.sideRight]}>{rightSlot}</View>
    </View>
  );
}

interface PillProps {
  label: string;
  onPress: () => void;
  Icon?: IconComponent;
}

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/** The slot button used for the MENU route out of every secondary screen. */
export function HeaderPillButton({ label, onPress, Icon }: PillProps) {
  const press = usePressScale(0.93);
  return (
    <Pressable
      style={styles.pillPress}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.pill, { transform: [{ scale: press.scale }] }]}>
        <View style={styles.pillRow}>
          {Icon ? <Icon size={theme.iconSize} color={theme.colors.secondary} /> : null}
          <Text style={styles.pillLabel}>{label}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

/** Small read-only HUD badge for the right slot (never empty: the caller guards). */
export function HeaderBadge({ Icon, value, accent }: { Icon: IconComponent; value: string; accent: string }) {
  return (
    <View style={[styles.badge, { borderColor: accent + '66' }]}>
      <Icon size={16} color={accent} />
      <Text style={[styles.badgeValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 44,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: { width: 104, justifyContent: 'center' },
  sideRight: { alignItems: 'flex-end' },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.secondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.6,
    marginTop: 3,
    textAlign: 'center',
  },
  pillPress: { width: 100, height: 44 },
  pill: {
    width: 100,
    height: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderCyanStrong,
    backgroundColor: 'rgba(0,245,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.iconGap },
  pillLabel: {
    color: theme.colors.secondary,
    fontSize: 13,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  badge: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(10,10,15,0.5)',
  },
  badgeValue: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5, fontVariant: ['tabular-nums'] },
});
