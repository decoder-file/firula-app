/**
 * Firula Design System — TopBar
 * 56dp. Variantes: root (título grande + ações), detail (voltar + título + ações),
 * transparent (sobre imagem). Máx. 2 ações à direita. Respeita safe-area no topo.
 *
 *   <TopBar variant="root" title="Eventos" actions={[
 *     { icon: Search, label: 'Buscar', onPress: search },
 *     { icon: Bell, label: 'Notificações', badge: true, onPress: notif },
 *   ]} />
 *   <TopBar variant="detail" title="Detalhes" onBack={goBack} />
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

import { useTheme } from '../foundation/ThemeProvider';
import { IconButton } from '../atoms/IconButton';
import { Text } from '../atoms/Text';

interface Action {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  onPress: () => void;
  badge?: boolean;
}

export interface TopBarProps {
  title: string;
  variant?: 'root' | 'detail' | 'transparent';
  onBack?: () => void;
  actions?: Action[];
}

export function TopBar({ title, variant = 'root', onBack, actions = [] }: TopBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const transparent = variant === 'transparent';

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: transparent ? 'transparent' : colors.surface,
        borderBottomWidth: variant === 'detail' ? 1 : 0,
        borderBottomColor: colors.border,
      }}
    >
      <View style={styles.bar}>
        {variant === 'root' ? (
          <Text token="titleLg" style={{ flex: 1 }} accessibilityRole="header">{title}</Text>
        ) : (
          <>
            <IconButton icon={ArrowLeft} accessibilityLabel="Voltar" onPress={onBack ?? (() => {})} variant={transparent ? 'outlined' : 'ghost'} />
            {variant === 'detail' ? (
              <Text token="title" style={styles.centerTitle} numberOfLines={1} accessibilityRole="header">{title}</Text>
            ) : (
              <View style={{ flex: 1 }} />
            )}
          </>
        )}
        <View style={styles.actions}>
          {actions.slice(0, 2).map((a, i) => (
            <IconButton key={i} icon={a.icon} accessibilityLabel={a.label} onPress={a.onPress} badge={a.badge} variant={transparent ? 'outlined' : 'ghost'} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingLeft: 16 },
  centerTitle: { flex: 1, textAlign: 'center' },
  actions: { flexDirection: 'row' },
});
