import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Trophy } from "lucide-react-native";
import { ScrollView, StyleSheet, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Avatar, Skeleton, Surface, Text, TopBar, useTheme } from "@/design-system";
import { VotingErrorState } from "@/features/voting/components/VotingStates";
import { describeVotingError } from "@/features/voting/errors";
import { useScreenLog } from "@/hooks/useScreenLog";
import { findCategoryBySlug, useVotingEdition, useVotingResults } from "@/hooks/useVoting";

const number = new Intl.NumberFormat("pt-BR");

/** Resultado oficial publicado — vencedor por posição + top 5. */
export default function VotingResultsScreen() {
  const router = useRouter();
  const { competitionSlug, editionSlug, categorySlug } = useLocalSearchParams<{ competitionSlug: string; editionSlug: string; categorySlug: string }>();
  const { colors, spacing } = useTheme();
  useScreenLog();

  const { data: edition, isLoading: loadingEdition, error: editionError } = useVotingEdition(competitionSlug, editionSlug);
  const category = findCategoryBySlug(edition, categorySlug);
  const { data: results, isLoading: loadingResults, error: resultsError } = useVotingResults(category?.id);
  const error = editionError ?? resultsError;

  return (
    <Screen>
      <StatusBar style="dark" />
      <TopBar title={category ? `Resultado ${category.name}` : "Resultado"} variant="detail" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: spacing.s4, gap: spacing.s3, paddingBottom: spacing.s10 }}>
        {(loadingEdition || loadingResults) && !error && (
          <>
            <Skeleton width="70%" height={28} radius={12} />
            <Skeleton width="100%" height={120} radius={16} />
            <Skeleton width="100%" height={120} radius={16} />
          </>
        )}
        {error && <VotingErrorState error={describeVotingError(error)} />}

        {results && (
          <>
            <View style={{ gap: 4 }}>
              <Text token="caption" color="muted">
                {results.edition.competition.name} · {results.edition.shortName}
              </Text>
              <View style={styles.titleRow}>
                <Trophy size={22} color={colors.primary} />
                <Text token="title" style={{ fontSize: 24, lineHeight: 28 }}>
                  Melhores do Ano {results.category.name}
                </Text>
              </View>
              <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0 }}>
                Resultado oficial · {number.format(results.totalVotes)} votos computados
              </Text>
            </View>

            {results.positions.map((position) => {
              const [winner, ...rest] = position.rows;
              return (
                <Surface key={position.positionId} level={1} style={{ padding: spacing.s4, gap: spacing.s3 }}>
                  <Text token="caption" color="muted">
                    {position.label.toUpperCase()}
                  </Text>
                  {winner ? (
                    <View style={styles.winner}>
                      <Avatar name={winner.player.name} source={winner.player.photoUrl ? { uri: winner.player.photoUrl } : null} size="lg" />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text token="subtitle" numberOfLines={1}>
                          {winner.player.name}
                        </Text>
                        <Text token="caption" color="muted" numberOfLines={1} style={{ textTransform: "none", letterSpacing: 0 }}>
                          {winner.player.school.name}
                        </Text>
                        <Text token="label" color="primary">
                          {number.format(winner.weightedTotal)} pts · {number.format(winner.rawVotes)} votos{winner.wonTieBreak ? " · sorteio" : ""}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <Text color="muted">Sem votos nesta posição.</Text>
                  )}
                  {rest.slice(0, 4).map((row) => (
                    <View key={row.playerId} style={styles.row}>
                      <Text token="label" color="muted" style={{ width: 20, textAlign: "right" }}>
                        {row.rank}
                      </Text>
                      <Text numberOfLines={1} style={{ flex: 1 }}>
                        {row.player.name}
                        {row.player.school.shortName ? <Text color="muted"> {row.player.school.shortName}</Text> : null}
                      </Text>
                      <Text token="label">{number.format(row.weightedTotal)}</Text>
                    </View>
                  ))}
                </Surface>
              );
            })}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  winner: { flexDirection: "row", alignItems: "center", gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
});
