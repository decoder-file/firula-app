/**
 * Firula Design System — Slider
 * Faixas contínuas (ex.: faixa de preço no filtro). SEMPRE com valor visível —
 * o slider sozinho não comunica precisão. Thumb 28dp, área de toque 48dp.
 *
 * Wrapper fino sobre @react-native-community/slider (dependência recomendada),
 * já tematizado. Se não usar o pacote, veja a nota no fim do arquivo.
 *
 *   <Slider label="Preço máximo" value={price} onValueChange={setPrice}
 *     min={0} max={1000} step={50} formatValue={(v) => formatCurrency(v)} />
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import RNSlider from '@react-native-community/slider';

import { useTheme } from '../foundation/ThemeProvider';
import { Text } from './Text';

export interface SliderProps {
  value: number;
  onValueChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  /** Formata o valor exibido à direita e o rótulo de acessibilidade. */
  formatValue?: (v: number) => string;
  minLabel?: string;
  maxLabel?: string;
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  formatValue = (v) => String(v),
  minLabel,
  maxLabel,
}: SliderProps) {
  const { colors } = useTheme();

  return (
    <View>
      {label ? (
        <View style={styles.header}>
          <Text token="bodySm" style={{ fontWeight: '600' }}>{label}</Text>
          <Text token="bodySm" color="primary" style={{ fontWeight: '700' }}>{formatValue(value)}</Text>
        </View>
      ) : null}
      <RNSlider
        value={value}
        onValueChange={onValueChange}
        minimumValue={min}
        maximumValue={max}
        step={step}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        style={{ height: 40 }}
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: value, text: formatValue(value) }}
      />
      {minLabel || maxLabel ? (
        <View style={styles.footer}>
          <Text token="caption" color="muted" style={{ textTransform: 'none', letterSpacing: 0 }}>{minLabel}</Text>
          <Text token="caption" color="muted" style={{ textTransform: 'none', letterSpacing: 0 }}>{maxLabel}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
});

/**
 * NOTA: se preferir não adicionar @react-native-community/slider, troque RNSlider por
 * uma trilha própria com PanResponder — a API pública (props acima) permanece idêntica.
 */
