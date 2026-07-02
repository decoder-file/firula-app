/**
 * Firula Design System — Snackbar + Toast (provider + hook)
 * Snackbar: confirmação com ação opcional, acima do BottomNav, 4s.
 * Toast: aviso passivo sem ação, 2s. Feedback imediato. Máx. 1 na tela.
 *
 * Instale o provider uma vez (dentro do ThemeProvider):
 *   <SnackbarProvider><App /></SnackbarProvider>
 * Use em qualquer lugar:
 *   const { show } = useSnackbar();
 *   show({ message: 'Ingresso adicionado', variant: 'success', action: { label: 'Desfazer', onPress: undo } });
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { CheckCircle2, XCircle, Info } from 'lucide-react-native';

import { useTheme } from '../foundation/ThemeProvider';
import { Text } from '../atoms/Text';

export type SnackVariant = 'default' | 'success' | 'error';

export interface SnackOptions {
  message: string;
  variant?: SnackVariant;
  action?: { label: string; onPress: () => void };
  /** ms. Default: 4000 (snackbar) / 2000 se sem ação. */
  duration?: number;
}

interface SnackbarContextValue {
  show: (opts: SnackOptions) => void;
  hide: () => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const { colors, radius, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const [snack, setSnack] = useState<SnackOptions | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setSnack(null);
  }, []);

  const show = useCallback((opts: SnackOptions) => {
    if (timer.current) clearTimeout(timer.current);
    setSnack(opts);
    const ms = opts.duration ?? (opts.action ? 4000 : 2000);
    timer.current = setTimeout(() => setSnack(null), ms);
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const Icon = snack?.variant === 'success' ? CheckCircle2 : snack?.variant === 'error' ? XCircle : Info;
  const accent = snack?.variant === 'success' ? '#3ED97F' : snack?.variant === 'error' ? '#F87171' : colors.primaryText;

  return (
    <SnackbarContext.Provider value={{ show, hide }}>
      {children}
      {snack ? (
        <Animated.View
          entering={FadeInUp.duration(220)}
          exiting={FadeOutDown.duration(180)}
          style={[styles.wrap, { bottom: insets.bottom + 72 }]}
          pointerEvents="box-none"
        >
          <View
            style={[styles.bar, elevation[2], { backgroundColor: colors.text, borderRadius: radius.md }]}
            accessibilityLiveRegion={snack.variant === 'error' ? 'assertive' : 'polite'}
            accessible
            accessibilityLabel={snack.message}
          >
            <Icon size={20} color={accent} strokeWidth={2} />
            <Text token="body" style={{ flex: 1, color: '#FFFFFF', fontWeight: '500' }} numberOfLines={2}>
              {snack.message}
            </Text>
            {snack.action ? (
              <Pressable
                onPress={() => { snack.action!.onPress(); hide(); }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={snack.action.label}
              >
                <Text token="label" style={{ color: accent }}>{snack.action.label}</Text>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar deve ser usado dentro de <SnackbarProvider>.');
  return ctx;
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
});
