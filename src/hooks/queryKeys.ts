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
    participants: (eventId: string, take: number) => [...queryKeys.events.details(), eventId, "participants", take] as const,
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
    storeProducts: (storeSlug: string) => [...queryKeys.organizer.all, "store-products", storeSlug] as const,
    dayUseOfferings: (orgSlug: string) => [...queryKeys.organizer.all, "day-use-offerings", orgSlug] as const,
    courts: (orgSlug: string) => [...queryKeys.organizer.all, "courts", orgSlug] as const,
    courtAvailability: (courtId: string, date: string) =>
      [...queryKeys.organizer.all, "court-availability", courtId, date] as const,
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
  sports: {
    all: ["sports"] as const,
    list: () => [...queryKeys.sports.all, "list"] as const,
  },
  search: {
    all: ["search"] as const,
    query: (q: string) => [...queryKeys.search.all, q] as const,
  },
  checkout: {
    all: ["checkout"] as const,
    quote: (eventId: string, selection: Record<string, number>, couponCode?: string) =>
      [...queryKeys.checkout.all, "quote", eventId, selection, couponCode ?? null] as const,
  },
  publicProfile: {
    all: ["publicProfile"] as const,
    detail: (username: string) => [...queryKeys.publicProfile.all, "detail", username] as const,
    followStatus: (username: string) => [...queryKeys.publicProfile.all, "follow-status", username] as const,
    // Prefixos sem skip/take: usados pra invalidar TODAS as páginas/perfis em
    // cache de uma vez quando um follow/unfollow acontece em qualquer lugar
    // do app — a lista de seguidores/seguindo de um perfil pode conter
    // qualquer pessoa, então não dá pra saber de antemão qual username
    // invalidar.
    followersAll: () => [...queryKeys.publicProfile.all, "followers"] as const,
    followers: (username: string, skip: number, take: number) =>
      [...queryKeys.publicProfile.followersAll(), username, skip, take] as const,
    followingAll: () => [...queryKeys.publicProfile.all, "following"] as const,
    following: (username: string, skip: number, take: number) =>
      [...queryKeys.publicProfile.followingAll(), username, skip, take] as const,
  },
} as const;
