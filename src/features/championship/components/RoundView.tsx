import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react-native";
import { ScrollView, StyleSheet, Text as RNText, View } from "react-native";

import { BRACKET_LABEL, type Entry, type Match } from "@/services/championship.service";

import { C, F, defaultRoundId, groupRounds } from "../helpers";
import { Pill } from "./atoms";
import { MatchCard } from "./MatchCard";

/** Chave por rodada: chips das rodadas e os jogos da rodada escolhida em lista. */
export function RoundView({ matches, entries }: { matches: Match[]; entries: Map<string, Entry> }) {
  const rounds = useMemo(() => groupRounds(matches), [matches]);
  const currentId = useMemo(() => defaultRoundId(rounds), [rounds]);
  const [selected, setSelected] = useState<string | undefined>(currentId);
  useEffect(() => setSelected(currentId), [currentId]);

  const active = rounds.find((r) => r.id === selected) ?? rounds[0];
  if (!active) return null;
  const visible = active.matches.filter((m) => !m.isBye);

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingBottom: 12 }} accessibilityRole="tablist">
        {rounds.map((round) => (
          <Pill
            key={round.id}
            label={round.short}
            active={round.id === active.id}
            live={round.live}
            done={round.done}
            fontSize={12.5}
            onPress={() => setSelected(round.id)}
            icon={round.done ? <Check size={13} color={round.id === active.id ? C.white : C.text5} /> : undefined}
          />
        ))}
      </ScrollView>
      {active.bracket && <RNText style={styles.bracketLabel}>{BRACKET_LABEL[active.bracket]} · {active.label}</RNText>}
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        {visible.length === 0 ? (
          <View style={styles.empty}><RNText style={{ fontFamily: F.regular, fontSize: 13, color: C.text4 }}>Sem jogos nesta rodada</RNText></View>
        ) : (
          visible.map((match) => <MatchCard key={match.id} match={match} entries={entries} />)
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bracketLabel: { fontFamily: F.extrabold, fontSize: 11, letterSpacing: 0.5, color: C.text4, paddingHorizontal: 20, marginBottom: 10 },
  empty: { alignItems: "center", paddingVertical: 28, paddingHorizontal: 20, backgroundColor: C.white, borderWidth: 1, borderColor: C.cardBorder, borderRadius: 16 },
});
