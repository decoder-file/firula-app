import { Clock, MapPin } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text as RNText, View } from "react-native";

import type { Entry, Match } from "@/services/championship.service";

import { C, F, formatMatchTime, pickStripMatches, sideLabel } from "../helpers";
import { Avatar, LiveBadge, PulseDot } from "./atoms";

export function LiveStrip({ matches, entries, onOpenMatches }: { matches: Match[]; entries: Map<string, Entry>; onOpenMatches: (filter: "live" | "pending") => void }) {
  const { items, isLive } = pickStripMatches(matches);
  if (items.length === 0) return null;
  const title = isLive ? (items.length > 1 ? `Agora · ${items.length} jogos` : "Agora") : "Próximos jogos";
  return (
    <View style={{ paddingTop: 18 }}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {isLive && <PulseDot size={8} />}
          <RNText style={{ fontFamily: F.extrabold, fontSize: 15, color: C.ink }}>{title}</RNText>
        </View>
        <Pressable onPress={() => onOpenMatches(isLive ? "live" : "pending")} accessibilityRole="button" hitSlop={8}>
          <RNText style={{ fontFamily: F.bold, fontSize: 13, color: C.primaryText }}>Ver todos</RNText>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
        {items.map((match) => {
          const live = match.status === "IN_PROGRESS";
          const Icon = live ? MapPin : Clock;
          const color = live ? C.primaryText : C.text3;
          const meta = live ? `Em andamento${match.venue ? ` · ${match.venue}` : ""}` : `${formatMatchTime(match.scheduledAt) ?? "A definir"}${match.venue ? ` · ${match.venue}` : ""}`;
          return (
            <View key={match.id} style={[styles.card, { borderColor: live ? C.primary : C.cardBorder, borderWidth: live ? 1.5 : 1 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <RNText style={{ fontFamily: F.bold, fontSize: 11.5, color: C.text3 }}>{match.roundLabel}</RNText>
                {live && <LiveBadge />}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
                {(["home", "away"] as const).map((side, index) => (
                  <View key={side} style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
                    {index === 1 && <RNText style={{ fontFamily: F.extrabold, fontSize: 13, color: C.text4, marginRight: 8 }}>vs</RNText>}
                    <View style={{ flex: 1, alignItems: "center", gap: 6 }}>
                      <Avatar entry={match[side].entryId ? entries.get(match[side].entryId!) : null} size={40} fontSize={13} />
                      <RNText numberOfLines={2} style={{ fontFamily: F.bold, fontSize: 12.5, lineHeight: 15, textAlign: "center", color: C.ink }}>{sideLabel(entries, match[side])}</RNText>
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.meta}>
                <Icon size={13} color={color} />
                <RNText style={{ fontFamily: F.semibold, fontSize: 11.5, color }}>{meta}</RNText>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 10 },
  card: { width: 264, backgroundColor: C.white, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 13 },
  meta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.divider },
});
