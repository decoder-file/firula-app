/**
 * Firula Design System — Text
 * Wrapper de RNText que aplica um token tipográfico e a cor de texto do tema.
 * Garante que TODO texto do app passe pela escala e pelos contrastes definidos.
 *
 *   <Text token="titleLg">Próximos eventos</Text>
 *   <Text token="bodySm" color="muted">Sáb, 14 dez</Text>
 */

import React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '../foundation/ThemeProvider';
import type { TypeToken } from '../foundation/typography';

type TextColor = 'default' | 'muted' | 'primary' | 'onPrimary' | 'error' | 'inherit';

export interface TextProps extends RNTextProps {
  token?: TypeToken;
  color?: TextColor;
}

export function Text({ token = 'body', color = 'default', style, ...props }: TextProps) {
  const { typography, colors } = useTheme();

  const colorMap: Record<TextColor, string | undefined> = {
    default: colors.text,
    muted: colors.textMuted,
    primary: colors.primaryText,
    onPrimary: colors.onPrimary,
    error: colors.error,
    inherit: undefined,
  };

  return (
    <RNText
      {...props}
      style={[typography[token], colorMap[color] ? { color: colorMap[color] } : null, style]}
    />
  );
}
