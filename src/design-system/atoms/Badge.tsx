/**
 * Firula Design System — Badge
 * Status ou contagem. NÃO é tocável. Status sempre com ponto/ícone + texto — cor reforça, não define.
 *
 *   <Badge label="Confirmado" variant="success" dot />
 *   <Badge label="ESGOTADO" variant="neutral" />
 *   <Badge count={3} variant="error" />
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../foundation/ThemeProvider';
import type { Palette } from '../foundation/colors';
import { Text } from './Text';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'brand';

export interface BadgeProps {
  label?: string;
  /** Renderiza um badge de contagem circular (ignora label). */
  count?: number;
  variant?: BadgeVariant;
  /** Ponto colorido antes do label (reforço não-cromático do status). */
  dot?: boolean;
}

function tone(variant: BadgeVariant, c: Palette): { bg: string; fg: string } {
  switch (variant) {
    case 'success':
      return { bg: c.successSoft, fg: c.success };
    case 'warning':
      return { bg: c.warningSoft, fg: c.warning };
    case 'error':
      return { bg: c.errorSoft, fg: c.error };
    case 'info':
      return { bg: c.infoSoft, fg: c.info };
    case 'brand':
      return { bg: c.primarySoft, fg: c.primaryText };
    case 'neutral':
      return { bg: c.surfaceAlt, fg: c.textMuted };
  }
}

export function Badge({ label, count, variant = 'neutral', dot = false }: BadgeProps) {
  const { colors } = useTheme();
  const t = tone(variant, colors);

  if (typeof count === 'number') {
    return (
      <View
        style={[styles.count, { backgroundColor: colors.error }]}
        accessible
        accessibilityLabel={`${count} não lidas`}
      >
        <Text token="caption" style={{ color: '#FFFFFF', letterSpacing: 0 }}>
          {count > 99 ? '99+' : count}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      {dot ? <View style={[styles.dot, { backgroundColor: t.fg }]} /> : null}
      <Text token="caption" style={{ color: t.fg, letterSpacing: 0.2, textTransform: 'none' }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 999 },
  count: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
