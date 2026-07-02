/**
 * Firula Design System — Radio / RadioGroup
 * Escolha única visível (ex.: forma de pagamento). Linha inteira tocável (48dp).
 *
 *   <RadioGroup value={pay} onChange={setPay} options={[
 *     { value: 'pix', label: 'Pix — aprovação imediata' },
 *     { value: 'card', label: 'Cartão de crédito' },
 *   ]} />
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../foundation/ThemeProvider';
import { PressScale } from './PressScale';
import { Text } from './Text';

export interface RadioOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: RadioOption<T>[];
}

export function RadioGroup<T extends string>({ value, onChange, options }: RadioGroupProps<T>) {
  const { colors } = useTheme();

  return (
    <View accessibilityRole="radiogroup">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <PressScale
            key={opt.value}
            onPress={() => onChange(opt.value)}
            disabled={opt.disabled}
            scaleTo={0.99}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled: opt.disabled }}
            accessibilityLabel={opt.label}
            style={[styles.row, { opacity: opt.disabled ? 0.45 : 1 }]}
          >
            <View
              style={[
                styles.outer,
                selected
                  ? { borderColor: colors.primary, borderWidth: 7 }
                  : { borderColor: colors.textMuted, borderWidth: 2 },
                { backgroundColor: colors.surface },
              ]}
            />
            <View style={styles.texts}>
              <Text token="body" style={{ fontWeight: '500' }}>
                {opt.label}
              </Text>
              {opt.description ? (
                <Text token="bodySm" color="muted">
                  {opt.description}
                </Text>
              ) : null}
            </View>
          </PressScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  outer: { width: 24, height: 24, borderRadius: 999 },
  texts: { flex: 1 },
});
