import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Trophy } from "lucide-react-native";
import { Image, ScrollView, StyleSheet, View } from "react-native";

import { Screen } from "@/components/Screen";
import { EmptyState, Skeleton, Text, TopBar, useTheme } from "@/design-system";
import { CategoryCard } from "@/features/voting/components/CategoryCard";
import { VotingErrorState } from "@/features/voting/components/VotingStates";
import { describeVotingError } from "@/features/voting/errors";
import { useIsCustomerScoped } from "@/hooks/useAuth";
import { useScreenLog } from "@/hooks/useScreenLog";
import { useVotingEdition } from "@/hooks/useVoting";

/** Home da edição: hero + categorias com o status pessoal (login só ao entrar numa categoria). */
export default function VotingEditionScreen() {
  const router = useRouter();
  const { competitionSlug, editionSlug } = useLocalSearchParams<{ competitionSlug: string; editionSlug: string }>();
  const { colors, spacing } = useTheme();
  const isCustomerScoped = useIsCustomerScoped();
  const { data: edition, isLoading, error } = useVotingEdition(competitionSlug, editionSlug);
  useScreenLog();

  const params = { competitionSlug: competitionSlug ?? "", editionSlug: editionSlug ?? "" };
  const title = edition?.heroTitle?.trim() || "MELHORES DO ANO";
  const subtitle = edition?.heroSubtitle?.trim() || (edition ? `Monte sua seleção e escolha os melhores jogadores — ${edition.competition.name} ${edition.name}.` : "");

  return (
    <Screen edges={[]}>
      <StatusBar style="dark" />
      <TopBar title="Melhores do Ano" variant="detail" onBack={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} />
      <ScrollView contentContainerStyle={{ padding: spacing.s4, gap: spacing.s4, paddingBottom: spacing.s10 }}>
        {isLoading && (
          <>
            <Skeleton width="100%" height={200} radius={24} />
            <Skeleton width="100%" height={110} radius={16} />
            <Skeleton width="100%" height={110} radius={16} />
          </>
        )}

        {error && <VotingErrorState error={describeVotingError(error)} />}

        {edition && (
          <>
            <View style={styles.hero}>
              {edition.coverImageUrl ? (
                <Image source={{ uri: edition.coverImageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : null}
              <LinearGradient colors={["rgba(11,26,18,0.55)", "#0B1A12"]} style={StyleSheet.absoluteFill} />
              <View style={{ padding: spacing.s5, gap: spacing.s2 }}>
                <View style={styles.eyebrowRow}>
                  <Trophy size={14} color="#5FE39A" />
                  <Text token="caption" style={styles.eyebrow}>
                    {edition.competition.name} · {edition.name}
                  </Text>
                </View>
                <Text token="title" style={styles.heroTitle}>
                  {title}
                </Text>
                <Text style={styles.heroSubtitle}>{subtitle}</Text>
                <Text token="caption" style={styles.heroHint}>
                  Escolha a categoria. Você vota uma vez em cada uma.
                </Text>
              </View>
            </View>

            <View style={{ gap: spacing.s1 }}>
              <Text token="subtitle">{isCustomerScoped ? "Minhas votações" : "Escolha a categoria"}</Text>
              <Text token="caption" color="muted" style={styles.sectionHint}>
                {isCustomerScoped ? "Cada categoria aceita uma seleção por pessoa." : "Você faz login só depois de escolher."}
              </Text>
            </View>

            {edition.categories.length === 0 ? (
              <EmptyState icon={Trophy} title="Nenhuma categoria disponível" description="A organização ainda não abriu as votações." />
            ) : (
              <View style={{ gap: spacing.s3 }}>
                {edition.categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    editionShortName={edition.shortName}
                    me={edition.me}
                    onVote={() => router.push({ pathname: "/votacao/[competitionSlug]/[editionSlug]/[categorySlug]", params: { ...params, categorySlug: category.slug } })}
                    onViewSelection={() =>
                      router.push({ pathname: "/votacao/[competitionSlug]/[editionSlug]/[categorySlug]/sucesso", params: { ...params, categorySlug: category.slug } })
                    }
                    onViewResults={() =>
                      router.push({ pathname: "/votacao/[competitionSlug]/[editionSlug]/resultados/[categorySlug]", params: { ...params, categorySlug: category.slug } })
                    }
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 24, overflow: "hidden", backgroundColor: "#0B1A12", minHeight: 200, justifyContent: "flex-end" },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  eyebrow: { color: "#5FE39A" },
  heroTitle: { color: "#FFFFFF", fontSize: 32, lineHeight: 36, textTransform: "uppercase" },
  heroSubtitle: { color: "rgba(255,255,255,0.82)" },
  heroHint: { color: "rgba(255,255,255,0.6)", textTransform: "none", letterSpacing: 0 },
  sectionHint: { textTransform: "none", letterSpacing: 0 },
});
