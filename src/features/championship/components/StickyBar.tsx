import { CircleCheck, RefreshCw } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text as RNText, View } from "react-native";

import type { PublicCategory } from "@/services/championship.service";

import { C, F } from "../helpers";
import { Pill, PulseDot } from "./atoms";

export type Tab = "table" | "matches" | "participants";
const TABS: Array<[Tab, string]> = [
  ["table", "Tabela"],
  ["matches", "Jogos"],
  ["participants", "Participantes"],
];

interface StickyBarProps {
  categories: PublicCategory[];
  categoryId: string;
  onCategory: (id: string) => void;
  tab: Tab;
  onTab: (tab: Tab) => void;
  isLive: boolean;
  relative: string;
}

/** Gruda no topo ao rolar: chips de categoria + indicador e o segmentado de abas. */
export function StickyBar({ categories, categoryId, onCategory, tab, onTab, isLive, relative }: StickyBarProps) {
  const Icon = isLive ? RefreshCw : CircleCheck;
  const refreshAria = isLive ? `A página atualiza sozinha. Última atualização ${relative || "agora"}.` : "Campeonato encerrado. A página não atualiza mais.";
  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        {categories.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ flex: 1 }} accessibilityRole="tablist">
            {categories.map((item) => (
              <Pill key={item.id} label={item.name} active={item.id === categoryId} live={item.progress.live > 0} onPress={() => onCategory(item.id)} />
            ))}
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <View style={styles.refresh} accessibilityLabel={refreshAria} accessible>
          <Icon size={16} color={C.text3} strokeWidth={2} />
          {isLive && <View style={{ position: "absolute", top: 4, right: 4 }}><PulseDot /></View>}
        </View>
      </View>
      <View style={styles.segmented} accessibilityRole="tablist">
        {TABS.map(([key, label]) => {
          const active = tab === key;
          return (
            <Pressable key={key} onPress={() => onTab(key)} accessibilityRole="tab" accessibilityState={{ selected: active }} style={[styles.segment, active && styles.segmentActive]}>
              <RNText style={{ fontFamily: F.bold, fontSize: 13, color: active ? C.ink : C.text3 }}>{label}</RNText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.cardBorder, paddingVertical: 12 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 20, paddingRight: 16, marginBottom: 10 },
  refresh: { width: 34, height: 34, borderRadius: 999, backgroundColor: C.alt, alignItems: "center", justifyContent: "center" },
  segmented: { marginHorizontal: 20, flexDirection: "row", backgroundColor: C.alt, borderRadius: 12, padding: 4 },
  segment: { flex: 1, height: 36, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  segmentActive: { backgroundColor: C.white, shadowColor: C.ink, shadowOpacity: 0.12, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
});
