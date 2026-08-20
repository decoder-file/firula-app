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

  useEffect(() => {
    if (!user) return;

    pushTokenService.register().then((token) => {
      tokenRef.current = token;
    }).catch((err) => {
      console.warn("[push] register failed:", err);
    });
  }, [user]);

  // useLastNotificationResponse cobre os 3 casos de toque numa push
  // (foreground, background e cold start) com uma única fonte — diferente de
  // addNotificationResponseReceivedListener sozinho, que não é confiável no
  // cold start: o app pode ser aberto pelo toque antes desse hook (que só
  // monta depois da splash/checagem de auth) registrar o listener, e o
  // evento já teria disparado e se perdido. Esse hook busca o valor guardado
  // nativamente, então funciona mesmo com esse atraso.
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    const screen = lastNotificationResponse?.notification.request.content.data?.screen as
      | string
      | undefined;
    if (!screen) return;

    router.push(screen as never);
    // Evita reabrir a mesma tela se este efeito rodar de novo (ex: hot
    // reload, remount) sem que uma nova notificação tenha chegado.
    Notifications.clearLastNotificationResponseAsync().catch(() => undefined);
  }, [lastNotificationResponse, router]);

  return { tokenRef };
}
