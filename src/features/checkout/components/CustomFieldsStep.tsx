import { View } from "react-native";

import { Button, RadioGroup, Text, TextField, useTheme } from "@/design-system";
import type { UseCheckoutReturn } from "@/features/checkout/useCheckout";

export function CustomFieldsStep({ checkout }: { checkout: UseCheckoutReturn }) {
  const { colors } = useTheme();
  const { relevantCustomFields, sharedCustomFieldValues, setSharedCustomFieldValues, areRequiredCustomFieldsFilled, goNext, goBack } =
    checkout;

  const setValue = (key: string, value: string) =>
    setSharedCustomFieldValues((prev) => ({ ...prev, [key]: value }));

  return (
    <View style={{ gap: 20 }}>
      <Text token="titleLg">Informações adicionais</Text>
      <Text token="bodySm" color="muted">
        O organizador do evento pediu algumas informações extras.
      </Text>

      <View style={{ gap: 16 }}>
        {relevantCustomFields.map((field) => {
          const type = field.type.toUpperCase();
          const value = sharedCustomFieldValues[field.key] ?? "";

          if (type === "SELECT" && field.options?.length) {
            return (
              <View key={field.id}>
                <Text token="bodySm" style={{ fontWeight: "600", marginBottom: 6, color: colors.text }}>
                  {field.label}
                  {field.required ? " *" : ""}
                </Text>
                <RadioGroup
                  value={value}
                  onChange={(next) => setValue(field.key, next)}
                  options={field.options
                    .slice()
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((option) => ({ value: option.value, label: option.label }))}
                />
              </View>
            );
          }

          return (
            <TextField
              key={field.id}
              label={field.required ? `${field.label} *` : field.label}
              value={value}
              onChangeText={(next) => setValue(field.key, next)}
              multiline={type === "TEXTAREA"}
            />
          );
        })}
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button label="Voltar" variant="secondary" onPress={goBack} />
        <View style={{ flex: 1 }}>
          <Button label="Continuar" onPress={goNext} disabled={!areRequiredCustomFieldsFilled} fullWidth />
        </View>
      </View>
    </View>
  );
}
