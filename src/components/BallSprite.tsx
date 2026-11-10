import React from 'react';
import { Animated, StyleSheet } from 'react-native';
import { assets } from '../assets';

interface Props {
  pos: Animated.ValueXY;
  opacity: Animated.Value;
  tile: number;
}

const BALL = 28;

/** The chrome orb. Only transform and opacity move, so the native driver is safe. */
export function BallSprite({ pos, opacity, tile }: Props) {
  // absolute children sit inside the frame padding already, so only the
  // centring inside one tile is left to do here
  const offset = (tile - BALL) / 2;
  return (
    <Animated.Image
      source={assets.orb}
      resizeMode="contain"
      style={[
        styles.ball,
        {
          left: offset,
          top: offset,
          opacity,
          transform: [{ translateX: pos.x }, { translateY: pos.y }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  // the orb floats over the rotors and must never intercept a tap meant for one
  ball: { position: 'absolute', width: BALL, height: BALL, zIndex: 20, pointerEvents: 'none' },
});
