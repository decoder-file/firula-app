/**
 * Firula Design System — FAB (Floating Action Button)
 * Reservado à ação global mais importante da tela (no Firula: escanear ingresso).
 * Máx. 1 por tela. 56dp, ou estendido com label. Some ao rolar para baixo (visible).
 *
 *   <FAB icon={QrCode} accessibilityLabel="Escanear ingresso" onPress={scan} />
 *   <FAB icon={QrCode} label="Escanear" onPress={scan} />   // estendido
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../foundation/ThemeProvider';
import { PressScale } from './PressScale';
import { Text } from './Text';

export interface FABProps {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  accessibilityLabel: string;
  onPress: () => void;
  /** Se presente, renderiza FAB estendido (pill com texto). */
  label?: string;
  visible?: boolean;
  testID?: string;
}

export function FAB({ icon: Icon, accessibilityLabel, onPress, label, visible = true, testID }: FABProps) {
  const { colors, elevation, iconStrokeWidth } = useTheme();
  if (!visible) return null;

  const extended = !!label;

  return (
    <PressScale
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.base,
        elevation[1],
        {
          backgroundColor: colors.primary,
          height: 56,
          width: extended ? undefined : 56,
          paddingHorizontal: extended ? 22 : 0,
          borderRadius: 999,
        },
      ]}
    >
      <View style={styles.row}>
        <Icon size={24} color={colors.onPrimary} strokeWidth={iconStrokeWidth} />
        {extended ? (
          <Text token="label" style={{ color: colors.onPrimary }}>{label}</Text>
        ) : null}
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
