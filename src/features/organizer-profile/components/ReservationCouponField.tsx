import React, { useState } from "react";
import { View } from "react-native";
import { Tag, X } from "lucide-react-native";

import { Button, PressScale, Text, TextField, useTheme } from "@/design-system";
import type { AppliedReservationCoupon } from "@/utils/reservationCoupon";

interface ReservationCouponFieldProps {
  applied: AppliedReservationCoupon | null;
  /** Valida no servidor. Devolve a mensagem de erro, ou null quando aplicou. */
  onApply: (code: string) => Promise<string | null>;
  onRemove: () => void;
  formatPrice: (cents: number) => string;
}

/** Campo de cupom da reserva — mesmo visual do cupom no checkout de ingressos. */
export function ReservationCouponField({ applied, onApply, onRemove, formatPrice }: ReservationCouponFieldProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (applied) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Tag size={13} color={colors.primaryText} strokeWidth={2} />
          <Text token="bodySm" style={{ fontWeight: "700", color: colors.primaryText }}>
            {applied.code}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text token="bodySm" style={{ fontWeight: "800", color: colors.primaryText }}>
            − {formatPrice(applied.discountCents)}
          </Text>
          <PressScale onPress={onRemove} accessibilityRole="button" accessibilityLabel="Remover cupom">
            <X size={14} color={colors.textMuted} strokeWidth={2} />
          </PressScale>
        </View>
      </View>
    );
  }

  if (!open) {
    return (
      <PressScale
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Tenho um cupom"
        style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, alignSelf: "flex-start" }}
      >
        <Tag size={14} color={colors.primaryText} strokeWidth={2} />
        <Text token="bodySm" style={{ fontWeight: "700", color: colors.primaryText }}>
          Tenho um cupom
        </Text>
      </PressScale>
    );
  }

  const apply = async () => {
    const trimmed = code.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    const message = await onApply(trimmed);
    setLoading(false);
    if (message) setError(message);
    else {
      setCode("");
      setOpen(false);
    }
  };

  return (
    <View style={{ marginTop: 12, gap: 7 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <TextField
            label=""
            value={code}
            onChangeText={(value) => {
              setCode(value);
              setError(null);
            }}
            placeholder="Código do cupom"
            autoCapitalize="characters"
          />
        </View>
        <Button label="Aplicar" variant="secondary" loading={loading} disabled={!code.trim()} onPress={() => void apply()} />
      </View>
      {error ? (
        <Text token="caption" color="error" style={{ textTransform: "none", letterSpacing: 0 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
