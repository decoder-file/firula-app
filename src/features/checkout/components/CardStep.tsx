import { View } from "react-native";

import { Button, RadioGroup, Text, TextField } from "@/design-system";
import { formatCardExpiry, formatCardNumber, formatCep } from "@/utils/mask";
import { formatCurrencyFromCents } from "@/utils/format";
import type { UseCheckoutReturn } from "@/features/checkout/useCheckout";

export function CardStep({ checkout }: { checkout: UseCheckoutReturn }) {
  const { quote, isSubmitting, goBack } = checkout;

  const flow = quote?.card?.flow ?? "TRANSPARENT";

  if (flow === "REDIRECT") {
    return <CardRedirectView checkout={checkout} />;
  }

  return (
    <View style={{ gap: 20 }}>
      <Text token="titleLg">Pagamento com cartão</Text>
      {quote ? (
        <Text token="body" color="muted">
          Total a pagar: {formatCurrencyFromCents(quote.finalAmountCents)}
        </Text>
      ) : null}

      <View style={{ gap: 12 }}>
        <TextField
          label="Número do cartão"
          value={formatCardNumber(checkout.cardNumber)}
          onChangeText={checkout.setCardNumber}
          keyboardType="number-pad"
          maxLength={19}
        />
        <TextField
          label="Nome impresso no cartão"
          value={checkout.cardHolderName}
          onChangeText={(value) => checkout.setCardHolderName(value.toUpperCase())}
          autoCapitalize="characters"
        />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Validade (MM/AA)"
              value={formatCardExpiry(checkout.cardExpiry)}
              onChangeText={checkout.setCardExpiry}
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="CVV"
              value={checkout.cardCvv}
              onChangeText={(value) => checkout.setCardCvv(value.replace(/\D/g, "").slice(0, 4))}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <Text token="bodySm" style={{ fontWeight: "700" }}>
          Endereço de cobrança
        </Text>
        <TextField
          label="CEP"
          value={formatCep(checkout.billingCep)}
          onChangeText={checkout.setBillingCep}
          keyboardType="number-pad"
          maxLength={9}
          helper={checkout.isLookingUpCep ? "Buscando endereço…" : undefined}
          error={checkout.cepError ?? undefined}
        />
        <TextField label="Rua" value={checkout.billingStreet} onChangeText={checkout.setBillingStreet} />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <TextField label="Número" value={checkout.billingNumber} onChangeText={checkout.setBillingNumber} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <TextField label="Complemento" value={checkout.billingComplement} onChangeText={checkout.setBillingComplement} />
          </View>
        </View>
        <TextField label="Bairro" value={checkout.billingNeighborhood} onChangeText={checkout.setBillingNeighborhood} />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 2 }}>
            <TextField label="Cidade" value={checkout.billingCity} onChangeText={checkout.setBillingCity} />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="UF"
              value={checkout.billingState}
              onChangeText={(value) => checkout.setBillingState(value.toUpperCase().slice(0, 2))}
              autoCapitalize="characters"
              maxLength={2}
            />
          </View>
        </View>
      </View>

      {quote?.card && quote.card.installments.length > 1 ? (
        <View>
          <Text token="bodySm" style={{ fontWeight: "700", marginBottom: 6 }}>
            Parcelas
          </Text>
          <RadioGroup
            value={String(checkout.installments)}
            onChange={(value) => checkout.setInstallments(Number(value))}
            options={quote.card.installments.map((option) => ({
              value: String(option.installments),
              label: `${option.installments}x de ${formatCurrencyFromCents(option.installmentValueCents)}${
                option.interestRate > 0 ? " (com juros)" : " sem juros"
              }`,
            }))}
          />
        </View>
      ) : null}

      {checkout.paymentError ? (
        <Text token="bodySm" color="error">
          {checkout.paymentError}
        </Text>
      ) : null}

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button label="Voltar" variant="secondary" onPress={goBack} disabled={isSubmitting} />
        <View style={{ flex: 1 }}>
          <Button
            label={checkout.paymentError ? "Tentar novamente" : "Pagar"}
            onPress={checkout.paymentError ? checkout.retryCardPayment : checkout.createCardPayment}
            disabled={!checkout.isCardFormValid}
            loading={isSubmitting}
            fullWidth
          />
        </View>
      </View>
    </View>
  );
}

function CardRedirectView({ checkout }: { checkout: UseCheckoutReturn }) {
  const { quote, isSubmitting, goBack } = checkout;

  return (
    <View style={{ gap: 20 }}>
      <Text token="titleLg">Pagamento com cartão</Text>
      {quote ? (
        <Text token="body" color="muted">
          Total a pagar: {formatCurrencyFromCents(quote.finalAmountCents)}
        </Text>
      ) : null}
      <Text token="bodySm" color="muted">
        Você será redirecionado para concluir o pagamento com cartão de forma segura.
      </Text>

      {checkout.paymentError ? (
        <Text token="bodySm" color="error">
          {checkout.paymentError}
        </Text>
      ) : null}

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button label="Voltar" variant="secondary" onPress={goBack} disabled={isSubmitting} />
        <View style={{ flex: 1 }}>
          <Button
            label="Pagar com cartão"
            onPress={checkout.createCardRedirectPayment}
            loading={isSubmitting}
            fullWidth
          />
        </View>
      </View>
    </View>
  );
}
