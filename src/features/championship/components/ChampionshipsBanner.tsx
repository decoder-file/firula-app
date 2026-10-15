import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, Medal } from "lucide-react-native";
import { Image, StyleSheet, View } from "react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Text, useTheme } from "@/design-system";
import { useOrganizationChampionships } from "@/hooks/useChampionship";
import { FORMAT_LABEL, type ChampionshipSummary } from "@/services/championship.service";

function describe(item: ChampionshipSummary): string {
  const state = item.status === "IN_PROGRESS" ? "Tabela ao vivo" : item.status === "FINISHED" ? "Resultado final" : "Tabela publicada";
  return `${state} · ${item._count.entries} participantes`;
}

function eyebrow(item: ChampionshipSummary): string {
  const format = item.categories.length === 1 ? FORMAT_LABEL[item.categories[0].format] : `${item.categories.length} categorias`;
  return item.sport ? `${format} · ${item.sport.name}` : format;
}

/** Gancho dos campeonatos na página do organizador — só aparece quando há campeonato publicado. */
export function ChampionshipsBanner({ organizationSlug }: { organizationSlug: string | null | undefined }) {
  const router = useRouter();
  const { spacing } = useTheme();
  const { data: items } = useOrganizationChampionships(organizationSlug);

  if (!items || items.length === 0) return null;

  return (
    <View style={{ gap: spacing.s3 }} accessibilityLabel="Campeonatos">
      {items.map((item) => {
        const live = item.status === "IN_PROGRESS";
        return (
          <AnimatedPressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}: ${describe(item)}`}
            onPress={() => router.push({ pathname: "/campeonatos/[slug]", params: { slug: item.slug } } as never)}
            style={styles.card}
          >
            {item.coverUrl ? <Image source={{ uri: item.coverUrl }} style={[StyleSheet.absoluteFill, { opacity: 0.3 }]} resizeMode="cover" /> : null}
            <LinearGradient colors={["rgba(31,189,99,0.35)", "rgba(11,26,18,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <View style={styles.icon}>
              <Medal size={22} color="#5FE39A" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text token="caption" style={styles.eyebrow} numberOfLines={1}>
                {eyebrow(item)}
              </Text>
              <Text token="subtitle" style={styles.title} numberOfLines={1}>
                {item.name}
              </Text>
              <Text token="caption" style={styles.description} numberOfLines={1}>
                {describe(item)}
              </Text>
            </View>
            <View style={[styles.pill, live ? styles.pillLive : styles.pillMuted]}>
              <Text token="label" style={{ color: "#FFFFFF" }}>
                {live ? "Ao vivo" : "Ver tabela"}
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
  pillLive: { backgroundColor: "#1FBD63" },
  pillMuted: { backgroundColor: "rgba(255,255,255,0.14)" },
});
