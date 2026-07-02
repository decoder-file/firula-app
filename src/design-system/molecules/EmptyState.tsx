/**
 * Firula Design System — EmptyState
 * Vazio nunca é beco sem saída — sempre com uma ação que avança.
 * Distingue empty / noResults / error / offline.
 *
 *   <EmptyState variant="empty" icon={Ticket} title="Nenhum ingresso ainda"
 *     description="Quando você comprar, eles aparecem aqui."
 *     actionLabel="Explorar eventos" onAction={explore} />
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../foundation/ThemeProvider';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';

export type EmptyVariant = 'empty' | 'noResults' | 'error' | 'offline';

export interface EmptyStateProps {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: EmptyVariant;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'empty',
}: EmptyStateProps) {
  const { colors, radius } = useTheme();

  // 'empty' usa tom da marca; demais usam neutro para não parecer sucesso.
  const brandTone = variant === 'empty';
  const iconBg = brandTone ? colors.primarySoft : colors.surfaceAlt;
  const iconFg = brandTone ? colors.primaryText : colors.textMuted;

  return (
    <View style={styles.wrap}>
      <View style={[styles.iconBox, { backgroundColor: iconBg, borderRadius: radius.xl }]}>
        <Icon size={30} color={iconFg} strokeWidth={1.75} />
      </View>
      <Text token="title" style={{ textAlign: 'center', marginBottom: 6 }} accessibilityRole="header">
        {title}
      </Text>
      {description ? (
        <Text token="bodySm" color="muted" style={styles.desc}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant={variant === 'empty' ? 'primary' : 'secondary'}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 36 },
  iconBox: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  desc: { textAlign: 'center', maxWidth: 280, marginBottom: 18 },
});
