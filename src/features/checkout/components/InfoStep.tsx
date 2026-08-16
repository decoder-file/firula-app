import { useMemo } from "react";
import { View } from "react-native";

import { Button, Text, TextField } from "@/design-system";
import { formatCpf, formatPhone, onlyDigits } from "@/utils/mask";
import { isValidCpf } from "@/utils/cpf";
import { AttendeesFieldset } from "@/features/checkout/components/AttendeesFieldset";
import type { UseCheckoutReturn } from "@/features/checkout/useCheckout";

export function InfoStep({ checkout }: { checkout: UseCheckoutReturn }) {
  const {
    event,
    ticketLotsPayload,
    buyerEmail,
    buyerName,
    setBuyerName,
    buyerCpf,
    setBuyerCpf,
    buyerPhone,
    setBuyerPhone,
    additionalAttendees,
    updateAdditionalAttendee,
    isAdditionalAttendeeValid,
    filterCustomFieldsForLot,
    quote,
    isSubmitting,
    goNext,
    goBack,
    createFreeOrder,
  } = checkout;

  // Unidade 0 (comprador) fica de fora — mapeia cada participante adicional pro lote a
  // que pertence, na mesma ordem/agrupamento usada no payload final (buildAttendeesPayload).
  const attendeeLots = useMemo(() => {
    if (!event) return [];
    const flat: { lotId: string; lotName: string }[] = [];
    for (const item of ticketLotsPayload) {
      const lot = event.ticketLots.find((l) => l.id === item.ticketLotId);
      for (let i = 0; i < item.quantity; i++) {
        flat.push({ lotId: item.ticketLotId, lotName: lot?.name ?? "" });
      }
    }
    return flat.slice(1);
  }, [event, ticketLotsPayload]);

  const isBuyerValid =
    buyerName.trim().length >= 3 && isValidCpf(buyerCpf) && onlyDigits(buyerPhone).length >= 10;

  const areAttendeesValid = additionalAttendees.every((attendee, index) =>
    isAdditionalAttendeeValid(attendee, attendeeLots[index]?.lotId ?? ""),
  );

  const canContinue = isBuyerValid && areAttendeesValid && !isSubmitting;

  const handleContinue = async () => {
    if (!quote) return;
    if (quote.isFree) {
      await createFreeOrder();
    } else {
      goNext();
    }
  };

  return (
    <View style={{ gap: 20 }}>
      <Text token="titleLg">Seus dados</Text>

      <View style={{ gap: 12 }}>
        <TextField label="E-mail" value={buyerEmail} onChangeText={() => {}} disabled />
        <TextField label="Nome completo" value={buyerName} onChangeText={setBuyerName} />
        <TextField
          label="CPF"
          value={formatCpf(buyerCpf)}
          onChangeText={setBuyerCpf}
          keyboardType="number-pad"
          maxLength={14}
          error={buyerCpf && !isValidCpf(buyerCpf) ? "CPF inválido" : undefined}
        />
        <TextField
          label="Telefone"
          value={formatPhone(buyerPhone)}
          onChangeText={setBuyerPhone}
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>

      {additionalAttendees.length > 0 ? (
        <View style={{ gap: 12 }}>
          <Text token="bodySm" style={{ fontWeight: "700" }}>
            Participantes
          </Text>
          {additionalAttendees.map((attendee, index) => (
            <AttendeesFieldset
              key={index}
              index={index}
              lotName={attendeeLots[index]?.lotName ?? ""}
              customFields={filterCustomFieldsForLot(attendeeLots[index]?.lotId ?? "")}
              attendee={attendee}
              onChange={(patch) => updateAdditionalAttendee(index, patch)}
            />
          ))}
        </View>
      ) : null}

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button label="Voltar" variant="secondary" onPress={goBack} />
        <View style={{ flex: 1 }}>
          <Button
            label={quote?.isFree ? "Confirmar" : "Continuar"}
            onPress={() => void handleContinue()}
            disabled={!canContinue}
            loading={isSubmitting}
            fullWidth
          />
        </View>
      </View>
    </View>
  );
}
