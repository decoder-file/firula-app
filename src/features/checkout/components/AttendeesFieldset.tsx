import { View } from "react-native";

import { Checkbox, Text, TextField, useTheme } from "@/design-system";
import { formatCpf, formatPhone } from "@/utils/mask";
import type { AdditionalAttendee } from "@/features/checkout/useCheckout";
import type { AdminEventDetail } from "@/services/events.service";

export function AttendeesFieldset({
  index,
  lotName,
  customFields,
  attendee,
  onChange,
}: {
  index: number;
  lotName: string;
  customFields: AdminEventDetail["customFields"];
  attendee: AdditionalAttendee;
  onChange: (patch: Partial<AdditionalAttendee>) => void;
}) {
  const { colors } = useTheme();

  const setCustomField = (key: string, value: string) =>
    onChange({ customFieldValues: { ...attendee.customFieldValues, [key]: value } });

  return (
    <View style={{ gap: 12, backgroundColor: colors.surfaceAlt, borderRadius: 16, padding: 14 }}>
      <Text token="bodySm" style={{ fontWeight: "800" }}>
        Ingresso {index + 2} — {lotName}
      </Text>

      <Checkbox
        checked={attendee.sameAsBuyer}
        onChange={(checked) => onChange({ sameAsBuyer: checked })}
        label="Mesmo que o comprador"
      />

      {!attendee.sameAsBuyer ? (
        <View style={{ gap: 12 }}>
          <TextField
            label="Nome completo"
            value={attendee.name}
            onChangeText={(value) => onChange({ name: value })}
          />
          <TextField
            label="CPF"
            value={formatCpf(attendee.cpf)}
            onChangeText={(value) => onChange({ cpf: value })}
            keyboardType="number-pad"
            maxLength={14}
          />
          <TextField
            label="Telefone"
            value={formatPhone(attendee.phone)}
            onChangeText={(value) => onChange({ phone: value })}
            keyboardType="phone-pad"
            maxLength={15}
          />
          {customFields.map((field) => (
            <TextField
              key={field.id}
              label={field.required ? `${field.label} *` : field.label}
              value={attendee.customFieldValues[field.key] ?? ""}
              onChangeText={(value) => setCustomField(field.key, value)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
