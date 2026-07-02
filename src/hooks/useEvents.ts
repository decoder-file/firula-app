import { useQuery } from "@tanstack/react-query";

import { eventsService } from "@/services/events.service";
import type { GetEventsParams, GetUpcomingEventsParams } from "@/services/events.service";

import { queryKeys } from "./queryKeys";

export const useEvents = (params?: GetEventsParams) =>
  useQuery({
    queryKey: queryKeys.events.list(params),
    queryFn: () => eventsService.getAll(params),
  });

export const useEvent = (id: string) =>
  useQuery({
    queryKey: queryKeys.events.detail(id),
    queryFn: () => eventsService.getById(id),
    enabled: Boolean(id),
  });

export const useFeaturedEvents = () =>
  useQuery({
    queryKey: queryKeys.events.featured(),
    queryFn: eventsService.getFeatured,
  });

export const useTrendingEvents = () =>
  useQuery({
    queryKey: queryKeys.events.trending(),
    queryFn: eventsService.getTrending,
  });

export const useUpcomingEvents = (params?: GetUpcomingEventsParams) =>
  useQuery({
    queryKey: queryKeys.events.upcoming(params),
    queryFn: () => eventsService.getUpcoming(params),
  });

export const useEventBySlug = (slug: string) =>
  useQuery({
    queryKey: queryKeys.events.detailBySlug(slug),
    queryFn: () => eventsService.getBySlug(slug),
    enabled: Boolean(slug),
  });
