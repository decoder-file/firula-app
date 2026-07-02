/**
 * Firula Design System — ThemeProvider + useTheme
 *
 * Fonte única de verdade do tema em runtime. Segue o esquema do sistema por padrão
 * (Appearance), com override manual opcional persistido pelo consumidor.
 *
 * Uso:
 *   <ThemeProvider>
 *     <App />
 *   </ThemeProvider>
 *
 *   const { colors, scheme, setScheme } = useTheme();
 *   <View style={{ backgroundColor: colors.surface }} />
 */

import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { Appearance } from 'react-native';

import { palettes, type Palette, type ColorScheme } from './colors';
import { spacing, layout } from './spacing';
import { radius } from './radius';
import { elevation } from './elevation';
import { typography } from './typography';
import { duration, easing } from './motion';
import { iconSize, iconStrokeWidth } from './icons';

export type ThemeMode = ColorScheme | 'system';

export interface Theme {
  scheme: ColorScheme;
  colors: Palette;
  spacing: typeof spacing;
  layout: typeof layout;
  radius: typeof radius;
  elevation: typeof elevation;
  typography: typeof typography;
  duration: typeof duration;
  easing: typeof easing;
  iconSize: typeof iconSize;
  iconStrokeWidth: number;
}

interface ThemeContextValue extends Theme {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function buildTheme(scheme: ColorScheme): Theme {
  return {
    scheme,
    colors: palettes[scheme],
    spacing,
    layout,
    radius,
    elevation,
    typography,
    duration,
    easing,
    iconSize,
    iconStrokeWidth,
  };
}

export interface ThemeProviderProps {
  /** Modo inicial. 'system' segue o esquema do dispositivo. Default: 'system'. */
  initialMode?: ThemeMode;
  children: React.ReactNode;
}

export function ThemeProvider({ initialMode = 'system', children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [systemScheme, setSystemScheme] = useState<ColorScheme>(
    (Appearance.getColorScheme() as ColorScheme) ?? 'light',
  );

  React.useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme((colorScheme as ColorScheme) ?? 'light');
    });
    return () => sub.remove();
  }, []);

  const scheme: ColorScheme = mode === 'system' ? systemScheme : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({ ...buildTheme(scheme), mode, setMode }),
    [scheme, mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Acessa o tema ativo. Lança se usado fora do ThemeProvider. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>.');
  return ctx;
}

/** Atalho para alternar entre light e dark ignorando 'system'. */
export function useToggleScheme(): () => void {
  const { scheme, setMode } = useTheme();
  return useCallback(() => setMode(scheme === 'light' ? 'dark' : 'light'), [scheme, setMode]);
}
