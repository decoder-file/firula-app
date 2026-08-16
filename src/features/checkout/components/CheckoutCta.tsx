import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, Lock, QrCode } from "lucide-react-native";

import { Button, Text, useTheme } from "@/design-system";
import { formatCurrencyFromCents } from "@/utils/format";
import type { UseCheckoutReturn } from "@/features/checkout/useCheckout";

export function CheckoutCta({ checkout }: { checkout: UseCheckoutReturn }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { quote, paymentMethod, installments, isSubmitting, canSubmitCheckout, submitCheckout, paymentError } =
    checkout;

  if (!quote) return null;

  const flow = quote.card?.flow ?? "TRANSPARENT";

  let label = "Continuar";
  let Icon = Lock;
  if (quote.isFree) {
    label = "Confirmar";
    Icon = Check;
  } else if (paymentMethod === "PIX") {
    label = "Gerar código Pix";
    Icon = QrCode;
  } else if (paymentMethod === "CARD" && flow === "REDIRECT") {
    label = "Pagar com cartão";
  } else {
    label = `Pagar ${formatCurrencyFromCents(quote.finalAmountCents)}`;
  }

  const installmentOption =
    paymentMethod === "CARD" && installments > 1
      ? quote.card?.installments.find((option) => option.installments === installments)
      : undefined;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: insets.bottom + 14,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <View>
          <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0, fontWeight: "600" }}>
            Total
          </Text>
          <Text token="titleLg" style={{ fontSize: 22 }}>
            {formatCurrencyFromCents(quote.finalAmountCents)}
          </Text>
        </View>
        {installmentOption ? (
          <Text token="bodySm" color="muted" style={{ fontWeight: "600", textAlign: "right" }}>
            {installments}x de {formatCurrencyFromCents(installmentOption.installmentValueCents)}
          </Text>
        ) : null}
      </View>

      <Button label={label} icon={Icon} onPress={submitCheckout} disabled={!canSubmitCheckout} loading={isSubmitting} fullWidth />

      {paymentError ? (
        <Text token="bodySm" color="error" style={{ marginTop: 10, textAlign: "center" }}>
          {paymentError}
        </Text>
      ) : null}
    </View>
  );
}
