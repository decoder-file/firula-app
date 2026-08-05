import React, { useEffect, useState } from "react";
import { View } from "react-native";

import { BottomSheet, Button, RadioGroup, TextField } from "@/design-system";
import type { ReportReason } from "@/features/player-profile/types";

interface ReportProfileSheetProps {
  visible: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  onSubmit: (reason: ReportReason, details?: string) => Promise<void>;
}

const REASON_OPTIONS: { value: ReportReason; label: string }[] = [
  { value: "SPAM", label: "Spam" },
  { value: "INAPPROPRIATE_CONTENT", label: "Conteúdo impróprio" },
  { value: "HARASSMENT", label: "Assédio" },
  { value: "FAKE_PROFILE", label: "Perfil falso" },
  { value: "OTHER", label: "Outro" },
];

export function ReportProfileSheet({ visible, onClose, isSubmitting, onSubmit }: ReportProfileSheetProps) {
  const [reason, setReason] = useState<ReportReason>("SPAM");
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (visible) {
      setReason("SPAM");
      setDetails("");
    }
  }, [visible]);

  const handleSubmit = async () => {
    try {
      await onSubmit(reason, details.trim() || undefined);
      onClose();
    } catch {
      // feedback de erro já é mostrado pelo chamador (snackbar) — mantém o
      // sheet aberto pra permitir tentar de novo.
    }
  };

  return (
    <BottomSheet visible={visible} title="Denunciar perfil" onClose={onClose}>
      <View style={{ paddingBottom: 4 }}>
        <RadioGroup value={reason} onChange={setReason} options={REASON_OPTIONS} />

        <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
          <TextField
            label="Detalhes (opcional)"
            value={details}
            onChangeText={setDetails}
            placeholder="Conte mais sobre o que aconteceu"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Button label="Enviar denúncia" variant="destructive" loading={isSubmitting} onPress={handleSubmit} fullWidth />
        </View>
      </View>
    </BottomSheet>
  );
}
