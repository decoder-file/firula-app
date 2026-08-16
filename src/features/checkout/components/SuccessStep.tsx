import { View } from "react-native";
import { useRouter } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";

import { Button, Text, useTheme } from "@/design-system";
import { formatCurrencyFromCents } from "@/utils/format";
import type { UseCheckoutReturn } from "@/features/checkout/useCheckout";

export function SuccessStep({ checkout }: { checkout: UseCheckoutReturn }) {
  const { colors } = useTheme();
  const router = useRouter();
  const { successOrderId, successTotalCents, successTickets } = checkout;

  return (
    <View style={{ gap: 20, alignItems: "center" }}>
      <CheckCircle2 size={56} color={colors.success} strokeWidth={1.5} />
      <Text token="titleLg">Compra confirmada!</Text>
      {successOrderId ? (
        <Text token="bodySm" color="muted">
          Pedido {successOrderId.slice(0, 8).toUpperCase()} · {formatCurrencyFromCents(successTotalCents)}
        </Text>
      ) : null}

      <View style={{ gap: 14, width: "100%" }}>
        {successTickets.map((ticket) => (
          <View
            key={ticket.id}
            style={{
              alignItems: "center",
              gap: 8,
              backgroundColor: colors.surfaceAlt,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 10,
              }}
            >
              <QRCode value={ticket.qrCode} size={140} />
            </View>
            <Text token="bodySm" style={{ fontWeight: "700" }}>
              {ticket.lotName}
            </Text>
            {ticket.attendeeName ? (
              <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0 }}>
                {ticket.attendeeName}
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      <View style={{ width: "100%", gap: 10 }}>
        <Button label="Ver meus ingressos" onPress={() => router.replace("/(tabs)/tickets")} fullWidth />
        <Button
          label="Voltar ao início"
          variant="secondary"
          onPress={() => router.replace("/(tabs)")}
          fullWidth
        />
      </View>
    </View>
  );
}
