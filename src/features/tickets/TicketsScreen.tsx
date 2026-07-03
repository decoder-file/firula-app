import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ticket } from "lucide-react-native";

import { Button, Text, useTheme } from "@/design-system";
import { QrModal } from "@/features/tickets/components/QrModal";
import { TicketBilhete } from "@/features/tickets/components/TicketBilhete";
import { TABS, type TabKey } from "@/features/tickets/constants";
import type { AppTicket, TicketsScreenProps } from "@/features/tickets/types";

const cardShadow = {
  shadowColor: "#141821",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
};

export function TicketsScreen({
  tickets,
  renderQr,
  onExplore,
}: TicketsScreenProps) {
  const { colors } = useTheme();
  const [tab, setTab] = useState<TabKey>("active");
  const [qrTicket, setQrTicket] = useState<AppTicket | null>(null);

  const list = useMemo(
    () => tickets.filter((t) => (tab === "all" ? true : t.status === tab)),
    [tickets, tab],
  );

  const emptyCopy: Record<TabKey, { title: string; body: string }> = {
    active: {
      title: "Nenhum ingresso ativo",
      body: "Seus ingressos válidos aparecem aqui com QR Code para entrada.",
    },
    used: {
      title: "Nenhum ingresso usado",
      body: "Depois que você participar de um evento, ele aparece aqui.",
    },
    all: {
      title: "Você ainda não tem ingressos",
      body: "Explore eventos e garanta seu lugar — é rápido.",
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />

      <View
        style={{
          backgroundColor: colors.surface,
          paddingHorizontal: 20,
          paddingTop: 14,
        }}
      >
        <Text token="titleLg" style={{ fontSize: 24 }}>
          Meus ingressos
        </Text>
        <View style={[styles.segment, { backgroundColor: colors.surfaceAlt }]}>
          {TABS.map((t) => {
            const on = t.id === tab;
            return (
              <Pressable
                key={t.id}
                onPress={() => setTab(t.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                accessibilityLabel={t.label}
                style={[
                  styles.segItem,
                  on
                    ? { backgroundColor: colors.surface, ...cardShadow }
                    : null,
                ]}
              >
                <Text
                  token="label"
                  style={{
                    fontSize: 13,
                    color: on ? colors.text : colors.textMuted,
                    fontWeight: on ? "700" : "600",
                  }}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        {list.length > 0 ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 16 }}>
            {list.map((t) => (
              <TicketBilhete
                key={t.id}
                ticket={t}
                onOpenQr={() => setQrTicket(t)}
              />
            ))}
          </View>
        ) : (
          <View
            style={{
              alignItems: "center",
              paddingHorizontal: 20,
              paddingTop: 40,
            }}
          >
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <Ticket size={30} color={colors.primaryText} strokeWidth={1.75} />
            </View>
            <Text token="title" style={{ marginBottom: 4 }}>
              {emptyCopy[tab].title}
            </Text>
            <Text
              token="bodySm"
              color="muted"
              style={{ textAlign: "center", maxWidth: 240, marginBottom: 16 }}
            >
              {emptyCopy[tab].body}
            </Text>
            <Button label="Explorar eventos" onPress={onExplore ?? (() => {})} />
          </View>
        )}
      </ScrollView>

      <QrModal
        ticket={qrTicket}
        onClose={() => setQrTicket(null)}
        renderQr={renderQr}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: "row",
    marginTop: 14,
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 4,
  },
  segItem: {
    flex: 1,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
});
