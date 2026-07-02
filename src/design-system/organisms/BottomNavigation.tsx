/**
 * Firula Design System — BottomNavigation
 * Navegação primária: 3–5 destinos, sempre visível. Cada destino a 1 toque.
 * Ícone PREENCHE quando ativo (reforço além da cor). Safe-area inferior.
 *
 *   <BottomNavigation activeKey={tab} onChange={setTab} items={[
 *     { key: 'home', label: 'Início', icon: House },
 *     { key: 'tickets', label: 'Ingressos', icon: Ticket, badge: 2 },
 *   ]} />
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../foundation/ThemeProvider';
import { PressScale } from '../atoms/PressScale';
import { Text } from '../atoms/Text';
import { Badge } from '../atoms/Badge';

export interface BottomNavItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; fill?: string }>;
  badge?: number;
}

export interface BottomNavigationProps {
  items: BottomNavItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function BottomNavigation({ items, activeKey, onChange }: BottomNavigationProps) {
  const { colors, elevation } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        elevation[1],
        { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom, 8), borderTopColor: colors.border },
      ]}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        const color = active ? colors.primaryText : colors.textMuted;
        return (
          <PressScale
            key={item.key}
            onPress={() => onChange(item.key)}
            scaleTo={0.94}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.badge ? `${item.label}, ${item.badge} novos` : item.label}
            style={styles.tab}
          >
            <View>
              <item.icon
                size={24}
                color={color}
                strokeWidth={active ? 2 : 1.75}
                fill={active ? colors.primarySoft : 'transparent'}
              />
              {item.badge ? (
                <View style={styles.badge}>
                  <Badge count={item.badge} variant="error" />
                </View>
              ) : null}
            </View>
            <Text token="caption" style={{ color, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>
              {item.label}
            </Text>
          </PressScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 8, paddingHorizontal: 4 },
  tab: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 3 },
  badge: { position: 'absolute', top: -6, left: 16 },
});
