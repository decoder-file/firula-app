import { apiClient } from "@/api/client";

export interface CustomerProfileIdentity {
  id: string;
  email: string;
  name: string;
}

export interface CustomerProfilePersonal {
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  photoUrl: string | null;
}

export interface CustomerProfileAddress {
  address: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
}

export interface CustomerProfilePublicSettings {
  username: string | null;
  bio: string | null;
  instagramHandle: string | null;
  xHandle: string | null;
  isPublicProfileEnabled: boolean;
  showCityOnPublicProfile: boolean;
  showEventsOnPublicProfile: boolean;
  publicProfileUrl: string | null;
}

export interface CustomerProfileComplete {
  identity: CustomerProfileIdentity;
  personal: CustomerProfilePersonal;
  address: CustomerProfileAddress;
  publicSettings: CustomerProfilePublicSettings;
}

export interface UpdatePersonalPayload {
  name: string;
  email: string;
  cpf: string;
  phone: string;
}

export interface UpdateAddressPayload {
  address: string;
  addressNumber: string;
  addressComplement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface UpdatePublicSettingsPayload {
  username: string;
  bio?: string;
  instagramHandle?: string;
  xHandle?: string;
  isPublicProfileEnabled: boolean;
  showCityOnPublicProfile: boolean;
  showEventsOnPublicProfile: boolean;
}

export interface RequestAvatarUploadPayload {
  fileType: string;
  fileSize: number;
}

interface AvatarUploadStartResult {
  fileKey: string;
  uploadUrl?: string;
  headers?: Record<string, string>;
}

export interface ConfirmAvatarPayload {
  fileKey: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

const unwrapEnvelope = <T>(responseData: unknown): T => {
  const wrapped = responseData as { data?: T };
  return wrapped?.data ?? (responseData as T);
}

export const profileService = {
  getCompleteProfile: async (): Promise<CustomerProfileComplete> => {
    const { data } = await apiClient.get("/public/customer/profile/complete");
    return unwrapEnvelope<CustomerProfileComplete>(data);
  },

  updatePersonal: async (
    payload: UpdatePersonalPayload,
  ): Promise<CustomerProfilePersonal> => {
    const { data } = await apiClient.put("/public/customer/profile/personal", payload);
    return unwrapEnvelope<CustomerProfilePersonal>(data);
  },

  updateAddress: async (
    payload: UpdateAddressPayload,
  ): Promise<CustomerProfileAddress> => {
    const { data } = await apiClient.put("/public/customer/profile/address", payload);
    return unwrapEnvelope<CustomerProfileAddress>(data);
  },

  updatePublicSettings: async (
    payload: UpdatePublicSettingsPayload,
  ): Promise<CustomerProfilePublicSettings> => {
    const { data } = await apiClient.put("/public/customer/profile/public-settings", payload);
    return unwrapEnvelope<CustomerProfilePublicSettings>(data);
  },

  requestAvatarUpload: async (
    payload: RequestAvatarUploadPayload,
  ): Promise<AvatarUploadStartResult> => {
    const { data } = await apiClient.post("/public/customer/profile/avatar", payload);
    return unwrapEnvelope<AvatarUploadStartResult>(data);
  },

  confirmAvatarUpload: async (
    payload: ConfirmAvatarPayload,
  ): Promise<CustomerProfilePersonal> => {
    const { data } = await apiClient.put("/public/customer/profile/avatar", payload);
    return unwrapEnvelope<CustomerProfilePersonal>(data);
  },

  deleteAccount: async (): Promise<DeleteAccountResponse> => {
    const { data } = await apiClient.delete<DeleteAccountResponse>("/public/customer/profile/account");
    return data;
  },
};
