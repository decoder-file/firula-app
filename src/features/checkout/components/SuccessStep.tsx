import { useEffect, useMemo } from "react";
import { Image, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Check, ChevronRight, ScanFace, Wallet } from "lucide-react-native";

import { Button, PressScale, Text } from "@/design-system";
import { formatCurrencyFromCents } from "@/utils/format";
import { resolvePlatformEventImageUrl } from "@/services/events.service";
import { useAddToWallet } from "@/hooks/useTickets";
import type { UseCheckoutReturn } from "@/features/checkout/useCheckout";
import { checkAndMaybeShowRatingPrompt } from "@/features/app-rating/RateAppModal";
import { recordMeaningfulAction } from "@/services/appRating.service";

const DARK_BG = "#141821";

export function SuccessStep({ checkout }: { checkout: UseCheckoutReturn }) {
  const router = useRouter();
  const { event, successOrderId, successTotalCents, successTickets, buyerEmail } = checkout;
  const addToWallet = useAddToWallet();

  // Compra concluída é a "tarefa importante" que sinaliza satisfação real —
  // ver appRating.service.ts. O atraso evita competir com a animação de
  // entrada desta tela.
  useEffect(() => {
    const timer = setTimeout(() => {
      recordMeaningfulAction().then(checkAndMaybeShowRatingPrompt);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const lotCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ticket of successTickets) {
      counts.set(ticket.lotName, (counts.get(ticket.lotName) ?? 0) + 1);
    }
    return Array.from(counts.entries());
  }, [successTickets]);

  const imageUrl = event ? resolvePlatformEventImageUrl({ coverUrl: event.coverUrl, imageUrl: null }) : null;

  return (
    <View style={{ flex: 1, backgroundColor: DARK_BG }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40, alignItems: "center" }}>
        <View
          style={{
            position: "absolute",
            top: 20,
            width: 220,
            height: 220,
            borderRadius: 999,
            backgroundColor: "rgba(31,189,99,0.16)",
          }}
        />
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: 999,
            backgroundColor: "#1FBD63",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#1FBD63",
            shadowOpacity: 0.4,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 10 },
            elevation: 8,
          }}
        >
          <Check size={42} color="#FFFFFF" strokeWidth={3} />
        </View>

        <Text
          style={{
            fontFamily: "PlusJakartaSans-ExtraBold",
            fontSize: 24,
            color: "#fff",
            marginTop: 20,
            letterSpacing: -0.4,
            textAlign: "center",
          }}
        >
          Pagamento aprovado!
        </Text>
        <Text
          style={{ fontSize: 13.5, color: "rgba(255,255,255,0.65)", marginTop: 7, textAlign: "center", lineHeight: 20, maxWidth: 270 }}
        >
          {successTickets.length === 1 ? "Seu ingresso já está" : `Seus ${successTickets.length} ingressos já estão`} na carteira
          {buyerEmail ? ` e no e-mail ${buyerEmail}` : ""}
        </Text>

        {/* resumo do pedido */}
        <View style={{ width: "100%", backgroundColor: "#fff", borderRadius: 20, marginTop: 26, overflow: "hidden" }}>
          <View style={{ padding: 16, flexDirection: "row", gap: 13, alignItems: "center" }}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#EDEFF2" }} />
            ) : (
              <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#EDEFF2" }} />
            )}
            <View style={{ flex: 1, minWidth: 0 }}>
              {lotCounts.map(([lotName, count]) => (
                <Text
                  key={lotName}
                  style={{ fontFamily: "PlusJakartaSans-ExtraBold", fontSize: 9.5, letterSpacing: 0.5, color: "#12813F" }}
                >
                  {count}× {lotName.toUpperCase()}
                </Text>
              ))}
              <Text
                style={{ fontFamily: "PlusJakartaSans-ExtraBold", fontSize: 14, marginTop: 2, color: "#141821" }}
                numberOfLines={1}
              >
                {event?.name}
              </Text>
              {successOrderId ? (
                <Text style={{ fontSize: 11, color: "#8A93A1", marginTop: 2 }}>
                  Pedido {successOrderId.slice(0, 8).toUpperCase()} · {formatCurrencyFromCents(successTotalCents)}
                </Text>
              ) : null}
            </View>
          </View>
          <View
            style={{
              borderTopWidth: 2,
              borderStyle: "dashed",
              borderTopColor: "#E7EAEE",
              padding: 13,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <Check size={14} color="#12813F" strokeWidth={2.5} />
            <Text style={{ fontFamily: "PlusJakartaSans-Bold", fontSize: 11.5, color: "#12813F" }}>Confirmado</Text>
          </View>
        </View>

        {/* ações */}
        <View style={{ width: "100%", gap: 10, marginTop: 22 }}>
          <Button label="Ver meus ingressos" onPress={() => router.replace("/(tabs)/tickets")} fullWidth />
          {successTickets.length === 1 ? (
            <Button
              label="Adicionar à Apple Wallet"
              icon={Wallet}
              variant="secondary"
              loading={addToWallet.isPending}
              onPress={() => addToWallet.mutate(successTickets[0].id)}
              fullWidth
            />
          ) : null}
        </View>

        {/* facial id */}
        <PressableFacialIdCard />
      </ScrollView>
    </View>
  );
}

function PressableFacialIdCard() {
  const router = useRouter();
  return (
    <PressScale
      onPress={() => router.push("/facial-id" as never)}
      accessibilityRole="button"
      accessibilityLabel="Ativar Facial ID"
      style={{
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: 14,
        marginTop: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          backgroundColor: "rgba(62,217,127,0.16)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ScanFace size={19} color="#3ED97F" strokeWidth={2} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: "PlusJakartaSans-ExtraBold", fontSize: 13, color: "#fff" }}>Ative o Facial ID</Text>
        <Text style={{ fontSize: 11.5, color: "rgba(255,255,255,0.6)", marginTop: 1 }}>
          Entre no evento sem fila, só com o rosto
        </Text>
      </View>
      <ChevronRight size={17} color="rgba(255,255,255,0.4)" strokeWidth={2} />
    </PressScale>
  );
}
