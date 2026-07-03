import React from 'react';
import { StyleSheet } from 'react-native';

import { PressScale } from '@/design-system';

interface RoundButtonProps {
  children: React.ReactNode;
  label: string;
  onPress?: () => void;
}

export function RoundButton({ children, label, onPress }: RoundButtonProps) {
  return (
    <PressScale onPress={onPress ?? (() => {})} accessibilityRole="button" accessibilityLabel={label} style={styles.roundBtn}>
      {children}
    </PressScale>
  );
}

const styles = StyleSheet.create({
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
