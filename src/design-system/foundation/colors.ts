/**
 * Firula Design System — Color tokens
 * Base neutra fria + verde Firula como cor de marca.
 *
 * Regra de contraste crítica:
 *   Texto sobre `primary` é SEMPRE `onPrimary` (verde-escuro, 8.9:1) — nunca branco (2.4:1, reprova AA).
 *   Verde como texto/ícone sobre fundo claro usa `primaryText` (#12813F, 4.6:1 AA).
 */

/** Escala bruta da marca — não use direto na UI; prefira os semânticos abaixo. */
export const green = {
  50: '#EBFAF1',
  100: '#D3F5E2',
  200: '#A8EBC6',
  300: '#6FE0A4',
  400: '#3ED97F',
  500: '#1FBD63', // ★ marca
  600: '#17A354',
  700: '#12813F',
  900: '#0A2E1A',
} as const;

export type ColorScheme = 'light' | 'dark';

export interface Palette {
  // superfícies
  background: string;
  surface: string;
  surfaceAlt: string;
  // texto
  text: string;
  textMuted: string;
  // marca
  primary: string;
  onPrimary: string;
  primaryText: string;
  primarySoft: string;
  // estruturais
  border: string;
  overlay: string;
  // semânticos
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  error: string;
  errorSoft: string;
  info: string;
  infoSoft: string;
}

export const light: Palette = {
  background: '#F7F7F8',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F4F6',
  text: '#141821', // 15.9:1
  textMuted: '#5C6470', // 5.8:1 AA
  primary: '#1FBD63',
  onPrimary: '#0A2E1A', // 8.9:1 sobre primary
  primaryText: '#12813F', // 4.6:1 AA — verde como texto/ícone
  primarySoft: '#EBFAF1',
  border: '#E7EAEE',
  overlay: 'rgba(20, 24, 33, 0.5)',
  success: '#12813F',
  successSoft: '#EBFAF1',
  warning: '#B45309',
  warningSoft: '#FEF4E6',
  error: '#C42B2B', // 5.9:1 AA
  errorSoft: '#FDECEC',
  info: '#0961C9',
  infoSoft: '#E8F1FD',
};

/** Dark derivado do light — mesma hierarquia, contraste recalibrado. */
export const dark: Palette = {
  background: '#0E1116',
  surface: '#161B22',
  surfaceAlt: '#1E242D',
  text: '#F2F4F7', // 15.2:1
  textMuted: '#A6AEBB', // 7.4:1 AAA
  primary: '#2BD473',
  onPrimary: '#0A2E1A', // 10.7:1 sobre primary
  primaryText: '#4ADE8C', // 8.1:1 AAA — verde como texto
  primarySoft: '#12291C',
  border: '#2A313C',
  overlay: 'rgba(0, 0, 0, 0.6)',
  success: '#4ADE8C',
  successSoft: '#12291C',
  warning: '#FBBF60',
  warningSoft: '#2A2110',
  error: '#F87171', // 6.9:1 AA
  errorSoft: '#2A1414',
  info: '#6BB2F5',
  infoSoft: '#111F2E',
};

export const palettes: Record<ColorScheme, Palette> = { light, dark };
