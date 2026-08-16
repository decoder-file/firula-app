import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { apiClient } from "@/api/client";

const getProjectId = () =>
  Constants.expoConfig?.extra?.eas?.projectId as string | undefined;

export const pushTokenService = {
  register: async (): Promise<string | null> => {
    if (!Device.isDevice) {
      console.warn("[push] register skipped: not a physical device");
      return null;
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    const finalStatus =
      existing === "granted"
        ? existing
        : (await Notifications.requestPermissionsAsync()).status;

    if (finalStatus !== "granted") {
      console.warn(`[push] register skipped: permission status is "${finalStatus}"`);
      return null;
    }

    const projectId = getProjectId();
    let token: string;
    try {
      token = (
        await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined,
        )
      ).data;
    } catch (err) {
      console.warn("[push] getExpoPushTokenAsync failed:", err);
      throw err;
    }

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
