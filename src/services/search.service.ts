import { apiClient } from "@/api/client";

export interface SearchOrganization {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
}

export interface SearchEvent {
  id: string;
  slug: string | null;
  name: string;
  startsAt: string;
  coverUrl: string | null;
}

export interface SearchUser {
  username: string;
  name: string;
  photoUrl: string | null;
}

export interface GlobalSearchResult {
  organizations: SearchOrganization[];
  events: SearchEvent[];
  users: SearchUser[];
}

export const searchService = {
  search: async (q: string): Promise<GlobalSearchResult> => {
    const { data } = await apiClient.get("/public/search", { params: { q } });
    return data.data;
  },
};
