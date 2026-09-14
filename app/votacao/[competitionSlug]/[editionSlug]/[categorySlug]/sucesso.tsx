import { useMemo, useState } from "react";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CheckCircle2, Copy, Share2 } from "lucide-react-native";
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

import { Screen } from "@/components/Screen";
import { Button, Surface, Switch, Text, TextField, TopBar, useTheme } from "@/design-system";
import { Pitch, type PitchSlot } from "@/features/voting/components/Pitch";
import { ShareCardView } from "@/features/voting/components/ShareCardView";
import { PitchSkeleton, VotingErrorState, VotingLoginRequired } from "@/features/voting/components/VotingStates";
import { describeVotingError } from "@/features/voting/errors";
import { useShareSelection } from "@/features/voting/useShareSelection";
import { useAuthHydrated, useAuthUser, useIsCustomerScoped } from "@/hooks/useAuth";
import { useScreenLog } from "@/hooks/useScreenLog";
import { findCategoryBySlug, useMyVote, useVotingEdition } from "@/hooks/useVoting";
import type { VoteView } from "@/services/voting.service";
import { firstName } from "@/utils/votingBallot";

/** "Seleção registrada!" + compartilhar. */
export default function VotingSuccessScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { competitionSlug, editionSlug, categorySlug } = useLocalSearchParams<{ competitionSlug: string; editionSlug: string; categorySlug: string }>();
  const { spacing } = useTheme();
  const hydrated = useAuthHydrated();
  const isCustomerScoped = useIsCustomerScoped();
  useScreenLog();

  const { data: edition, isLoading: loadingEdition, error: editionError } = useVotingEdition(competitionSlug, editionSlug);
  const category = findCategoryBySlug(edition, categorySlug);
  const { data: vote, isLoading: loadingVote, error: voteError } = useMyVote(category?.id);
  const params = { competitionSlug: competitionSlug ?? "", editionSlug: editionSlug ?? "" };
  const goHome = () => router.replace({ pathname: "/votacao/[competitionSlug]/[editionSlug]", params });

  const error = editionError ?? voteError;

  return (
    <Screen>
      <StatusBar style="dark" />
      <TopBar title="Minha seleção" variant="detail" onBack={goHome} />
      {hydrated && !isCustomerScoped ? (
        <View style={{ padding: spacing.s4 }}>
          <VotingLoginRequired redirectTo={pathname} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.s4, gap: spacing.s5, paddingBottom: spacing.s10 }}>
          {(loadingEdition || loadingVote) && !error && <PitchSkeleton />}
          {error && <VotingErrorState error={describeVotingError(error)} actionLabel="Ver categorias" onAction={goHome} />}

          {!loadingVote && !error && vote === null && category && (
            <VotingErrorState
              error={{ code: "NO_VOTE", title: "Você ainda não votou nesta categoria", description: "Monte sua seleção para vê-la aqui." }}
              actionLabel="Montar minha seleção"
              onAction={() => router.replace({ pathname: "/votacao/[competitionSlug]/[editionSlug]/[categorySlug]", params: { ...params, categorySlug: categorySlug ?? "" } })}
            />
          )}

          {vote && <SuccessBody vote={vote} onOtherCategory={goHome} />}
        </ScrollView>
      )}
    </Screen>
  );
}

function SuccessBody({ vote, onOtherCategory }: { vote: VoteView; onOtherCategory: () => void }) {
  const { colors, spacing } = useTheme();
  const user = useAuthUser();
  const accountName = (user as { name?: string | null } | null)?.name ?? null;
  const [showName, setShowName] = useState(Boolean(vote.share?.displayName));
  const [displayName, setDisplayName] = useState(vote.share?.displayName ?? (accountName ? firstName(accountName) : ""));
  const { storyRef, squareRef, share, busy, shareNow, copyLink } = useShareSelection(vote);

  const slots: PitchSlot[] = useMemo(
    () => vote.selections.map((selection) => ({ position: { ...selection.position, id: selection.positionId ?? selection.position.key }, player: selection.player })),
    [vote],
  );
  const effectiveName = showName ? displayName.trim() || null : null;

  return (
    <>
      <View style={{ alignItems: "center", gap: 8 }}>
        <Animated.View entering={ZoomIn.springify().damping(16)} style={[styles.checkWrap, { backgroundColor: colors.primarySoft }]}>
          <CheckCircle2 size={36} color={colors.primaryText} />
        </Animated.View>
        <Text token="title" style={{ fontSize: 28, lineHeight: 32, textAlign: "center" }}>
          Seleção registrada!
        </Text>
        <Text color="muted" style={{ textAlign: "center" }}>
          Seu voto na categoria <Text token="label">{vote.category.name}</Text> foi computado com sucesso.
        </Text>
      </View>

      <Pitch slots={slots} readOnly />

      <Surface level={1} style={{ padding: spacing.s4, gap: spacing.s3 }}>
        <View>
          <Text token="subtitle">Compartilhar minha seleção</Text>
          <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0 }}>
            Card pronto para Stories e WhatsApp com os seus escolhidos.
          </Text>
        </View>
        <View style={styles.switchRow}>
          <Text token="label" style={{ flex: 1 }}>
            Mostrar meu nome na página compartilhada
          </Text>
          <Switch value={showName} onValueChange={setShowName} />
        </View>
        {showName && <TextField label="Como quer aparecer?" value={displayName} onChangeText={setDisplayName} maxLength={40} placeholder="Ex.: Gabriel" />}
        <Button label="Compartilhar minha seleção" icon={Share2} loading={busy} onPress={() => void shareNow(effectiveName)} fullWidth />
        <Button label="Copiar link" icon={Copy} variant="outline" disabled={busy} onPress={() => void copyLink(effectiveName)} fullWidth />
        {share && (
          <Text token="caption" color="muted" numberOfLines={1} style={{ textTransform: "none", letterSpacing: 0 }}>
            {share.publicUrl}
          </Text>
        )}
      </Surface>

      <Button label="Votar em outra categoria" variant="tonal" onPress={onOtherCategory} fullWidth />

      {/* Cards renderizados fora da tela só pra captura (react-native-view-shot). */}
      <View style={styles.offscreen} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <ShareCardView ref={storyRef} vote={vote} variant="9x16" displayName={effectiveName} />
        <ShareCardView ref={squareRef} vote={vote} variant="1x1" displayName={effectiveName} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  checkWrap: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  switchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  offscreen: { position: "absolute", left: -2000, top: 0 },
});
