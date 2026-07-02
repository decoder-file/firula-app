import { apiClient } from "@/api/client";

export interface FavoriteEvent {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  startsAt: string;
  status: string;
  totalCapacity: number;
  soldCount: number;
  coverUrl: string | null;
  location: {
    city: string;
    state: string;
    address: string;
  };
  ticketLots: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    quantitySold: number;
  }>;
  sports: Array<{ id: string; name: string; slug: string }>;
}

export interface FavoriteItem {
  favoriteId: string;
  addedAt: string;
  event: FavoriteEvent;
}

export interface FavoritesPage {
  total: number;
  skip: number;
  take: number;
  favorites: FavoriteItem[];
}

export const favoritesService = {
  getFavorites: async (skip = 0, take = 50): Promise<FavoritesPage> => {
    const { data } = await apiClient.get("/public/customer/favorites", {
      params: { skip, take },
    });
    return data.data;
  },

  add: async (eventId: string): Promise<void> => {
    await apiClient.post(`/public/customer/favorites/${eventId}`);
  },

  remove: async (eventId: string): Promise<void> => {
    await apiClient.delete(`/public/customer/favorites/${eventId}`);
  },

  check: async (eventId: string): Promise<{ isFavorited: boolean; favoriteId: string | null }> => {
    const { data } = await apiClient.get(`/public/customer/favorites/${eventId}/check`);
    return data.data;
  },
};
