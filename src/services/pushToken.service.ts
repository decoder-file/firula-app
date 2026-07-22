import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { apiClient } from "@/api/client";

const getProjectId = () =>
  Constants.expoConfig?.extra?.eas?.projectId as string | undefined;

export const pushTokenService = {
  register: async (): Promise<string | null> => {
    if (!Device.isDevice) return null;

    const { status: existing } = await Notifications.getPermissionsAsync();
    const finalStatus =
      existing === "granted"
        ? existing
        : (await Notifications.requestPermissionsAsync()).status;

    if (finalStatus !== "granted") return null;

    const projectId = getProjectId();
    const { data: token } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );

    await apiClient.post("/public/customer/push-token", {
      token,
      platform: Platform.OS,
    });

    return token;
  },

  deregister: async (token: string): Promise<void> => {
    await apiClient.delete("/public/customer/push-token", {
      data: { token },
    });
  },
};
