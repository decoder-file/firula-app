import { Trophy } from "lucide-react-native";
import { StyleSheet, Text as RNText, View } from "react-native";

import type { Entry, StandingRow } from "@/services/championship.service";

import { C, F } from "../helpers";
import { Avatar } from "./atoms";

interface StandingsCardProps {
  title: string;
  subtitle?: string;
  rows: StandingRow[];
  entries: Map<string, Entry>;
  highlightTop?: number;
  champion?: string | null;
}

const COLS = { pos: 30, p: 30, j: 26, v: 26, sg: 36 };

export function StandingsCard({ title, subtitle, rows, entries, highlightTop = 0, champion }: StandingsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <RNText style={{ fontFamily: F.extrabold, fontSize: 14, color: C.ink }}>{title}</RNText>
        {subtitle && <RNText style={{ fontFamily: F.semibold, fontSize: 11, color: C.text4 }}>{subtitle}</RNText>}
      </View>
      <View style={[styles.row, { backgroundColor: C.page, paddingVertical: 6, borderTopWidth: 0 }]}>
        <RNText style={[styles.th, { width: COLS.pos }]}>#</RNText>
        <RNText style={[styles.th, { flex: 1 }]}>PARTICIPANTE</RNText>
        <RNText style={[styles.th, { width: COLS.p, textAlign: "center" }]}>P</RNText>
        <RNText style={[styles.th, { width: COLS.j, textAlign: "center" }]}>J</RNText>
        <RNText style={[styles.th, { width: COLS.v, textAlign: "center" }]}>V</RNText>
        <RNText style={[styles.th, { width: COLS.sg, textAlign: "right" }]}>SG</RNText>
      </View>
      {rows.map((row) => {
        const entry = entries.get(row.entryId);
        const qualified = row.rank <= highlightTop;
        return (
          <View key={row.entryId} style={[styles.row, { backgroundColor: qualified ? C.rowQualified : C.white }]}>
            <View style={{ width: COLS.pos }}>
              <View style={[styles.pos, qualified && { backgroundColor: C.primary }]}>
                <RNText style={{ fontFamily: F.extrabold, fontSize: 11.5, color: qualified ? C.onPrimary : C.text3 }}>{row.rank}</RNText>
              </View>
            </View>
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, minWidth: 0 }}>
              <Avatar entry={entry} size={26} fontSize={9.5} />
              <RNText numberOfLines={1} style={{ fontFamily: F.semibold, fontSize: 13, color: C.ink, flexShrink: 1 }}>{entry?.name ?? "—"}</RNText>
              {champion === row.entryId && (
                <View style={styles.champ}><Trophy size={10} color={C.onPrimary} /><RNText style={{ fontFamily: F.extrabold, fontSize: 10, color: C.onPrimary }}>campeão</RNText></View>
              )}
            </View>
            <RNText style={[styles.td, { width: COLS.p, fontFamily: F.extrabold, fontSize: 13, color: C.ink }]}>{row.points}</RNText>
            <RNText style={[styles.td, { width: COLS.j }]}>{row.played}</RNText>
            <RNText style={[styles.td, { width: COLS.v }]}>{row.wins}</RNText>
            <RNText style={[styles.td, { width: COLS.sg, textAlign: "right", fontFamily: F.semibold, color: C.text2 }]}>{row.diff > 0 ? `+${row.diff}` : row.diff}</RNText>
          </View>
        );
      })}
      {rows.length === 0 && <RNText style={{ fontFamily: F.regular, fontSize: 13, color: C.text4, textAlign: "center", paddingVertical: 24 }}>Nenhum participante.</RNText>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.white, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 18, overflow: "hidden" },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 9, borderTopWidth: 1, borderTopColor: C.divider },
  th: { fontFamily: F.extrabold, fontSize: 10.5, letterSpacing: 0.3, color: C.text4 },
  td: { fontFamily: F.regular, fontSize: 12.5, color: C.text3, textAlign: "center" },
  pos: { width: 22, height: 22, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  champ: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.primary, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
});
