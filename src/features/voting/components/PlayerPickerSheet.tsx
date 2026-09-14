import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Check, Search } from "lucide-react-native";

import { Avatar, BottomSheet, Button, Chip, Text, useTheme } from "@/design-system";
import type { BallotPosition, VotingPlayer } from "@/services/voting.service";
import type { BallotDraft } from "@/utils/votingBallot";

interface PlayerPickerSheetProps {
  position: BallotPosition | null;
  positions: BallotPosition[];
  draft: BallotDraft;
  onSelect: (positionId: string, playerId: string) => void;
  onClear: (positionId: string) => void;
  onClose: () => void;
}

/** Lista de atletas elegíveis para a posição tocada — busca, filtro por escola, A→Z. */
export function PlayerPickerSheet({ position, positions, draft, onSelect, onClear, onClose }: PlayerPickerSheetProps) {
  const { colors, spacing, radius } = useTheme();
  const [search, setSearch] = useState("");
  const [schoolFilter, setSchoolFilter] = useState<string | null>(null);

  const schools = useMemo(() => {
    const map = new Map<string, string>();
    position?.players.forEach((player) => map.set(player.school.name, player.school.shortName ?? player.school.name));
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
  }, [position]);

  const placedElsewhere = useMemo(() => {
    const map = new Map<string, string>();
    for (const [positionId, playerId] of Object.entries(draft)) {
      if (positionId !== position?.id) map.set(playerId, positions.find((item) => item.id === positionId)?.shortLabel ?? "");
    }
    return map;
  }, [draft, position, positions]);

  const players = useMemo(() => {
    if (!position) return [];
    const needle = search.trim().toLowerCase();
    return position.players
      .filter((player) => (!needle || player.name.toLowerCase().includes(needle)) && (!schoolFilter || player.school.name === schoolFilter))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [position, search, schoolFilter]);

  const selectedId = position ? draft[position.id] : undefined;

  const handleClose = () => {
    setSearch("");
    setSchoolFilter(null);
    onClose();
  };

  return (
    <BottomSheet visible={position !== null} title={position?.label ?? ""} onClose={handleClose}>
      <View style={{ gap: spacing.s3 }}>
        <View style={[styles.search, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, borderRadius: radius.md }]}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={`Buscar ${position?.label.toLowerCase() ?? "jogador"}`}
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Buscar jogador"
            style={[styles.searchInput, { color: colors.text }]}
            autoCorrect={false}
          />
        </View>

        {schools.length > 1 && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[["", "Todas"] as [string, string], ...schools]}
            keyExtractor={([name]) => name || "all"}
            contentContainerStyle={{ gap: spacing.s2 }}
            renderItem={({ item: [name, short] }) => (
              <Chip label={short} selected={name === "" ? schoolFilter === null : schoolFilter === name} onPress={() => setSchoolFilter(name === "" ? null : name === schoolFilter ? null : name)} />
            )}
          />
        )}

        <FlatList
          data={players}
          keyExtractor={(player) => player.id}
          style={{ maxHeight: 380 }}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
          ListEmptyComponent={
            <Text color="muted" style={{ textAlign: "center", paddingVertical: spacing.s6 }}>
              Nenhum jogador disponível para esta posição.
            </Text>
          }
          renderItem={({ item: player }) => (
            <PlayerRow
              player={player}
              selected={selectedId === player.id}
              elsewhere={placedElsewhere.get(player.id)}
              onPress={() => {
                if (!position) return;
                onSelect(position.id, player.id);
                handleClose();
              }}
            />
          )}
        />

        {selectedId && position && (
          <Button
            label="Remover do time"
            variant="ghost"
            fullWidth
            onPress={() => {
              onClear(position.id);
              handleClose();
            }}
          />
        )}
      </View>
    </BottomSheet>
  );
}

function PlayerRow({ player, selected, elsewhere, onPress }: { player: VotingPlayer; selected: boolean; elsewhere?: string; onPress: () => void }) {
  const { colors, spacing } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${player.name}, ${player.school.name}${selected ? ", escalado" : ""}`}
      style={({ pressed }) => [styles.row, { paddingVertical: spacing.s3, backgroundColor: pressed ? colors.surfaceAlt : selected ? colors.primarySoft : "transparent" }]}
    >
      <Avatar name={player.name} source={player.photoUrl ? { uri: player.photoUrl } : null} size="sm" />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text token="label" numberOfLines={1}>
          {player.name}
          {player.jerseyNumber !== null && (
            <Text token="caption" color="muted">
              {"  "}#{player.jerseyNumber}
            </Text>
          )}
        </Text>
        <Text token="caption" color="muted" numberOfLines={1} style={{ textTransform: "none", letterSpacing: 0 }}>
          {player.school.name}
          {elsewhere ? ` · já escalado em ${elsewhere}` : ""}
        </Text>
      </View>
      <View style={[styles.pill, { borderColor: colors.primary, backgroundColor: selected ? colors.primary : "transparent" }]}>
        {selected && <Check size={14} color={colors.onPrimary} />}
        <Text token="caption" style={{ color: selected ? colors.onPrimary : colors.primaryText, textTransform: "none", letterSpacing: 0 }}>
          {selected ? "Escalado" : "Escolher"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, height: 44, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 4 },
  pill: { flexDirection: "row", alignItems: "center", gap: 4, height: 30, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 },
});
