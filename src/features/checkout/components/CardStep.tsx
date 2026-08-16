import { useRef } from "react";
import { ActivityIndicator, TextInput, View } from "react-native";
import { Check, MapPin, ScanLine } from "lucide-react-native";

import { PressScale, Text, TextField, useTheme } from "@/design-system";
import { formatCardExpiry, formatCardNumber, formatCep } from "@/utils/mask";
import { formatCurrencyFromCents } from "@/utils/format";
import type { UseCheckoutReturn } from "@/features/checkout/useCheckout";

/**
 * Formulário do fluxo TRANSPARENT (Marlim) — sem 3DS, envia os dados direto. Conteúdo
 * puro (sem navegação/botão de pagar), embutido inline em `CheckoutScreen`, que é quem
 * decide quando mostrar (linha "Novo cartão" selecionada) e tem o único CTA da tela.
 */
export function CardStep({ checkout }: { checkout: UseCheckoutReturn }) {
  const { colors, radius } = useTheme();
  const { quote } = checkout;

  const holderNameRef = useRef<TextInput>(null);
  const expiryRef = useRef<TextInput>(null);
  const cvvRef = useRef<TextInput>(null);
  const cepRef = useRef<TextInput>(null);
  const numberRef = useRef<TextInput>(null);

  const addressFound = checkout.billingStreet.trim().length > 0 && checkout.billingCity.trim().length > 0;

  return (
    <View style={{ gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 13 }}>
      <View style={{ position: "relative" }}>
        <TextField
          label="Número do cartão"
          value={formatCardNumber(checkout.cardNumber)}
          onChangeText={checkout.setCardNumber}
          keyboardType="number-pad"
          maxLength={19}
          returnKeyType="next"
          onSubmitEditing={() => holderNameRef.current?.focus()}
        />
        <ScanLine size={19} color={colors.primaryText} strokeWidth={2} style={{ position: "absolute", right: 14, top: 36 }} />
      </View>

      <TextField
        ref={holderNameRef}
        label="Nome como está no cartão"
        value={checkout.cardHolderName}
        onChangeText={(value) => checkout.setCardHolderName(value.toUpperCase())}
        autoCapitalize="characters"
        returnKeyType="next"
        onSubmitEditing={() => expiryRef.current?.focus()}
      />

      <View style={{ flexDirection: "row", gap: 9 }}>
        <View style={{ flex: 1 }}>
          <TextField
            ref={expiryRef}
            label="MM/AA"
            value={formatCardExpiry(checkout.cardExpiry)}
            onChangeText={checkout.setCardExpiry}
            keyboardType="number-pad"
            maxLength={5}
            returnKeyType="next"
            onSubmitEditing={() => cvvRef.current?.focus()}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextField
            ref={cvvRef}
            label="CVV"
            value={checkout.cardCvv}
            onChangeText={(value) => checkout.setCardCvv(value.replace(/\D/g, "").slice(0, 4))}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            returnKeyType="next"
            onSubmitEditing={() => cepRef.current?.focus()}
          />
        </View>
      </View>

      {quote?.card && quote.card.installments.length > 1 ? (
        <View style={{ flexDirection: "row", gap: 7, marginTop: 2 }}>
          {quote.card.installments.map((option) => {
            const active = checkout.installments === option.installments;
            return (
              <PressScale
                key={option.installments}
                onPress={() => checkout.setInstallments(option.installments)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={{
                  flex: 1,
                  height: 52,
                  borderRadius: radius.md,
                  borderWidth: 1.5,
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.primarySoft : colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <Text token="bodySm" style={{ fontWeight: "800", color: active ? colors.primaryText : colors.text }}>
                  {option.installments === 1 ? "À vista" : `${option.installments}×`}
                </Text>
                <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0, fontSize: 10 }}>
                  {formatCurrencyFromCents(option.installmentValueCents)}
                </Text>
              </PressScale>
            );
          })}
        </View>
      ) : null}

      <View style={{ flexDirection: "row", gap: 9, alignItems: "flex-start" }}>
        <View style={{ width: 128 }}>
          <TextField
            ref={cepRef}
            label="CEP"
            value={formatCep(checkout.billingCep)}
            onChangeText={checkout.setBillingCep}
            keyboardType="number-pad"
            maxLength={9}
            error={checkout.cepError ?? undefined}
            returnKeyType="next"
            onSubmitEditing={() => numberRef.current?.focus()}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextField
            ref={numberRef}
            label="Número"
            value={checkout.billingNumber}
            onChangeText={checkout.setBillingNumber}
            keyboardType="number-pad"
            returnKeyType="done"
          />
        </View>
      </View>

      {checkout.isLookingUpCep ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <ActivityIndicator size="small" color={colors.textMuted} />
          <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0 }}>
            Buscando endereço…
          </Text>
        </View>
      ) : addressFound ? (
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            backgroundColor: colors.primarySoft,
            borderRadius: radius.md,
            padding: 10,
          }}
        >
          <MapPin size={15} color={colors.primaryText} strokeWidth={2} style={{ marginTop: 1 }} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Check size={12} color={colors.primaryText} strokeWidth={2.5} />
              <Text token="caption" style={{ fontWeight: "700", color: colors.primaryText, textTransform: "none", letterSpacing: 0 }}>
                Endereço encontrado
              </Text>
            </View>
            <Text token="caption" style={{ color: colors.primaryText, textTransform: "none", letterSpacing: 0, marginTop: 2, lineHeight: 16 }}>
              {checkout.billingStreet}
              {checkout.billingNeighborhood ? ` — ${checkout.billingNeighborhood}` : ""}
              {"\n"}
              {checkout.billingCity}, {checkout.billingState}
            </Text>
          </View>
        </View>
      ) : !checkout.cepError ? (
        <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0, lineHeight: 15 }}>
          Só o CEP — buscamos o resto do endereço
        </Text>
      ) : null}
    </View>
  );
}
