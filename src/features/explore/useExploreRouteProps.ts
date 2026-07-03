import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";

import { useUpcomingEvents } from "@/hooks/useEvents";
import { useSports } from "@/hooks/useSports";
import {
  resolvePlatformEventImageUrl,
  type PlatformEvent,
} from "@/services/events.service";
import {
  EXPLORE_CATEGORIES,
  EXPLORE_DEFAULT_CATEGORY,
} from "@/features/explore/constants";
import type {
  ExploreCategory,
  ExploreEvent,
  ExploreRouteProps,
} from "@/features/explore/types";

const FALLBACK_EVENT_IMAGE = require("../../../assets/events/event-running.jpg");

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

const formatDateLabel = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

export const mapEventToExploreItem = (event: PlatformEvent): ExploreEvent => {
  const category = inferCategoryFromName(event.name);
  const imageUrl = resolvePlatformEventImageUrl(event);

  return {
    id: event.slug ?? event.id,
    type: CATEGORY_TYPE_LABEL[category] ?? "Evento",
    category,
    title: event.name,
    city: `${event.location.city}, ${event.location.state}`,
    dateLabel: formatDateLabel(event.startsAt),
    price: "A confirmar",
    attendeesLabel: event.organization.tradeName,
    hot: event.isTrending || event.isFeatured,
    image: imageUrl ? { uri: imageUrl } : FALLBACK_EVENT_IMAGE,
  };
};

export const useExploreRouteProps = (): ExploreRouteProps => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(EXPLORE_DEFAULT_CATEGORY);
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<ExploreEvent[]>([]);

  const normalizedQuery = query.trim();
  const selectedSportSlug =
    selectedCategory !== EXPLORE_DEFAULT_CATEGORY ? selectedCategory : undefined;

  const { data: sportsData } = useSports();
  const {
    data,
    isPending,
    isFetching,
  } = useUpcomingEvents({
    period: "upcoming",
    page,
    pageSize: 20,
    search: normalizedQuery || undefined,
    sportSlug: selectedSportSlug,
  });

  const categories = useMemo<ExploreCategory[]>(() => {
    if (!sportsData?.length) {
      return EXPLORE_CATEGORIES;
    }

    return [
      EXPLORE_CATEGORIES[0],
      ...sportsData.map((sport) => ({ id: sport.slug, label: sport.name })),
    ];
  }, [sportsData]);

  useEffect(() => {
    setPage(1);
  }, [normalizedQuery, selectedCategory]);

  useEffect(() => {
    const mapped = (data?.data ?? []).map(mapEventToExploreItem);

    if (page === 1) {
      setEvents(mapped);
      return;
    }

    if (mapped.length === 0) {
      return;
    }

    setEvents((previous) => {
      const seen = new Set(previous.map((item) => item.id));
      const appended = mapped.filter((item) => !seen.has(item.id));
      return [...previous, ...appended];
    });
  }, [data?.data, page]);

  const canLoadMore = (data?.pagination?.page ?? 0) < (data?.pagination?.totalPages ?? 0);

  const handleLoadMore = () => {
    if (!canLoadMore || isFetching) {
      return;
    }

    setPage((current) => current + 1);
  };

  return {
    events,
    categories,
    query,
    selectedCategory,
    onQueryChange: setQuery,
    onCategoryChange: setSelectedCategory,
    isLoading: isPending,
    isFetchingMore: page > 1 && isFetching,
    canLoadMore,
    onLoadMore: handleLoadMore,
    onOpenEvent: (slugOrId) => router.push(`/event/${slugOrId}`),
  };
};
