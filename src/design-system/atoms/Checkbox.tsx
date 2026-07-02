/**
 * Firula Design System — Checkbox
 * Múltipla escolha / consentimento. A LINHA inteira é tocável (48dp), não só o box (24dp).
 *
 *   <Checkbox checked={agree} onChange={setAgree} label="Aceito os termos de uso" />
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { useTheme } from '../foundation/ThemeProvider';
import { PressScale } from './PressScale';
import { Text } from './Text';

export interface CheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  testID?: string;
}

export function Checkbox({ checked, onChange, label, description, disabled, testID }: CheckboxProps) {
  const { colors } = useTheme();

  return (
    <PressScale
      onPress={() => onChange(!checked)}
      disabled={disabled}
      scaleTo={0.99}
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      style={[styles.row, { opacity: disabled ? 0.45 : 1 }]}
    >
      <View
        style={[
          styles.box,
          checked
            ? { backgroundColor: colors.primary, borderColor: colors.primary }
            : { borderColor: colors.textMuted, borderWidth: 2 },
        ]}
      >
        {checked ? <Check size={15} color={colors.onPrimary} strokeWidth={3} /> : null}
      </View>
      <View style={styles.texts}>
        <Text token="body" style={{ fontWeight: '500' }}>
          {label}
        </Text>
        {description ? (
          <Text token="bodySm" color="muted">
            {description}
          </Text>
        ) : null}
      </View>
    </PressScale>
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
  box: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1 },
});
