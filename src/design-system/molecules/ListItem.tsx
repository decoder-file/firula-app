/**
 * Firula Design System — ListItem
 * Bloco fundamental de listas longas. ALTURA FIXA (56/64/72dp) para virtualização
 * com getItemLayout. leading + conteúdo + trailing. React.memo por padrão.
 *
 *   <ListItem title="Festival Firula 2026" subtitle="2 ingressos" onPress={open}
 *     leading={<Avatar name="Firula" />} trailing="chevron" />
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { useTheme } from '../foundation/ThemeProvider';
import { PressScale } from '../atoms/PressScale';
import { Text } from '../atoms/Text';

export type ListItemHeight = 56 | 64 | 72;

export interface ListItemProps {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  /** 'chevron' mostra a seta; ou passe qualquer nó (Badge, Switch…). */
  trailing?: React.ReactNode | 'chevron';
  height?: ListItemHeight;
  onPress?: () => void;
  testID?: string;
}

function ListItemBase({
  title,
  subtitle,
  leading,
  trailing,
  height = 72,
  onPress,
  testID,
}: ListItemProps) {
  const { colors, iconStrokeWidth } = useTheme();

  const content = (
    <View style={[styles.row, { height }]}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.texts}>
        <Text token="body" style={{ fontWeight: '600' }} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text token="bodySm" color="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing === 'chevron' ? (
        <ChevronRight size={20} color={colors.border} strokeWidth={iconStrokeWidth} />
      ) : trailing ? (
        <View>{trailing}</View>
      ) : null}
    </View>
  );

  if (!onPress) return <View testID={testID}>{content}</View>;

  return (
    <PressScale
      testID={testID}
      onPress={onPress}
      scaleTo={0.99}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
    >
      {content}
    </PressScale>
  );
}

/** Memoizado — essencial para listas virtualizadas. */
export const ListItem = React.memo(ListItemBase);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16 },
  leading: { flexShrink: 0 },
  texts: { flex: 1, minWidth: 0 },
});
