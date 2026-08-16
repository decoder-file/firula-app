import { useEffect, useMemo, useRef } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AuthGate } from "@/components/AuthGate";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { useEventBySlug } from "@/hooks/useEvents";
import { useCheckout } from "@/features/checkout/useCheckout";
import { useCountdown } from "@/features/checkout/useCountdown";
import { CheckoutHeader } from "@/features/checkout/components/CheckoutHeader";
import { CheckoutCta } from "@/features/checkout/components/CheckoutCta";
import { CheckoutScreen } from "@/features/checkout/components/CheckoutScreen";
import { PixStep } from "@/features/checkout/components/PixStep";
import { SuccessStep } from "@/features/checkout/components/SuccessStep";

const SESSION_MINUTES = 30;

function parseSelection(tickets?: string): Record<string, number> {
  if (!tickets) return {};
  const selection: Record<string, number> = {};
  for (const entry of tickets.split(",")) {
    const [lotId, qty] = entry.split(":");
    const quantity = Number(qty);
    if (lotId && Number.isFinite(quantity) && quantity > 0) {
      selection[lotId] = quantity;
    }
  }
  return selection;
}

function CheckoutContent() {
  const router = useRouter();
  const { slug, tickets } = useLocalSearchParams<{ slug: string; tickets?: string }>();

  const selection = useMemo(() => parseSelection(tickets), [tickets]);
  const { data: event, isLoading } = useEventBySlug(slug ?? "");
  const checkout = useCheckout(event, selection);

  // Timer único pra sessão inteira (checkout + pix) — não reinicia ao trocar de tela.
  const expiresAtRef = useRef(new Date(Date.now() + SESSION_MINUTES * 60 * 1000).toISOString());
  const { label: timerLabel, expired } = useCountdown(expiresAtRef.current);

  useEffect(() => {
    if (expired && checkout.step !== "success") {
      router.back();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expired]);

  const handleBack = () => {
    if (checkout.step === "pix") {
      checkout.setStep("checkout");
      return;
    }
    router.back();
  };

  if (checkout.step === "success") {
    return (
      <>
        <StatusBar style="light" />
        <SuccessStep checkout={checkout} />
      </>
    );
  }

  return (
    <Screen edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <CheckoutHeader
        title={checkout.step === "pix" ? "Pagar com Pix" : "Finalizar compra"}
        onBack={handleBack}
        timerLabel={expired ? undefined : timerLabel}
      />

      {isLoading || !event ? (
        <View style={{ padding: 20, gap: 12 }}>
          <Skeleton className="h-6 w-2/3 rounded-xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 28 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {checkout.step === "checkout" ? <CheckoutScreen checkout={checkout} /> : null}
            {checkout.step === "pix" ? <PixStep checkout={checkout} /> : null}
          </ScrollView>
          {checkout.step === "checkout" ? <CheckoutCta checkout={checkout} /> : null}
        </KeyboardAvoidingView>
      )}
    </Screen>
  );
}

export default function CheckoutRoute() {
  return (
    <AuthGate
      title="Faça login para continuar a compra"
      description="Entre na sua conta pra concluir a compra dos seus ingressos."
    >
      <Stack.Screen options={{ headerShown: false }} />
      <CheckoutContent />
    </AuthGate>
  );
}
