import React from "react";
import { StyleSheet } from "react-native";

import { PressScale } from "@/design-system";

interface HeaderIconButtonProps {
  children: React.ReactNode;
  accessibilityLabel: string;
  onPress?: () => void;
}

/** Botão circular translúcido sobre o header escuro — mesmo espírito do RoundButton do event-detail, mas para fundo escuro. */
export function HeaderIconButton({ children, accessibilityLabel, onPress }: HeaderIconButtonProps) {
  return (
    <PressScale
      onPress={onPress ?? (() => {})}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={styles.button}
    >
      {children}
    </PressScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
});
