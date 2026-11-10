import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

interface Props {
  text: string;
  visible: boolean;
}

/**
 * Names the gesture and its result, so a tap-on-a-cell control never has to be
 * guessed. Kept above the floating bar where the button shadow cannot clip it.
 */
export function HintLine({ text, visible }: Props) {
  if (!visible) {
    return null;
  }
  return (
    <View style={styles.wrap}>
      <Text numberOfLines={2} style={styles.text}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingBottom: 8 },
  text: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.4,
    textAlign: 'center',
  },
});
