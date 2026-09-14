import { useMemo, useState } from "react";
import { Redirect, useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ShieldCheck } from "lucide-react-native";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "@/components/Screen";
import { Button, Surface, Text, TopBar, useTheme } from "@/design-system";
import { Pitch, type PitchSlot } from "@/features/voting/components/Pitch";
import { PitchSkeleton, VotingErrorState, VotingLoginRequired } from "@/features/voting/components/VotingStates";
import { describeVotingError, type VotingErrorView } from "@/features/voting/errors";
import { useAuthHydrated, useIsCustomerScoped } from "@/hooks/useAuth";
import { useScreenLog } from "@/hooks/useScreenLog";
import { findCategoryBySlug, useSubmitVote, useVotingBallot, useVotingEdition } from "@/hooks/useVoting";
import { selectDraft, useVotingDraftStore } from "@/stores/votingDraftStore";
import { findPlayer, isComplete, newSubmissionId, toSelections } from "@/utils/votingBallot";

/** "Essa é a sua Seleção?" — passo obrigatório antes de enviar. */
export default function VotingConfirmScreen() {
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
  const resetDraft = useVotingDraftStore((state) => state.reset);
  const submit = useSubmitVote(categoryId);

  // Uma chave por tentativa: reenviar (rede caiu) devolve o mesmo voto.
  const [submissionId] = useState(newSubmissionId);
  const [submitError, setSubmitError] = useState<VotingErrorView | null>(null);

  const params = { competitionSlug: competitionSlug ?? "", editionSlug: editionSlug ?? "", categorySlug: categorySlug ?? "" };
  const slots: PitchSlot[] = useMemo(
    () => (ballot ? ballot.positions.map((position) => ({ position, player: findPlayer(ballot, position.id, draft[position.id]) })) : []),
    [ballot, draft],
  );

  if (hydrated && !isCustomerScoped) {
    return (
      <Screen>
        <TopBar title="Confirmar votação" variant="detail" onBack={() => router.back()} />
        <View style={{ padding: spacing.s4 }}>
          <VotingLoginRequired redirectTo={pathname} />
        </View>
      </Screen>
    );
  }

  if (ballot && category && !isComplete(draft, ballot.positions)) {
    return <Redirect href={{ pathname: "/votacao/[competitionSlug]/[editionSlug]/[categorySlug]", params }} />;
  }

  const goSuccess = () => router.replace({ pathname: "/votacao/[competitionSlug]/[editionSlug]/[categorySlug]/sucesso", params });

  async function handleConfirm() {
    if (!ballot || !category) return;
    setSubmitError(null);
    try {
      await submit.mutateAsync({ submissionId, selections: toSelections(draft, ballot) });
      resetDraft(category.id);
      goSuccess();
    } catch (error) {
      const described = describeVotingError(error);
      if (described.code === "VOTING_ALREADY_VOTED") {
        resetDraft(category.id);
        goSuccess();
        return;
      }
      setSubmitError(described);
    }
  }

  const error = editionError ?? ballotError;

  return (
    <Screen>
      <StatusBar style="dark" />
      <TopBar title="Confirmar votação" variant="detail" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: spacing.s4, gap: spacing.s4, paddingBottom: 140 + insets.bottom }}>
        {(loadingEdition || loadingBallot) && !error && <PitchSkeleton />}
        {error && <VotingErrorState error={describeVotingError(error)} actionLabel="Ver categorias" onAction={() => router.replace({ pathname: "/votacao/[competitionSlug]/[editionSlug]", params })} />}

        {ballot && category && (
          <>
            <View style={{ alignItems: "center", gap: 6 }}>
              <Text token="caption" color="muted">
                {edition?.shortName} · {category.name}
              </Text>
              <Text token="title" style={{ fontSize: 28, lineHeight: 32, textAlign: "center" }}>
                Essa é a sua Seleção?
              </Text>
              <Text color="muted" style={{ textAlign: "center" }}>
                Confira seus {ballot.positions.length} escolhidos antes de confirmar sua votação.
              </Text>
            </View>

            <Pitch slots={slots} readOnly />

            <Surface level={1} style={{ padding: spacing.s3, gap: 6 }}>
              {slots.map(({ position, player }) => (
                <View key={position.id} style={styles.row}>
                  <Text token="label" color="muted">
                    {position.label}
                  </Text>
                  <Text token="label" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {player?.name}
                  </Text>
                </View>
              ))}
            </Surface>

            {submitError && (
              <VotingErrorState
                error={submitError}
                actionLabel={submitError.code === "VOTING_INVALID_SELECTION" ? "Revisar meu time" : undefined}
                onAction={submitError.code === "VOTING_INVALID_SELECTION" ? () => router.back() : undefined}
              />
            )}
          </>
        )}
      </ScrollView>

      {ballot && category && (
        <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: insets.bottom + spacing.s3, paddingHorizontal: spacing.s4, gap: spacing.s2 }]}>
          <Button label="Confirmar votação" icon={ShieldCheck} loading={submit.isPending} onPress={() => void handleConfirm()} fullWidth />
          <Button label="Voltar e editar" variant="outline" disabled={submit.isPending} onPress={() => router.back()} fullWidth />
          <Text token="caption" color="muted" style={{ textAlign: "center", textTransform: "none", letterSpacing: 0 }}>
            Depois de confirmar, sua seleção nesta categoria não pode ser alterada.
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, paddingTop: 12, borderTopWidth: 1 },
});
