import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { pushTokenService } from "@/services/pushToken.service";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const router = useRouter();
  const user = useAuthStore((s) => s.customer);
  const tokenRef = useRef<string | null>(null);
  const listenerRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!user) return;

    pushTokenService.register().then((token) => {
      tokenRef.current = token;
    }).catch(() => {});

    listenerRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const screen = response.notification.request.content.data?.screen as
          | string
          | undefined;
        if (screen) {
          router.push(screen as never);
        }
      },
    );

    return () => {
      listenerRef.current?.remove();
    };
  }, [user, router]);

  return { tokenRef };
}
