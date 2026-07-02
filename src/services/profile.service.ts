import { apiClient } from "@/api/client";

export interface CustomerProfile {
  id: string;
  identityId: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  photoUrl: string | null;
  address: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  createdAt: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  photoUrl?: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export const profileService = {
  getProfile: async (): Promise<CustomerProfile> => {
    const { data } = await apiClient.get("/public/customer/profile");
    return data.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<CustomerProfile> => {
    const { data } = await apiClient.put("/public/customer/profile", payload);
    return data.data;
  },
};
