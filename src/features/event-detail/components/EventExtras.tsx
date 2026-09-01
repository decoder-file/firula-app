import React, { useState } from "react";
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { CalendarClock, Download, FileText, X } from "lucide-react-native";

import { RichText } from "@/components/RichText";
import { PressScale, Text } from "@/design-system";
import type { EventDaySchedule, EventTerm } from "@/features/event-detail/types";

type ThemeValues = { colors: any; radius: any };

const openUrl = async (url: string) => {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("Não foi possível abrir o arquivo", "Tente novamente em alguns instantes.");
  }
};

export function EventScheduleModal({
  visible,
  days,
  onClose,
  colors,
  radius,
}: { visible: boolean; days: EventDaySchedule[]; onClose: () => void } & ThemeValues) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.scrim, { backgroundColor: colors.overlay }]}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface, borderRadius: radius.xl }]}>
          <View style={styles.modalHeader}>
            <View>
              <Text token="title" style={{ fontWeight: "800" }}>Data do evento</Text>
              <Text token="bodySm" color="muted">Início e término de cada dia</Text>
            </View>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar">
              <X size={22} color={colors.text} />
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ gap: 10 }}>
            {days.map((day, index) => {
              const start = new Date(day.startsAt);
              const end = new Date(day.endsAt);
              const date = start.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
              const time = `${start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} às ${end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
              return (
                <View key={day.id} style={[styles.dayRow, { backgroundColor: colors.surfaceAlt, borderRadius: radius.lg }]}>
                  <View style={[styles.dayBadge, { backgroundColor: colors.primarySoft }]}>
                    <Text token="label" color="primary">{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text token="body" style={{ fontWeight: "800" }}>Dia {index + 1} · {date}</Text>
                    <Text token="bodySm" color="muted">{time}</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function EventProgramSection({ schedule, colors, radius }: { schedule: { title: string; description?: string | null; pdfUrl: string } } & ThemeValues) {
  return (
    <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.xl }]}>
      <Text token="subtitle" style={styles.sectionTitle}>Programação</Text>
      <View style={[styles.documentRow, { backgroundColor: colors.primarySoft, borderRadius: radius.lg }]}>
        <View style={[styles.iconBox, { backgroundColor: colors.surface }]}><CalendarClock size={20} color={colors.primaryText} /></View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text token="body" style={{ fontWeight: "800" }}>{schedule.title}</Text>
          {schedule.description ? <Text token="bodySm" color="muted" numberOfLines={2}>{schedule.description}</Text> : null}
        </View>
        <PressScale onPress={() => openUrl(schedule.pdfUrl)} accessibilityRole="button" accessibilityLabel="Baixar programação" style={styles.smallAction}>
          <Download size={17} color={colors.primaryText} /><Text token="label" color="primary">Abrir</Text>
        </PressScale>
      </View>
    </View>
  );
}

export function EventTermsSection({ terms, colors, radius }: { terms: EventTerm[] } & ThemeValues) {
  const [selected, setSelected] = useState<EventTerm | null>(null);
  return (
    <>
      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radius.xl }]}>
        <Text token="subtitle" style={styles.sectionTitle}>Termos do evento</Text>
        <View style={{ gap: 2 }}>
          {terms.map((term) => (
            <PressScale key={term.id} onPress={() => term.fileUrl ? openUrl(term.fileUrl) : setSelected(term)} accessibilityRole="button" style={[styles.termRow, { borderBottomColor: colors.border }]}>
              <FileText size={18} color={colors.primaryText} />
              <View style={{ flex: 1 }}><Text token="body" style={{ fontWeight: "700" }}>{term.title}</Text>{term.description ? <Text token="bodySm" color="muted">{term.description}</Text> : null}</View>
              <Text token="label" color="primary">{term.fileUrl ? "Abrir" : "Ler"}</Text>
            </PressScale>
          ))}
        </View>
      </View>
      <Modal visible={selected !== null} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={[styles.scrim, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderRadius: radius.xl }]}>
            <View style={styles.modalHeader}><Text token="title" style={{ flex: 1, fontWeight: "800" }}>{selected?.title}</Text><Pressable onPress={() => setSelected(null)} accessibilityLabel="Fechar"><X size={22} color={colors.text} /></Pressable></View>
            <ScrollView style={{ maxHeight: 460 }}>{selected?.bodyHtml ? <RichText html={selected.bodyHtml} /> : null}</ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, marginBottom: 22, padding: 18 },
  sectionTitle: { fontWeight: "800", marginBottom: 12 },
  documentRow: { alignItems: "center", flexDirection: "row", gap: 12, padding: 12 },
  iconBox: { alignItems: "center", borderRadius: 999, height: 42, justifyContent: "center", width: 42 },
  smallAction: { alignItems: "center", flexDirection: "row", gap: 5, paddingHorizontal: 6, paddingVertical: 10 },
  termRow: { alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 10, paddingVertical: 12 },
  scrim: { alignItems: "center", flex: 1, justifyContent: "center", padding: 24 },
  modalCard: { maxHeight: "82%", padding: 20, width: "100%" },
  modalHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  dayRow: { alignItems: "center", flexDirection: "row", gap: 12, padding: 12 },
  dayBadge: { alignItems: "center", borderRadius: 999, height: 36, justifyContent: "center", width: 36 },
});
