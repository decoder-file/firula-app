import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CalendarX, Shuffle, Trophy } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text as RNText, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Skeleton } from "@/design-system";
import { useChampionshipLive, useRelativeTime } from "@/hooks/useChampionship";
import { useScreenLog } from "@/hooks/useScreenLog";
import type { Match, PublicCategory } from "@/services/championship.service";

import { Pill } from "./components/atoms";
import { Brackets } from "./components/BracketFull";
import { Hero } from "./components/Hero";
import { LiveStrip } from "./components/LiveStrip";
import { MatchCard } from "./components/MatchCard";
import { Participants } from "./components/Participants";
import { RoundView } from "./components/RoundView";
import { StandingsCard } from "./components/StandingsCard";
import { StickyBar, type Tab } from "./components/StickyBar";
import { C, F, categoryHasTable, filterMatches, type MatchFilter } from "./helpers";

interface ChampionshipScreenProps {
  slug: string | undefined;
  /** ?categoria= do link (firula.com.br/campeonatos/:slug?categoria=id). */
  initialCategoryId?: string;
  /** ?aba= do link. */
  initialTab?: string;
}

const TAB_PARAM: Record<string, Tab> = { tabela: "table", jogos: "matches", participantes: "participants" };
const STATUS_FILTERS: Array<[MatchFilter, string]> = [
  ["all", "Todos"],
  ["live", "Ao vivo"],
  ["pending", "Próximos"],
  ["finished", "Encerrados"],
];

export function ChampionshipScreen({ slug, initialCategoryId, initialTab }: ChampionshipScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, lastSyncAt, isLive } = useChampionshipLive(slug);
  const relative = useRelativeTime(lastSyncAt);
  useScreenLog();

  const [categoryId, setCategoryId] = useState<string | undefined>(initialCategoryId);
  const [tab, setTab] = useState<Tab>(TAB_PARAM[initialTab ?? ""] ?? "table");
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [bracketMode, setBracketMode] = useState<"round" | "full">("round");
  const scrollRef = useRef<ScrollView>(null);

  const category: PublicCategory | undefined = useMemo(() => {
    if (!data) return undefined;
    return data.categories.find((c) => c.id === categoryId) ?? data.categories[0];
  }, [data, categoryId]);

  useEffect(() => {
    if (data && !categoryId) setCategoryId(data.categories[0]?.id);
  }, [data, categoryId]);

  const entries = useMemo(() => new Map((category?.entries ?? []).map((e) => [e.id, e])), [category?.entries]);
  const champion = category?.champion ? entries.get(category.champion) : null;
  const knockout = useMemo(() => (category?.matches ?? []).filter((m) => m.stage === "KNOCKOUT"), [category?.matches]);
  const hasTable = Boolean(category && categoryHasTable(category));

  const openMatches = useCallback((filter: "live" | "pending") => {
    setMatchFilter(filter);
    setTab("matches");
  }, []);

  if (isLoading) return <LoadingState topInset={insets.top} />;
  if (isError || !data || !category) {
    return <NotFoundState topInset={insets.top} onHome={() => router.replace("/(tabs)" as never)} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView ref={scrollRef} stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <Hero championship={data} category={category} champion={champion} />
        <StickyBar
          categories={data.categories}
          categoryId={category.id}
          onCategory={(id) => {
            setGroupFilter("all");
            setCategoryId(id);
          }}
          tab={tab}
          onTab={setTab}
          isLive={isLive}
          relative={relative}
        />

        {tab === "table" && (
          <View>
            {!hasTable && (
              <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
                <View style={styles.predraw}>
                  <Shuffle size={20} color={C.warnIcon} style={{ marginTop: 1 }} />
                  <View style={{ flex: 1 }}>
                    <RNText style={{ fontFamily: F.extrabold, fontSize: 14, color: C.warnText }}>O sorteio desta categoria ainda não saiu</RNText>
                    <RNText style={{ fontFamily: F.regular, fontSize: 12.5, lineHeight: 19, color: C.warnText, marginTop: 2 }}>Grupos e jogos aparecem aqui assim que o organizador sortear. Confira quem já está confirmado.</RNText>
                  </View>
                </View>
                <RNText style={[styles.sectionTitle, { marginTop: 20, marginBottom: 10 }]}>Participantes confirmados · {category.entries.filter((e) => e.status === "ACTIVE").length}</RNText>
                <Participants category={category} variant="list" />
              </View>
            )}

            {hasTable && <LiveStrip matches={category.matches} entries={entries} onOpenMatches={openMatches} />}

            {category.groups.length > 0 && (
              <View style={{ paddingHorizontal: 20, paddingTop: 22, gap: 12 }}>
                <RNText style={styles.sectionTitle}>Grupos</RNText>
                {category.groups.map((group) => (
                  <StandingsCard key={group.id} title={group.name} subtitle={`${category.config.advancePerGroup} primeiro${category.config.advancePerGroup === 1 ? "" : "s"} avança${category.config.advancePerGroup === 1 ? "" : "m"}`} rows={group.standings} entries={entries} highlightTop={category.config.advancePerGroup} />
                ))}
              </View>
            )}

            {category.standings && (
              <View style={{ paddingHorizontal: 20, paddingTop: 22, gap: 12 }}>
                <RNText style={styles.sectionTitle}>Classificação</RNText>
                <StandingsCard title="Pontos corridos" subtitle={`${category.entries.filter((e) => e.status === "ACTIVE").length} participantes`} rows={category.standings} entries={entries} highlightTop={1} champion={category.champion} />
              </View>
            )}

            {knockout.length > 0 && (
              <View style={{ paddingTop: 24 }}>
                <View style={styles.bracketHeader}>
                  <RNText style={styles.sectionTitle}>{category.format === "DOUBLE_ELIMINATION" ? "Dupla eliminatória" : "Mata-mata"}</RNText>
                  <View style={styles.modeSwitch} accessibilityRole="tablist">
                    {([
                      ["round", "Por rodada"],
                      ["full", "Chave completa"],
                    ] as Array<["round" | "full", string]>).map(([mode, label]) => {
                      const active = bracketMode === mode;
                      return (
                        <Pressable key={mode} onPress={() => setBracketMode(mode)} accessibilityRole="tab" accessibilityState={{ selected: active }} style={[styles.modeItem, active && styles.modeItemActive]}>
                          <RNText style={{ fontFamily: F.bold, fontSize: 11.5, color: active ? C.ink : C.text3 }}>{label}</RNText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                {bracketMode === "round" ? <RoundView matches={knockout} entries={entries} /> : <Brackets matches={knockout} entries={entries} />}
              </View>
            )}
          </View>
        )}

        {tab === "matches" && (
          <View style={{ paddingTop: 14 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
              {STATUS_FILTERS.map(([key, label]) => (
                <Pill key={key} label={label} active={matchFilter === key} fontSize={12.5} onPress={() => setMatchFilter(key)} />
              ))}
            </ScrollView>
            {category.groups.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 20, paddingTop: 10 }}>
                {[["all", "Todos os grupos"], ...category.groups.map((g) => [g.id, g.name]), ["knockout", "Mata-mata"]].map(([key, label]) => (
                  <Pill key={key} label={label} active={groupFilter === key} variant="soft" height={30} fontSize={12} onPress={() => setGroupFilter(key)} />
                ))}
              </ScrollView>
            )}
            <MatchSections matches={filterMatches(category.matches, matchFilter, groupFilter)} entries={entries} category={category} />
          </View>
        )}

        {tab === "participants" && (
          <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
            <Participants category={category} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function MatchSections({ matches, entries, category }: { matches: Match[]; entries: Map<string, PublicCategory["entries"][number]>; category: PublicCategory }) {
  const groupName = new Map(category.groups.map((g) => [g.id, g.name]));
  const sections = new Map<string, Match[]>();
  for (const match of [...matches].sort((a, b) => a.number - b.number)) {
    const key = match.stage === "GROUP" ? `${match.groupId ? `${groupName.get(match.groupId) ?? "Grupo"} · ` : ""}${match.roundLabel}` : match.roundLabel;
    if (!sections.has(key)) sections.set(key, []);
    sections.get(key)!.push(match);
  }
  if (sections.size === 0) {
    return (
      <View style={{ alignItems: "center", paddingHorizontal: 30, paddingVertical: 50 }}>
        <CalendarX size={28} color={C.text4} />
        <RNText style={{ fontFamily: F.extrabold, fontSize: 14.5, color: C.ink, marginTop: 10, marginBottom: 4 }}>Nenhum jogo nesta lista</RNText>
        <RNText style={{ fontFamily: F.regular, fontSize: 12.5, lineHeight: 19, color: C.text4, textAlign: "center", maxWidth: 230 }}>
          {category.tableGeneratedAt ? "Tente outro filtro de status ou de grupo." : "Os jogos aparecem aqui depois do sorteio da categoria."}
        </RNText>
      </View>
    );
  }
  return (
    <View>
      {[...sections.entries()].map(([title, list]) => (
        <View key={title} style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <RNText style={{ fontFamily: F.extrabold, fontSize: 11, letterSpacing: 0.7, color: C.text4, marginBottom: 10 }}>{title.toUpperCase()}</RNText>
          <View style={{ gap: 10 }}>{list.map((match) => <MatchCard key={match.id} match={match} entries={entries} />)}</View>
        </View>
      ))}
    </View>
  );
}

function LoadingState({ topInset }: { topInset: number }) {
  return (
    <View style={styles.root} accessibilityLabel="Carregando campeonato">
      <StatusBar style="light" />
      <View style={{ backgroundColor: C.dark, paddingTop: topInset + 20, paddingHorizontal: 20, paddingBottom: 24, gap: 8 }}>
        <Skeleton width={90} height={12} />
        <Skeleton width={250} height={24} radius={8} style={{ marginTop: 6 }} />
        <Skeleton width={170} height={24} radius={8} />
        <Skeleton width={140} height={14} style={{ marginTop: 10 }} />
      </View>
      <View style={{ backgroundColor: C.white, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.cardBorder, gap: 12 }}>
        <View style={{ flexDirection: "row", gap: 8 }}><Skeleton width={72} height={34} radius={999} /><Skeleton width={60} height={34} radius={999} /><Skeleton width={80} height={34} radius={999} /></View>
        <Skeleton height={40} radius={12} />
      </View>
      <View style={{ padding: 20 }}><Skeleton height={260} radius={18} /></View>
    </View>
  );
}

function NotFoundState({ topInset, onHome }: { topInset: number; onHome: () => void }) {
  return (
    <View style={[styles.root, { alignItems: "center", paddingTop: topInset + 80, paddingHorizontal: 24 }]}>
      <StatusBar style="dark" />
      <View style={{ width: 76, height: 76, borderRadius: 16, backgroundColor: C.primarySoft, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <Trophy size={32} color={C.primaryText} />
      </View>
      <RNText style={{ fontFamily: F.extrabold, fontSize: 20, color: C.ink }}>Campeonato não encontrado</RNText>
      <RNText style={{ fontFamily: F.regular, fontSize: 13, lineHeight: 19, color: C.text3, textAlign: "center", maxWidth: 300, marginTop: 6 }}>O link pode estar errado ou a tabela ainda não foi publicada pelo organizador.</RNText>
      <Pressable onPress={onHome} accessibilityRole="button" style={{ marginTop: 20, height: 40, paddingHorizontal: 16, borderRadius: 12, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" }}>
        <RNText style={{ fontFamily: F.bold, fontSize: 13, color: C.onPrimary }}>Ir para a página inicial</RNText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.page },
  sectionTitle: { fontFamily: F.extrabold, fontSize: 15, color: C.ink },
  predraw: { flexDirection: "row", gap: 12, backgroundColor: C.warnBg, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14 },
  bracketHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 12 },
  modeSwitch: { flexDirection: "row", backgroundColor: C.alt, borderRadius: 10, padding: 3 },
  modeItem: { height: 30, paddingHorizontal: 10, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  modeItemActive: { backgroundColor: C.white, shadowColor: C.ink, shadowOpacity: 0.12, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
});
