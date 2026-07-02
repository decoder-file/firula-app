/**
 * Firula Design System — Spacing tokens
 * Escala de 4pt (granularidade para densidade mobile).
 * Padding de tela: screen (16dp phone) / screenTablet (24dp, conteúdo máx. 640dp).
 */

export const spacing = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
  s8: 32,
  s10: 40,
  s12: 48,
  s16: 64,
} as const;

export type SpacingToken = keyof typeof spacing;

export const layout = {
  screenPadding: 16,
  screenPaddingTablet: 24,
  contentMaxWidth: 640, // tablet: centraliza o conteúdo
  listGap: 12, // gap padrão entre cards em listas
  tabletBreakpoint: 768,
  minTouchTarget: 48, // dp — nunca menor
} as const;
