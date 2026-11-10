import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';
import { HudFrame } from '../components/HudFrame';
import { ScreenBackground } from '../components/ScreenBackground';
import { LOADER_DURATION_MS } from '../constants/config';
import { theme } from '../constants/theme';

interface Props {
  onDone: () => void;
}

const BAR_W = 180;
const HALF = BAR_W / 2;

/**
 * Brand card only: no CTA, no chips, no tap handler. The hold is timer driven
 * and always runs its full LOADER_DURATION_MS before handing over to the hub.
 */
export function LoaderScreen({ onDone }: Props) {
  const ringFade = useRef(new Animated.Value(0)).current;
  const markScale = useRef(new Animated.Value(0.78)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleRise = useRef(new Animated.Value(14)).current;
  const fill = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.4)).current;

  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const timer = setTimeout(() => doneRef.current(), LOADER_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const entry = Animated.parallel([
      Animated.timing(ringFade, { toValue: 1, duration: 420, delay: 120, useNativeDriver: true }),
      Animated.spring(markScale, {
        toValue: 1,
        delay: 120,
        tension: theme.spring.logo.tension,
        friction: theme.spring.logo.friction,
        useNativeDriver: true,
      }),
      Animated.timing(titleFade, { toValue: 1, duration: 280, delay: 520, useNativeDriver: true }),
      Animated.timing(titleRise, { toValue: 0, duration: 280, delay: 520, useNativeDriver: true }),
      Animated.timing(fill, {
        toValue: 1,
        duration: LOADER_DURATION_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]);
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 450, useNativeDriver: true }),
      ]),
    );
    entry.start();
    blink.start();
    return () => {
      entry.stop();
      blink.stop();
    };
  }, [fill, markScale, pulse, ringFade, titleFade, titleRise]);

  return (
    <ScreenBackground overlay={theme.overlays.loader}>
      <HudFrame color="rgba(0,245,255,0.30)" inset={20} arm={28} />
      <View style={styles.root}>
        <Animated.View style={[styles.ring, { opacity: ringFade }]}>
          <Animated.Image
            source={assets.logo}
            resizeMode="contain"
            style={[styles.mark, { transform: [{ scale: markScale }] }]}
          />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[styles.titleBox, { opacity: titleFade, transform: [{ translateY: titleRise }] }]}>
          <Text style={styles.title}>CASCADE</Text>
          <Text style={styles.title}>ROUTE LAB</Text>
          <Text style={styles.subtitle}>ROTOR CALIBRATION</Text>
        </Animated.View>

        <View style={styles.track}>
          <Animated.View
            style={[
              styles.fillWrap,
              { transform: [{ translateX: -HALF }, { scaleX: fill }, { translateX: HALF }] },
            ]}>
            <LinearGradient
              colors={[theme.gradients.route[0], theme.gradients.route[1]]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.fill}
            />
          </Animated.View>
        </View>
        <Animated.Text style={[styles.loading, { opacity: pulse }]}>
          {'LOADING…'}
        </Animated.Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  ring: {
    width: 180,
    height: 180,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(0,245,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: { width: 148, height: 148 },
  titleBox: { alignItems: 'center', marginTop: 30 },
  title: {
    color: '#F2F4FF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 4,
    textAlign: 'center',
    textShadowColor: '#FF006E',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    marginTop: 14,
  },
  track: {
    width: BAR_W,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 40,
    overflow: 'hidden',
  },
  fillWrap: { width: BAR_W, height: 4 },
  fill: { width: BAR_W, height: 4, borderRadius: 2 },
  loading: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.5,
    marginTop: 14,
  },
});
