import { useState } from "react";
import { useRouter } from "expo-router";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, MapPin, Share2, Ticket, Trophy } from "lucide-react-native";
import { ImageBackground, Pressable, Share, StyleSheet, Text as RNText, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FORMAT_LABEL, PARTICIPANT_TYPE_LABEL, type Entry, type PublicCategory, type PublicChampionship } from "@/services/championship.service";

import { C, F, formatDates, initials } from "../helpers";
import { Avatar } from "./atoms";

interface HeroProps {
  championship: PublicChampionship;
  category: PublicCategory;
  champion: Entry | null | undefined;
}

export function Hero({ championship, category, champion }: HeroProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [aboutOpen, setAboutOpen] = useState(false);
  const single = championship.categories.length === 1;
  const live = championship.status === "IN_PROGRESS";
  const dates = formatDates(championship.startsAt, championship.endsAt);
  const context = `${single ? `${FORMAT_LABEL[category.format]} · ${PARTICIPANT_TYPE_LABEL[category.participantType]}` : `${championship.categories.length} categorias`}${championship.sport ? ` · ${championship.sport.name}` : ""}`;
  const statusLabel = live ? "Ao vivo" : championship.status === "FINISHED" ? "Encerrado" : "Em breve";

  async function share() {
    const website = process.env.EXPO_PUBLIC_WEBSITE_URL?.replace(/\/$/, "");
    const url = website ? `${website}/campeonatos/${championship.slug}?categoria=${category.id}` : null;
    await Share.share({ message: url ? `${championship.name} · tabela ao vivo\n${url}` : championship.name, ...(url ? { url } : {}) });
  }

  function back() {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as never);
  }

  return (
    <View style={styles.root}>
      {championship.coverUrl ? <ImageBackground source={{ uri: championship.coverUrl }} style={StyleSheet.absoluteFill} imageStyle={{ opacity: 0.3 }} /> : null}
      <LinearGradient colors={["rgba(14,17,22,.35)", C.dark]} locations={[0, 0.88]} style={StyleSheet.absoluteFill} />
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 22 }}>
        <View style={styles.topRow}>
          <Pressable onPress={back} accessibilityRole="button" accessibilityLabel="Voltar" style={styles.roundButton}>
            <ChevronLeft size={22} color={C.white} strokeWidth={2} />
          </Pressable>
          <Pressable onPress={() => void share()} accessibilityRole="button" accessibilityLabel="Compartilhar campeonato" style={styles.roundButton}>
            <Share2 size={18} color={C.white} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.contextRow}>
          <View style={[styles.statusPill, live ? { backgroundColor: C.primary } : { backgroundColor: "rgba(255,255,255,.14)" }]}>
            {live && <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: C.onPrimary }} />}
            <RNText style={{ fontFamily: F.extrabold, fontSize: 11.5, color: live ? C.onPrimary : C.white }}>{statusLabel}</RNText>
          </View>
          <RNText style={{ fontFamily: F.semibold, fontSize: 12, color: "rgba(255,255,255,.72)", flexShrink: 1 }}>{context}</RNText>
        </View>

        <RNText accessibilityRole="header" style={styles.title}>{championship.name}</RNText>

        <Pressable onPress={() => router.push(`/organizer/${championship.organization.id}` as never)} accessibilityRole="link" style={styles.orgRow}>
          {championship.organization.logoUrl ? (
            <Avatar name={championship.organization.name} photoUrl={championship.organization.logoUrl} size={24} radius={7} />
          ) : (
            <View style={styles.orgIni}><RNText style={{ fontFamily: F.extrabold, fontSize: 10, color: C.onPrimary }}>{initials(championship.organization.name)}</RNText></View>
          )}
          <RNText style={{ fontFamily: F.bold, fontSize: 13, color: C.white }}>{championship.organization.name}</RNText>
          <ChevronRight size={14} color="rgba(255,255,255,.5)" />
        </Pressable>

        {(dates || championship.location) && (
          <View style={{ gap: 5, marginTop: 12 }}>
            {dates && <View style={styles.metaRow}><CalendarDays size={14} color="rgba(255,255,255,.6)" /><RNText style={styles.metaText}>{dates}</RNText></View>}
            {championship.location && <View style={styles.metaRow}><MapPin size={14} color="rgba(255,255,255,.6)" /><RNText style={styles.metaText}>{championship.location}</RNText></View>}
          </View>
        )}

        {(championship.event || championship.description) && (
          <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
            {championship.event && (
              <Pressable onPress={() => router.push(`/event/${championship.event!.slug}` as never)} accessibilityRole="button" style={[styles.button, { backgroundColor: C.primary }]}>
                <Ticket size={15} color={C.onPrimary} />
                <RNText style={{ fontFamily: F.bold, fontSize: 13, color: C.onPrimary }}>Ver evento</RNText>
              </Pressable>
            )}
            {championship.description && (
              <Pressable onPress={() => setAboutOpen((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: aboutOpen }} style={[styles.button, styles.ghostButton]}>
                <RNText style={{ fontFamily: F.bold, fontSize: 13, color: C.white }}>Sobre</RNText>
                {aboutOpen ? <ChevronUp size={15} color={C.white} /> : <ChevronDown size={15} color={C.white} />}
              </Pressable>
            )}
          </View>
        )}
        {aboutOpen && championship.description && <RNText style={styles.about}>{championship.description}</RNText>}

        {champion && (
          <View style={styles.champion}>
            <Avatar entry={champion} size={42} fontSize={13} bg={C.onPrimary} color={C.primaryGlow} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <RNText style={{ fontFamily: F.extrabold, fontSize: 11, letterSpacing: 0.5, color: C.onPrimary }}>CAMPEÃO{single ? "" : ` · ${category.name.toUpperCase()}`}</RNText>
              <RNText numberOfLines={1} style={{ fontFamily: F.extrabold, fontSize: 16, color: C.onPrimary }}>{champion.name}</RNText>
            </View>
            <Trophy size={24} color={C.onPrimary} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: C.dark, overflow: "hidden" },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  roundButton: { width: 40, height: 40, borderRadius: 999, backgroundColor: "rgba(255,255,255,.12)", alignItems: "center", justifyContent: "center" },
  contextRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16, flexWrap: "wrap" },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, paddingHorizontal: 11, paddingVertical: 5 },
  title: { marginTop: 10, fontFamily: F.extrabold, fontSize: 24, lineHeight: 29, letterSpacing: -0.4, color: C.white },
  orgRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, alignSelf: "flex-start" },
  orgIni: { width: 24, height: 24, borderRadius: 7, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  metaText: { fontFamily: F.regular, fontSize: 12.5, color: "rgba(255,255,255,.82)" },
  button: { height: 40, paddingHorizontal: 16, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 7 },
  ghostButton: { borderWidth: 1, borderColor: "rgba(255,255,255,.18)", backgroundColor: "rgba(255,255,255,.08)" },
  about: { marginTop: 12, fontFamily: F.regular, fontSize: 13, lineHeight: 20, color: "rgba(255,255,255,.78)" },
  champion: { marginTop: 16, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.primary, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 },
});
