import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Users } from "lucide-react-native";
import { useRouter } from "expo-router";

import { Avatar, BottomSheet, EmptyState, PressScale, SearchBar, Text, useTheme } from "@/design-system";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { usePublicProfileFollowers, usePublicProfileFollowing, useToggleFollowByUsername } from "@/hooks/usePublicProfile";
import type { FollowPerson, FollowTab } from "@/features/player-profile/types";

const TAKE = 20;

interface FollowListSheetProps {
  visible: boolean;
  onClose: () => void;
  profileName: string;
  username: string;
  initialTab: FollowTab;
  followersCount: number;
  followingCount: number;
  onOpenPerson: (person: FollowPerson) => void;
}

export function FollowListSheet({
  visible,
  onClose,
  profileName,
  username,
  initialTab,
  followersCount,
  followingCount,
  onOpenPerson,
}: FollowListSheetProps) {
  const { colors, radius } = useTheme();
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const toggleFollow = useToggleFollowByUsername();

  const [tab, setTab] = useState<FollowTab>(initialTab);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<FollowPerson[]>([]);

  useEffect(() => {
    if (visible) {
      setTab(initialTab);
      setQuery("");
      setPage(1);
      setItems([]);
    }
  }, [visible, initialTab]);

  // Reseta page/items no MESMO commit que troca a aba (não num useEffect
  // separado reagindo a [tab]) — dois efeitos reagindo à mesma mudança
  // fazia o efeito de mapeamento ler um `page` velho (de antes do reset) e
  // renderizar um pedaço errado da lista por um instante.
  const selectTab = (next: FollowTab) => {
    setTab(next);
    setPage(1);
    setItems([]);
  };

  const skip = (page - 1) * TAKE;
  const followersQuery = usePublicProfileFollowers(username, skip, TAKE, visible && tab === "followers");
  const followingQuery = usePublicProfileFollowing(username, skip, TAKE, visible && tab === "following");
  const activeQuery = tab === "followers" ? followersQuery : followingQuery;
  const total = tab === "followers" ? followersQuery.data?.total : followingQuery.data?.peopleTotal;

  useEffect(() => {
    const raw = tab === "followers" ? followersQuery.data?.followers : followingQuery.data?.following;
    if (!raw) return;

    const mapped: FollowPerson[] = raw.map((person) => ({
      identityId: person.identityId,
      username: person.username,
      name: person.name,
      photoUrl: person.photoUrl,
      isFollowing: person.isFollowing,
    }));

    setItems((previous) => {
      if (page === 1) return mapped;
      const seen = new Set(previous.map((item) => item.identityId));
      return [...previous, ...mapped.filter((item) => !seen.has(item.identityId))];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followersQuery.data, followingQuery.data, tab, page]);

  const canLoadMore = typeof total === "number" && items.length < total;
  const handleLoadMore = () => {
    if (!canLoadMore || activeQuery.isFetching) return;
    setPage((current) => current + 1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (person) => person.name.toLowerCase().includes(q) || (person.username?.toLowerCase().includes(q) ?? false),
    );
  }, [items, query]);

  const isFirstLoad = activeQuery.isPending && page === 1;

  const handleToggleFollow = (person: FollowPerson) => {
    if (!person.username) return;
    if (!isAuthenticated) {
      onClose();
      router.push(`/login-modal?redirectTo=/player/${username}` as never);
      return;
    }

    const targetUsername = person.username;
    toggleFollow.mutate(
      { username: targetUsername, isFollowing: person.isFollowing },
      {
        onSuccess: () => {
          setItems((previous) =>
            previous.map((item) =>
              item.identityId === person.identityId ? { ...item, isFollowing: !item.isFollowing } : item,
            ),
          );
        },
      },
    );
  };

  return (
    <BottomSheet visible={visible} title={profileName} onClose={onClose}>
      <View style={{ paddingHorizontal: 20 }}>
        <View style={[styles.tabs, { backgroundColor: colors.surfaceAlt, borderRadius: radius.md }]}>
          <PressScale
            onPress={() => selectTab("followers")}
            style={[styles.tabBtn, { borderRadius: radius.md - 3 }, tab === "followers" && { backgroundColor: colors.surface }]}
            accessibilityRole="button"
            accessibilityLabel={`Seguidores, ${followersCount}`}
          >
            <Text token="label" style={{ fontSize: 13 }} color={tab === "followers" ? "default" : "muted"}>
              Seguidores · {followersCount}
            </Text>
          </PressScale>
          <PressScale
            onPress={() => selectTab("following")}
            style={[styles.tabBtn, { borderRadius: radius.md - 3 }, tab === "following" && { backgroundColor: colors.surface }]}
            accessibilityRole="button"
            accessibilityLabel={`Seguindo, ${followingCount}`}
          >
            <Text token="label" style={{ fontSize: 13 }} color={tab === "following" ? "default" : "muted"}>
              Seguindo · {followingCount}
            </Text>
          </PressScale>
        </View>

        <View style={{ marginTop: 12, marginBottom: 4 }}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar" />
        </View>
      </View>

      <ScrollView style={{ maxHeight: 380 }} contentContainerStyle={{ paddingBottom: 8 }}>
        {isFirstLoad ? (
          <View style={{ paddingVertical: 32, alignItems: "center" }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} variant="noResults" title="Ninguém encontrado" />
        ) : (
          <>
            {filtered.map((person) => (
              <View key={person.identityId} style={styles.personRow}>
                <PressScale
                  onPress={() => person.username && onOpenPerson(person)}
                  disabled={!person.username}
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir perfil de ${person.name}`}
                  style={styles.personInfo}
                >
                  <Avatar name={person.name} size="md" source={person.photoUrl ? { uri: person.photoUrl } : null} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text token="bodySm" style={{ fontWeight: "700" }} numberOfLines={1}>
                      {person.name}
                    </Text>
                    {person.username ? (
                      <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0, marginTop: 1 }} numberOfLines={1}>
                        @{person.username}
                      </Text>
                    ) : null}
                  </View>
                </PressScale>
                {person.username ? (
                  <PressScale
                    onPress={() => handleToggleFollow(person)}
                    disabled={toggleFollow.isPending}
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
                ) : null}
              </View>
            ))}
            {canLoadMore && !query ? (
              <PressScale
                onPress={handleLoadMore}
                accessibilityRole="button"
                accessibilityLabel="Carregar mais"
                style={{ paddingVertical: 16, alignItems: "center" }}
              >
                {activeQuery.isFetching ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text token="label" color="primary" style={{ fontSize: 13 }}>
                    Carregar mais
                  </Text>
                )}
              </PressScale>
            ) : null}
          </>
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: "row", padding: 4, gap: 4 },
  tabBtn: { flex: 1, height: 36, alignItems: "center", justifyContent: "center" },
  personRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 9 },
  personInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12, minWidth: 0 },
  followBtn: { height: 32, paddingHorizontal: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
});
