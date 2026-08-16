import { View } from "react-native";
import { Ticket } from "lucide-react-native";

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
  const { colors, radius } = useTheme();

  const setCustomField = (key: string, value: string) =>
    onChange({ customFieldValues: { ...attendee.customFieldValues, [key]: value } });

  return (
    <View
      style={{
        gap: 14,
        backgroundColor: colors.surfaceAlt,
        borderRadius: radius.lg,
        padding: 14,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ticket size={14} color={colors.primaryText} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text token="bodySm" style={{ fontWeight: "800" }}>
            Participante {index + 2}
          </Text>
          <Text
            token="caption"
            color="muted"
            numberOfLines={1}
            style={{ textTransform: "none", letterSpacing: 0, marginTop: 1 }}
          >
            {lotName}
          </Text>
        </View>
      </View>

      <View style={{ marginHorizontal: -16 }}>
        <Checkbox
          checked={attendee.sameAsBuyer}
          onChange={(checked) => onChange({ sameAsBuyer: checked })}
          label="Mesmo que o comprador"
        />
      </View>

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
