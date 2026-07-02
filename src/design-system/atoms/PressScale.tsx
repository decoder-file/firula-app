/**
 * Firula Design System — Pressable com press-scale (feedback imediato, 60fps).
 * Reutiliza react-native-reanimated (já é dependência do app).
 * Respeita reduce-motion: quando ativo, não escala.
 */

import React from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { pressScale } from '../foundation/motion';
import { useReducedMotion } from '../foundation/useReducedMotion';

const AnimatedView = Animated.createAnimatedComponent(Pressable);

export interface PressScaleProps extends PressableProps {
  /** Fator de escala no press. Default: token pressScale (0.97). */
  scaleTo?: number;
}

export function PressScale({ style, onPressIn, onPressOut, scaleTo, ...props }: PressScaleProps) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const target = scaleTo ?? pressScale;

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedView
      {...props}
      style={[style, animatedStyle]}
      onPressIn={(e) => {
        if (!reduced) scale.value = withSpring(target, { damping: 18, stiffness: 280 });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 18, stiffness: 280 });
        onPressOut?.(e);
      }}
    />
  );
}
