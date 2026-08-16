import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";

import { AuthGate } from "@/components/AuthGate";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { IconButton, Text, useTheme } from "@/design-system";
import { useEventBySlug } from "@/hooks/useEvents";
import { useCheckout } from "@/features/checkout/useCheckout";
import { CheckoutFooter } from "@/features/checkout/components/CheckoutFooter";
import { ReviewStep } from "@/features/checkout/components/ReviewStep";
import { CustomFieldsStep } from "@/features/checkout/components/CustomFieldsStep";
import { InfoStep } from "@/features/checkout/components/InfoStep";
import { PaymentStep } from "@/features/checkout/components/PaymentStep";
import { SuccessStep } from "@/features/checkout/components/SuccessStep";

const STEP_TITLES: Record<string, string> = {
  review: "Revisão",
  custom: "Informações",
  info: "Seus dados",
  payment: "Pagamento",
  success: "Confirmação",
};

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
  const { colors } = useTheme();
  const { slug, tickets } = useLocalSearchParams<{ slug: string; tickets?: string }>();

  const selection = useMemo(() => parseSelection(tickets), [tickets]);
  const { data: event, isLoading } = useEventBySlug(slug ?? "");
  const checkout = useCheckout(event, selection);

  const handleBack = () => {
    if (checkout.step === checkout.steps[0]) {
      router.back();
    } else {
      checkout.goBack();
    }
  };

  return (
    <Screen edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <IconButton icon={ArrowLeft} accessibilityLabel="Voltar" onPress={handleBack} />
        <Text token="subtitle" style={{ fontWeight: "800" }}>
          {STEP_TITLES[checkout.step] ?? "Checkout"}
        </Text>
      </View>

      {isLoading || !event ? (
        <View style={{ padding: 20, gap: 12 }}>
          <Skeleton className="h-6 w-2/3 rounded-xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
            {checkout.step === "review" ? <ReviewStep checkout={checkout} /> : null}
            {checkout.step === "custom" ? <CustomFieldsStep checkout={checkout} /> : null}
            {checkout.step === "info" ? <InfoStep checkout={checkout} /> : null}
            {checkout.step === "payment" ? <PaymentStep checkout={checkout} /> : null}
            {checkout.step === "success" ? <SuccessStep checkout={checkout} /> : null}
          </ScrollView>
          {checkout.step !== "success" ? <CheckoutFooter onExpire={() => router.back()} /> : null}
        </>
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
