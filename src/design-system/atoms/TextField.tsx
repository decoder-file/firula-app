/**
 * Firula Design System — TextField
 * Label sempre visível acima do campo (nunca placeholder-como-label).
 * Erro = borda + ícone + mensagem (nunca só cor). Altura 52dp.
 *
 *   <TextField label="Nome completo" value={name} onChangeText={setName} />
 *   <TextField label="E-mail" value={email} onChangeText={setEmail} error="E-mail inválido" keyboardType="email-address" />
 *   <TextField label="Senha" value={pw} onChangeText={setPw} secureTextEntry />
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Pressable,
  type TextInputProps,
} from 'react-native';
import { AlertCircle, Eye, EyeOff } from 'lucide-react-native';

import { useTheme } from '../foundation/ThemeProvider';
import { Text } from './Text';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  helper?: string;
  /** Ícone Lucide à esquerda. */
  leadingIcon?: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  disabled?: boolean;
}

export function TextField({
  label,
  value,
  onChangeText,
  error,
  helper,
  leadingIcon: Leading,
  disabled = false,
  secureTextEntry,
  ...inputProps
}: TextFieldProps) {
  const { colors, radius, iconStrokeWidth, typography } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  const borderColor = error ? colors.error : focused ? colors.primary : colors.border;
  const bg = disabled ? colors.surfaceAlt : colors.surface;

  return (
    <View>
      <Text token="bodySm" style={{ fontWeight: '600', marginBottom: 6, color: disabled ? colors.textMuted : colors.text }}>
        {label}
      </Text>
      <View
        style={[
          styles.field,
          {
            borderColor,
            backgroundColor: bg,
            borderRadius: radius.md,
            shadowColor: colors.primary,
            shadowOpacity: focused && !error ? 0.18 : 0,
            shadowRadius: 4,
            elevation: 0,
          },
        ]}
      >
        {Leading ? <Leading size={20} color={colors.textMuted} strokeWidth={iconStrokeWidth} /> : null}
        <TextInput
          {...inputProps}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          secureTextEntry={hidden}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          placeholderTextColor={colors.textMuted}
          style={[typography.body, styles.input, { color: disabled ? colors.textMuted : colors.text }]}
          accessibilityLabel={label}
        />
        {error ? <AlertCircle size={20} color={colors.error} strokeWidth={iconStrokeWidth} /> : null}
        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
          >
            {hidden ? (
              <Eye size={20} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
            ) : (
              <EyeOff size={20} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
            )}
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text token="bodySm" color="error" style={{ marginTop: 6 }} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : helper ? (
        <Text token="bodySm" color="muted" style={{ marginTop: 6 }}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    height: 52,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: { flex: 1, padding: 0 },
});
