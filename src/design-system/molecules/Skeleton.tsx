/**
 * Firula Design System — Skeleton + SkeletonList
 * Reflete o layout real do conteúdo que vai carregar. Pulso de opacidade
 * (mais barato que shimmer diagonal). Respeita reduce-motion.
 *
 *   <Skeleton width={120} height={16} />
 *   <SkeletonList count={6} itemHeight={72} />   // casa com getItemLayout
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { useTheme } from '../foundation/ThemeProvider';
import { useReducedMotion } from '../foundation/useReducedMotion';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height = 14, radius = 6, style }: SkeletonProps) {
  const { colors, scheme } = useTheme();
  const reduced = useReducedMotion();
  const pulse = useSharedValue(0.55);

  useEffect(() => {
    if (reduced) return;
    pulse.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [reduced]);

  const animated = useAnimatedStyle(() => ({ opacity: reduced ? 0.7 : pulse.value }));
  const base = scheme === 'dark' ? colors.surfaceAlt : '#EDEEF1';

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height, borderRadius: radius, backgroundColor: base }, animated, style]}
    />
  );
}

export interface SkeletonListProps {
  count?: number;
  itemHeight?: number;
}

/** Placeholder de lista — espelha ListItem 72dp por padrão. */
export function SkeletonList({ count = 6, itemHeight = 72 }: SkeletonListProps) {
  return (
    <View accessibilityLabel="Carregando">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.row, { height: itemHeight }]}>
          <Skeleton width={44} height={44} radius={12} />
          <View style={styles.texts}>
            <Skeleton width={`${55 + (i % 3) * 10}%`} height={14} />
            <Skeleton width={`${35 + (i % 2) * 10}%`} height={11} style={{ marginTop: 9 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16 },
  texts: { flex: 1 },
});
