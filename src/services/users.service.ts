import { apiClient } from "@/api/client";
import type { ApiResponse } from "@/api/types";
import type { UserProfile } from "@/data/mockData";

export const usersService = {
  getProfile: async (): Promise<UserProfile> => {
    const { data } =
      await apiClient.get<ApiResponse<UserProfile>>("/users/me");
    return data.data;
  },

  updateProfile: async (
    payload: Partial<UserProfile>,
  ): Promise<UserProfile> => {
    const { data } = await apiClient.patch<ApiResponse<UserProfile>>(
      "/users/me",
      payload,
    );
    return data.data;
  },
};
