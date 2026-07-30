import { apiClient } from "@/api/client";

export interface PlatformVersionConfig {
  minVersion: string;
  storeUrl: string;
}

export interface AppConfigResponse {
  ios: PlatformVersionConfig;
  android: PlatformVersionConfig;
  updateMessage: string | null;
}

interface AppConfigEnvelope {
  success: boolean;
  data: AppConfigResponse;
}

export const appConfigService = {
  getAppConfig: async (): Promise<AppConfigResponse> => {
    const { data } = await apiClient.get<AppConfigEnvelope>("/public/app-config");
    return data.data;
  },
};
