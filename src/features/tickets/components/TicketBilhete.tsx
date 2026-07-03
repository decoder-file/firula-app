import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { CalendarDays, MapPin, QrCode, ScanFace } from "lucide-react-native";

import { Button, Text, useTheme } from "@/design-system";
import { STATUS_LABEL } from "@/features/tickets/constants";
import type { AppTicket } from "@/features/tickets/types";

export function TicketBilhete({
  ticket,
  onOpenQr,
}: {
  ticket: AppTicket;
  onOpenQr: () => void;
}) {
  const { colors } = useTheme();
  const active = ticket.status === "active";
  const headerBg = active ? colors.text : colors.textMuted;
  const accent = active ? colors.primary : colors.border;

  return (
    <View
      style={{
        borderRadius: 22,
        overflow: "hidden",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
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

const styles = StyleSheet.create({
  notch: {
    position: "absolute",
    top: -9,
    width: 18,
    height: 18,
    borderRadius: 999,
  },
});
