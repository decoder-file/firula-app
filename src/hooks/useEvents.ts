import { useQuery } from "@tanstack/react-query";

import { eventsService } from "@/services/events.service";
import type { GetEventsParams } from "@/services/events.service";
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
