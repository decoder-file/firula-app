import React from 'react';
import { View } from 'react-native';

import { Text } from '@/design-system';

interface TrustItemProps {
  icon: React.ReactNode;
  label: string;
}

export function TrustItem({ icon, label }: TrustItemProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
      {icon}
      <Text token="caption" color="muted" style={{ textTransform: 'none', letterSpacing: 0, fontWeight: '600', fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
}
