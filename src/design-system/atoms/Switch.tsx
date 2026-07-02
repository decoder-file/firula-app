/**
 * Firula Design System — Switch
 * Liga/desliga com efeito IMEDIATO (sem botão salvar). 52×32dp, transição 150ms.
 * Estado nunca só por cor — posição do thumb + accessibilityRole="switch".
 *
 *   <Switch value={on} onValueChange={setOn} label="Notificações de eventos" />
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

import { useTheme } from '../foundation/ThemeProvider';
import { useReducedMotion } from '../foundation/useReducedMotion';
import { Text } from './Text';

export interface SwitchProps {
  value: boolean;
  onValueChange: (v: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  testID?: string;
}

export function Switch({ value, onValueChange, label, description, disabled, testID }: SwitchProps) {
  const { colors, duration } = useTheme();
  const reduced = useReducedMotion();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = reduced ? (value ? 1 : 0) : withTiming(value ? 1 : 0, { duration: duration.fast });
  }, [value, reduced, duration.fast]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.textMuted, colors.primary]),
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: 3 + progress.value * 20 }],
  }));

  const control = (
    <Animated.View style={[styles.track, trackStyle]}>
      <Animated.View style={[styles.thumb, thumbStyle]} />
    </Animated.View>
  );

  const a11y = {
    accessibilityRole: 'switch' as const,
    accessibilityState: { checked: value, disabled },
    accessibilityLabel: label,
  };

  if (!label) {
    return (
      <Pressable testID={testID} onPress={() => onValueChange(!value)} disabled={disabled} {...a11y} style={{ opacity: disabled ? 0.45 : 1 }}>
        {control}
      </Pressable>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      {...a11y}
      style={[styles.row, { opacity: disabled ? 0.45 : 1 }]}
    >
      <View style={styles.texts}>
        <Text token="body" style={{ fontWeight: '600' }}>
          {label}
        </Text>
        {description ? (
          <Text token="bodySm" color="muted">
            {description}
          </Text>
        ) : null}
      </View>
      {control}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  texts: { flex: 1 },
  track: { width: 52, height: 32, borderRadius: 999, justifyContent: 'center' },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    shadowColor: '#141821',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
});
