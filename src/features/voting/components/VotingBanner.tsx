import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, Trophy } from "lucide-react-native";
import { Image, StyleSheet, View } from "react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Text, useTheme } from "@/design-system";
import { useOrganizationVotingEditions } from "@/hooks/useVoting";
import type { OrganizationVotingEdition } from "@/services/voting.service";

function describe(edition: OrganizationVotingEdition): string {
  if (edition.categoriesOpen > 0) return `${edition.categoriesOpen} categoria${edition.categoriesOpen === 1 ? "" : "s"} com votação aberta`;
  if (edition.categoriesScheduled > 0) return "Votação abre em breve";
  if (edition.categoriesWithResults > 0) return "Resultados publicados";
  return "Em preparação";
}

/** Gancho da votação na página do organizador — só aparece quando há edição ativa. */
export function VotingBanner({ organizationSlug }: { organizationSlug: string | null | undefined }) {
  const router = useRouter();
  const { spacing } = useTheme();
  const { data: editions } = useOrganizationVotingEditions(organizationSlug);

  if (!editions || editions.length === 0) return null;

  return (
    <View style={{ gap: spacing.s3 }} accessibilityLabel="Votações">
      {editions.map((edition) => {
        const isOpen = edition.categoriesOpen > 0;
        return (
          <AnimatedPressable
            key={edition.id}
            accessibilityRole="button"
            accessibilityLabel={`${edition.competition.name} ${edition.name}: ${describe(edition)}`}
            onPress={() =>
              router.push({ pathname: "/votacao/[competitionSlug]/[editionSlug]", params: { competitionSlug: edition.competition.slug, editionSlug: edition.slug } })
            }
            style={styles.card}
          >
            {edition.coverImageUrl ? <Image source={{ uri: edition.coverImageUrl }} style={[StyleSheet.absoluteFill, { opacity: 0.3 }]} resizeMode="cover" /> : null}
            <LinearGradient colors={["rgba(31,189,99,0.35)", "rgba(11,26,18,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <View style={styles.icon}>
              <Trophy size={22} color="#5FE39A" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text token="caption" style={styles.eyebrow} numberOfLines={1}>
                {edition.competition.name} · {edition.name}
              </Text>
              <Text token="subtitle" style={styles.title} numberOfLines={1}>
                {edition.heroTitle?.trim() || "Melhores do Ano"}
              </Text>
              <Text token="caption" style={styles.description} numberOfLines={1}>
                {describe(edition)}
              </Text>
            </View>
            <View style={[styles.pill, isOpen ? styles.pillOpen : styles.pillMuted]}>
              <Text token="label" style={{ color: "#FFFFFF" }}>
                {isOpen ? "Votar" : "Ver"}
              </Text>
              <ArrowRight size={14} color="#FFFFFF" />
            </View>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 20, backgroundColor: "#0B1A12", overflow: "hidden" },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  eyebrow: { color: "#5FE39A" },
  title: { color: "#FFFFFF" },
  description: { color: "rgba(255,255,255,0.75)", textTransform: "none", letterSpacing: 0 },
  pill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  pillOpen: { backgroundColor: "#1FBD63" },
  pillMuted: { backgroundColor: "rgba(255,255,255,0.14)" },
});
