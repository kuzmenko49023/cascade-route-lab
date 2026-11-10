import React from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';
import { theme } from '../constants/theme';
import { usePressScale } from '../hooks/usePressScale';
import { HudFrame } from './HudFrame';
import type { IconComponent } from './PrimaryButton';

interface Props {
  size: 'lg' | 'sm' | 'strip';
  caption: string;
  metric?: string;
  overline?: string;
  Icon: IconComponent;
  accent: string;
  onPress: () => void;
}

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };
const HEIGHTS = { lg: 186, sm: 104, strip: 56 };

/** The M3 hub tile. One component, three sizes, used for every Menu route. */
export function BentoTile({ size, caption, metric, overline, Icon, accent, onPress }: Props) {
  const press = usePressScale(size === 'lg' ? 0.97 : 0.95);
  const height = HEIGHTS[size];
  const large = size === 'lg';

  return (
    <Pressable
      style={[styles.press, { height }]}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={HIT}
      accessibilityRole="button"
      accessibilityLabel={caption}>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.shell,
          { height },
          large ? styles.shellLarge : styles.shellSmall,
          large ? theme.shadows.cta : null,
          { transform: [{ scale: press.scale }] },
        ]}>
        {large ? (
          <>
            <LinearGradient
              colors={[theme.gradients.magentaDeep[0], theme.gradients.magentaDeep[1]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Image source={assets.buttonRect} style={styles.plate} resizeMode="cover" />
            <Image source={assets.rotor} style={styles.rotor} resizeMode="contain" />
            <HudFrame color="rgba(255,255,255,0.3)" inset={10} arm={22} />
          </>
        ) : (
          <View pointerEvents="none" style={[styles.bracket, { borderColor: accent + '99' }]} />
        )}

        <View style={large ? styles.bodyLarge : styles.bodySmall}>
          {overline ? <Text style={styles.overline}>{overline}</Text> : null}
          <View style={styles.row}>
            <Icon size={theme.iconSize} color={large ? '#FFFFFF' : accent} />
            <Text style={[styles.caption, large ? styles.captionLarge : null]}>{caption}</Text>
          </View>
          {metric ? (
            <Text style={[styles.metric, large ? styles.metricLarge : null]}>{metric}</Text>
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { width: '100%' },
  shell: {
    width: '100%',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  shellLarge: { borderColor: 'rgba(255,255,255,0.16)' },
  shellSmall: { borderColor: theme.colors.borderCyan, backgroundColor: theme.colors.glass },
  plate: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined, opacity: 0.18 },
  rotor: { position: 'absolute', right: 14, bottom: 14, width: 72, height: 72, opacity: 0.9 },
  bracket: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 16,
    height: 16,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  bodyLarge: { padding: 18 },
  bodySmall: { padding: 14, flex: 1, justifyContent: 'flex-end' },
  overline: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: theme.iconGap },
  caption: { color: theme.colors.text, fontSize: 13, lineHeight: 24, fontWeight: '700', letterSpacing: 1.6 },
  // same 24 icon, same 24 lineHeight as every other button in the app
  captionLarge: { fontSize: 24, lineHeight: 24, fontWeight: '800', letterSpacing: 3 },
  metric: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginTop: 6,
  },
  metricLarge: { color: 'rgba(255,255,255,0.8)', fontSize: 11, letterSpacing: 2 },
});
