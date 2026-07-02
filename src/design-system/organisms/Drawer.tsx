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
}

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  header?: { name: string; subtitle?: string };
  items: DrawerItem[];
}

export function Drawer({ open, onClose, header, items }: DrawerProps) {
  const { colors, radius, iconStrokeWidth, elevation } = useTheme();
  const insets = useSafeAreaInsets();
  const x = useSharedValue(-320);

  useEffect(() => {
    x.value = withTiming(open ? 0 : -320, { duration: 260 });
  }, [open]);

  const panel = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} onPress={onClose} accessibilityLabel="Fechar menu" />
      <Animated.View
        accessibilityViewIsModal
        style={[styles.panel, elevation[2], panel, { backgroundColor: colors.surface, paddingTop: insets.top + 12 }]}
      >
        {header ? (
          <>
            <View style={styles.header}>
              <Avatar name={header.name} size="lg" />
              <View style={{ flex: 1 }}>
                <Text token="subtitle" style={{ fontWeight: '700' }} numberOfLines={1}>{header.name}</Text>
                {header.subtitle ? <Text token="bodySm" color="muted">{header.subtitle}</Text> : null}
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
              <item.icon size={22} color={item.active ? colors.primaryText : colors.text} strokeWidth={iconStrokeWidth} />
              <Text token="body" style={{ fontWeight: item.active ? '700' : '500', color: item.active ? colors.primaryText : colors.text }}>
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
  panel: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 300, paddingHorizontal: 12, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8, paddingBottom: 4 },
  item: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12 },
});
