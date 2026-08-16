import { useEffect } from "react";
import { View } from "react-native";
import { ChevronLeft, CreditCard, QrCode } from "lucide-react-native";

import { PressScale, Text, useTheme } from "@/design-system";
import { CardStep } from "@/features/checkout/components/CardStep";
import { PixStep } from "@/features/checkout/components/PixStep";
import type { PaymentMethod } from "@/features/checkout/types";
import type { UseCheckoutReturn } from "@/features/checkout/useCheckout";

const METHOD_META: Record<PaymentMethod, { label: string; icon: typeof QrCode }> = {
  PIX: { label: "Pix", icon: QrCode },
  CARD: { label: "Cartão", icon: CreditCard },
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
        <PaymentMethodSegmentedControl
          methods={availableMethods}
          value={availableMethods[0]}
          onChange={setPaymentMethod}
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
          <Text token="caption" color="primary" style={{ fontWeight: "700", textTransform: "none", letterSpacing: 0 }}>
            Trocar forma de pagamento
          </Text>
        </PressScale>
      ) : null}

      {paymentMethod === "PIX" ? <PixStep checkout={checkout} /> : <CardStep checkout={checkout} />}
    </View>
  );
}

function PaymentMethodSegmentedControl({
  methods,
  value,
  onChange,
}: {
  methods: PaymentMethod[];
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}) {
  const { colors, radius } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.surfaceAlt,
        borderRadius: radius.lg,
        padding: 4,
        gap: 4,
      }}
    >
      {methods.map((method) => {
        const active = method === value;
        const { label, icon: Icon } = METHOD_META[method];

        return (
          <PressScale
            key={method}
            onPress={() => onChange(method)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={label}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              paddingVertical: 12,
              borderRadius: radius.md,
              backgroundColor: active ? colors.surface : "transparent",
              shadowColor: "#000",
              shadowOpacity: active ? 0.08 : 0,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: active ? 1 : 0,
            }}
          >
            <Icon size={17} color={active ? colors.primaryText : colors.textMuted} strokeWidth={2} />
            <Text token="label" style={{ color: active ? colors.text : colors.textMuted }}>
              {label}
            </Text>
          </PressScale>
        );
      })}
    </View>
  );
}
