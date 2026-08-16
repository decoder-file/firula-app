import { useEffect, useRef } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Clock } from "lucide-react-native";

import { Text, useTheme } from "@/design-system";
import { useCountdown } from "@/features/checkout/useCountdown";

const SESSION_MINUTES = 30;

export function CheckoutFooter({ onExpire }: { onExpire: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const expiresAtRef = useRef(new Date(Date.now() + SESSION_MINUTES * 60 * 1000).toISOString());
  const { label, expired } = useCountdown(expiresAtRef.current);
  const firedRef = useRef(false);

  useEffect(() => {
    if (expired && !firedRef.current) {
      firedRef.current = true;
      onExpire();
    }
  }, [expired, onExpire]);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingTop: 8,
        paddingBottom: insets.bottom + 8,
        backgroundColor: colors.surfaceAlt,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <Clock size={13} color={colors.textMuted} strokeWidth={2} />
      <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0 }}>
        Sua seleção fica reservada por mais {label}
      </Text>
    </View>
  );
}
