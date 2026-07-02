/**
 * Firula Design System — TabBar
 * Abas de conteúdo DENTRO de uma tela (≠ BottomNavigation). Indicador deslizante.
 * Roláveis quando > 4. Estado ativo por peso + indicador (não só cor).
 *
 *   <TabBar tabs={[{key:'up',label:'Próximos'},{key:'past',label:'Passados'}]}
 *     activeKey={tab} onChange={setTab} />
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '../foundation/ThemeProvider';
import { PressScale } from '../atoms/PressScale';
import { Text } from '../atoms/Text';

export interface TabItem {
  key: string;
  label: string;
}

export interface TabBarProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  scrollable?: boolean;
}

export function TabBar({ tabs, activeKey, onChange, scrollable = false }: TabBarProps) {
  const { colors } = useTheme();

  const renderTab = (tab: TabItem) => {
    const active = tab.key === activeKey;
    return (
      <PressScale
        key={tab.key}
        onPress={() => onChange(tab.key)}
        scaleTo={0.97}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={tab.label}
        style={[styles.tab, scrollable ? styles.tabScroll : styles.tabFlex]}
      >
        <Text token="label" style={{ color: active ? colors.text : colors.textMuted, fontWeight: active ? '700' : '500' }}>
          {tab.label}
        </Text>
        {active ? <View style={[styles.indicator, { backgroundColor: colors.primary }]} /> : null}
      </PressScale>
    );
  };

  if (scrollable) {
    return (
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollRow}>
          {tabs.map(renderTab)}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      {tabs.map(renderTab)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', borderBottomWidth: 1 },
  scrollRow: { paddingHorizontal: 8 },
  tab: { height: 48, alignItems: 'center', justifyContent: 'center' },
  tabFlex: { flex: 1 },
  tabScroll: { paddingHorizontal: 16 },
  indicator: { position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
});
