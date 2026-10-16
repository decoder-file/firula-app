import { ScrollView, StyleSheet, Text as RNText, View } from "react-native";

import { BRACKET_LABEL, type BracketKind, type Entry, type Match } from "@/services/championship.service";
import { isCrossoverFinal } from "../helpers";

import { C, F, scoreText, sideLabel } from "../helpers";
import { Avatar, LiveBadge, PlaceholderAvatar } from "./atoms";

const COL_W = 196;
const SLOT_H = 104;

/** Dupla eliminatória: três blocos empilhados. Demais formatos: uma chave só. */
export function Brackets({ matches, entries }: { matches: Match[]; entries: Map<string, Entry> }) {
  const kinds: BracketKind[] = ["WINNERS", "LOSERS", "FINAL"];
  if (!matches.some((m) => m.bracket)) return <BracketColumns matches={matches} entries={entries} />;
  return (
    <View style={{ gap: 24 }}>
      {kinds.map((kind) => {
        const subset = matches.filter((m) => m.bracket === kind);
        if (subset.length === 0) return null;
        return (
          <View key={kind} style={{ gap: 8 }}>
            <RNText style={{ fontFamily: F.extrabold, fontSize: 13, color: C.ink, paddingHorizontal: 20 }}>{kind === "FINAL" && isCrossoverFinal(subset) ? "Fase final" : BRACKET_LABEL[kind]}</RNText>
            <BracketColumns matches={subset} entries={entries} />
          </View>
        );
      })}
    </View>
  );
}

/** Colunas por rodada com rolagem horizontal; altura = jogos da 1ª rodada × 104. */
function BracketColumns({ matches, entries }: { matches: Match[]; entries: Map<string, Entry> }) {
  const rounds = [...new Set(matches.filter((m) => !m.isThirdPlace).map((m) => m.round))].sort((a, b) => a - b);
  const thirdPlace = matches.find((m) => m.isThirdPlace);
  const slotsByRound = new Map<number, number>();
  for (const round of rounds) {
    const positions = matches.filter((m) => m.round === round && !m.isThirdPlace).map((m) => m.position);
    slotsByRound.set(round, Math.max(...positions) + 1);
  }
  const leaves = Math.max(...[...slotsByRound.values()], 1);
  const height = leaves * SLOT_H;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingHorizontal: 20, paddingBottom: 6 }}>
      {rounds.map((round) => {
        const roundMatches = matches.filter((m) => m.round === round && !m.isThirdPlace);
        const slots = slotsByRound.get(round) ?? 1;
        return (
          <View key={round} style={{ width: COL_W }}>
            <RNText style={styles.colTitle}>{(roundMatches[0]?.roundLabel ?? `Rodada ${round}`).toUpperCase()}</RNText>
            <View style={{ height, justifyContent: "space-around", gap: 10 }}>
              {Array.from({ length: slots }, (_, position) => {
                const match = roundMatches.find((m) => m.position === position);
                return <View key={position} style={{ flex: 1, justifyContent: "center" }}>{match ? <CompactMatch match={match} entries={entries} /> : null}</View>;
              })}
            </View>
          </View>
        );
      })}
      {thirdPlace && (
        <View style={{ width: COL_W }}>
          <RNText style={styles.colTitle}>{thirdPlace.roundLabel.toUpperCase()}</RNText>
          <View style={{ height, justifyContent: "center" }}><CompactMatch match={thirdPlace} entries={entries} /></View>
        </View>
      )}
    </ScrollView>
  );
}

function CompactMatch({ match, entries }: { match: Match; entries: Map<string, Entry> }) {
  const live = match.status === "IN_PROGRESS";
  const finished = match.status === "FINISHED" && !match.isBye;
  const score = scoreText(match);
  const Row = ({ side, value }: { side: Match["home"]; value: string }) => {
    const defined = Boolean(side.entryId);
    const won = finished && defined && match.winnerEntryId === side.entryId;
    const lost = finished && defined && !won;
    return (
      <View style={[styles.row, { opacity: lost ? 0.5 : 1 }]}>
        {defined ? <Avatar entry={entries.get(side.entryId!)} size={20} fontSize={7.5} /> : <PlaceholderAvatar size={20} />}
        <RNText numberOfLines={1} style={{ flex: 1, fontFamily: won ? F.extrabold : F.semibold, fontStyle: defined ? "normal" : "italic", fontSize: 12, color: defined ? C.ink : C.text4 }}>
          {match.isBye && !defined ? "Bye" : sideLabel(entries, side)}
        </RNText>
        <RNText style={{ fontFamily: F.extrabold, fontSize: 12.5, color: won ? C.primaryText : finished ? C.ink : C.text5 }}>{finished ? value : ""}</RNText>
      </View>
    );
  };
  return (
    <View style={[styles.card, { borderColor: live ? C.primary : C.cardBorder, borderWidth: live ? 1.5 : 1 }]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <RNText style={{ fontFamily: F.bold, fontSize: 10.5, color: C.text4 }}>Jogo {match.number}</RNText>
        {live && <LiveBadge small />}
        {match.isBye && <RNText style={{ fontFamily: F.extrabold, fontSize: 9.5, color: C.text4 }}>BYE</RNText>}
      </View>
      <Row side={match.home} value={score.home} />
      <Row side={match.away} value={score.away} />
    </View>
  );
}

const styles = StyleSheet.create({
  colTitle: { fontFamily: F.extrabold, fontSize: 11, letterSpacing: 0.5, color: C.text4, marginBottom: 10 },
  card: { backgroundColor: C.white, borderRadius: 13, paddingHorizontal: 10, paddingVertical: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 3 },
});
