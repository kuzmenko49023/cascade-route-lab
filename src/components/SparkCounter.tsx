import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { theme } from '../constants/theme';

interface Props {
  collected: number;
  total: number;
}

/** Sparks banked on the current route. Hidden when the rig carries none. */
export function SparkCounter({ collected, total }: Props) {
  if (total <= 0) {
    return null;
  }
  return (
    <View style={styles.root}>
      <Sparkles size={16} color={theme.colors.spark} />
      <Text style={styles.value}>
        {collected}/{total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,200,87,0.4)',
    backgroundColor: 'rgba(10,10,15,0.45)',
  },
  value: {
    color: theme.colors.spark,
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
