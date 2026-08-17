/**
 * Firula Design System — Drawer
 * Navegação secundária e troca de contexto (ex.: modo Organizador). Complementa
 * a BottomNavigation, não substitui. Modal lateral com scrim.
 *
 *   <Drawer open={open} onClose={close} header={{ name: 'Ana Firula', subtitle: 'Participante' }}
 *     items={[{ key:'home', label:'Início', icon: House, active:true, onPress:… }]} />
 */

import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from '../foundation/ThemeProvider';
import { Avatar } from '../atoms/Avatar';
import { Text } from '../atoms/Text';
import { Divider } from '../atoms/Divider';

export interface DrawerItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  active?: boolean;
  onPress: () => void;
  /** Renderiza um Divider acima do item. */
  dividerBefore?: boolean;
  /** Estiliza o item como ação destrutiva (ex.: sair da conta). */
  danger?: boolean;
}

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  header?: { name: string; subtitle?: string; photoUrl?: string | null };
  items: DrawerItem[];
  /** Lado da tela de onde a gaveta desliza. @default 'left' */
  side?: 'left' | 'right';
}

export function Drawer({ open, onClose, header, items, side = 'left' }: DrawerProps) {
  const { colors, radius, iconStrokeWidth, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const closedX = side === 'right' ? 320 : -320;
  const x = useSharedValue(closedX);

  useEffect(() => {
    x.value = withTiming(open ? 0 : closedX, { duration: 260 });
  }, [open, closedX]);

  const panel = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} onPress={onClose} accessibilityLabel="Fechar menu" />
      <Animated.View
        accessibilityViewIsModal
        style={[
          styles.panel,
          side === 'right' ? styles.panelRight : styles.panelLeft,
          elevation[2],
          panel,
          { backgroundColor: colors.surface, paddingTop: insets.top + 12 },
        ]}
      >
        {header ? (
          <>
            <View style={styles.header}>
              <Avatar name={header.name} size="lg" source={header.photoUrl ? { uri: header.photoUrl } : undefined} />
              <View style={{ flex: 1 }}>
                <Text token="subtitle" style={{ fontWeight: '700' }} numberOfLines={1}>{header.name}</Text>
                {header.subtitle ? <Text token="bodySm" color="muted" numberOfLines={1}>{header.subtitle}</Text> : null}
              </View>
            </View>
            <View style={{ marginVertical: 8 }}><Divider /></View>
          </>
        ) : null}
        {items.map((item) => (
          <React.Fragment key={item.key}>
            {item.dividerBefore ? <View style={{ marginVertical: 8 }}><Divider inset={12} /></View> : null}
            <Pressable
              onPress={() => { item.onPress(); onClose(); }}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: item.active }}
              accessibilityLabel={item.label}
              style={[
                styles.item,
                { borderRadius: radius.md, backgroundColor: item.active ? colors.primarySoft : 'transparent' },
              ]}
            >
              <item.icon
                size={22}
                color={item.danger ? colors.error : item.active ? colors.primaryText : colors.text}
                strokeWidth={iconStrokeWidth}
              />
              <Text
                token="body"
                style={{
                  fontWeight: item.active ? '700' : '500',
                  color: item.danger ? colors.error : item.active ? colors.primaryText : colors.text,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          </React.Fragment>
        ))}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  panel: { position: 'absolute', top: 0, bottom: 0, width: 300, paddingHorizontal: 12, paddingBottom: 20 },
  panelLeft: { left: 0 },
  panelRight: { right: 0 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8, paddingBottom: 4 },
  item: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12 },
});
