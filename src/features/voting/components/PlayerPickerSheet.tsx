import { useMemo, useState } from "react";
import { FlatList, StyleSheet, TextInput, View, useWindowDimensions } from "react-native";
import { Check, Search } from "lucide-react-native";

import { Avatar, BottomSheet, Button, Chip, PressScale, Text, useTheme } from "@/design-system";
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
  const { height: windowHeight } = useWindowDimensions();
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
      <View style={[styles.body, { gap: spacing.s3 }]}>
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
          style={{ maxHeight: Math.max(240, Math.round(windowHeight * 0.45)) }}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={{ height: 1, marginLeft: 64, backgroundColor: colors.border }} />}
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
  const { colors, spacing, radius } = useTheme();
  return (
    // Estilo estático de propósito: a forma `style={({ pressed }) => …}` perde o layout da linha neste app.
    <PressScale
      onPress={onPress}
      scaleTo={0.985}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${player.name}, ${player.school.name}${selected ? ", escalado" : ""}`}
      style={[styles.row, { paddingVertical: spacing.s3, borderRadius: radius.md, backgroundColor: selected ? colors.primarySoft : "transparent" }]}
    >
      <Avatar name={player.name} source={player.photoUrl ? { uri: player.photoUrl } : null} size="md" />
      <View style={styles.rowText}>
        <View style={styles.nameLine}>
          <Text token="label" numberOfLines={1} style={styles.name}>
            {player.name}
          </Text>
          {player.jerseyNumber !== null && (
            <Text token="caption" color="muted" style={styles.jersey}>
              #{player.jerseyNumber}
            </Text>
          )}
        </View>
        <Text token="caption" color="muted" numberOfLines={1} style={styles.school}>
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
    </PressScale>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 20 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, height: 44, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 8 },
  rowText: { flex: 1, minWidth: 0, gap: 2 },
  nameLine: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  name: { flexShrink: 1 },
  jersey: { textTransform: "none", letterSpacing: 0 },
  school: { textTransform: "none", letterSpacing: 0 },
  pill: { flexDirection: "row", alignItems: "center", gap: 4, height: 30, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, flexShrink: 0 },
});
