/**
 * Firula Design System — IconButton
 * Ação sobre um único ícone. Área de toque SEMPRE 48dp, mesmo com visual menor.
 * accessibilityLabel é OBRIGATÓRIA (botão só-ícone sem label é inacessível).
 *
 *   <IconButton icon={Heart} accessibilityLabel="Favoritar" onPress={fav} />
 *   <IconButton icon={Bell} variant="tonal" badge accessibilityLabel="Notificações" onPress={open} />
 */

import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '../foundation/ThemeProvider';
import type { Palette } from '../foundation/colors';
import { PressScale } from './PressScale';

export type IconButtonVariant = 'ghost' | 'outlined' | 'filled' | 'tonal';

export interface IconButtonProps {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  accessibilityLabel: string;
  onPress: () => void;
  variant?: IconButtonVariant;
  /** Ponto de notificação no canto superior direito. */
  badge?: boolean;
  disabled?: boolean;
  testID?: string;
}

function resolveVariant(variant: IconButtonVariant, c: Palette) {
  switch (variant) {
    case 'ghost':
      return { bg: 'transparent', fg: c.text, border: undefined };
    case 'outlined':
      return { bg: c.surface, fg: c.text, border: c.border };
    case 'filled':
      return { bg: c.primary, fg: c.onPrimary, border: undefined };
    case 'tonal':
      return { bg: c.surfaceAlt, fg: c.text, border: undefined };
  }
}

export function IconButton({
  icon: Icon,
  accessibilityLabel,
  onPress,
  variant = 'ghost',
  badge = false,
  disabled = false,
  testID,
}: IconButtonProps) {
  const { colors, iconStrokeWidth } = useTheme();
  const v = resolveVariant(variant, colors);

  const container: ViewStyle = {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: v.bg,
    borderWidth: v.border ? 1 : 0,
    borderColor: v.border,
    opacity: disabled ? 0.45 : 1,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <PressScale
      onPress={onPress}
      disabled={disabled}
      style={container}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      <Icon size={22} color={v.fg} strokeWidth={iconStrokeWidth} />
      {badge ? <View style={[styles.badge, { borderColor: v.bg === 'transparent' ? colors.background : v.bg, backgroundColor: colors.error }]} /> : null}
    </PressScale>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 9,
    height: 9,
    borderRadius: 999,
    borderWidth: 1.5,
  },
});
