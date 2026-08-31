import React from 'react';
import { StyleSheet, View } from 'react-native';

import { PressScale, Text } from '@/design-system';

interface FactItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  colors: any;
  contained?: boolean;
}

export function FactItem({ icon, title, subtitle, actionLabel, onAction, colors, contained = false }: FactItemProps) {
  return (
    <View
      style={[
        styles.container,
        contained
          ? {
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.border,
              borderWidth: 1,
              paddingHorizontal: 12,
              paddingVertical: 12,
            }
          : null,
      ]}
    >
      <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt }}>
        {icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text token="body" numberOfLines={2} style={styles.title}>{title}</Text>
        <Text token="bodySm" color="muted" numberOfLines={2} style={styles.subtitle}>{subtitle}</Text>
      </View>
      {actionLabel ? (
        <PressScale
          onPress={onAction ?? (() => {})}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={{ borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, minHeight: 36, justifyContent: 'center', backgroundColor: colors.primarySoft }}
        >
          <Text token="label" color="primary" style={{ fontSize: 12 }}>{actionLabel}</Text>
        </PressScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 0,
    flexDirection: 'row',
    gap: 12,
    minHeight: 68,
    paddingHorizontal: 0,
    paddingVertical: 8,
  },
  title: {
    fontWeight: '700',
    lineHeight: 20,
  },
  subtitle: {
    lineHeight: 19,
    marginTop: 2,
  },
});
