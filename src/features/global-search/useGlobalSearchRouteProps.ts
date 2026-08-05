import { useState } from "react";
import { useRouter } from "expo-router";

import { useGlobalSearch } from "@/hooks/useSearch";
import type { SearchEvent, SearchOrganization, SearchUser } from "@/services/search.service";
import type { GlobalSearchScreenProps } from "@/features/global-search/types";

export function useGlobalSearchRouteProps(): GlobalSearchScreenProps {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const { data, isPending, isError, enabled } = useGlobalSearch(query);

  return {
    query,
    onQueryChange: setQuery,
    organizations: data?.organizations ?? [],
    events: data?.events ?? [],
    users: data?.users ?? [],
    isEnabled: enabled,
    isLoading: enabled && isPending,
    isError: enabled && isError,
    onClose: () => router.back(),
    onOpenOrganization: (organization: SearchOrganization) => {
      router.push(`/organizer/${organization.slug}` as never);
    },
    onOpenEvent: (event: SearchEvent) => {
      router.push(`/event/${event.slug ?? event.id}` as never);
    },
    onOpenUser: (user: SearchUser) => {
      router.push(`/player/${user.username}` as never);
    },
  };
}
