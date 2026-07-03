import { useMemo } from "react";
import { useRouter } from "expo-router";

import { useMe } from "@/hooks/useAuth";
import {
  useFeaturedEvents,
  useTrendingEvents,
  useUpcomingEvents,
} from "@/hooks/useEvents";
import { useUnreadCount } from "@/hooks/useNotifications";
import type { PlatformEvent } from "@/services/events.service";

import type { HomeEvent, HomeScreenProps } from "@/features/home/types";

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

export const mapEventToHomeItem = (
  event: PlatformEvent,
  isHot: boolean,
): HomeEvent => {
  const category = inferCategoryFromName(event.name);
  const { day, mon, dateLabel } = formatDateBits(event.startsAt);
  return {
    id: event.slug ?? event.id,
    type: CATEGORY_TYPE_LABEL[category] ?? "Evento",
    category,
    title: event.name,
    city: `${event.location.city}, ${event.location.state}`,
    dateLabel,
    day,
    mon,
    price: "A confirmar",
    attendeesLabel: event.organization.tradeName,
    hot: isHot,
    image: event.coverUrl ? { uri: event.coverUrl } : FALLBACK_EVENT_IMAGE,
  };
};

export const useHomeRouteProps = (): HomeScreenProps => {
  const router = useRouter();
  const { data: me } = useMe();
  const { data: featuredData } = useFeaturedEvents();
  const { data: trendingData } = useTrendingEvents();
  const { data: upcomingData } = useUpcomingEvents({
    period: "upcoming",
    page: 1,
    pageSize: 50,
  });
  const { data: unreadCount } = useUnreadCount();

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

  return {
    userName: me?.name || "Atleta",
    city: "Brasil",
    events,
    notificationCount: unreadCount ?? 0,
    onOpenNotifications: () => router.push("/notifications"),
    onOpenEvent: (slugOrId) => router.push(`/event/${slugOrId}`),
    onSeeAll: () => router.push("/(tabs)/explore"),
  };
};
