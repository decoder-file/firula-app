import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";
import { Check, Copy, RefreshCw } from "lucide-react-native";

import { Button, Text, useTheme } from "@/design-system";
import { formatCurrencyFromCents } from "@/utils/format";
import { useCountdown } from "@/features/checkout/useCountdown";
import type { UseCheckoutReturn } from "@/features/checkout/useCheckout";

export function PixStep({ checkout }: { checkout: UseCheckoutReturn }) {
  const { colors, radius } = useTheme();
  const { quote, pixSession, isSubmitting, paymentError, retryPixPayment } = checkout;
  const [copied, setCopied] = useState(false);
  const { expired } = useCountdown(pixSession?.expiresAt);

  const handleCopy = async () => {
    if (!pixSession) return;
    await Clipboard.setStringAsync(pixSession.qrCodeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  if (!pixSession) {
    return (
      <View style={{ alignItems: "center", gap: 16, paddingVertical: 40 }}>
        {isSubmitting ? (
          <>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text token="body" color="muted">
              Gerando código Pix…
            </Text>
          </>
        ) : (
          <>
            <Text token="body" color="error" style={{ textAlign: "center" }}>
              {paymentError ?? "Não foi possível gerar o código Pix."}
            </Text>
            <Button label="Tentar novamente" onPress={retryPixPayment} />
          </>
        )}
      </View>
    );
  }

  return (
    <View style={{ gap: 14 }}>
      {/* status aguardando */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: colors.warningSoft,
          borderRadius: radius.lg,
          padding: 14,
        }}
      >
        <ActivityIndicator size="small" color={colors.warning} />
        <View style={{ flex: 1 }}>
          <Text token="bodySm" style={{ fontWeight: "800", color: colors.warning }}>
            Aguardando pagamento
          </Text>
          <Text token="caption" style={{ color: colors.warning, opacity: 0.8, textTransform: "none", letterSpacing: 0, marginTop: 1 }}>
            Detectamos automaticamente — não precisa voltar
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.xl,
          padding: 22,
          alignItems: "center",
        }}
      >
        <View style={{ backgroundColor: "#fff", borderRadius: 14, padding: 10 }}>
          <QRCode value={pixSession.qrCodeText} size={196} />
        </View>
        <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0, marginTop: 16, textAlign: "center", lineHeight: 18 }}>
          Abra o app do seu banco e{"\n"}escaneie o código acima
        </Text>
      </View>

      <Button
        label={copied ? "Código copiado!" : "Copiar código Pix"}
        icon={copied ? Check : Copy}
        variant="secondary"
        onPress={() => void handleCopy()}
        fullWidth
      />

      <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text token="bodySm" color="muted" style={{ fontWeight: "600" }}>
            Valor a pagar
          </Text>
          {quote ? (
            <Text token="subtitle" style={{ fontWeight: "800" }}>
              {formatCurrencyFromCents(quote.finalAmountCents)}
            </Text>
          ) : null}
        </View>
      </View>

      {expired ? (
        <Text token="bodySm" color="error" style={{ textAlign: "center" }}>
          O código expirou.
        </Text>
      ) : null}

      {paymentError ? (
        <View style={{ gap: 10 }}>
          <Text token="bodySm" color="error" style={{ textAlign: "center" }}>
            {paymentError}
          </Text>
          <Button label="Tentar novamente" icon={RefreshCw} onPress={retryPixPayment} loading={isSubmitting} fullWidth />
        </View>
      ) : null}
    </View>
  );
}
