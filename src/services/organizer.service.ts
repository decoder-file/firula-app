import { apiClient } from "@/api/client";
import axios from "axios";

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
  following?: boolean;
  store?: { slug: string } | null;
  courts?: { status?: string | null }[];
  dayUses?: { status?: string | null }[];
  day_uses?: { status?: string | null }[];
  hasCourts?: boolean;
  has_courts?: boolean;
  courtsEnabled?: boolean;
  courts_enabled?: boolean;
  courtReservationsEnabled?: boolean;
  court_reservations_enabled?: boolean;
  hasDayUse?: boolean;
  hasDayUses?: boolean;
  has_day_use?: boolean;
  has_day_uses?: boolean;
  dayUseEnabled?: boolean;
  day_use_enabled?: boolean;
  dayUsesEnabled?: boolean;
  day_uses_enabled?: boolean;
  dayUseReservationsEnabled?: boolean;
  day_use_reservations_enabled?: boolean;
  services?: {
    courts?: boolean;
    dayUse?: boolean;
    day_use?: boolean;
    dayUses?: boolean;
    day_uses?: boolean;
  } | null;
  events: OrganizerEvent[];
}

export interface OrganizerRating {
  id: string;
  stars: number;
  comment?: string | null;
  createdAt?: string | null;
  userName?: string | null;
  authorName?: string | null;
  user?: { name?: string | null; avatarUrl?: string | null } | null;
  author?: { name?: string | null; avatarUrl?: string | null } | null;
}

export const organizerService = {
  getProfile: async (slug: string): Promise<OrganizerProfile> => {
    const { data } = await apiClient.get(`/public/organizations/${slug}`);
    const profile = data.data as OrganizerProfile;

    return {
      ...profile,
      followersCount: Number(profile.followersCount) || 0,
      ratingsCount: Number(profile.ratingsCount) || 0,
      averageRating: Number(profile.averageRating) || 0,
      events: Array.isArray(profile.events) ? profile.events : [],
    };
  },

  follow: async (slug: string): Promise<{ following: boolean }> => {
    const { data } = await apiClient.post(`/public/organizations/${slug}/follow`);
    return data.data;
  },

  unfollow: async (slug: string): Promise<{ following: boolean }> => {
    const { data } = await apiClient.delete(`/public/organizations/${slug}/follow`);
    return data.data;
  },

  getRatings: async (slug: string): Promise<OrganizerRating[]> => {
    const { data } = await apiClient.get(`/public/organizations/${slug}/ratings`);
    const payload = data.data;
    return Array.isArray(payload) ? payload : payload?.items ?? payload?.ratings ?? [];
  },

  rate: async (slug: string, rating: number, comment?: string): Promise<void> => {
    const payload = { stars: rating, comment: comment?.trim() ?? "" };

    try {
      await apiClient.patch(`/public/organizations/${slug}/ratings`, payload);
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 400) throw error;
      await apiClient.post(`/public/organizations/${slug}/ratings`, payload);
    }
  },
};
