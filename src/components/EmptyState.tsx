import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import type { IconComponent } from './PrimaryButton';

interface Props {
  title: string;
  hint: string;
  Icon: IconComponent;
}

/** A themed message, centred in its container. Never a blank area. */
export function EmptyState({ title, hint, Icon }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.ring}>
        <Icon size={28} color={theme.colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', paddingVertical: 26, paddingHorizontal: 20 },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: theme.colors.borderCyan,
    backgroundColor: 'rgba(18,18,31,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginTop: 6,
    textAlign: 'center',
  },
});
