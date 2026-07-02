/**
 * Firula Design System — Surface
 * Base de todo card: bg `surface`, radius, borda (elevation 0) OU sombra (1–2).
 * NUNCA use sombra (level > 0) em superfície de item de lista — custo no Android.
 *
 *   <Surface style={{ padding: 16 }}>…</Surface>            // flat, borda
 *   <Surface level={1} radius="xl">…</Surface>              // raised
 */

import React from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '../foundation/ThemeProvider';
import type { ElevationLevel } from '../foundation/elevation';
import type { RadiusToken } from '../foundation/radius';

export interface SurfaceProps extends ViewProps {
  level?: ElevationLevel;
  radius?: RadiusToken;
  /** Usa surfaceAlt em vez de surface (ex.: campos, chips). */
  alt?: boolean;
}

export function Surface({ level = 0, radius = 'lg', alt = false, style, children, ...props }: SurfaceProps) {
  const theme = useTheme();

  const base: ViewStyle = {
    backgroundColor: alt ? theme.colors.surfaceAlt : theme.colors.surface,
    borderRadius: theme.radius[radius],
    ...(level === 0
      ? { borderWidth: 1, borderColor: theme.colors.border }
      : theme.elevation[level]),
  };

  return (
    <View {...props} style={[base, style]}>
      {children}
    </View>
  );
}
