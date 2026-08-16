import { View } from "react-native";
import { Tag, Ticket, X } from "lucide-react-native";

import { Button, Checkbox, Text, TextField, useTheme } from "@/design-system";
import { formatCurrencyFromCents } from "@/utils/format";
import type { UseCheckoutReturn } from "@/features/checkout/useCheckout";

export function ReviewStep({ checkout }: { checkout: UseCheckoutReturn }) {
  const { colors } = useTheme();
  const {
    quote,
    quoteLoading,
    couponCode,
    couponInput,
    setCouponInput,
    couponError,
    isValidatingCoupon,
    applyCoupon,
    removeCoupon,
    requiresTermsAcceptance,
    acceptedTerms,
    setAcceptedTerms,
    goNext,
  } = checkout;

  const canContinue = !quoteLoading && !!quote && (!requiresTermsAcceptance || acceptedTerms);

  return (
    <View style={{ gap: 20 }}>
      <Text token="titleLg">Revisão do pedido</Text>

      <View style={{ gap: 10 }}>
        {(quote?.items ?? []).map((item) => (
          <View
            key={item.ticketLotId}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: colors.surfaceAlt,
              borderRadius: 14,
              padding: 14,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
              <Ticket size={18} color={colors.primaryText} strokeWidth={1.75} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text token="body" style={{ fontWeight: "700" }}>
                  {item.name}
                </Text>
                <Text token="bodySm" color="muted">
                  {item.quantity}x {formatCurrencyFromCents(item.unitPriceCents)}
                </Text>
              </View>
            </View>
            <Text token="body" style={{ fontWeight: "800" }}>
              {formatCurrencyFromCents(item.subtotalCents)}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ gap: 8 }}>
        <Text token="bodySm" style={{ fontWeight: "700" }}>
          Cupom de desconto
        </Text>
        {couponCode ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: colors.primarySoft,
              borderRadius: 12,
              padding: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Tag size={16} color={colors.primaryText} strokeWidth={2} />
              <Text token="bodySm" color="primary" style={{ fontWeight: "700" }}>
                {couponCode}
              </Text>
            </View>
            <Button label="Remover" variant="ghost" size="sm" icon={X} onPress={removeCoupon} />
          </View>
        ) : (
          <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-end" }}>
            <View style={{ flex: 1 }}>
              <TextField
                label="Código do cupom"
                value={couponInput}
                onChangeText={setCouponInput}
                autoCapitalize="characters"
                error={couponError ?? undefined}
              />
            </View>
            <Button
              label="Aplicar"
              variant="secondary"
              loading={isValidatingCoupon}
              disabled={!couponInput.trim()}
              onPress={() => void applyCoupon()}
            />
          </View>
        )}
      </View>

      {quote ? (
        <View style={{ gap: 6, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 }}>
          <SummaryRow label="Subtotal" value={formatCurrencyFromCents(quote.grossAmountCents)} />
          {quote.discountCents > 0 ? (
            <SummaryRow
              label="Desconto"
              value={`- ${formatCurrencyFromCents(quote.discountCents)}`}
              valueColor={colors.success}
            />
          ) : null}
          <SummaryRow label="Total" value={formatCurrencyFromCents(quote.finalAmountCents)} bold />
        </View>
      ) : null}

      {requiresTermsAcceptance ? (
        <Checkbox
          checked={acceptedTerms}
          onChange={setAcceptedTerms}
          label="Li e aceito os termos deste evento"
        />
      ) : null}

      <Button label="Continuar" onPress={goNext} disabled={!canContinue} fullWidth />
    </View>
  );
}

function SummaryRow({
  label,
  value,
  bold,
  valueColor,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text token={bold ? "subtitle" : "body"} color={bold ? "default" : "muted"}>
        {label}
      </Text>
      <Text
        token={bold ? "subtitle" : "body"}
        style={[{ fontWeight: bold ? "800" : "600" }, valueColor ? { color: valueColor } : null]}
      >
        {value}
      </Text>
    </View>
  );
}
