/**
 * Centralized React Query key factory.
 *
 * Keys are structured hierarchically so that broad invalidations work
 * correctly (e.g. invalidating `queryKeys.events.all` invalidates every
 * events-related query).
 */
export const queryKeys = {
  events: {
    all: ["events"] as const,
    lists: () => [...queryKeys.events.all, "list"] as const,
    list: (params?: object) =>
      [...queryKeys.events.lists(), { params }] as const,
    featured: () => [...queryKeys.events.all, "featured"] as const,
    details: () => [...queryKeys.events.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.events.details(), id] as const,
  },
  tickets: {
    all: ["tickets"] as const,
    mine: () => [...queryKeys.tickets.all, "mine"] as const,
    details: () => [...queryKeys.tickets.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.tickets.details(), id] as const,
  },
  users: {
    all: ["users"] as const,
    profile: () => [...queryKeys.users.all, "profile"] as const,
  },
} as const;
