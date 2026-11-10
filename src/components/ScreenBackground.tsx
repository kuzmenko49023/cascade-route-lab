import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { assets } from '../assets';

interface Props {
  /** three-stop overlay: every screen uses the same photo and its own tint */
  overlay: readonly [string, string, string];
  children: React.ReactNode;
}

/**
 * The single background of the app. bg_game is the only image; screens are
 * told apart by the gradient on top of it plus two soft colour blobs.
 */
export function ScreenBackground({ overlay, children }: Props) {
  return (
    <ImageBackground source={assets.bg} style={styles.root} resizeMode="cover">
      <LinearGradient
        colors={[overlay[0], overlay[1], overlay[2]]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={[styles.blob, styles.blobMagenta]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobCyan]} />
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0F' },
  content: { flex: 1 },
  blob: { position: 'absolute', borderRadius: 999 },
  blobMagenta: {
    width: 260,
    height: 260,
    top: -60,
    left: -40,
    backgroundColor: 'rgba(255,0,110,0.12)',
  },
  blobCyan: {
    width: 300,
    height: 300,
    bottom: -90,
    right: -70,
    backgroundColor: 'rgba(0,245,255,0.09)',
  },
});
