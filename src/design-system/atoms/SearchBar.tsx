/**
 * Firula Design System — SearchBar
 * Caminho de 2 toques para qualquer evento. Pill 48dp, fundo surfaceAlt (sem borda).
 * Botão limpar aparece com conteúdo. Debounce fica a cargo do consumidor.
 *
 *   <SearchBar value={q} onChangeText={setQ} placeholder="Buscar eventos…" onSubmit={search} />
 */

import React from 'react';
import { StyleSheet, TextInput, View, Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';

import { useTheme } from '../foundation/ThemeProvider';

export interface SearchBarProps {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
  testID?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar…',
  onSubmit,
  autoFocus,
  testID,
}: SearchBarProps) {
  const { colors, iconStrokeWidth, typography } = useTheme();

  return (
    <View style={[styles.bar, { backgroundColor: colors.surfaceAlt }]} accessibilityRole="search">
      <Search size={20} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoFocus={autoFocus}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        style={[typography.body, styles.input, { color: colors.text }]}
        accessibilityLabel={placeholder}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          style={[styles.clear, { backgroundColor: colors.border }]}
        >
          <X size={16} color={colors.text} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 48,
    borderRadius: 999,
    paddingLeft: 16,
    paddingRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: { flex: 1, padding: 0 },
  clear: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
