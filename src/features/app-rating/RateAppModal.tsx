import React, { useEffect, useState } from "react";
import { Modal, View } from "react-native";
import { Smile, Frown, Star } from "lucide-react-native";

import { Button, PressScale, Text, useTheme } from "@/design-system";
import {
  recordNegative,
  recordPositiveAndRequestReview,
  recordPromptShown,
  shouldShowRatingPrompt,
} from "@/services/appRating.service";

/**
 * Gate de avaliação: pergunta a satisfação ANTES de levar pra loja. Só quem
 * responde "Estou gostando" é direcionado à avaliação nativa/loja — evita
 * empurrar gente insatisfeita pra deixar nota baixa pública. Ver
 * appRating.service.ts para os critérios de quando isso pode aparecer.
 *
 * Montar uma única vez perto da raiz do app (app/_layout.tsx) e chamar
 * `checkAndMaybeShowRatingPrompt()` (exportado por este módulo) depois de um
 * momento de satisfação real — hoje: compra de ingresso concluída.
 */

type Step = "gate" | "thanks-negative";

let externalTrigger: (() => void) | null = null;

/** Chamado de qualquer tela após uma ação que sinaliza satisfação (ex.: compra concluída). */
export async function checkAndMaybeShowRatingPrompt(): Promise<void> {
  if (!(await shouldShowRatingPrompt())) return;
  externalTrigger?.();
}

export function RateAppModal() {
  const { colors, radius } = useTheme();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<Step>("gate");

  useEffect(() => {
    externalTrigger = () => {
      recordPromptShown();
      setStep("gate");
      setVisible(true);
    };
    return () => {
      externalTrigger = null;
    };
  }, []);

  const close = () => setVisible(false);

  const handlePositive = () => {
    close();
    recordPositiveAndRequestReview();
  };

  const handleNegative = () => {
    recordNegative();
    setStep("thanks-negative");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: colors.overlay }}>
        <View
          accessibilityViewIsModal
          style={{ width: "100%", maxWidth: 360, padding: 24, backgroundColor: colors.surface, borderRadius: radius.xl }}
        >
          {step === "gate" ? (
            <>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: radius.md,
                  backgroundColor: colors.primarySoft,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Star size={24} color={colors.primaryText} strokeWidth={2} />
              </View>
              <Text token="title" style={{ marginBottom: 6 }} accessibilityRole="header">
                Está gostando do Firula?
              </Text>
              <Text token="body" color="muted" style={{ marginBottom: 20 }}>
                Sua opinião nos ajuda a melhorar o app.
              </Text>
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                <PressScale
                  onPress={handleNegative}
                  accessibilityRole="button"
                  accessibilityLabel="Pode melhorar"
                  style={{
                    flex: 1,
                    alignItems: "center",
                    gap: 8,
                    paddingVertical: 16,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Frown size={26} color={colors.text} strokeWidth={1.75} />
                  <Text token="bodySm" style={{ fontWeight: "600" }}>
                    Pode melhorar
                  </Text>
                </PressScale>
                <PressScale
                  onPress={handlePositive}
                  accessibilityRole="button"
                  accessibilityLabel="Estou gostando"
                  style={{
                    flex: 1,
                    alignItems: "center",
                    gap: 8,
                    paddingVertical: 16,
                    borderRadius: radius.md,
                    backgroundColor: colors.primarySoft,
                  }}
                >
                  <Smile size={26} color={colors.primaryText} strokeWidth={1.75} />
                  <Text token="bodySm" color="primary" style={{ fontWeight: "600" }}>
                    Estou gostando
                  </Text>
                </PressScale>
              </View>
              <Button label="Agora não" variant="ghost" fullWidth onPress={close} />
            </>
          ) : (
            <>
              <Text token="title" style={{ marginBottom: 6 }} accessibilityRole="header">
                Obrigado pelo retorno!
              </Text>
              <Text token="body" color="muted" style={{ marginBottom: 20 }}>
                Vamos continuar trabalhando para melhorar sua experiência.
              </Text>
              <Button label="Fechar" fullWidth onPress={close} />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
