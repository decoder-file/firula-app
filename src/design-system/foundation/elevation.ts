/**
 * Firula Design System — Elevation tokens
 * Apenas 3 níveis. Cards em listas usam nível 0 (borda, sem sombra) —
 * sombras em centenas de itens custam caro no Android.
 *
 * Uso: aplique {...elevation[1]} no style. A cor de sombra é a mesma em ambos os temas
 * (sombra sempre escura); no dark o efeito é sutil por design.
 */

import type { ViewStyle } from 'react-native';

const shadowColor = '#141821';

export const elevation: Record<0 | 1 | 2, ViewStyle> = {
  // Flat — borda 1px, sem sombra. Cards de lista, inputs, chips.
  0: {},
  // Raised — cards em destaque, FAB em repouso, BottomNavigation.
  1: {
    shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  // Overlay — Dialog, BottomSheet, Snackbar, Drawer (sempre com scrim `overlay`).
  2: {
    shadowColor,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 12,
  },
};

export type ElevationLevel = keyof typeof elevation;
