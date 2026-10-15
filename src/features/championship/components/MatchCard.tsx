import { MapPin, MessageSquare } from "lucide-react-native";
import { StyleSheet, Text as RNText, View } from "react-native";

import type { Entry, Match } from "@/services/championship.service";

import { C, F, formatMatchTime, scoreText, sideLabel } from "../helpers";
import { Avatar, LiveBadge, PlaceholderAvatar } from "./atoms";

export function MatchCard({ match, entries }: { match: Match; entries: Map<string, Entry> }) {
  const live = match.status === "IN_PROGRESS";
  const finished = match.status === "FINISHED";
  const canceled = match.status === "CANCELED";
  const score = scoreText(match);
  const homeWon = finished && Boolean(match.home.entryId) && match.winnerEntryId === match.home.entryId;
  const awayWon = finished && Boolean(match.away.entryId) && match.winnerEntryId === match.away.entryId;
  const when = !finished ? formatMatchTime(match.scheduledAt) : null;
  const hasMeta = Boolean(match.venue) || (finished && Boolean(score.detail));

  const Side = ({ side, won, right }: { side: Match["home"]; won: boolean; right?: boolean }) => {
    const defined = Boolean(side.entryId);
    const lost = finished && defined && !won;
    const entry = side.entryId ? entries.get(side.entryId) : null;
    const avatar = defined ? <Avatar entry={entry} size={30} fontSize={10} /> : <PlaceholderAvatar size={30} />;
    return (
      <View style={[styles.side, right && { justifyContent: "flex-end" }, { opacity: lost ? 0.5 : 1 }]}>
        {!right && avatar}
        <RNText numberOfLines={2} style={{ fontFamily: won ? F.extrabold : F.semibold, fontStyle: defined ? "normal" : "italic", fontSize: 13, lineHeight: 16, color: defined ? C.ink : C.text4, flexShrink: 1, textAlign: right ? "right" : "left" }}>
          {sideLabel(entries, side)}
        </RNText>
        {right && avatar}
      </View>
    );
  };

  return (
    <View style={[styles.card, { borderColor: live ? C.primary : C.cardBorder, borderWidth: live ? 1.5 : 1, opacity: canceled ? 0.5 : 1 }]} accessibilityLabel={`Jogo ${match.number}`}>
      <View style={styles.top}>
        <RNText style={{ fontFamily: F.bold, fontSize: 11.5, color: C.text4 }}>Jogo {match.number}</RNText>
        {live && <LiveBadge />}
        {canceled && <RNText style={{ fontFamily: F.bold, fontSize: 11, color: C.text4 }}>Cancelado</RNText>}
        {!live && !canceled && when && <RNText style={{ fontFamily: F.semibold, fontSize: 11.5, color: C.text3 }}>{when}</RNText>}
      </View>
      <View style={styles.main}>
        <Side side={match.home} won={homeWon} />
        <View style={styles.score}>
          <RNText style={[styles.scoreText, { color: homeWon ? C.primaryText : finished ? C.ink : C.text5 }]}>{score.home}</RNText>
          <RNText style={[styles.scoreText, { color: C.text5 }]}>:</RNText>
          <RNText style={[styles.scoreText, { color: awayWon ? C.primaryText : finished ? C.ink : C.text5 }]}>{score.away}</RNText>
        </View>
        <Side side={match.away} won={awayWon} right />
      </View>
      {hasMeta && (
        <View style={styles.meta}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            {match.venue && (<><MapPin size={12} color={C.text4} /><RNText style={{ fontFamily: F.regular, fontSize: 11.5, color: C.text4 }}>{match.venue}</RNText></>)}
          </View>
          {finished && score.detail && <RNText style={{ fontFamily: F.semibold, fontSize: 11.5, letterSpacing: 0.3, color: C.text3 }}>{score.detail}</RNText>}
        </View>
      )}
      {match.notes && (
        <View style={styles.note}>
          <MessageSquare size={13} color={C.text4} style={{ marginTop: 1 }} />
          <RNText style={{ fontFamily: F.regular, fontSize: 11.5, lineHeight: 16, color: C.text3, flex: 1 }}>{match.notes}</RNText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.white, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  main: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  side: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 8 },
  score: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: C.alt, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  scoreText: { fontFamily: F.extrabold, fontSize: 15 },
  meta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 10, paddingTop: 9, borderTopWidth: 1, borderTopColor: C.divider },
  note: { marginTop: 8, flexDirection: "row", gap: 6, backgroundColor: C.page, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
});
