import { Trophy } from "lucide-react-native";
import { StyleSheet, Text as RNText, View } from "react-native";

import type { PublicCategory } from "@/services/championship.service";

import { C, F, supportLine } from "../helpers";
import { Avatar } from "./atoms";

/** list = linhas num único cartão (pré-sorteio); cards = cartões (aba Participantes). */
export function Participants({ category, variant = "cards" }: { category: PublicCategory; variant?: "cards" | "list" }) {
  const sorted = [...category.entries].sort((a, b) => a.seed - b.seed);
  if (sorted.length === 0) {
    return <View style={styles.empty}><RNText style={{ fontFamily: F.regular, fontSize: 13, color: C.text4 }}>Participantes ainda não divulgados.</RNText></View>;
  }

  if (variant === "list") {
    return (
      <View style={styles.listCard}>
        {sorted.map((entry, index) => (
          <View key={entry.id} style={[styles.listRow, index > 0 && { borderTopWidth: 1, borderTopColor: C.divider }, { opacity: entry.status === "WITHDRAWN" ? 0.5 : 1 }]}>
            <Avatar entry={entry} size={36} fontSize={12} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <RNText numberOfLines={1} style={{ fontFamily: F.bold, fontSize: 13.5, color: C.ink }}>{entry.name}</RNText>
              <RNText style={{ fontFamily: F.regular, fontSize: 11.5, color: C.text4, marginTop: 1 }}>{supportLine(entry, category)}</RNText>
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {sorted.map((entry) => {
        const isChampion = category.champion === entry.id;
        const withdrawn = entry.status === "WITHDRAWN";
        const showMembers = category.participantType !== "INDIVIDUAL" && entry.members.length > 0;
        return (
          <View key={entry.id} style={[styles.card, isChampion && { backgroundColor: C.rowQualified, borderColor: C.champBorder }, { opacity: withdrawn ? 0.5 : 1 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Avatar entry={entry} size={40} fontSize={13} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                  <RNText numberOfLines={1} style={{ fontFamily: F.extrabold, fontSize: 14, color: C.ink, flexShrink: 1, textDecorationLine: withdrawn ? "line-through" : "none" }}>{entry.name}</RNText>
                  {isChampion && (
                    <View style={styles.champ}><Trophy size={10} color={C.onPrimary} /><RNText style={{ fontFamily: F.extrabold, fontSize: 10, color: C.onPrimary }}>campeão</RNText></View>
                  )}
                </View>
                <RNText style={{ fontFamily: F.regular, fontSize: 11.5, lineHeight: 15, color: C.text4, marginTop: 2 }}>{supportLine(entry, category)}</RNText>
              </View>
            </View>
            {showMembers && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {entry.members.map((member) => (
                  <View key={member.athleteId} style={styles.member}>
                    <Avatar name={member.name} photoUrl={member.photoUrl} size={20} fontSize={9} bg={C.text2} />
                    <RNText style={{ fontFamily: F.bold, fontSize: 11.5, color: C.text2 }}>
                      {member.nickname || member.name}
                      {member.jerseyNumber !== null && <RNText style={{ fontFamily: F.semibold, color: C.text4 }}> #{member.jerseyNumber}</RNText>}
                    </RNText>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", paddingVertical: 28, paddingHorizontal: 20, backgroundColor: C.white, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 16 },
  listCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 16, overflow: "hidden" },
  listRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 11 },
  card: { backgroundColor: C.white, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 },
  champ: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.primary, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  member: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.alt, borderRadius: 999, paddingVertical: 3, paddingLeft: 3, paddingRight: 10 },
});
