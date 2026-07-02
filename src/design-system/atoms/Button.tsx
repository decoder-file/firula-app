/**
 * Firula Design System — Button
 *
 * Quando usar: ação principal da tela (variant primary, máx. 1 por tela),
 * ações secundárias claras, confirmação em dialogs/sheets.
 * Quando NÃO usar: navegação em listas (ListItem), ação sobre 1 ícone (IconButton),
 * filtros/seleção (Chip).
 *
 *   <Button label="Comprar ingresso" onPress={buy} />
 *   <Button label="Ver detalhes" variant="secondary" onPress={open} />
 *   <Button label="Cancelar" variant="destructive" loading={submitting} onPress={cancel} />
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '../foundation/ThemeProvider';
import type { Palette } from '../foundation/colors';
import { PressScale } from './PressScale';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Ícone Lucide (opcional) à esquerda do label. Recebe size/color. */
  icon?: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  testID?: string;
}

interface VariantStyle {
  bg: string;
  fg: TextColorKey;
  border?: string;
}
type TextColorKey = 'onPrimary' | 'default' | 'primary' | 'error';

function resolveVariant(variant: ButtonVariant, c: Palette): VariantStyle {
  switch (variant) {
    case 'primary':
      return { bg: c.primary, fg: 'onPrimary' };
    case 'secondary':
      return { bg: c.surfaceAlt, fg: 'default' };
    case 'outline':
      return { bg: 'transparent', fg: 'primary', border: c.primary };
    case 'ghost':
      return { bg: 'transparent', fg: 'primary' };
    case 'destructive':
      return { bg: c.errorSoft, fg: 'error' };
  }
}

const fgColorProp: Record<TextColorKey, 'onPrimary' | 'default' | 'primary' | 'error'> = {
  onPrimary: 'onPrimary',
  default: 'default',
  primary: 'primary',
  error: 'error',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  testID,
}: ButtonProps) {
  const { colors, radius } = useTheme();
  const v = resolveVariant(variant, colors);
  const isDisabled = disabled || loading;

  const height = size === 'md' ? 48 : 40;
  const paddingH = size === 'md' ? 24 : 16;
  const br = size === 'md' ? radius.lg : radius.md;

  const iconColor =
    v.fg === 'onPrimary' ? colors.onPrimary : v.fg === 'error' ? colors.error : colors.primaryText;

  const container: ViewStyle = {
    height,
    minHeight: 48, // área de toque nunca < 48dp mesmo no size sm
    paddingHorizontal: paddingH,
    borderRadius: br,
    backgroundColor: v.bg,
    borderWidth: v.border ? 1.5 : 0,
    borderColor: v.border,
    opacity: isDisabled ? 0.45 : 1,
    ...styles.center,
    width: fullWidth ? '100%' : undefined,
  };

  return (
    <PressScale
      onPress={onPress}
      disabled={isDisabled}
      style={container}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={label}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator size="small" color={iconColor} />
        ) : (
          <>
            {Icon ? <Icon size={size === 'md' ? 18 : 16} color={iconColor} strokeWidth={2} /> : null}
            <Text token="label" color={fgColorProp[v.fg]}>
              {label}
            </Text>
          </>
        )}
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
