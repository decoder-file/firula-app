import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import type { ImageSourcePropType } from "react-native";

import { useAuthUser, useIsAuthenticated, useMe } from "@/hooks/useAuth";
import {
  useFeaturedEvents,
  useTrendingEvents,
  useUpcomingEvents,
  useUpcomingEventsWhen,
} from "@/hooks/useEvents";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useSports } from "@/hooks/useSports";
import {
  resolvePlatformEventImageUrl,
  type PlatformEvent,
} from "@/services/events.service";

import {
  getSportIconBySlug,
  HOME_DEFAULT_CATEGORIES,
} from "@/features/home/constants";
import type { HomeEvent, HomeScreenProps } from "@/features/home/types";

const FALLBACK_EVENT_IMAGE = require("../../../assets/events/event-running.jpg");

const getFirstName = (name?: string | null): string | null => {
  const normalized = name?.trim();
  if (!normalized) {
    return null;
  }

  return normalized.split(/\s+/)[0] ?? null;
};

const CATEGORY_TYPE_LABEL: Record<string, string> = {
  futebol: "Futebol",
  futevolei: "Futevôlei",
  "beach-tennis": "Beach Tennis",
  corrida: "Corrida",
  surf: "Surf",
  yoga: "Yoga",
};

export const inferCategoryFromName = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("beach")) return "beach-tennis";
  if (n.includes("futev") || n.includes("futv")) return "futevolei";
  if (n.includes("futebol") || n.includes("soccer")) return "futebol";
  if (n.includes("corrida") || n.includes("run") || n.includes("marat")) return "corrida";
  if (n.includes("surf")) return "surf";
  if (n.includes("yoga")) return "yoga";
  return "todos";
};

const formatDateBits = (isoDate: string) => {
  const date = new Date(isoDate);
  const day = date.toLocaleDateString("pt-BR", { day: "2-digit" });
  const mon = date
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "")
    .toUpperCase();
  const dateLabel = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  return { day, mon, dateLabel };
};

const formatCurrencyFromCents = (valueInCents: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInCents / 100);

const getStartingPriceLabel = (event: PlatformEvent): string => {
  if (event.ticketPricingStatus === "FREE" || event.isFreeEvent) {
    return "Gratuito";
  }

  if (event.hasTicketLots === false) {
    return "A confirmar";
  }

  if (
    typeof event.minTicketPrice === "number" &&
    Number.isFinite(event.minTicketPrice) &&
    event.minTicketPrice > 0
  ) {
    return formatCurrencyFromCents(event.minTicketPrice);
  }

  return "A confirmar";
};

export const mapEventToHomeItem = (
  event: PlatformEvent,
  isHot: boolean,
): HomeEvent => {
  const category = inferCategoryFromName(event.name);
  const { day, mon, dateLabel } = formatDateBits(event.startsAt);
  const imageUrl = resolvePlatformEventImageUrl(event);

  return {
    id: event.slug ?? event.id,
    type: CATEGORY_TYPE_LABEL[category] ?? "Evento",
    category,
    title: event.name,
    city: `${event.location.city}, ${event.location.state}`,
    dateLabel,
    day,
    mon,
    price: getStartingPriceLabel(event),
    attendeesLabel: event.organization.tradeName,
    hot: isHot,
    image: imageUrl ? { uri: imageUrl } : FALLBACK_EVENT_IMAGE,
  };
};

export const useHomeRouteProps = (): HomeScreenProps => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [searchPage, setSearchPage] = useState(1);
  const [searchResults, setSearchResults] = useState<HomeEvent[]>([]);
  const isAuthenticated = useIsAuthenticated();
  const authUser = useAuthUser();

  const normalizedQuery = query.trim();
  const shouldSearch = normalizedQuery.length > 0;
  const selectedSportSlug =
    selectedCategory !== "todos" ? selectedCategory : undefined;

  const { data: me } = useMe();
  const { data: featuredData, isPending: isFeaturedPending } = useFeaturedEvents();
  const { data: trendingData, isPending: isTrendingPending } = useTrendingEvents();
  const { data: upcomingData, isPending: isUpcomingPending } = useUpcomingEvents({
    period: "upcoming",
    page: 1,
    pageSize: 50,
  });
  const { data: unreadCount } = useUnreadCount();
  const { data: sportsData } = useSports();
  const {
    data: searchPageData,
    isPending: isSearchPending,
    isFetching: isSearchFetching,
  } = useUpcomingEventsWhen(
    {
      search: normalizedQuery,
      sportSlug: selectedSportSlug,
      page: searchPage,
      pageSize: 20,
    },
    shouldSearch,
  );
  const displayName = authUser?.name || me?.name;
  const firstName = getFirstName(displayName) ?? "Atleta";
  const userAvatar: ImageSourcePropType | undefined =
    authUser?.photoUrl ? { uri: authUser.photoUrl } : undefined;

  const events = useMemo(() => {
    const featured = featuredData ?? [];
    const trending = trendingData ?? [];
    const upcoming = upcomingData?.data ?? [];

    const hotIds = new Set([...featured, ...trending].map((event) => event.id));

    const uniqueById = new Map<string, PlatformEvent>();
    [...featured, ...trending, ...upcoming].forEach((event) => {
      if (!uniqueById.has(event.id)) {
        uniqueById.set(event.id, event);
      }
    });

    return Array.from(uniqueById.values()).map((event) =>
      mapEventToHomeItem(
        event,
        hotIds.has(event.id) || event.isTrending || event.isFeatured,
      ),
    );
  }, [featuredData, trendingData, upcomingData?.data]);

  const categories = useMemo(() => {
    if (!sportsData?.length) {
      return HOME_DEFAULT_CATEGORIES;
    }

    const dynamicCategories = sportsData.map((sport) => ({
      id: sport.slug,
      label: sport.name,
      icon: getSportIconBySlug(sport.slug),
    }));

    return [HOME_DEFAULT_CATEGORIES[0], ...dynamicCategories];
  }, [sportsData]);

  useEffect(() => {
    setSearchPage(1);
  }, [normalizedQuery, selectedCategory]);

  useEffect(() => {
    if (!shouldSearch) {
      setSearchResults([]);
      return;
    }

    const mapped = (searchPageData?.data ?? []).map((event) =>
      mapEventToHomeItem(event, false),
    );

    if (searchPage === 1) {
      setSearchResults(mapped);
      return;
    }

    if (mapped.length === 0) {
      return;
    }

    setSearchResults((previous) => {
      const seen = new Set(previous.map((item) => item.id));
      const appended = mapped.filter((item) => !seen.has(item.id));
      return [...previous, ...appended];
    });
  }, [searchPageData?.data, searchPage, shouldSearch]);

  const canLoadMoreSearchResults =
    shouldSearch &&
    (searchPageData?.pagination?.page ?? 0) <
      (searchPageData?.pagination?.totalPages ?? 0);

  const handleLoadMoreSearchResults = () => {
    if (!canLoadMoreSearchResults || isSearchFetching) {
      return;
    }

    setSearchPage((current) => current + 1);
  };

  const openProtectedRoute = (authenticatedPath: string) => {
    if (!isAuthenticated) {
      router.push("/login-modal");
      return;
    }

    router.push(authenticatedPath as never);
  };

  return {
    userName: firstName,
    userAvatar,
    city: "Brasil",
    events,
    categories,
    query,
    selectedCategory,
    onQueryChange: setQuery,
    onCategoryChange: setSelectedCategory,
    searchResults,
    isSearchLoading: shouldSearch && isSearchPending,
    isSearchFetchingMore: shouldSearch && searchPage > 1 && isSearchFetching,
    canLoadMoreSearchResults,
    onLoadMoreSearchResults: handleLoadMoreSearchResults,
    isLoading: isFeaturedPending || isTrendingPending || isUpcomingPending,
    notificationCount: unreadCount ?? 0,
    onOpenNotifications: () => openProtectedRoute("/notifications"),
    onOpenProfile: () => openProtectedRoute("/(tabs)/profile"),
    onOpenEvent: (slugOrId) => router.push(`/event/${slugOrId}`),
    onSeeAll: () => router.push("/(tabs)/explore"),
  };
};
