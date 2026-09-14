import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Sparkles } from "lucide-react-native";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "@/components/Screen";
import { Button, Text, TopBar, useTheme } from "@/design-system";
import { Pitch, type PitchSlot } from "@/features/voting/components/Pitch";
import { PlayerPickerSheet } from "@/features/voting/components/PlayerPickerSheet";
import { PitchSkeleton, VotingErrorState, VotingLoginRequired } from "@/features/voting/components/VotingStates";
import { describeVotingError } from "@/features/voting/errors";
import { useAuthHydrated, useIsCustomerScoped } from "@/hooks/useAuth";
import { useScreenLog } from "@/hooks/useScreenLog";
import { findCategoryBySlug, useVotingBallot, useVotingEdition } from "@/hooks/useVoting";
import { selectDraft, useVotingDraftStore } from "@/stores/votingDraftStore";
import { filledCount, findPlayer, isComplete, sanitizeDraft } from "@/utils/votingBallot";

/** Cédula: campo + seletor de jogadores. */
export default function VotingBallotScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { competitionSlug, editionSlug, categorySlug } = useLocalSearchParams<{ competitionSlug: string; editionSlug: string; categorySlug: string }>();
  const { colors, spacing } = useTheme();
  const hydrated = useAuthHydrated();
  const isCustomerScoped = useIsCustomerScoped();
  useScreenLog();

  const { data: edition, isLoading: loadingEdition, error: editionError } = useVotingEdition(competitionSlug, editionSlug);
  const category = findCategoryBySlug(edition, categorySlug);
  const { data: ballot, isLoading: loadingBallot, error: ballotError } = useVotingBallot(category?.id);

  const categoryId = category?.id ?? "pending";
  const draft = useVotingDraftStore(selectDraft(categoryId));
  const { select, clear, replace } = useVotingDraftStore();
  const [activePositionId, setActivePositionId] = useState<string | null>(null);

  useEffect(() => {
    if (!ballot || !category) return;
    const sanitized = sanitizeDraft(draft, ballot);
    if (Object.keys(sanitized).length !== Object.keys(draft).length) replace(category.id, sanitized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ballot]);

  const slots: PitchSlot[] = useMemo(
    () => (ballot ? ballot.positions.map((position) => ({ position, player: findPlayer(ballot, position.id, draft[position.id]) })) : []),
    [ballot, draft],
  );
  const total = ballot?.positions.length ?? 0;
  const filled = ballot ? filledCount(draft, ballot.positions) : 0;
  const complete = ballot ? isComplete(draft, ballot.positions) : false;
  const activePosition = ballot?.positions.find((position) => position.id === activePositionId) ?? null;

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withSpring(total ? filled / total : 0, { damping: 18, stiffness: 140 });
  }, [filled, total, progress]);
  const progressStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  const error = editionError ?? ballotError;
  const errorView = error ? describeVotingError(error) : null;
  const params = { competitionSlug: competitionSlug ?? "", editionSlug: editionSlug ?? "", categorySlug: categorySlug ?? "" };
  const goHome = () => router.replace({ pathname: "/votacao/[competitionSlug]/[editionSlug]", params });

  return (
    <Screen>
      <StatusBar style="dark" />
      <TopBar title={category ? `Seleção ${category.name}` : "Monte sua seleção"} variant="detail" onBack={() => (router.canGoBack() ? router.back() : goHome())} />

      {hydrated && !isCustomerScoped ? (
        <View style={{ padding: spacing.s4 }}>
          <VotingLoginRequired redirectTo={pathname} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.s4, gap: spacing.s4, paddingBottom: 120 + insets.bottom }}>
          {(loadingEdition || loadingBallot || !hydrated) && !error && <PitchSkeleton />}

          {edition && !category && !loadingEdition && (
            <VotingErrorState error={{ code: "VOTING_NOT_FOUND", title: "Categoria não encontrada", description: "Escolha uma categoria na lista." }} actionLabel="Ver categorias" onAction={goHome} />
          )}

          {errorView && (
            <VotingErrorState
              error={errorView}
              actionLabel={errorView.code === "VOTING_ALREADY_VOTED" ? "Ver minha seleção" : "Votar em outra categoria"}
              onAction={() =>
                errorView.code === "VOTING_ALREADY_VOTED"
                  ? router.replace({ pathname: "/votacao/[competitionSlug]/[editionSlug]/[categorySlug]/sucesso", params })
                  : goHome()
              }
            />
          )}

          {ballot && category && (
            <>
              <View style={styles.header}>
                <View style={{ flex: 1 }}>
                  <Text token="title">Minha Seleção {category.name}</Text>
                  <Text token="caption" color="muted" style={styles.hint}>
                    Toque em cada posição e escolha o melhor do campeonato.
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text token="caption" color="muted">
                    SEU TIME
                  </Text>
                  <Text token="title" style={{ fontSize: 26, lineHeight: 30 }}>
                    <Text token="title" style={{ fontSize: 26, lineHeight: 30, color: complete ? colors.primaryText : colors.text }}>
                      {filled}
                    </Text>
                    <Text token="title" color="muted" style={{ fontSize: 26, lineHeight: 30 }}>
                      /{total}
                    </Text>
                  </Text>
                </View>
              </View>

              <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: filled }}>
                <Animated.View style={[styles.fill, { backgroundColor: colors.primary }, progressStyle]} />
              </View>

              <Pitch slots={slots} activePositionId={activePositionId} onSlotPress={setActivePositionId} />

              {complete && (
                <Animated.View entering={FadeInDown} style={[styles.complete, { backgroundColor: colors.primarySoft }]}>
                  <Sparkles size={16} color={colors.primaryText} />
                  <Text token="label" color="primary">
                    Time completo! Revise e confirme sua votação.
                  </Text>
                </Animated.View>
              )}
            </>
          )}
        </ScrollView>
      )}

      {ballot && category && (
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: insets.bottom + spacing.s3, paddingHorizontal: spacing.s4 }]}>
          <Text color="muted">
            <Text token="label">{filled}</Text> de {total} jogadores
          </Text>
          <Button
            label="Finalizar minha seleção"
            disabled={!complete}
            onPress={() => router.push({ pathname: "/votacao/[competitionSlug]/[editionSlug]/[categorySlug]/confirmar", params })}
          />
        </View>
      )}

      {ballot && (
        <PlayerPickerSheet
          position={activePosition}
          positions={ballot.positions}
          draft={draft}
          onSelect={(positionId, playerId) => select(categoryId, positionId, playerId)}
          onClear={(positionId) => clear(categoryId, positionId)}
          onClose={() => setActivePositionId(null)}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-end", gap: 12 },
  hint: { textTransform: "none", letterSpacing: 0, marginTop: 2 },
  track: { height: 8, borderRadius: 999, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 999 },
  complete: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 14 },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 12, borderTopWidth: 1 },
});
