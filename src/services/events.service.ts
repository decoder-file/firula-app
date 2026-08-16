import { apiClient } from "@/api/client";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/api/types";
import type { EventCategory, EventData } from "@/data/mockData";

export interface PlatformEventOrganization {
  id: string;
  tradeName: string;
  slug: string;
}

export interface PlatformEventLocation {
  city: string;
  state: string;
}

export interface PlatformEvent {
  id: string;
  name: string;
  slug: string | null;
  startsAt: string;
  status: string;
  isFeatured: boolean;
  isTrending: boolean;
  minTicketPrice?: number | null;
  ticketPricingStatus?: string | null;
  isFreeEvent?: boolean;
  hasTicketLots?: boolean;
  coverUrl: string | null;
  imageUrl?: string | null;
  organization: PlatformEventOrganization;
  location: PlatformEventLocation;
}

export interface PlatformEventsPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PlatformEventsPage {
  data: PlatformEvent[];
  pagination: PlatformEventsPagination;
}

interface PlatformEventsResponse {
  success: boolean;
  data: {
    source: string;
    events: PlatformEvent[];
  };
}

interface AdminEventsResponse {
  success: boolean;
  data: PlatformEventsPage;
}

export interface AdminEventTicketLot {
  id: string;
  name: string;
  description: string | null;
  type: string;
  price: number;
  quantity: number;
  quantitySold: number;
  salesStart: string;
  salesEnd: string;
  active: boolean;
  /** Datas/horários válidos, presente quando `type === "PASSPORT"`. */
  passportValidDates?: string[];
}

export interface AdminEventDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  startsAt: string;
  totalCapacity: number;
  soldCount: number;
  status: string;
  coverUrl: string | null;
  organization: {
    id: string;
    tradeName: string;
    slug: string;
    city: string;
    state: string;
    email: string;
    phone: string;
    description: string | null;
    website: string | null;
    instagram: string | null;
  };
  location: {
    city: string;
    state: string;
    address: string;
    addressNumber: string;
    addressComplement: string | null;
    neighborhood: string;
    postalCode: string;
  };
  policies: {
    allowCancellation: boolean;
    allowTransfer: boolean;
    allowHalfPrice: boolean;
    hasTerms: boolean;
  };
  settings: {
    limitPerCpf: boolean;
    maxTicketsPerCpf: number;
    showParticipantsOnEventPage?: boolean;
    ticketPageAccentColor?: string | null;
    /** Se os dados de cada participante são exigidos antes do pagamento ou podem ser preenchidos depois. */
    attendeeDataStrategy?: "REQUIRED_BEFORE_PAYMENT" | "OPTIONAL_AFTER_PAYMENT";
  };
  ticketLots: AdminEventTicketLot[];
  sports: Array<{ name: string; slug: string }>;
  customFields: Array<{
    id: string;
    key: string;
    label: string;
    type: string;
    required: boolean;
    options?: Array<{ id: string; label: string; value: string; sortOrder: number }>;
    /** Lotes aos quais o campo se aplica. Vazio = campo global (vale pra qualquer ingresso). */
    ticketLotIds: string[];
  }>;
  eventTerms: Array<{
    id: string;
    title: string;
    description: string;
    required: boolean;
    status: string;
    ticketLotId: string | null;
    currentVersion: { fileUrl: string | null } | null;
  }>;
  featuredPeople: Array<{
    id: string;
    name: string;
    photoUrl: string | null;
    shortDescription: string | null;
    description: string | null;
    instagram: string | null;
    position: number;
  }>;
}

export interface EventParticipant {
  id: string;
  name: string;
  photoUrl: string | null;
  username: string | null;
  verified: boolean;
}

export interface EventParticipantsPage {
  participants: EventParticipant[];
  total: number;
  skip: number;
  take: number;
}

interface AdminEventDetailResponse {
  success: boolean;
  data: AdminEventDetail;
}

export interface GetEventsParams extends PaginationParams {
  category?: EventCategory;
  city?: string;
  search?: string;
}

export interface GetUpcomingEventsParams {
  search?: string;
  city?: string;
  sportSlug?: string;
  period?: "upcoming" | "past";
  page?: number;
  pageSize?: number;
}

export const resolvePlatformEventImageUrl = (
  event: Pick<PlatformEvent, "coverUrl" | "imageUrl">,
): string | null => {
  const candidate = event.imageUrl ?? event.coverUrl;
  if (!candidate) {
    return null;
  }

  const raw = candidate.trim();
  if (!raw) {
    return null;
  }

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  const apiBase = process.env.EXPO_PUBLIC_API_URL;
  if (!apiBase) {
    return null;
  }

  try {
    return new URL(raw, apiBase).toString();
  } catch {
    return null;
  }
};

/** Maps a PlatformEvent to a minimal EventCardItem-compatible object. */
export const platformEventToCardItem = (event: PlatformEvent) => {
  const imageUrl = resolvePlatformEventImageUrl(event);

  return {
    id: event.id,
    slug: event.slug ?? undefined,
    title: event.name,
    date: event.startsAt.split("T")[0],
    city: `${event.location.city}, ${event.location.state}`,
    eventType: "",
    image: imageUrl ? { uri: imageUrl } : null,
  };
};

export const eventsService = {
  getAll: async (
    params?: GetEventsParams,
  ): Promise<PaginatedResponse<EventData>> => {
    const { data } = await apiClient.get<PaginatedResponse<EventData>>(
      "/events",
      { params },
    );
    return data;
  },

  getById: async (id: string): Promise<EventData> => {
    const { data } = await apiClient.get<ApiResponse<EventData>>(
      `/events/${id}`,
    );
    return data.data;
  },

  getFeatured: async (): Promise<PlatformEvent[]> => {
    const { data } = await apiClient.get<PlatformEventsResponse>(
      "/platform/events/featured",
    );
    return data.data.events;
  },

  getTrending: async (): Promise<PlatformEvent[]> => {
    const { data } = await apiClient.get<PlatformEventsResponse>(
      "/platform/events/trending",
    );
    return data.data.events;
  },

  getBySlug: async (slug: string): Promise<AdminEventDetail> => {
    const { data } = await apiClient.get<AdminEventDetailResponse>(
      `/admin/events/slug/${slug}`,
    );
    return data.data;
  },

  getParticipants: async (
    eventId: string,
    skip = 0,
    take = 30,
  ): Promise<EventParticipantsPage> => {
    const { data } = await apiClient.get<
      ApiResponse<{
        participants?: Array<{
          id?: string;
          name?: string | null;
          photoUrl?: string | null;
          avatarUrl?: string | null;
          username?: string | null;
          isVerified?: boolean;
          verified?: boolean;
        }>;
        total?: number;
        skip?: number;
        take?: number;
      }>
    >(`/public/events/${encodeURIComponent(eventId)}/participants`, {
      params: { skip, take },
    });

    const payload = data.data;
    const participants = (payload.participants ?? []).map((participant, index) => ({
      id: participant.id ?? participant.username ?? `${skip + index}-${participant.name ?? "participante"}`,
      name: participant.name?.trim() || "Participante",
      photoUrl: participant.photoUrl ?? participant.avatarUrl ?? null,
      username: participant.username?.trim() || null,
      verified: Boolean(participant.isVerified ?? participant.verified),
    }));

    return {
      participants,
      total: Number(payload.total ?? participants.length),
      skip: Number(payload.skip ?? skip),
      take: Number(payload.take ?? take),
    };
  },

  getUpcoming: async (
    params?: GetUpcomingEventsParams,
  ): Promise<PlatformEventsPage> => {
    const clean: Record<string, string | number> = {};
    // if (params?.period) clean.period = params.period;
    if (params?.search) clean.search = params.search;
    if (params?.city) clean.city = params.city;
    if (params?.sportSlug) clean.sportSlug = params.sportSlug;
    if (params?.page) clean.page = params.page;
    if (params?.pageSize) clean.pageSize = params.pageSize;

    const { data } = await apiClient.get<AdminEventsResponse>("/admin/events", {
      params: Object.keys(clean).length > 0 ? clean : undefined,
    });
    return data.data;
  },
};
