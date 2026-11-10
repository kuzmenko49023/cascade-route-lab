import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';

const HIT = { top: 6, bottom: 6, left: 6, right: 6 };

interface SegmentedProps {
  options: [string, string];
  value: string;
  onChange: (value: string) => void;
}

function Segmented({ options, value, onChange }: SegmentedProps) {
  return (
    <View style={styles.segmented}>
      {options.map(opt => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            style={styles.segment}
            hitSlop={HIT}
            onPress={() => onChange(opt)}
            accessibilityRole="button"
            accessibilityLabel={opt}>
            <View style={[styles.segmentInner, active ? styles.segmentOn : null]}>
              <Text style={[styles.segmentText, active ? styles.segmentTextOn : null]}>{opt}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

interface ToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
}

function Toggle({ value, onChange, label }: ToggleProps) {
  const press = usePressScale(0.94);
  return (
    <Pressable
      style={styles.togglePress}
      hitSlop={HIT}
      onPress={() => onChange(!value)}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      accessibilityRole="switch"
      accessibilityLabel={label}>
      <Animated.View
        pointerEvents="box-none"
        style={[styles.toggle, value ? styles.toggleOn : null, { transform: [{ scale: press.scale }] }]}>
        <View style={[styles.knob, value ? styles.knobOn : null]} />
        <Text style={[styles.toggleText, value ? styles.toggleTextOn : null]}>
          {value ? 'ON' : 'OFF'}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

interface Props {
  label: string;
  hint: string;
  control: 'toggle' | 'segmented' | 'danger';
  options?: [string, string];
  value?: string | boolean;
  onChange?: (value: string | boolean) => void;
  dangerLabel?: string;
  onDanger?: () => void;
}

/** One settings row. Every control here changes real behaviour and is persisted. */
export function SettingRow({
  label,
  hint,
  control,
  options,
  value,
  onChange,
  dangerLabel,
  onDanger,
}: Props) {
  const press = usePressScale(0.97);
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <Text numberOfLines={1} style={styles.label}>
          {label}
        </Text>
        <Text numberOfLines={2} style={styles.hint}>
          {hint}
        </Text>
      </View>
      <View style={styles.control}>
        {control === 'segmented' && options ? (
          <Segmented
            options={options}
            value={String(value)}
            onChange={v => onChange && onChange(v)}
          />
        ) : null}
        {control === 'toggle' ? (
          <Toggle value={Boolean(value)} onChange={v => onChange && onChange(v)} label={label} />
        ) : null}
        {control === 'danger' ? (
          <Pressable
            style={styles.dangerPress}
            hitSlop={HIT}
            onPress={onDanger}
            onPressIn={press.onPressIn}
            onPressOut={press.onPressOut}
            accessibilityRole="button"
            accessibilityLabel={dangerLabel || 'reset'}>
            <Animated.View
              pointerEvents="box-none"
              style={[styles.danger, { transform: [{ scale: press.scale }] }]}>
              <Text style={styles.dangerText}>{dangerLabel || 'RESET'}</Text>
            </Animated.View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    backgroundColor: 'rgba(18,18,31,0.70)',
  },
  texts: { flex: 1, paddingRight: 10 },
  label: { color: theme.colors.text, fontSize: 13, fontWeight: '700', letterSpacing: 1.2 },
  hint: { color: theme.colors.textMuted, fontSize: 9, fontWeight: '600', letterSpacing: 0.8, marginTop: 3 },
  control: { alignItems: 'flex-end', justifyContent: 'center' },

  segmented: { flexDirection: 'row', gap: 6 },
  segment: { width: 58, height: 36 },
  segmentInner: {
    width: 58,
    height: 36,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentOn: { borderColor: theme.colors.secondary, backgroundColor: 'rgba(0,245,255,0.14)' },
  segmentText: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  segmentTextOn: { color: theme.colors.secondary },

  togglePress: { width: 84, height: 36 },
  toggle: {
    width: 84,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    gap: 6,
  },
  toggleOn: { borderColor: theme.colors.success, backgroundColor: 'rgba(127,232,197,0.14)' },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.25)' },
  knobOn: { backgroundColor: theme.colors.success },
  toggleText: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  toggleTextOn: { color: theme.colors.success },

  dangerPress: { width: 92, height: 36 },
  danger: {
    width: 92,
    height: 36,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(255,0,110,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerText: { color: theme.colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
});
