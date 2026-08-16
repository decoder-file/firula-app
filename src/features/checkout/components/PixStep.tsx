import { useState } from "react";
import { View } from "react-native";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import { Check, Copy, TriangleAlert } from "lucide-react-native";

import { Button, Text, useTheme } from "@/design-system";
import { formatCurrencyFromCents } from "@/utils/format";
import { useCountdown } from "@/features/checkout/useCountdown";
import type { UseCheckoutReturn } from "@/features/checkout/useCheckout";

export function PixStep({ checkout }: { checkout: UseCheckoutReturn }) {
  const { colors } = useTheme();
  const { quote, pixSession, isSubmitting, isPollingPix, pixError, createPixPayment, retryPixPayment, goBack } =
    checkout;
  const [copied, setCopied] = useState(false);
  const { label: countdownLabel, expired } = useCountdown(pixSession?.expiresAt);

  const pixUnavailable = !!quote && !quote.availablePaymentMethods.includes("PIX");

  const handleCopy = async () => {
    if (!pixSession) return;
    await Clipboard.setStringAsync(pixSession.qrCodeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (pixUnavailable) {
    return (
      <View style={{ gap: 16, alignItems: "center", paddingVertical: 20 }}>
        <TriangleAlert size={32} color={colors.warning} strokeWidth={1.75} />
        <Text token="body" style={{ textAlign: "center" }}>
          Pagamento por PIX está indisponível para este evento no momento.
        </Text>
        <Button label="Voltar" variant="secondary" onPress={goBack} />
      </View>
    );
  }

  if (!pixSession) {
    return (
      <View style={{ gap: 20 }}>
        <Text token="titleLg">Pagamento via PIX</Text>
        {quote ? (
          <Text token="body" color="muted">
            Total a pagar: {formatCurrencyFromCents(quote.finalAmountCents)}
          </Text>
        ) : null}
        {pixError ? (
          <Text token="bodySm" color="error">
            {pixError}
          </Text>
        ) : null}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button label="Voltar" variant="secondary" onPress={goBack} disabled={isSubmitting} />
          <View style={{ flex: 1 }}>
            <Button
              label="Gerar código PIX"
              onPress={createPixPayment}
              loading={isSubmitting}
              fullWidth
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: 20, alignItems: "center" }}>
      <Text token="titleLg">Escaneie o QR Code</Text>
      <Text token="bodySm" color="muted" style={{ textAlign: "center" }}>
        Abra o app do seu banco e escaneie o código, ou copie o código abaixo.
      </Text>

      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <QRCode value={pixSession.qrCodeText} size={200} />
      </View>

      <Text token="bodySm" color="muted">
        {expired ? "Código expirado" : `Expira em ${countdownLabel}`}
      </Text>

      <Button
        label={copied ? "Copiado!" : "Copiar código PIX"}
        icon={copied ? Check : Copy}
        variant="secondary"
        onPress={() => void handleCopy()}
        fullWidth
      />

      {isPollingPix ? (
        <Text token="bodySm" color="muted">
          Aguardando confirmação do pagamento…
        </Text>
      ) : null}

      {pixError ? (
        <View style={{ gap: 10, width: "100%" }}>
          <Text token="bodySm" color="error" style={{ textAlign: "center" }}>
            {pixError}
          </Text>
          <Button label="Tentar novamente" onPress={retryPixPayment} loading={isSubmitting} fullWidth />
        </View>
      ) : null}
    </View>
  );
}
