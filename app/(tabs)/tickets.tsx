/**
 * Firula — Ingressos redesenhada (mapeia para app/(tabs)/tickets.tsx)
 * Construída sobre o Design System. Segmentação + TicketCard (bilhete) + modal de QR.
 *
 * O QR real deve vir do react-native-qrcode-svg (já usado no app):
 *   import QRCode from 'react-native-qrcode-svg';
 *   <QRCode value={getTicketQrValue(ticket)} size={200} />
 * Passe-o via a prop `renderQr` para não acoplar o DS à lib.
 */

import React, { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CalendarDays,
  MapPin,
  QrCode,
  ScanFace,
  Ticket,
  X,
} from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import { Button, Text, useTheme } from "@/design-system";
import { useMyTickets } from "@/hooks/useTickets";
import type { CustomerTicket } from "@/services/tickets.service";

export type TicketStatus = "active" | "used";

export interface AppTicket {
  id: string;
  event: string;
  tier: string;
  dateLabel: string;
  city: string;
  code: string;
  status: TicketStatus;
  facial?: boolean;
  image?: ImageSourcePropType;
}

type TabKey = "active" | "used" | "all";
const TABS: { id: TabKey; label: string }[] = [
  { id: "active", label: "Ativos" },
  { id: "used", label: "Usados" },
  { id: "all", label: "Todos" },
];
const STATUS_LABEL: Record<TicketStatus, string> = {
  active: "Válido",
  used: "Usado",
};

const toAppTicketStatus = (status: string): TicketStatus =>
  status === "VALID" ? "active" : "used";

const formatTicketDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const mapCustomerTicket = (ticket: CustomerTicket): AppTicket => ({
  id: ticket.id,
  event: ticket.event.name,
  tier: ticket.ticketLot.name,
  dateLabel: formatTicketDate(ticket.event.startsAt),
  city: `${ticket.event.location.city}/${ticket.event.location.state}`,
  code: `FIRULA-${ticket.id.slice(0, 8).toUpperCase()}`,
  status: toAppTicketStatus(ticket.status),
  facial: false,
  image: ticket.event.coverUrl ? { uri: ticket.event.coverUrl } : undefined,
});

export interface TicketsScreenProps {
  tickets: AppTicket[];
  /** Recebe o valor do QR e devolve o nó a renderizar (ex.: <QRCode value={v} size={200} />). */
  renderQr?: (value: string, size: number) => React.ReactNode;
  onExplore?: () => void;
}

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

      {/* Header + segmentação */}
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
            <Button
              label="Explorar eventos"
              onPress={onExplore ?? (() => {})}
            />
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

// ─────────────────────────────────────────────── Bilhete

function TicketBilhete({
  ticket,
  onOpenQr,
}: {
  ticket: AppTicket;
  onOpenQr: () => void;
}) {
  const { colors, radius } = useTheme();
  const active = ticket.status === "active";
  const headerBg = active ? colors.text : colors.textMuted;
  const accent = active ? colors.primary : colors.border;

  return (
    <View
      style={[
        {
          borderRadius: 22,
          overflow: "hidden",
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
      ]}
      accessibilityLabel={`Ingresso ${ticket.tier} para ${ticket.event}, ${ticket.dateLabel}, ${STATUS_LABEL[ticket.status]}`}
    >
      <View style={{ height: 3, backgroundColor: accent }} />
      <View
        style={{
          backgroundColor: headerBg,
          paddingHorizontal: 18,
          paddingVertical: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              token="caption"
              style={{ color: active ? "#3ED97F" : "#E7EAEE" }}
            >
              {ticket.tier.toUpperCase()}
            </Text>
            <Text
              token="subtitle"
              style={{ color: "#fff", fontWeight: "800", marginTop: 3 }}
            >
              {ticket.event}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: active
                ? "rgba(62,217,127,0.16)"
                : "rgba(255,255,255,0.18)",
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text
              token="caption"
              style={{
                color: active ? "#3ED97F" : "#fff",
                textTransform: "none",
                letterSpacing: 0,
                fontSize: 10.5,
              }}
            >
              {STATUS_LABEL[ticket.status]}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            marginTop: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <CalendarDays
              size={13}
              color="rgba(255,255,255,0.7)"
              strokeWidth={1.75}
            />
            <Text token="bodySm" style={{ color: "rgba(255,255,255,0.85)" }}>
              {ticket.dateLabel}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <MapPin
              size={13}
              color="rgba(255,255,255,0.7)"
              strokeWidth={1.75}
            />
            <Text token="bodySm" style={{ color: "rgba(255,255,255,0.85)" }}>
              {ticket.city}
            </Text>
          </View>
        </View>
      </View>

      {/* Perfuração */}
      <View style={{ height: 0, position: "relative" }}>
        <View
          style={[
            styles.notch,
            { left: -9, backgroundColor: colors.background },
          ]}
        />
        <View
          style={[
            styles.notch,
            { right: -9, backgroundColor: colors.background },
          ]}
        />
      </View>

      <View
        style={{
          borderTopWidth: 2,
          borderStyle: "dashed",
          borderTopColor: colors.border,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontFamily: "PlusJakartaSans-Medium",
              fontSize: 12,
              letterSpacing: 1.5,
              color: colors.textMuted,
            }}
          >
            {ticket.code}
          </Text>
          {ticket.facial ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginTop: 5,
              }}
            >
              <ScanFace size={13} color={colors.primaryText} strokeWidth={2} />
              <Text
                token="caption"
                color="primary"
                style={{
                  textTransform: "none",
                  letterSpacing: 0,
                  fontSize: 11,
                }}
              >
                Facial ID ativo
              </Text>
            </View>
          ) : null}
        </View>
        <Button
          label="QR"
          icon={QrCode}
          size="sm"
          variant={active ? "primary" : "secondary"}
          onPress={onOpenQr}
        />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────── Modal de QR

function QrModal({
  ticket,
  onClose,
  renderQr,
}: {
  ticket: AppTicket | null;
  onClose: () => void;
  renderQr?: (v: string, s: number) => React.ReactNode;
}) {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const visible = !!ticket;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
        onPress={onClose}
        accessibilityLabel="Fechar"
      />
      <View
        style={{ flex: 1, justifyContent: "flex-end" }}
        pointerEvents="box-none"
      >
        <View
          accessibilityViewIsModal
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingTop: 8,
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 24,
          }}
        >
          <View
            style={{
              width: 40,
              height: 5,
              borderRadius: 999,
              backgroundColor: colors.border,
              alignSelf: "center",
              marginVertical: 8,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <Text token="title" accessibilityRole="header">
              Entrada do evento
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityLabel="Fechar"
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                backgroundColor: colors.surfaceAlt,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} color={colors.text} strokeWidth={2} />
            </Pressable>
          </View>
          <Text token="bodySm" color="muted" style={{ marginBottom: 18 }}>
            Apresente este QR Code na portaria
          </Text>

          {ticket ? (
            <>
              <View
                style={{
                  backgroundColor: colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 20,
                  padding: 22,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  {renderQr ? (
                    renderQr(`FIRULA-TICKET-${ticket.id}`, 200)
                  ) : (
                    <View
                      style={{
                        width: 200,
                        height: 200,
                        borderRadius: 8,
                        backgroundColor: colors.text,
                      }}
                    />
                  )}
                </View>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans-Medium",
                    fontSize: 13,
                    letterSpacing: 2,
                    color: colors.text,
                    marginTop: 16,
                  }}
                >
                  {ticket.code}
                </Text>
              </View>
              <View
                style={{
                  marginTop: 16,
                  backgroundColor: colors.text,
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <Text token="caption" style={{ color: "#3ED97F" }}>
                  {ticket.tier.toUpperCase()}
                </Text>
                <Text
                  token="subtitle"
                  style={{ color: "#fff", fontWeight: "800", marginTop: 3 }}
                >
                  {ticket.event}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 6,
                  }}
                >
                  <CalendarDays
                    size={13}
                    color="rgba(255,255,255,0.7)"
                    strokeWidth={1.75}
                  />
                  <Text
                    token="bodySm"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    {ticket.dateLabel} · {ticket.city}
                  </Text>
                </View>
              </View>
              {ticket.facial ? (
                <View
                  style={{
                    marginTop: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: colors.primarySoft,
                    borderWidth: 1,
                    borderColor: "#A8EBC6",
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <ScanFace
                    size={18}
                    color={colors.primaryText}
                    strokeWidth={2}
                  />
                  <Text
                    token="bodySm"
                    color="primary"
                    style={{ flex: 1, fontWeight: "600" }}
                  >
                    Facial ID ativo — a entrada também valida seu rosto
                  </Text>
                </View>
              ) : null}
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const cardShadow = {
  shadowColor: "#141821",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 2,
};

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
  notch: {
    position: "absolute",
    top: -9,
    width: 18,
    height: 18,
    borderRadius: 999,
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

export default function TicketsRoute() {
  const router = useRouter();
  const { data } = useMyTickets();

  const tickets = useMemo(
    () => (data ?? []).map(mapCustomerTicket),
    [data],
  );

  return (
    <TicketsScreen
      tickets={tickets}
      renderQr={(value, size) => <QRCode value={value} size={size} />}
      onExplore={() => router.push("/(tabs)/explore")}
    />
  );
}
