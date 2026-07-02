/**
 * Firula Design System — Chip
 * Filtro ou seleção. TOCÁVEL (alvo 38dp visual, área 48dp). Seleção por
 * fundo + peso + ícone de check — nunca só cor.
 *
 *   <Chip label="Todos" selected={f === 'all'} onPress={() => setF('all')} />
 *   <Chip label="Esta semana" selected onRemove={clear} />
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Check, X } from 'lucide-react-native';

import { useTheme } from '../foundation/ThemeProvider';
import { PressScale } from './PressScale';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Se presente, mostra um X à direita e chama isto ao tocar nele. */
  onRemove?: () => void;
  testID?: string;
}

export function Chip({ label, selected = false, onPress, onRemove, testID }: ChipProps) {
  const { colors } = useTheme();

  const bg = selected ? colors.primary : colors.surface;
  const fg = selected ? colors.onPrimary : colors.textMuted;
  const border = selected ? colors.primary : colors.border;

  return (
    <PressScale
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[
        styles.chip,
        { backgroundColor: bg, borderColor: border, borderWidth: 1 },
      ]}
    >
      <View style={styles.row}>
        {selected && !onRemove ? <Check size={15} color={fg} strokeWidth={3} /> : null}
        <Text token="label" style={{ color: fg, fontSize: 13 }}>
          {label}
        </Text>
        {onRemove ? <X size={14} color={fg} strokeWidth={2.5} /> : null}
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 38,
    minHeight: 38,
    paddingHorizontal: 16,
    borderRadius: 999,
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
