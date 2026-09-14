import { forwardRef } from "react";
import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system";
import type { ShareImageVariant, VoteView } from "@/services/voting.service";
import { defaultShareTitle } from "@/utils/votingBallot";
import { Pitch, type PitchSlot } from "./Pitch";

interface ShareCardViewProps {
  vote: VoteView;
  variant: ShareImageVariant;
  displayName?: string | null;
}

const SIZES: Record<ShareImageVariant, { width: number; height: number }> = {
  "9x16": { width: 360, height: 640 },
  "1x1": { width: 400, height: 400 },
};

/**
 * Card compartilhável renderizado fora da tela e capturado com
 * react-native-view-shot (em 3× de pixel ratio vira 1080×1920 / 1200×1200).
 */
export const ShareCardView = forwardRef<View, ShareCardViewProps>(function ShareCardView({ vote, variant, displayName }, ref) {
  const { width, height } = SIZES[variant];
  const isStory = variant === "9x16";
  const title = vote.edition.shareTitle?.trim() || defaultShareTitle(vote.edition.shortName);
  const slots: PitchSlot[] = vote.selections.map((selection) => ({
    position: { ...selection.position, id: selection.positionId ?? selection.position.key },
    player: selection.player,
  }));

  return (
    <View ref={ref} collapsable={false} style={[styles.card, { width, height, padding: isStory ? 24 : 18 }]}>
      <Text token="caption" style={styles.competition}>
        {vote.edition.competition.name.toUpperCase()}
      </Text>
      <Text token="title" style={[styles.title, { fontSize: isStory ? 26 : 20, lineHeight: isStory ? 30 : 24 }]}>
        {title}
      </Text>
      <Text token="label" style={styles.subtitle}>
        {vote.category.name}
        {displayName ? ` · ${displayName}` : ""}
      </Text>

      <View style={[styles.pitchWrap, isStory ? { marginTop: 16 } : { marginTop: 10, alignSelf: "center", width: 220 }]}>
        <Pitch slots={slots} readOnly compact aspectRatio={isStory ? 2 / 3 : 3 / 4} />
      </View>

      <View style={styles.footer}>
        <View style={styles.wordmarkRow}>
          <Text style={styles.wordmark}>firula</Text>
          <View style={styles.dot} />
        </View>
        <Text token="caption" style={styles.cta}>
          Vote no seu time ideal · firula.com.br/votacao
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: "#0B1A12", justifyContent: "space-between", overflow: "hidden" },
  competition: { color: "#1FBD58", letterSpacing: 1.2 },
  title: { color: "#FFFFFF", marginTop: 6 },
  subtitle: { color: "rgba(255,255,255,0.75)", marginTop: 4 },
  pitchWrap: { flex: 1, justifyContent: "center" },
  footer: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 12 },
  wordmarkRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  wordmark: { color: "#FFFFFF", fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#1FBD58" },
  cta: { color: "rgba(255,255,255,0.75)", textTransform: "none", letterSpacing: 0 },
});
