import { useCallback, useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { pushTokenService } from "@/services/pushToken.service";

export type NotificationPermissionStatus = Notifications.PermissionStatus | "loading";

export function useNotificationPermission() {
  const [status, setStatus] = useState<NotificationPermissionStatus>("loading");
  const [isRequesting, setIsRequesting] = useState(false);

  const refresh = useCallback(async () => {
    const { status: current } = await Notifications.getPermissionsAsync();
    setStatus(current);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Reaproveita pushTokenService.register() em vez de chamar
  // requestPermissionsAsync() direto — assim, se o usuário conceder a
  // permissão aqui (e não só no primeiro login), o token já é registrado no
  // mesmo passo, sem precisar esperar o app reabrir.
  const requestPermission = useCallback(async () => {
    setIsRequesting(true);
    try {
      await pushTokenService.register();
    } catch {
      // O motivo (ex.: permissão negada) já é logado dentro do service —
      // aqui só importa reconferir o status real do sistema a seguir.
    } finally {
      await refresh();
      setIsRequesting(false);
    }
  }, [refresh]);

  return { status, isRequesting, refresh, requestPermission };
}
