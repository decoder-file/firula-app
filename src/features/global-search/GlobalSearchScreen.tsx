import React from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Building2, CalendarDays, SearchX, User } from "lucide-react-native";

import { EmptyState, SearchBar, Text, useTheme } from "@/design-system";
import { SearchResultRow } from "@/features/global-search/components/SearchResultRow";
import type { GlobalSearchScreenProps } from "@/features/global-search/types";

export function GlobalSearchScreen({
  query,
  onQueryChange,
  organizations,
  events,
  users,
  isEnabled,
  isLoading,
  isError,
  onClose,
  onOpenOrganization,
  onOpenEvent,
  onOpenUser,
}: GlobalSearchScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const hasResults = organizations.length > 0 || events.length > 0 || users.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 20,
          paddingTop: insets.top + 10,
          paddingBottom: 12,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flex: 1 }}>
          <SearchBar
            value={query}
            onChangeText={onQueryChange}
            placeholder="Buscar organizações, eventos e pessoas…"
            autoFocus
          />
        </View>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar busca" hitSlop={8}>
          <Text token="label" color="default" style={{ fontSize: 14 }}>
            Cancelar
          </Text>
        </Pressable>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 28 }}>
        {!isEnabled ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
            <Text token="bodySm" color="muted">
              Digite pelo menos 2 caracteres para buscar.
            </Text>
          </View>
        ) : isLoading ? (
          <View style={{ paddingTop: 40, alignItems: "center" }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : isError ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
            <Text token="bodySm" color="muted">
              Não foi possível buscar agora. Tente novamente.
            </Text>
          </View>
        ) : !hasResults ? (
          <EmptyState icon={SearchX} variant="noResults" title="Nenhum resultado encontrado" description={`Não encontramos nada para "${query.trim()}".`} />
        ) : (
          <>
            {organizations.length > 0 ? (
              <View style={{ paddingTop: 18 }}>
                <SectionTitle label="Organizações" />
                {organizations.map((org) => (
                  <SearchResultRow
                    key={org.id}
                    title={org.name}
                    imageUrl={org.logoUrl}
                    fallbackIcon={Building2}
                    onPress={() => onOpenOrganization(org)}
                  />
                ))}
              </View>
            ) : null}

            {events.length > 0 ? (
              <View style={{ paddingTop: 18 }}>
                <SectionTitle label="Eventos" />
                {events.map((event) => (
                  <SearchResultRow
                    key={event.id}
                    title={event.name}
                    subtitle={new Date(event.startsAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    imageUrl={event.coverUrl}
                    fallbackIcon={CalendarDays}
                    rounded={false}
                    onPress={() => onOpenEvent(event)}
                  />
                ))}
              </View>
            ) : null}

            {users.length > 0 ? (
              <View style={{ paddingTop: 18 }}>
                <SectionTitle label="Pessoas" />
                {users.map((user) => (
                  <SearchResultRow
                    key={user.username}
                    title={user.name}
                    subtitle={`@${user.username}`}
                    imageUrl={user.photoUrl}
                    fallbackIcon={User}
                    onPress={() => onOpenUser(user)}
                  />
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <Text
      token="caption"
      color="muted"
      style={{ textTransform: "uppercase", letterSpacing: 0.8, fontWeight: "700", paddingHorizontal: 20, marginBottom: 6 }}
    >
      {label}
    </Text>
  );
}
