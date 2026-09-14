import { StyleSheet, View } from "react-native";
import { CheckCircle2, ChevronRight, Clock3, Lock, PauseCircle, Trophy } from "lucide-react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Badge, Surface, Text, useTheme } from "@/design-system";
import type { MyVotingStatus, VotingCategorySummary } from "@/services/voting.service";

export type CategoryCardState = "vote" | "voted" | "scheduled" | "paused" | "closed" | "restricted" | "draft";

export function resolveCategoryState(category: VotingCategorySummary, me: MyVotingStatus | null): CategoryCardState {
  if (me?.votedCategoryIds.includes(category.id)) return "voted";
  if (category.status === "OPEN") return me && !me.eligibleCategoryIds.includes(category.id) ? "restricted" : "vote";
  if (category.status === "SCHEDULED") return "scheduled";
  if (category.status === "PAUSED") return "paused";
  if (category.status === "DRAFT") return "draft";
  return "closed";
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

interface CategoryCardProps {
  category: VotingCategorySummary;
  editionShortName: string;
  me: MyVotingStatus | null;
  onVote: () => void;
  onViewSelection: () => void;
  onViewResults: () => void;
}

export function CategoryCard({ category, editionShortName, me, onVote, onViewSelection, onViewResults }: CategoryCardProps) {
  const { colors, spacing } = useTheme();
  const state = resolveCategoryState(category, me);

  const action =
    state === "vote" ? onVote : state === "voted" ? onViewSelection : state === "closed" && category.resultsPublished ? onViewResults : undefined;

  const badge: Record<CategoryCardState, { label: string; variant: "success" | "neutral" | "warning" | "brand" }> = {
    vote: { label: "Aberta", variant: "brand" },
    voted: { label: "Concluída", variant: "success" },
    scheduled: { label: "Em breve", variant: "neutral" },
    paused: { label: "Pausada", variant: "warning" },
    closed: { label: "Encerrada", variant: "neutral" },
    restricted: { label: "Convidados", variant: "neutral" },
    draft: { label: "Em breve", variant: "neutral" },
  };

  const hint: Record<CategoryCardState, { icon: typeof Clock3; text: string }> = {
    vote: { icon: ChevronRight, text: "Montar minha seleção" },
    voted: { icon: CheckCircle2, text: "Votação concluída · ver minha seleção" },
    scheduled: { icon: Clock3, text: category.votingStartsAt ? `Abre em ${dateFormatter.format(new Date(category.votingStartsAt))}` : "Em breve" },
    paused: { icon: PauseCircle, text: "Votação pausada — volte mais tarde" },
    closed: { icon: category.resultsPublished ? Trophy : Lock, text: category.resultsPublished ? "Ver resultado" : "Votação encerrada" },
    restricted: { icon: Lock, text: "Restrita a votantes convidados" },
    draft: { icon: Clock3, text: "Em preparação" },
  };

  const HintIcon = hint[state].icon;
  const hintColor = state === "vote" || state === "voted" ? colors.primaryText : colors.textMuted;

  return (
    <AnimatedPressable onPress={action} disabled={!action} accessibilityRole="button" accessibilityLabel={`${category.name}: ${hint[state].text}`}>
      <Surface level={1} style={[styles.card, { padding: spacing.s4, borderColor: state === "vote" ? colors.primary : colors.border }]}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text token="title" style={styles.name}>
              {category.name}
            </Text>
            <Text token="caption" color="muted" style={styles.subtitle}>
              Melhores do Ano {editionShortName}
            </Text>
          </View>
          <Badge label={badge[state].label} variant={badge[state].variant} />
        </View>
        <View style={[styles.hint, { marginTop: spacing.s3 }]}>
          <HintIcon size={16} color={hintColor} />
          <Text token="label" style={{ color: hintColor }}>
            {hint[state].text}
          </Text>
        </View>
      </Surface>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  name: { fontSize: 26, lineHeight: 30 },
  subtitle: { textTransform: "none", letterSpacing: 0, marginTop: 2 },
  hint: { flexDirection: "row", alignItems: "center", gap: 6 },
});
