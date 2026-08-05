import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Avatar, BottomSheet, EmptyState, PressScale, SearchBar, Text, useTheme } from "@/design-system";
import { Users } from "lucide-react-native";
import type { FollowPerson, FollowTab } from "@/features/player-profile/types";

interface FollowListSheetProps {
  visible: boolean;
  onClose: () => void;
  profileName: string;
  initialTab: FollowTab;
  followers: FollowPerson[];
  following: FollowPerson[];
  onTogglePerson: (tab: FollowTab, personId: string) => void;
}

export function FollowListSheet({
  visible,
  onClose,
  profileName,
  initialTab,
  followers,
  following,
  onTogglePerson,
}: FollowListSheetProps) {
  const { colors, radius } = useTheme();
  const [tab, setTab] = useState<FollowTab>(initialTab);
  const [query, setQuery] = useState("");

  React.useEffect(() => {
    if (visible) {
      setTab(initialTab);
      setQuery("");
    }
  }, [visible, initialTab]);

  const list = tab === "followers" ? followers : following;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((person) => person.name.toLowerCase().includes(q));
  }, [list, query]);

  return (
    <BottomSheet visible={visible} title={profileName} onClose={onClose}>
      <View style={{ paddingHorizontal: 20 }}>
        <View style={[styles.tabs, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
          <PressScale
            onPress={() => setTab("followers")}
            style={[styles.tabBtn, { borderRadius: radius.md - 3 }, tab === "followers" && { backgroundColor: colors.surface }]}
            accessibilityRole="button"
            accessibilityLabel={`Seguidores, ${followers.length}`}
          >
            <Text token="label" style={{ fontSize: 13 }} color={tab === "followers" ? "default" : "muted"}>
              Seguidores · {followers.length}
            </Text>
          </PressScale>
          <PressScale
            onPress={() => setTab("following")}
            style={[styles.tabBtn, { borderRadius: radius.md - 3 }, tab === "following" && { backgroundColor: colors.surface }]}
            accessibilityRole="button"
            accessibilityLabel={`Seguindo, ${following.length}`}
          >
            <Text token="label" style={{ fontSize: 13 }} color={tab === "following" ? "default" : "muted"}>
              Seguindo · {following.length}
            </Text>
          </PressScale>
        </View>

        <View style={{ marginTop: 12, marginBottom: 4 }}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar" />
        </View>
      </View>

      <ScrollView style={{ maxHeight: 380 }} contentContainerStyle={{ paddingBottom: 8 }}>
        {filtered.length === 0 ? (
          <EmptyState icon={Users} variant="noResults" title="Ninguém encontrado" />
        ) : (
          filtered.map((person) => (
            <View key={person.id} style={styles.personRow}>
              <Avatar name={person.name} size="md" />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text token="bodySm" style={{ fontWeight: "700" }} numberOfLines={1}>
                  {person.name}
                </Text>
                <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0, marginTop: 1 }}>
                  {person.meta}
                </Text>
              </View>
              <PressScale
                onPress={() => onTogglePerson(tab, person.id)}
                accessibilityRole="button"
                accessibilityLabel={person.isFollowing ? `Deixar de seguir ${person.name}` : `Seguir ${person.name}`}
                style={[
                  styles.followBtn,
                  {
                    borderRadius: radius.md - 3,
                    backgroundColor: person.isFollowing ? colors.surface : colors.primary,
                    borderColor: person.isFollowing ? colors.border : colors.primary,
                  },
                ]}
              >
                <Text
                  token="caption"
                  style={{ fontWeight: "700", textTransform: "none", letterSpacing: 0 }}
                  color={person.isFollowing ? "default" : "onPrimary"}
                >
                  {person.isFollowing ? "Seguindo" : "Seguir"}
                </Text>
              </PressScale>
            </View>
          ))
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: "row", padding: 4, gap: 4 },
  tabBtn: { flex: 1, height: 36, alignItems: "center", justifyContent: "center" },
  personRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 9 },
  followBtn: { height: 32, paddingHorizontal: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
});
