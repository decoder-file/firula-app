/**
 * Firula Design System — Typography tokens
 * Família única: Plus Jakarta Sans (já embarcada no app).
 * Tamanhos em `sp` (fontSize respeita a escala de fonte do sistema no RN).
 * Regra: no máximo 3 tamanhos por tela.
 */

import type { TextStyle } from 'react-native';

export const fontFamily = {
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semibold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
  extrabold: 'PlusJakartaSans-ExtraBold',
} as const;

export type TypeToken =
  | 'display'
  | 'titleLg'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodySm'
  | 'label'
  | 'caption';

/** Cada token combina família (peso), tamanho, entrelinha e tracking. */
export const typography: Record<TypeToken, TextStyle> = {
  display: { fontFamily: fontFamily.extrabold, fontSize: 28, lineHeight: 36, letterSpacing: -0.4 },
  titleLg: { fontFamily: fontFamily.extrabold, fontSize: 22, lineHeight: 30, letterSpacing: -0.3 },
  title: { fontFamily: fontFamily.bold, fontSize: 18, lineHeight: 26, letterSpacing: -0.2 },
  subtitle: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  body: { fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  bodySm: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  label: { fontFamily: fontFamily.bold, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  caption: { fontFamily: fontFamily.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 0.8 },
};
