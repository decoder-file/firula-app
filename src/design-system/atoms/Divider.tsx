/**
 * Firula Design System — Divider
 * 1px na cor `border`. Inset (alinha com o conteúdo após o leading) ou full-bleed.
 *
 *   <Divider />
 *   <Divider inset={56} />
 */

import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../foundation/ThemeProvider';

export interface DividerProps {
  /** Recuo à esquerda em dp (alinha com texto após avatar/ícone). Default 0. */
  inset?: number;
}

export function Divider({ inset = 0 }: DividerProps) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ height: 1, backgroundColor: colors.border, marginLeft: inset }}
    />
  );
}
