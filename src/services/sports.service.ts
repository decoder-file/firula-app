import { apiClient } from "@/api/client";

export interface PublicSport {
  id: string;
  name: string;
  slug: string;
}

interface SportsEnvelopeResponse {
  data?: PublicSport[];
}

export const sportsService = {
  getPublicSports: async (): Promise<PublicSport[]> => {
    const { data } = await apiClient.get<PublicSport[] | SportsEnvelopeResponse>(
      "/public/sports",
    );

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    return [];
  },
};
