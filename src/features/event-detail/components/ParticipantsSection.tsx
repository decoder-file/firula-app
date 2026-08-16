import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import { EmptyState, PressScale, Text, useTheme } from "@/design-system";
import { InitialsAvatar } from "@/components/InitialsAvatar";

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
          <View style={{ marginTop: 16 }}>
            <EmptyState
              icon={UsersRound}
              title="Ainda não há participantes"
              description="Seja a primeira pessoa a participar deste evento."
            />
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
                {query.isLoading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : query.isError ? (
                  <EmptyState
                    variant="error"
                    icon={UsersRound}
                    title="Não foi possível carregar os participantes."
                    description="Tente novamente em alguns instantes."
                    actionLabel="Tentar novamente"
                    onAction={() => query.refetch()}
                  />
                ) : normalizedSearch ? (
                  <EmptyState
                    variant="noResults"
                    icon={Search}
                    title="Nenhum participante encontrado"
                  />
                ) : (
                  <EmptyState
                    variant="empty"
                    icon={UsersRound}
                    title="Ainda não há participantes"
                    description="Seja a primeira pessoa a participar deste evento."
                  />
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
      <InitialsAvatar name={participant.name} photoUrl={participant.photoUrl} size={48} />
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
          <InitialsAvatar name={participant.name} photoUrl={participant.photoUrl} size={42} />
        </View>
      ))}
      {total > participants.length ? (
        <View style={styles.more}><Text style={{ color: "white", fontWeight: "800", fontSize: 11 }}>+{formatCompactNumber(total - participants.length)}</Text></View>
      ) : null}
    </View>
  );
}

function formatNumber(value: number) { return new Intl.NumberFormat("pt-BR").format(value); }

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

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
  more: { marginLeft: -8, minWidth: 42, height: 42, paddingHorizontal: 8, borderRadius: 21, borderWidth: 2, borderColor: "white", backgroundColor: "#18181B", alignItems: "center", justifyContent: "center" },
});
