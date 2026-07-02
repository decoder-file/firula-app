/**
 * Firula Design System — Motion tokens
 * Animações são feedback, não decoração. Anime só `transform` e `opacity`
 * (nativo, 60fps via Reanimated). Respeite reduce-motion (ver useReducedMotion).
 */

import { Easing } from 'react-native';

export const duration = {
  press: 100, // press state: scale 0.97 + opacity 0.9 — feedback imediato
  fast: 150, // switch, checkbox, chips, tabs
  standard: 220, // fade/slide de conteúdo, snackbar
  enter: 300, // bottom sheet, dialog, transições de tela
} as const;

export const easing = {
  standard: Easing.bezier(0.2, 0, 0, 1), // easeOut padrão
  emphasized: Easing.out(Easing.exp), // entradas de overlay
  linear: Easing.linear, // press
} as const;

/** Escala de press padrão para pressables. */
export const pressScale = 0.97;

export type DurationToken = keyof typeof duration;
