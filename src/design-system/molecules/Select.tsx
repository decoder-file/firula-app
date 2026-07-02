/**
 * Firula Design System — Select
 * No mobile, Select abre um BottomSheet com opções — nunca dropdown flutuante.
 * Mesmo shell visual do TextField.
 *
 *   <Select label="Cidade" value={city} options={cities} onSelect={setCity} placeholder="Selecione…" />
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';

import { useTheme } from '../foundation/ThemeProvider';
import { Text } from '../atoms/Text';
import { BottomSheet } from './BottomSheet';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string> {
  label: string;
  value?: T;
  options: SelectOption<T>[];
  onSelect: (v: T) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function Select<T extends string>({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Selecione…',
  disabled = false,
}: SelectProps<T>) {
  const { colors, radius, iconStrokeWidth } = useTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <View>
      <Text token="bodySm" style={{ fontWeight: '600', marginBottom: 6, color: disabled ? colors.textMuted : colors.text }}>
        {label}
      </Text>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${current?.label ?? placeholder}. Abre seletor.`}
        style={[
          styles.trigger,
          { borderColor: colors.border, backgroundColor: disabled ? colors.surfaceAlt : colors.surface, borderRadius: radius.md },
        ]}
      >
        <Text token="body" style={{ color: current ? colors.text : colors.textMuted }}>
          {current?.label ?? placeholder}
        </Text>
        <ChevronDown size={18} color={colors.textMuted} strokeWidth={iconStrokeWidth} />
      </Pressable>

      <BottomSheet visible={open} title={label} onClose={() => setOpen(false)}>
        <ScrollView style={{ maxHeight: 380 }}>
          {options.map((opt) => {
            const selected = opt.value === value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => {
                  onSelect(opt.value);
                  setOpen(false);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={opt.label}
                style={styles.option}
              >
                {selected ? (
                  <Check size={20} color={colors.primaryText} strokeWidth={2.5} />
                ) : (
                  <View style={{ width: 20 }} />
                )}
                <Text token="body" style={{ fontWeight: selected ? '600' : '400' }}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    height: 52,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  option: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20 },
});
