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
    trending: () => [...queryKeys.events.all, "trending"] as const,
    upcoming: (params?: object) =>
      [...queryKeys.events.all, "upcoming", { params }] as const,
    details: () => [...queryKeys.events.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.events.details(), id] as const,
    detailBySlug: (slug: string) => [...queryKeys.events.details(), "slug", slug] as const,
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
  organizer: {
    all: ["organizer"] as const,
    detail: (slug: string) => [...queryKeys.organizer.all, "detail", slug] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: () => [...queryKeys.notifications.all, "list"] as const,
    unreadCount: () => [...queryKeys.notifications.all, "unread-count"] as const,
  },
  favorites: {
    all: ["favorites"] as const,
    list: () => [...queryKeys.favorites.all, "list"] as const,
    check: (eventId: string) => [...queryKeys.favorites.all, "check", eventId] as const,
  },
  profile: {
    all: ["profile"] as const,
    customer: () => [...queryKeys.profile.all, "customer"] as const,
  },
} as const;
