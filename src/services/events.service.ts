import { apiClient } from "@/api/client";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/api/types";
import type { EventCategory, EventData } from "@/data/mockData";

export interface GetEventsParams extends PaginationParams {
  category?: EventCategory;
  city?: string;
  search?: string;
}

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

  getFeatured: async (): Promise<EventData[]> => {
    const { data } =
      await apiClient.get<ApiResponse<EventData[]>>("/events/featured");
    return data.data;
  },
};
