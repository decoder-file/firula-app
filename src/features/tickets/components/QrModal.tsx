import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { CalendarDays, ScanFace, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text, useTheme } from "@/design-system";
import type { AppTicket } from "@/features/tickets/types";

export function QrModal({
  ticket,
  onClose,
  renderQr,
}: {
  ticket: AppTicket | null;
  onClose: () => void;
  renderQr?: (v: string, s: number) => React.ReactNode;
}) {
  const { colors } = useTheme();
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
