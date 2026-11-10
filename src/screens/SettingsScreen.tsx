import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Menu as MenuIcon } from 'lucide-react-native';
import { HudPanel } from '../components/HudPanel';
import { ScreenBackground } from '../components/ScreenBackground';
import { HeaderPillButton, ScreenHeader } from '../components/ScreenHeader';
import { SecondaryButton } from '../components/SecondaryButton';
import { SettingRow } from '../components/SettingRow';
import { theme } from '../constants/theme';
import type { RotationDirection, TraceMode } from '../game/types';
import { useProgressStore } from '../hooks/useProgressStore';

interface Props {
  onMenu: () => void;
}

/**
 * Five rows, every one of them with a real effect on the rig.
 * No sound or music controls: the app has no audio, so a volume slider
 * would be a control that does nothing.
 */
export function SettingsScreen({ onMenu }: Props) {
  const { settings, updateSettings, resetProgress } = useProgressStore();
  const [confirming, setConfirming] = useState(false);

  return (
    <ScreenBackground overlay={theme.overlays.panel}>
      <ScreenHeader
        title="SETTINGS"
        subtitle="BENCH CONFIGURATION"
        leftSlot={<HeaderPillButton label="MENU" Icon={MenuIcon} onPress={onMenu} />}
      />

      <View style={styles.body}>
        <View style={styles.rows}>
          <SettingRow
            label="ROTATION DIRECTION"
            hint="WHICH WAY A TAP TURNS A ROTOR"
            control="segmented"
            options={['CW', 'CCW']}
            value={settings.rotation}
            onChange={v => updateSettings({ rotation: v as RotationDirection })}
          />
          <SettingRow
            label="ROUTE TRACE"
            hint="ALWAYS ON DRAWS THE LIVE ROUTE FREE, BUT DISABLES THE PERFECT BONUS"
            control="segmented"
            options={['MANUAL', 'ALWAYS']}
            value={settings.trace === 'ALWAYS_ON' ? 'ALWAYS' : 'MANUAL'}
            onChange={v => updateSettings({ trace: (v === 'ALWAYS' ? 'ALWAYS_ON' : 'MANUAL') as TraceMode })}
          />
          <SettingRow
            label="HIGH-CONTRAST POCKETS"
            hint="TAGS THE TARGET POCKET SO IT IS NOT MARKED BY COLOUR ALONE"
            control="toggle"
            value={settings.highContrast}
            onChange={v => updateSettings({ highContrast: Boolean(v) })}
          />
          <SettingRow
            label="REDUCED MOTION"
            hint="FASTER DROP STEPS, NO SHAKE, SHORTER SCREEN TRANSITIONS"
            control="toggle"
            value={settings.reducedMotion}
            onChange={v => updateSettings({ reducedMotion: Boolean(v) })}
          />
          <SettingRow
            label="RESET PROGRESS"
            hint="CLEARS ROUTES, SPARKS, BLUEPRINTS, STREAK AND THE RUN LOG"
            control="danger"
            dangerLabel={confirming ? 'CANCEL' : 'RESET'}
            onDanger={() => setConfirming(c => !c)}
          />
        </View>

        {confirming ? (
          <HudPanel accent={theme.colors.primary} style={styles.confirm}>
            <Text style={styles.confirmText}>
              THIS WIPES THE WHOLE BENCH LOG. THERE IS NO UNDO.
            </Text>
            <SecondaryButton
              label="CONFIRM RESET"
              onPress={() => {
                resetProgress();
                setConfirming(false);
              }}
            />
          </HudPanel>
        ) : null}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 16, paddingBottom: 20 },
  rows: { gap: 10 },
  confirm: { padding: 14, marginTop: 14 },
  confirmText: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 14,
  },
});
