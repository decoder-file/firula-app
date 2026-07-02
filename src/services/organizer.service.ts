import { apiClient } from "@/api/client";

export interface OrganizerEvent {
  id: string;
  name: string;
  slug: string;
  startsAt: string;
  status: string;
  coverUrl: string | null;
  location: {
    address: string;
    city: string;
    state: string;
  };
}

export interface OrganizerProfile {
  id: string;
  slug: string;
  tradeName: string;
  legalName: string | null;
  description: string | null;
  contact: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  city: string;
  state: string;
  logoUrl: string | null;
  followersCount: number;
  ratingsCount: number;
  averageRating: number;
  events: OrganizerEvent[];
}

export const organizerService = {
  getProfile: async (slug: string): Promise<OrganizerProfile> => {
    const { data } = await apiClient.get(`/public/organizations/${slug}`);
    return data.data;
  },

  follow: async (slug: string): Promise<{ following: boolean }> => {
    const { data } = await apiClient.post(`/public/organizations/${slug}/follow`);
    return data.data;
  },

  unfollow: async (slug: string): Promise<{ following: boolean }> => {
    const { data } = await apiClient.delete(`/public/organizations/${slug}/follow`);
    return data.data;
  },

  rate: async (slug: string, rating: number, comment?: string): Promise<void> => {
    await apiClient.post(`/public/organizations/${slug}/ratings`, { rating, comment });
  },

  updateRating: async (slug: string, rating: number, comment?: string): Promise<void> => {
    await apiClient.patch(`/public/organizations/${slug}/ratings`, { rating, comment });
  },
};
