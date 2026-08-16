import { useEffect } from "react";
import { View } from "react-native";
import { ChevronLeft, CreditCard, QrCode } from "lucide-react-native";

import { PressScale, RadioGroup, Text, useTheme } from "@/design-system";
import { CardStep } from "@/features/checkout/components/CardStep";
import { PixStep } from "@/features/checkout/components/PixStep";
import type { PaymentMethod } from "@/features/checkout/types";
import type { UseCheckoutReturn } from "@/features/checkout/useCheckout";

const METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: "Pix — aprovação imediata",
  CARD: "Cartão de crédito",
};

export function PaymentStep({ checkout }: { checkout: UseCheckoutReturn }) {
  const { colors } = useTheme();
  const { quote, paymentMethod, setPaymentMethod } = checkout;

  const availableMethods = quote?.availablePaymentMethods ?? [];

  // Só um método disponível: seleciona automaticamente, sem mostrar o seletor.
  useEffect(() => {
    if (paymentMethod === null && availableMethods.length === 1) {
      setPaymentMethod(availableMethods[0]);
    }
  }, [paymentMethod, availableMethods, setPaymentMethod]);

  if (!quote) return null;

  if (availableMethods.length === 0) {
    return (
      <View style={{ gap: 16 }}>
        <Text token="titleLg">Pagamento</Text>
        <Text token="body" color="muted">
          Nenhuma forma de pagamento está disponível para este evento no momento.
        </Text>
      </View>
    );
  }

  if (paymentMethod === null) {
    return (
      <View style={{ gap: 20 }}>
        <Text token="titleLg">Como você quer pagar?</Text>
        <RadioGroup<PaymentMethod>
          value={availableMethods[0]}
          onChange={setPaymentMethod}
          options={availableMethods.map((method) => ({ value: method, label: METHOD_LABELS[method] }))}
        />
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {availableMethods.length > 1 ? (
        <PressScale
          onPress={() => setPaymentMethod(null)}
          accessibilityRole="button"
          accessibilityLabel="Trocar forma de pagamento"
          style={{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start" }}
        >
          <ChevronLeft size={14} color={colors.primaryText} strokeWidth={2} />
          {paymentMethod === "PIX" ? (
            <QrCode size={14} color={colors.primaryText} strokeWidth={2} />
          ) : (
            <CreditCard size={14} color={colors.primaryText} strokeWidth={2} />
          )}
          <Text token="caption" color="primary" style={{ fontWeight: "700", textTransform: "none", letterSpacing: 0 }}>
            Trocar forma de pagamento
          </Text>
        </PressScale>
      ) : null}

      {paymentMethod === "PIX" ? <PixStep checkout={checkout} /> : <CardStep checkout={checkout} />}
    </View>
  );
}
