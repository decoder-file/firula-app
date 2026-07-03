import React from 'react';
import { View } from 'react-native';

import { PressScale, Text } from '@/design-system';

interface FactItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  colors: any;
}

export function FactItem({ icon, title, subtitle, actionLabel, onAction, colors }: FactItemProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt }}>
        {icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text token="body" style={{ fontWeight: '700' }}>{title}</Text>
        <Text token="bodySm" color="muted">{subtitle}</Text>
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
