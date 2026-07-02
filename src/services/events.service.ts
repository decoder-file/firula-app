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
  coverUrl: string | null;
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
  };
  ticketLots: AdminEventTicketLot[];
  sports: Array<{ name: string; slug: string }>;
  customFields: Array<{
    id: string;
    key: string;
    label: string;
    type: string;
    required: boolean;
  }>;
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

/** Maps a PlatformEvent to a minimal EventCardItem-compatible object. */
export const platformEventToCardItem = (event: PlatformEvent) => ({
  id: event.id,
  slug: event.slug ?? undefined,
  title: event.name,
  date: event.startsAt.split("T")[0],
  city: `${event.location.city}, ${event.location.state}`,
  eventType: "",
  image: event.coverUrl ? { uri: event.coverUrl } : null,
});

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

  getUpcoming: async (
    params?: GetUpcomingEventsParams,
  ): Promise<PlatformEventsPage> => {
    const clean: Record<string, string | number> = {};
    if (params?.period) clean.period = params.period;
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
