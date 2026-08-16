import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { BadgeCheck, ChevronRight, Search, UsersRound, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useEventParticipants } from "@/hooks/useEvents";
import type { EventParticipant } from "@/services/events.service";
import { PressScale, Text, useTheme } from "@/design-system";

type ParticipantsSectionProps = { eventId: string };

export function ParticipantsSection({ eventId }: ParticipantsSectionProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const previewQuery = useEventParticipants(eventId, true, 5);
  const participants = previewQuery.data?.pages.flatMap((page) => page.participants) ?? [];
  const total = previewQuery.data?.pages[0]?.total ?? 0;

  if (previewQuery.isLoading) {
    return (
      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <PressScale
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Ver participantes"
        style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}
      >
        <View style={styles.headingRow}>
          <View>
            <Text token="subtitle" style={{ fontWeight: "800" }}>Participantes</Text>
            <Text token="caption" color="muted" style={styles.normalCaption}>
              {formatNumber(total)} {total === 1 ? "participante" : "participantes"}
            </Text>
          </View>
          <View style={[styles.chevron, { backgroundColor: colors.primarySoft }]}>
            <ChevronRight size={20} color={colors.primaryText} />
          </View>
        </View>

        {previewQuery.isError ? (
          <Pressable onPress={() => previewQuery.refetch()} style={styles.messageRow}>
            <UsersRound size={18} color={colors.textMuted} />
            <Text token="bodySm" color="muted" style={{ flex: 1 }}>Não foi possível carregar os participantes.</Text>
            <Text token="label" color="primary">Tentar novamente</Text>
          </Pressable>
        ) : total === 0 ? (
          <View style={styles.messageRow}>
            <UsersRound size={18} color={colors.textMuted} />
            <Text token="bodySm" color="muted">Ainda não há participantes</Text>
          </View>
        ) : (
          <View style={[styles.previewRow, { borderTopColor: colors.border }]}> 
            <AvatarStack participants={participants} total={total} />
            <Text token="bodySm" color="primary" style={{ fontWeight: "800" }}>Ver participantes</Text>
          </View>
        )}
      </PressScale>
      <ParticipantsModal eventId={eventId} visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

function ParticipantsModal({ eventId, visible, onClose }: { eventId: string; visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const query = useEventParticipants(eventId, visible, 30);
  const allParticipants = query.data?.pages.flatMap((page) => page.participants) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const participants = useMemo(
    () => normalizedSearch
      ? allParticipants.filter((item) =>
          `${item.name} ${item.username ?? ""}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
        )
      : allParticipants,
    [allParticipants, normalizedSearch],
  );

  useEffect(() => {
    if (normalizedSearch && query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [normalizedSearch, query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  const openProfile = (participant: EventParticipant) => {
    if (!participant.username) return;
    onClose();
    router.push(`/player/${encodeURIComponent(participant.username)}` as never);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.scrim, { backgroundColor: colors.overlay }]} onPress={onClose} />
      <View style={styles.modalAnchor} pointerEvents="box-none">
        <View style={[styles.modal, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 8 }]}> 
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}> 
            <View style={{ alignItems: "center" }}>
              <Text token="subtitle" style={{ fontWeight: "900" }}>Participantes</Text>
              <Text token="caption" color="muted" style={styles.normalCaption}>
                {formatNumber(total)} {total === 1 ? "participante" : "participantes"}
              </Text>
            </View>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar" style={[styles.close, { borderColor: colors.primary }]}> 
              <X size={22} color={colors.text} />
            </Pressable>
          </View>

          <View style={[styles.search, { backgroundColor: colors.background }]}> 
            <Search size={20} color={colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar participante"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.text }]}
              accessibilityLabel="Buscar participante"
            />
          </View>

          <FlatList
            data={participants}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.listContent}
            onEndReached={() => query.hasNextPage && !query.isFetchingNextPage && query.fetchNextPage()}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => (
              <ParticipantRow participant={item} onPress={() => openProfile(item)} colors={colors} />
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                {query.isLoading ? <ActivityIndicator color={colors.primary} /> : (
                  <>
                    <UsersRound size={30} color={colors.textMuted} />
                    <Text token="bodySm" color="muted" style={{ textAlign: "center" }}>
                      {query.isError ? "Não foi possível carregar os participantes." : normalizedSearch ? "Nenhum participante encontrado" : "Ainda não há participantes"}
                    </Text>
                    {query.isError ? <Pressable onPress={() => query.refetch()}><Text color="primary" token="label">Tentar novamente</Text></Pressable> : null}
                  </>
                )}
              </View>
            }
            ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator style={{ margin: 16 }} color={colors.primary} /> : null}
          />
        </View>
      </View>
    </Modal>
  );
}

function ParticipantRow({ participant, onPress, colors }: { participant: EventParticipant; onPress: () => void; colors: any }) {
  const enabled = Boolean(participant.username);
  return (
    <Pressable disabled={!enabled} onPress={onPress} style={[styles.person, { backgroundColor: colors.background, opacity: enabled ? 1 : 0.8 }]}> 
      <ParticipantAvatar participant={participant} size={48} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Text token="bodySm" numberOfLines={1} style={{ fontWeight: "800", flexShrink: 1 }}>{participant.name}</Text>
          {participant.verified ? <BadgeCheck size={16} color={colors.primary} /> : null}
        </View>
        {participant.username ? <Text token="caption" color="muted" style={styles.normalCaption}>@{participant.username}</Text> : null}
      </View>
      {enabled ? <ChevronRight size={17} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

function AvatarStack({ participants, total }: { participants: EventParticipant[]; total: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {participants.slice(0, 5).map((participant, index) => (
        <View key={`${participant.id}-${index}`} style={{ marginLeft: index === 0 ? 0 : -10 }}>
          <ParticipantAvatar participant={participant} size={42} />
        </View>
      ))}
      {total > participants.length ? (
        <View style={styles.more}><Text style={{ color: "white", fontWeight: "800", fontSize: 11 }}>+{formatNumber(total - participants.length)}</Text></View>
      ) : null}
    </View>
  );
}

function ParticipantAvatar({ participant, size }: { participant: EventParticipant; size: number }) {
  const initials = participant.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
  if (participant.photoUrl) return <Image source={{ uri: participant.photoUrl }} style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: "white" }} />;
  return <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}><Text style={{ color: "white", fontWeight: "800", fontSize: size * 0.3 }}>{initials || "?"}</Text></View>;
}

function formatNumber(value: number) { return new Intl.NumberFormat("pt-BR").format(value); }

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 22, minHeight: 82, justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  headingRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  chevron: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  normalCaption: { textTransform: "none", letterSpacing: 0 },
  messageRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16 },
  previewRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 16, marginTop: 16 },
  scrim: { ...StyleSheet.absoluteFillObject },
  modalAnchor: { flex: 1, justifyContent: "flex-end" },
  modal: { height: "82%", borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" },
  modalHeader: { minHeight: 66, alignItems: "center", justifyContent: "center", borderBottomWidth: StyleSheet.hairlineWidth },
  close: { position: "absolute", right: 12, top: 11, width: 44, height: 44, borderWidth: 2, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  search: { flexDirection: "row", alignItems: "center", minHeight: 52, borderRadius: 12, margin: 14, paddingHorizontal: 14, gap: 10 },
  input: { flex: 1, fontSize: 16, fontWeight: "600", paddingVertical: 10 },
  listContent: { paddingHorizontal: 14, paddingBottom: 20, flexGrow: 1 },
  person: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 16, marginBottom: 10, gap: 12 },
  empty: { flex: 1, minHeight: 220, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 30 },
  avatarFallback: { backgroundColor: "#27272A", borderWidth: 2, borderColor: "white", alignItems: "center", justifyContent: "center" },
  more: { marginLeft: -8, minWidth: 42, height: 42, paddingHorizontal: 8, borderRadius: 21, borderWidth: 2, borderColor: "white", backgroundColor: "#18181B", alignItems: "center", justifyContent: "center" },
});
