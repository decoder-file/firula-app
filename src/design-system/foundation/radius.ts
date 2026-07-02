/**
 * Firula Design System — Radius tokens
 * Arredondamento moderado. Regra: quanto maior a superfície, maior o raio.
 */

export const radius = {
  sm: 8, // badges, thumbnails
  md: 12, // inputs, chips, botões sm
  lg: 16, // cards, botões, dialogs
  xl: 20, // cards grandes, sheets
  '2xl': 28, // bottom sheet, imagens hero
  full: 999, // pills, avatares, FAB
} as const;

export type RadiusToken = keyof typeof radius;
