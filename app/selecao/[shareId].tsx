import { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowRight } from "lucide-react-native";
import { ScrollView, StyleSheet, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Button, Text, TopBar, useTheme } from "@/design-system";
import { Pitch, type PitchSlot } from "@/features/voting/components/Pitch";
import { PitchSkeleton, VotingErrorState } from "@/features/voting/components/VotingStates";
import { describeVotingError } from "@/features/voting/errors";
import { useScreenLog } from "@/hooks/useScreenLog";
import { useVotingShare } from "@/hooks/useVoting";

/** Seleção compartilhada (link firula.com.br/selecao/:id abre aqui pelo App Link). */
export default function SharedSelectionScreen() {
  const router = useRouter();
  const { shareId } = useLocalSearchParams<{ shareId: string }>();
  const { spacing } = useTheme();
  const { data: share, isLoading, error } = useVotingShare(shareId);
  useScreenLog();

  const slots: PitchSlot[] = useMemo(
    () => (share ? share.selections.map((selection) => ({ position: { ...selection.position, id: selection.position.key }, player: selection.player })) : []),
    [share],
  );

  const goVote = () => {
    if (!share) return;
    router.push({ pathname: "/votacao/[competitionSlug]/[editionSlug]", params: { competitionSlug: share.edition.competition.slug, editionSlug: share.edition.slug } });
  };

  return (
    <Screen>
      <StatusBar style="dark" />
      <TopBar title="Seleção" variant="detail" onBack={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} />
      <ScrollView contentContainerStyle={{ padding: spacing.s4, gap: spacing.s5, paddingBottom: spacing.s10 }}>
        {isLoading && <PitchSkeleton />}
        {error && <VotingErrorState error={describeVotingError(error)} actionLabel="Ir para o início" onAction={() => router.replace("/(tabs)")} />}

        {share && (
          <>
            <View style={{ alignItems: "center", gap: 6 }}>
              <Text token="caption" color="muted">
                {share.edition.competition.name} · {share.category.name}
              </Text>
              <Text token="title" style={{ fontSize: 26, lineHeight: 30, textAlign: "center" }}>
                {share.displayName ? `Essa é a seleção do ${share.displayName}` : share.title}
              </Text>
            </View>

            <Pitch slots={slots} readOnly />

            <View style={styles.cta}>
              <Text token="title" style={styles.ctaTitle}>
                Monte a sua no Firula
              </Text>
              <Text style={styles.ctaText}>Vote no seu time ideal — leva um minuto.</Text>
              <Button label="Montar minha seleção" icon={ArrowRight} onPress={goVote} fullWidth />
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cta: { backgroundColor: "#0B1A12", borderRadius: 24, padding: 24, gap: 10, alignItems: "center" },
  ctaTitle: { color: "#FFFFFF", textAlign: "center" },
  ctaText: { color: "rgba(255,255,255,0.75)", textAlign: "center", marginBottom: 6 },
});
